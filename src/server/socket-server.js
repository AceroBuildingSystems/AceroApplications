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

// Keep track of user connections and rooms
const userConnections = new Map();
const typingUsers = new Map();
const userStatus = new Map();
const ticketRooms = new Map();
const messageQueue = new Map();

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  // Store user data on connection
  const { userId } = socket.handshake.auth;
  if (userId) {
    // Add socket to user's connections
    if (!userConnections.has(userId)) {
      userConnections.set(userId, new Set());
    }
    userConnections.get(userId).add(socket.id);
    
    // Set user as online
    userStatus.set(userId, 'online');
    
    // Broadcast user online status to all clients
    io.emit('user-status', { userId, status: 'online' });
  }

  // Handle joining a room
  socket.on('join', (data) => {
    const { ticketId, userId } = data;
    const roomId = `ticket-${ticketId}`;
    
    // Create room if it doesn't exist
    if (!ticketRooms.has(roomId)) {
      ticketRooms.set(roomId, new Set());
    }
    
    // Add user to room members
    if (userId) {
      console.log(`Adding user ${userId} to room ${roomId}`);
      ticketRooms.get(roomId).add(userId);
    }
    
    // Join the socket to the room
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
    
    // Initialize typing status for this room if not exists
    if (!typingUsers.has(roomId)) {
      typingUsers.set(roomId, new Map());
    }
    
    // Send any queued messages for this room
    if (messageQueue.has(roomId)) {
      const queuedMessages = messageQueue.get(roomId) || [];
      for (const msg of queuedMessages) {
        console.log(`Sending queued message to user ${userId} in room ${roomId}`);
        socket.emit('message', msg);
      }
    }
    
    // Notify other users in the room that this user is online
    if (userId) {
      socket.to(roomId).emit('user-status', { 
        userId, 
        status: userStatus.get(userId) || 'online' 
      });
    }
    
    // Notify the client that join was successful
    socket.emit('joined', { ticketId, success: true });
  });

  // Handle leaving a room
  socket.on('leave', (ticketId) => {
    const roomId = `ticket-${ticketId}`;
    
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room ${roomId}`);
    
    // Remove user from room members but keep the room
    if (userId && ticketRooms.has(roomId)) {
      ticketRooms.get(roomId).delete(userId);
      console.log(`Removed user ${userId} from room ${roomId}`);
    }
    
    // Remove user from typing status for this room
    if (userId) {
      const roomTyping = typingUsers.get(roomId);
      if (roomTyping) {
        roomTyping.delete(userId);
      }
    }
  });

  // Handle new chat messages
  socket.on('message', (data) => {
    try {
      const { ticketId, userId, content, attachments, replyTo, mentions, tempId } = data;
      
      console.log(`Received message from user ${userId} in room ticket-${ticketId}: ${content.substring(0, 30)}...`);
      
      // Create a message object
      const message = {
        _id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        ticket: ticketId,
        user: { _id: userId },
        content,
        attachments: attachments || [],
        replyTo,
        mentions: mentions || [],
        createdAt: new Date().toISOString(),
        deliveredAt: new Date(),
        readBy: [userId]
      };
      
      const roomId = `ticket-${ticketId}`;
      
      // Always broadcast to the room
      console.log(`Broadcasting message to room ${roomId}`);
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
      console.log(`Adding message to queue for room ${roomId}`);
      
      // Limit queue size to prevent memory issues
      const queue = messageQueue.get(roomId);
      queue.push(message);
      if (queue.length > 50) {
        queue.shift(); // Remove oldest message if queue is too large
      }
      
      // Also emit typing stopped event
      io.to(roomId).emit('typing', { userId, isTyping: false });
      
      // Reset typing status for this user
      const roomTyping = typingUsers.get(roomId);
      if (roomTyping) {
        roomTyping.set(userId, false);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', { message: 'Failed to save message' });
    }
  });

  // Handle typing events
  socket.on('typing', (data) => {
    const { ticketId, userId, isTyping } = data;
    
    // Update typing status for this user in this room
    const roomId = `ticket-${ticketId}`;
    const roomTyping = typingUsers.get(roomId);
    if (roomTyping) {
      roomTyping.set(userId, isTyping);
    }
    
    // Broadcast typing status to room (except sender)
    socket.to(roomId).emit('typing', { userId, isTyping });
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

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});