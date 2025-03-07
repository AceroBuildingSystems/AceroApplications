// src/pages/api/socket.ts
import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type { NextApiRequest, NextApiResponse } from 'next';
import { NextApiResponseServerIO } from '@/types/next';
import { dbConnect } from '@/lib/mongoose';
import { TicketComment } from '@/models';
import { createTicketHistory } from '@/server/services/ticketHistoryServices';

// Global variable to hold the Socket.io server instance
let io: SocketIOServer;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  // Ensure database connection
  await dbConnect();

  // If the Socket.io server hasn't been initialized, set it up
  if (!res.socket.server.io) {
    console.log('Setting up Socket.io server...');
    
    const httpServer: HTTPServer = res.socket.server as any;
    io = new SocketIOServer(httpServer, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: '*', // Allow all origins for now; adjust for production
        methods: ['GET', 'POST'],
        credentials: true
      },
      // Make sure we're using WebSocket first, with polling as fallback
      transports: ['websocket', 'polling'],
      // Faster ping timeout and interval for better connection management
      pingTimeout: 30000,
      pingInterval: 25000
    });

    // Set up event handlers
    io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      // Handle joining a chat room (ticket-specific)
      socket.on('join', (ticketId: string) => {
        socket.join(`ticket-${ticketId}`);
        console.log(`Socket ${socket.id} joined ticket-${ticketId}`);
      });

      // Handle leaving a chat room
      socket.on('leave', (ticketId: string) => {
        socket.leave(`ticket-${ticketId}`);
        console.log(`Socket ${socket.id} left ticket-${ticketId}`);
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
            isActive: true
          });
          
          // Save to database
          const savedMessage = await newMessage.save();
          
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
          
          // Broadcast to room
          io.to(`ticket-${ticketId}`).emit('message', savedMessage);
          
          // Also emit typing stopped event
          io.to(`ticket-${ticketId}`).emit('typing', { userId, isTyping: false });
        } catch (error) {
          console.error('Error handling message:', error);
          socket.emit('error', { message: 'Failed to save message' });
        }
      });

      // Handle typing events
      socket.on('typing', (data) => {
        const { ticketId, userId, isTyping } = data;
        // Broadcast typing status to room
        socket.to(`ticket-${ticketId}`).emit('typing', { userId, isTyping });
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
      });
    });

    // Attach Socket.io server to Next.js response
    res.socket.server.io = io;
  } else {
    console.log('Socket.io server already running');
  }

  // Return a simple response
  res.status(200).json({ success: true, message: 'Socket.io server is running' });
}