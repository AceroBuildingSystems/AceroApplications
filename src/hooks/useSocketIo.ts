// src/hooks/useSocketIo.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatMessage, MessageReaction, UserTyping } from '@/types/next';
import { toast } from 'react-toastify';

interface UseSocketIOProps {
  ticketId: string;
  userId: string;
}

export const useSocketIo = ({ ticketId, userId }: UseSocketIOProps) => {
  // Connection states
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Message and user states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [onlineUsers, setOnlineUsers] = useState<Record<string, string>>({});
  const [messageReactions, setMessageReactions] = useState<Record<string, MessageReaction[]>>({});
  
  // Socket reference
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize Socket connection
  const initializeSocket = useCallback(() => {
    if (socketRef.current?.connected) return;
    
    setIsConnecting(true);
    setConnectionError(null);
    
    // Check if socket.io server is available
    fetch('/api/socket')
      .then(response => {
        if (!response.ok) {
          throw new Error('Socket server unavailable');
        }
        return response.json();
      })
      .then(() => {
        // Create socket connection with auth data
        socketRef.current = io({
          path: '/api/socketio',
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
          auth: { userId },
          transports: ['websocket', 'polling']
        });
        
        // Set up event listeners
        setupEventHandlers();
      })
      .catch(error => {
        console.error('Failed to initialize socket:', error);
        setConnectionError('Unable to connect to chat server');
        setIsConnecting(false);
        
        // Try to reconnect after delay
        scheduleReconnect();
      });
  }, [userId]);
  
  // Set up event handlers
  const setupEventHandlers = useCallback(() => {
    if (!socketRef.current) return;
    
    // Connection events
    socketRef.current.on('connect', () => {
      console.log('Socket connected!', socketRef.current?.id);
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionError(null);
      reconnectAttemptsRef.current = 0;
      
      // Join the ticket room
      socketRef.current?.emit('join', ticketId);
    });
    
    socketRef.current.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${reason}`);
      setIsConnected(false);
      
      // Handle forced disconnections differently
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        // Manual disconnection - don't auto-reconnect
        console.log('Manual disconnection - not attempting to reconnect');
      } else {
        // Unexpected disconnection - try to reconnect
        scheduleReconnect();
      }
    });
    
    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnecting(false);
      setConnectionError(`Connection error: ${error.message}`);
      
      // Schedule reconnect
      scheduleReconnect();
    });
    
    // Chat message events
    socketRef.current.on('message', (message: ChatMessage) => {
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        const exists = prev.some(m => m._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });
      
      // Play notification sound for new messages if not from current user
      if (message.user._id !== userId) {
        playNotificationSound();
      }
    });
    
    // Typing status events
    socketRef.current.on('typing', ({ userId, isTyping }: UserTyping) => {
      setTypingUsers(prev => ({ ...prev, [userId]: isTyping }));
    });
    
    // User status events
    socketRef.current.on('user-status', ({ userId, status }) => {
      setOnlineUsers(prev => ({ ...prev, [userId]: status }));
    });
    
    // Message reaction events
    socketRef.current.on('message-reaction', ({ messageId, reactions }) => {
      setMessageReactions(prev => ({ ...prev, [messageId]: reactions }));
      
      // Also update the message with new reactions
      setMessages(prev => prev.map(msg => 
        msg._id === messageId 
          ? { ...msg, reactions }
          : msg
      ));
    });
    
    // Message read status events
    socketRef.current.on('messages-read', ({ userId, messageIds, timestamp }) => {
      setMessages(prev => prev.map(msg => {
        if (messageIds.includes(msg._id)) {
          // Add user to readBy if not already included
          const readBy = [...(msg.readBy || [])];
          if (!readBy.includes(userId)) {
            readBy.push(userId);
          }
          
          return {
            ...msg,
            isRead: true,
            readAt: timestamp,
            readBy
          };
        }
        return msg;
      }));
    });
    
    // Error events
    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error(error.message || 'An error occurred with the chat connection');
    });
    
  }, [ticketId, userId]);
  
  // Schedule reconnection attempt
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      setConnectionError('Unable to connect after multiple attempts');
      return;
    }
    
    const delay = Math.min(1000 * (reconnectAttemptsRef.current + 1), 5000);
    console.log(`Scheduling reconnect attempt ${reconnectAttemptsRef.current + 1} in ${delay}ms`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttemptsRef.current += 1;
      console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
      
      // Clean up existing socket before reconnecting
      cleanupSocket();
      
      // Try to connect again
      initializeSocket();
    }, delay);
  }, [initializeSocket, maxReconnectAttempts]);
  
  // Clean up socket
  const cleanupSocket = useCallback(() => {
    if (!socketRef.current) return;
    
    // Remove all event listeners to prevent memory leaks
    socketRef.current.off('connect');
    socketRef.current.off('disconnect');
    socketRef.current.off('connect_error');
    socketRef.current.off('message');
    socketRef.current.off('typing');
    socketRef.current.off('user-status');
    socketRef.current.off('message-reaction');
    socketRef.current.off('messages-read');
    socketRef.current.off('error');
    
    // Leave the ticket room
    if (socketRef.current.connected) {
      socketRef.current.emit('leave', ticketId);
    }
    
    // Disconnect and clean up
    socketRef.current.disconnect();
    socketRef.current = null;
  }, [ticketId]);
  
  // Initialize socket on component mount
  useEffect(() => {
    initializeSocket();
    
    // Clean up on component unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      cleanupSocket();
    };
  }, [ticketId, userId, initializeSocket, cleanupSocket]);
  
  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/sounds/message.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Error playing sound:', e));
    } catch (error) {
      console.error('Could not play notification sound:', error);
    }
  }, []);
  
  // Update messages from external source (e.g., API)
  const updateMessages = useCallback((newMessages: ChatMessage[]) => {
    setMessages(newMessages);
  }, []);
  
  // Send a message
  const sendMessage = useCallback((
    content: string, 
    attachments?: any[], 
    replyTo?: string, 
    mentions?: string[]
  ) => {
    if (!socketRef.current || !isConnected) {
      console.error('Socket not connected, using fallback API to send message');
      return false;
    }
    
    // Emit message event
    socketRef.current.emit('message', {
      ticketId,
      userId,
      content,
      attachments,
      replyTo,
      mentions,
    });
    
    return true;
  }, [ticketId, userId, isConnected]);
  
  // Edit a message
  const editMessage = useCallback((messageId: string, newContent: string) => {
    if (!socketRef.current || !isConnected) return false;
    
    // This would need a server-side implementation too
    socketRef.current.emit('edit-message', {
      ticketId,
      messageId,
      content: newContent,
      updatedBy: userId
    });
    
    return true;
  }, [ticketId, userId, isConnected]);
  
  // Add reaction to a message
  const addReaction = useCallback((messageId: string, emoji: string) => {
    if (!socketRef.current || !isConnected) return false;
    
    socketRef.current.emit('reaction', {
      messageId,
      userId,
      emoji
    });
    
    return true;
  }, [userId, isConnected]);
  
  // Mark messages as read
  const markMessagesAsRead = useCallback((messageIds: string[]) => {
    if (!socketRef.current || !isConnected || !messageIds.length) return false;
    
    socketRef.current.emit('mark-read', {
      messageIds,
      userId
    });
    
    return true;
  }, [userId, isConnected]);
  
  // Send typing indicator
  const sendTyping = useCallback((isTyping: boolean) => {
    if (!socketRef.current || !isConnected) return false;
    
    socketRef.current.emit('typing', {
      ticketId,
      userId,
      isTyping
    });
    
    return true;
  }, [ticketId, userId, isConnected]);
  
  // Update user status
  const updateStatus = useCallback((status: 'online' | 'away' | 'busy') => {
    if (!socketRef.current || !isConnected) return false;
    
    socketRef.current.emit('status-update', {
      userId,
      status
    });
    
    return true;
  }, [userId, isConnected]);
  
  // Notify about file upload
  const notifyFileUpload = useCallback((fileInfo: any) => {
    if (!socketRef.current || !isConnected) return false;
    
    socketRef.current.emit('file-upload', {
      ticketId,
      userId,
      fileInfo
    });
    
    return true;
  }, [ticketId, userId, isConnected]);
  
  // Force reconnect
  const reconnect = useCallback(() => {
    cleanupSocket();
    reconnectAttemptsRef.current = 0;
    setIsConnected(false);
    setIsConnecting(true);
    initializeSocket();
  }, [cleanupSocket, initializeSocket]);
  
  return {
    // Connection states
    isConnected,
    isConnecting,
    connectionError,
    
    // Message and user data
    messages,
    typingUsers,
    onlineUsers,
    messageReactions,
    
    // Functions
    updateMessages,
    sendMessage,
    editMessage,
    addReaction,
    markMessagesAsRead,
    sendTyping,
    updateStatus,
    notifyFileUpload,
    reconnect
  };
};