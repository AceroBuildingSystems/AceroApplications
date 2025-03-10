// src/server/socket-server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Create Express app
const app = express();
app.use(cors());

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Debug flag
const DEBUG = true;

// Keep track of user connections and rooms
const userConnections = new Map();
const userSockets = new Map(); // Map userId to socketId
const typingUsers = new Map();
const userStatus = new Map();
const ticketRooms = new Map();
const messageQueue = new Map();

// Helper function for logging
function log(...args) {
  if (DEBUG) {
    console.log(...args);
  }
}

// Socket.IO event handlers
io.on('connection', (socket) => {
  log(`Socket connected: ${socket.id}`);
  
  // Store user data on connection
  const { userId } = socket.handshake.auth;
  if (userId) {
    // Add socket to user's connections
    if (!userConnections.has(userId)) {
      userConnections.set(userId, new Set());
    }
    userConnections.get(userId).add(socket.id);
    userSockets.set(userId, socket.id);
    
    // Set user as online
    userStatus.set(userId, 'online');
    
    // Broadcast user online status to all clients
    io.emit('user-status', { userId, status: 'online' });
  }

  // Handle joining a room
  socket.on('join', (data) => {
    const { ticketId, userId: joinUserId } = data;
    const roomId = `ticket-${ticketId}`;
    
    // Create room if it doesn't exist
    if (!ticketRooms.has(roomId)) {
      ticketRooms.set(roomId, new Set());
    }
    const roomMembers = ticketRooms.get(roomId);
    
    // Add user to room members
    if (joinUserId) {
      log(`Adding user ${joinUserId} to room ${roomId}`);
      roomMembers.add(joinUserId);
    }
    
    // Notify everyone in the room that a new user joined
    if (joinUserId) {
      socket.to(roomId).emit('user-joined', {
        userId: joinUserId,
        username: joinUserId,
        timestamp: new Date()
      });
    }
    
    // Join the socket to the room
    socket.join(roomId);
    log(`Socket ${socket.id} joined room ${roomId}`);
    
    // Initialize typing status for this room if not exists
    if (!typingUsers.has(roomId)) {
      typingUsers.set(roomId, new Map());
    }
    
    // Send any queued messages for this room
    if (messageQueue.has(roomId)) {
      const queuedMessages = messageQueue.get(roomId) || [];
      log(`Found ${queuedMessages.length} queued messages for room ${roomId}`);
      for (const msg of queuedMessages) {
        log(`Sending queued message to user ${joinUserId} in room ${roomId}`);
        socket.emit('message', msg);
      }
    }
    
    // Notify other users in the room that this user is online
    log(`Notifying other users that ${joinUserId} is online in room ${roomId}`);
    if (joinUserId) {
      socket.to(roomId).emit('user-status', { 
        userId: joinUserId, 
        status: userStatus.get(joinUserId) || 'online' 
      });
    }
    
    // Send list of online users in this room
    const onlineUsers = {};
    roomMembers.forEach(memberId => {
      onlineUsers[memberId] = userStatus.get(memberId) || 'offline';
    });
    
    log(`Sending online users to ${joinUserId}: ${JSON.stringify(onlineUsers)}`);
    socket.emit('online-users-update', onlineUsers);
    
    // Notify the client that join was successful
    socket.emit('joined', { ticketId, success: true });
  });

  // Handle leaving a room
  socket.on('leave', (ticketId) => {
    const roomId = `ticket-${ticketId}`;
    
    socket.leave(roomId);
    log(`Socket ${socket.id} left room ${roomId}`);
    
    // Notify others that user left
    // Remove user from room members but keep the room
    if (userId && ticketRooms.has(roomId)) {
      ticketRooms.get(roomId).delete(userId);
      log(`Removed user ${userId} from room ${roomId}`);
    }
    
    // Remove user from typing status for this room
    if (userId) {
      const roomTyping = typingUsers.get(roomId);
      if (roomTyping) {
        roomTyping.delete(userId);
      }
      
      // Notify others that user left
      socket.to(roomId).emit('user-left', {
        userId,
        username: userId,
        timestamp: new Date()
      });
    }
  });

  // Handle new chat messages
  socket.on('message', (data) => {
    try {
      const { ticketId, userId: messageUserId, content, attachments, replyTo, mentions, tempId } = data;
      
      log(`Received message from user ${messageUserId} in room ticket-${ticketId}: ${content.substring(0, 30)}...`);
      
      // Create a message object
      const message = {
        _id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        ticket: ticketId,
        user: { _id: messageUserId },
        content,
        attachments: attachments || [],
        replyTo,
        mentions: mentions || [],
        createdAt: new Date().toISOString(),
        deliveredAt: new Date(),
        readBy: [messageUserId]
      };
      
      const roomId = `ticket-${ticketId}`;
      
      // Get room members
      const roomMembers = Array.from(ticketRooms.get(roomId) || []);
      log(`Room members: ${JSON.stringify(roomMembers)}`);
      
      // Get connected sockets in this room
      const roomSockets = io.sockets.adapter.rooms.get(roomId);
      log(`Room has ${roomSockets?.size || 0} connected sockets`);
      
      // Always broadcast to the room
      log(`Broadcasting message to all users in room ${roomId}`);
      io.to(roomId).emit('message', message);
      
      // Send acknowledgment to sender
      if (tempId) {
        socket.emit('message-ack', {
          messageId: message._id,
          tempId,
          status: 'delivered',
          timestamp: message.createdAt
        });
      }
      
      // Store in message queue for users who join later
      if (!messageQueue.has(roomId)) {
        messageQueue.set(roomId, []);
      }
      log(`Adding message to queue for room ${roomId}`);
      
      // Store message in queue for users who join later
      // Limit queue size to prevent memory issues
      const queue = messageQueue.get(roomId);
      queue.push(message);
      if (queue.length > 50) {
        queue.shift(); // Remove oldest message if queue is too large
      }
      
      // Also emit typing stopped event
      io.to(roomId).emit('typing', { userId: messageUserId, isTyping: false });
      
      // Reset typing status for this user
      const roomTyping = typingUsers.get(roomId);
      if (roomTyping) {
        roomTyping.set(messageUserId, false);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', { message: 'Failed to save message' });
    }
  });

  // Handle typing events
  socket.on('typing', (data) => {
    const { ticketId, userId: typingUserId, isTyping } = data;
    
    // Update typing status for this user in this room
    const roomId = `ticket-${ticketId}`;
    const roomTyping = typingUsers.get(roomId);
    if (roomTyping) {
      roomTyping.set(typingUserId, isTyping);
    }
    
    // Broadcast typing status to room (except sender)
    socket.to(roomId).emit('typing', { userId: typingUserId, isTyping });
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    log(`Socket disconnected: ${socket.id}`);
    
    if (userId) {
      userSockets.delete(userId);
      // Remove socket from user's connections
      const userSocketIds = userConnections.get(userId);
      if (userSocketIds) {
        userSocketIds.delete(socket.id);
        
        // If user has no more connections, mark as offline
        if (userSocketIds.size === 0) {
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
      
      // Remove user from typing status in all rooms
      for (const [roomId, typingMap] of typingUsers.entries()) {
        if (typingMap.has(userId)) {
          typingMap.delete(userId);
          io.to(roomId).emit('typing', { userId, isTyping: false });
        }
      }
    }
  });
});

// API routes
app.get('/api/ping', (req, res) => {
  res.json({ timestamp: Date.now() });
});

app.post('/api/ping', (req, res) => {
  res.json({ timestamp: Date.now() });
});

// Debug endpoint to get room info
app.get('/api/debug/rooms', (req, res) => {
  const rooms = {};
  
  ticketRooms.forEach((members, roomId) => {
    rooms[roomId] = {
      members: Array.from(members),
      socketCount: io.sockets.adapter.rooms.get(roomId)?.size || 0,
      messageCount: messageQueue.get(roomId)?.length || 0
    };
  });
  
  res.json({
    rooms,
    userCount: userConnections.size,
    socketCount: io.sockets.sockets.size
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
  
  // Print server info
  console.log(`
Server Information:
- Socket.IO server running on port ${PORT}
- CORS enabled for all origins
- Debug mode: ${DEBUG ? 'ON' : 'OFF'}
- Transports: websocket, polling
- Message queue enabled for offline message persistence
`);
});