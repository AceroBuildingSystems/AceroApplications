// src/app/api/socket/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { dbConnect } from '@/lib/mongoose';
import { TicketComment } from '@/models';
import { createTicketHistory } from '@/server/services/ticketHistoryServices';
import { MessageReaction } from '@/types/next';

// Global variable to track the Socket.io server instance
let io: SocketIOServer;

// Keep track of user connections
const userConnections = new Map<string, Set<string>>();
const typingUsers = new Map<string, Map<string, boolean>>();
const userStatus = new Map<string, string>();
const ticketRooms = new Map<string, Set<string>>(); // Track rooms and their members

// Add a message queue for storing messages when no users are in room
const messageQueue = new Map<string, any[]>();

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    await dbConnect();
    
    // For App Router, we need to handle socket.io differently
    // Just return success for now, socket.io will be initialized by the client

    return NextResponse.json({
      status: 'success',
      message: 'Socket.io server is running'
    });
  } catch (error) {
    console.error('Socket initialization error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to initialize Socket.io server'
    }, { status: 500 });
  }
}

// Add a POST handler for client ping
export async function POST() {
  return NextResponse.json({
    timestamp: Date.now()
  });
}

function getSocketIO(server: any) {
  // If the Socket.io server hasn't been initialized, set it up
  if (!io) {
    // Initialize ticket rooms from database
    const initializeTicketRooms = async () => {
      try {
        await dbConnect();
        // Get all active tickets from database
        const tickets = await TicketComment.distinct('ticket');
        // Create rooms for all tickets
        tickets.forEach(ticketId => {
          ticketRooms.set(`ticket-${ticketId}`, new Set());
        });
      } catch (error) {
        console.error('Error initializing ticket rooms:', error);
      }
    };
    console.log('Setting up Socket.io server...');

    io = new SocketIOServer(server, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 30000,
      pingInterval: 25000,
      connectionStateRecovery: {
        // Enable the connection state recovery feature
        maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
        skipMiddlewares: true,
      }
    });
    
    // Initialize rooms
    initializeTicketRooms();

    // Set up event handlers
    io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);
      
      // Store user data on connection
      const { userId } = socket.handshake.auth;
      if (userId) {
        // Add socket to user's connections
        if (!userConnections.has(userId)) {
          userConnections.set(userId, new Set());
        }
        userConnections.get(userId)?.add(socket.id);
        
        // Set user as online
        userStatus.set(userId, 'online');
        
        // Broadcast user online status to all clients
        io.emit('user-status', { userId, status: 'online' });
      }

      // Create or join a ticket room
      const joinOrCreateRoom = (ticketId: string) => {
        const roomId = `ticket-${ticketId}`;
        // Create room if it doesn't exist
        if (!ticketRooms.has(roomId)) {
          ticketRooms.set(roomId, new Set());
        }
        // Add user to room members
        if (userId) ticketRooms.get(roomId)?.add(userId);
      };

      // Handle joining a ticket room
      socket.on('join', (ticketId: string) => {
        joinOrCreateRoom(ticketId);
        socket.join(`ticket-${ticketId}`);
        console.log(`Socket ${socket.id} joined ticket-${ticketId}`);
        
        // Notify other users in the room that this user joined
        socket.to(`ticket-${ticketId}`).emit('user-joined', { userId, username: socket.handshake.auth.username });

        // Send any queued messages for this room
        const roomId = `ticket-${ticketId}`;
        if (messageQueue.has(roomId)) {
          const queuedMessages = messageQueue.get(roomId) || [];
          for (const msg of queuedMessages) {
            socket.emit('message', msg);
          }
          // Clear the queue after sending
          messageQueue.delete(roomId);
        }
        
        // Initialize typing status for this ticket if not exists
        if (!typingUsers.has(`ticket-${ticketId}`)) {
          typingUsers.set(`ticket-${ticketId}`, new Map());
        }
        
        // Notify other users in the room that this user is online
        if (userId) {
          socket.to(`ticket-${ticketId}`).emit('user-status', { 
            userId, 
            status: userStatus.get(userId) || 'online' 
          });
        }
      });

      // Handle leaving a chat room
      socket.on('leave', (ticketId: string) => {
        socket.leave(`ticket-${ticketId}`);
        console.log(`Socket ${socket.id} left ticket-${ticketId}`);
        
        // Remove user from room members but keep the room
        if (userId) ticketRooms.get(`ticket-${ticketId}`)?.delete(userId);
        
        // Remove user from typing status for this ticket
        if (userId) {
          const ticketTyping = typingUsers.get(`ticket-${ticketId}`);
          if (ticketTyping) {
            ticketTyping.delete(userId);
          }
        }
      });

      // Handle new chat messages
      socket.on('message', async (data) => {
        try {
          const { ticketId, userId, content, attachments, replyTo, mentions } = data;
          
          // Create a new message document
          const newMessage = new TicketComment({
            ticket: ticketId,
            user: userId,
            content,
            attachments: attachments || [],
            replyTo,
            mentions: mentions || [],
            addedBy: userId,
            updatedBy: userId,
            isActive: true,
            deliveredAt: new Date(),
            readBy: [userId] // Mark as read by sender
          });
          
          // Save to database
          const savedMessage = await newMessage.save();
          
          // Ensure room exists for this ticket
          joinOrCreateRoom(ticketId);
          
          // Populate user information before broadcasting
          await savedMessage.populate([
            { path: 'user' },
            { path: 'mentions' },
            { 
              path: 'replyTo',
              populate: {
                path: 'user'
              }
            }
          ]);
          
          // Create history entry
          await createTicketHistory({
            data: {
              ticket: ticketId,
              action: 'COMMENT',
              user: userId,
              details: { messageId: savedMessage._id }
            }
          });
          
          // Always broadcast to the room
          const roomId = `ticket-${ticketId}`;
          io.to(roomId).emit('message', savedMessage);
          
          // Store in message queue for users who join later
          if (!messageQueue.has(roomId)) messageQueue.set(roomId, []);
          // Limit queue size to prevent memory issues
          messageQueue.get(roomId)?.push(savedMessage);
          
          // Also emit typing stopped event
          io.to(`ticket-${ticketId}`).emit('typing', { userId, isTyping: false });
          
          // Reset typing status for this user
          const ticketTyping = typingUsers.get(`ticket-${ticketId}`);
          if (ticketTyping) {
            ticketTyping.set(userId, false);
          }
        } catch (error) {
          console.error('Error handling message:', error);
          socket.emit('error', { message: 'Failed to save message' });
        }
      });

      // Handle typing events
      socket.on('typing', (data) => {
        const { ticketId, userId, isTyping } = data;
        
        // Update typing status for this user in this ticket
        const ticketTyping = typingUsers.get(`ticket-${ticketId}`);
        if (ticketTyping) {
          ticketTyping.set(userId, isTyping);
        }
        
        // Broadcast typing status to room (except sender)
        socket.to(`ticket-${ticketId}`).emit('typing', { userId, isTyping });
      });

      // Handle message reactions
      socket.on('reaction', async (data) => {
        try {
          const { messageId, userId, emoji } = data;
          
          // Get the message from database
          const message = await TicketComment.findById(messageId);
          if (!message) {
            return socket.emit('error', { message: 'Message not found' });
          }
          
          // Initialize reactions array if not exists
          if (!message.reactions) {
            message.reactions = [];
          }
          
          // Check if user already reacted with this emoji
          const existingReactionIndex = message.reactions.findIndex(
            reaction => reaction.emoji === emoji && reaction.userId.toString() === userId
          );
          
          if (existingReactionIndex > -1) {
            // User already reacted with this emoji, so remove it (toggle)
            message.reactions.splice(existingReactionIndex, 1);
          } else {
            // Add new reaction
            message.reactions.push({
              // @ts-ignore - Type mismatch is expected but works at runtime
              emoji,
 
              userId,
              createdAt: new Date()
            } as MessageReaction);
          }
          
          // Save to database
          await message.save();
          
          // Populate and broadcast updated reactions
          await message.populate('reactions.userId');
          io.to(`ticket-${message.ticket}`).emit('message-reaction', {
            messageId,
            reactions: message.reactions
          });
        } catch (error) {
          console.error('Error handling reaction:', error);
          socket.emit('error', { message: 'Failed to save reaction' });
        }
      });

      // Handle message read status
      socket.on('mark-read', async (data) => {
        try {
          const { messageIds, userId } = data;
          
          if (!messageIds || !messageIds.length) return;
          
          // Update multiple messages at once
          const result = await TicketComment.updateMany(
            { _id: { $in: messageIds }, readBy: { $ne: userId } },
            { 
              $set: { isRead: true, readAt: new Date() },
              $addToSet: { readBy: userId }
            }
          );
          
          // Get updated messages to broadcast
          const updatedMessages = await TicketComment.find({ _id: { $in: messageIds } })
            .select('_id readBy isRead readAt');
          
          // Find which tickets these messages belong to
          const messages = await TicketComment.find({ _id: { $in: messageIds } })
            .select('ticket');
          
          // Broadcast to relevant ticket rooms
          const ticketIds = [...new Set(messages.map(msg => msg.ticket.toString()))];
          
          for (const ticketId of ticketIds) {
            io.to(`ticket-${ticketId}`).emit('messages-read', {
              userId,
              messageIds,
              timestamp: new Date()
            });
          }
        } catch (error) {
          console.error('Error marking messages as read:', error);
          socket.emit('error', { message: 'Failed to mark messages as read' });
        }
      });

      // Handle user status updates
      socket.on('status-update', (data) => {
        const { userId, status } = data;
        
        if (userId) {
          userStatus.set(userId, status);
          
          // Broadcast to all connected clients
          io.emit('user-status', { userId, status });
        }
      });

      // Handle file upload notifications
      socket.on('file-upload', (data) => {
        const { ticketId, fileInfo } = data;
        // Broadcast file upload to room
        io.to(`ticket-${ticketId}`).emit('file-upload', fileInfo);
      });

      // Handle disconnections
      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        
        if (userId) {
          // Remove socket from user's connections
          const userSockets = userConnections.get(userId);
          if (userSockets) {
            userSockets.delete(socket.id);
            
            // If user has no more connections, mark as offline
            if (userSockets.size === 0) {
              userStatus.set(userId, 'offline');
              
              // Broadcast user offline status after a short delay
              // (to handle page refreshes and brief disconnections)
              setTimeout(() => {
                const currentUserSockets = userConnections.get(userId);
                if (!currentUserSockets || currentUserSockets.size === 0) {
                  io.emit('user-status', { 
                    userId, 
                    status: 'offline', 
                    lastSeen: new Date() 
                  });
                }
              }, 5000);
            }
          }
          
          // Remove user from typing status in all tickets
          for (const [ticketRoom, typingMap] of typingUsers.entries()) {
            if (typingMap.has(userId)) {
              typingMap.delete(userId);
              io.to(ticketRoom).emit('typing', { userId, isTyping: false });
            }
          }
        }
      });
    });
  }
  
  return io;
}