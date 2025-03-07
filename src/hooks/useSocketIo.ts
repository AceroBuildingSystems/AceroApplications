// src/hooks/useSocketIo.ts (Fixed)
import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatMessage, UserTyping } from '@/types/next';
import { toast } from 'react-toastify';

interface UseSocketIOProps {
  ticketId: string;
  userId: string;
}

export const useSocketIo = ({ ticketId, userId }: UseSocketIOProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [onlineUsers, setOnlineUsers] = useState<Record<string, string>>({});
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  
  // Connection function - extracted for reusability
  const connect = useCallback(() => {
    if (socketRef.current) {
      // If already have a socket instance, just reconnect it
      socketRef.current.connect();
      return;
    }

    // Initialize the socket connection
    try {
      console.log('Creating new socket connection...');
      setIsConnecting(true);
      
      // First make sure the socket server is running
      fetch('/api/socket')
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to initialize socket server');
          }
          return response.json();
        })
        .then(() => {
          // Create a new socket connection with better options
          socketRef.current = io({
            path: '/api/socketio', // Matching the server path
            autoConnect: true,
            reconnection: true, 
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            transports: ['websocket', 'polling'] // Try WebSocket first, fallback to polling
          });
          
          // Set up connection event handlers
          setupEventHandlers();
        })
        .catch(err => {
          console.error('Socket initialization error:', err);
          setIsConnecting(false);
          toast.error('Failed to connect to chat server');
        });
    } catch (error) {
      console.error('Socket connection error:', error);
      setIsConnecting(false);
    }
  }, [ticketId, userId]);
  
  // Setup socket event handlers
  const setupEventHandlers = useCallback(() => {
    if (!socketRef.current) return;
    
    // Connection events
    socketRef.current.on('connect', () => {
      console.log('Socket connected successfully!', socketRef.current?.id);
      setIsConnected(true);
      setIsConnecting(false);
      reconnectAttemptsRef.current = 0;
      
      // Join ticket room
      socketRef.current?.emit('join', ticketId);
    });
    
    socketRef.current.on('disconnect', (reason) => {
      console.log(`Socket disconnected! Reason: ${reason}`);
      setIsConnected(false);
      
      // Handle reconnection
      if (
        reason === 'io server disconnect' || 
        reason === 'io client disconnect'
      ) {
        // If server or client explicitly closed the connection, don't reconnect automatically
        console.log('Disconnected by server or client, not attempting to reconnect');
      } else {
        // For other disconnection reasons, attempt to reconnect if under max attempts
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
          
          // Try to reconnect after a delay
          setTimeout(() => {
            if (socketRef.current) {
              socketRef.current.connect();
            } else {
              connect(); // If socket was destroyed, create a new one
            }
          }, 2000);
        } else {
          console.log('Max reconnection attempts reached');
          setIsConnecting(false);
          toast.error('Unable to connect to chat server after multiple attempts');
        }
      }
    });
    
    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnecting(false);
      
      // Only show the error toast after multiple attempts to avoid spamming
      if (reconnectAttemptsRef.current >= 2) {
        toast.error('Chat connection error: ' + error.message);
      }
    });
    
    // Chat events
    socketRef.current.on('message', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
      
      // Play notification sound for new messages if not from current user
      if (message.user._id !== userId) {
        playMessageSound();
      }
    });
    
    socketRef.current.on('typing', ({ userId, isTyping }: UserTyping) => {
      setTypingUsers((prev) => ({ ...prev, [userId]: isTyping }));
    });
    
    socketRef.current.on('user-status', ({ userId, status }) => {
      setOnlineUsers((prev) => ({ ...prev, [userId]: status }));
    });
    
    socketRef.current.on('error', (error: any) => {
      console.error('Socket error:', error);
      toast.error(error.message || 'An error occurred with the chat connection');
    });
  }, [ticketId, userId, connect]);
  
  // Initialize Socket.io connection
  useEffect(() => {
    connect();
    
    // Cleanup when component unmounts
    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket connection');
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
        socketRef.current.off('message');
        socketRef.current.off('typing');
        socketRef.current.off('error');
        
        socketRef.current.emit('leave', ticketId);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [ticketId, userId, connect]);
  
  // Play a sound for new messages
  const playMessageSound = useCallback(() => {
    try {
      const audio = new Audio('/sounds/message.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Error playing sound:', e));
    } catch (error) {
      console.error('Could not play notification sound:', error);
    }
  }, []);
  
  // Update messages from external source (e.g., API call)
  const updateMessages = useCallback((newMessages: ChatMessage[]) => {
    setMessages(newMessages);
  }, []);
  
  // Send a new message
  const sendMessage = useCallback((content: string, attachments?: any[], replyTo?: string, mentions?: string[]) => {
    if (!socketRef.current || !isConnected) {
      console.error('Socket not connected, using fallback API to send message');
      
      // Here you could implement a fallback to use a regular API endpoint
      // instead of sockets if the connection is down
      
      toast.warning('Not connected to chat server, message may be delayed');
      return false;
    }
    
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
  
  // Send typing indicator
  const sendTyping = useCallback((isTyping: boolean) => {
    if (!socketRef.current || !isConnected) return;
    
    socketRef.current.emit('typing', {
      ticketId,
      userId,
      isTyping,
    });
  }, [ticketId, userId, isConnected]);
  
  // Notify about file upload
  const notifyFileUpload = useCallback((fileInfo: any) => {
    if (!socketRef.current || !isConnected) return;
    
    socketRef.current.emit('file-upload', {
      ticketId,
      userId,
      fileInfo,
    });
  }, [ticketId, userId, isConnected]);
  
  // Force a manual reconnection
  const reconnect = useCallback(() => {
    // Clean up existing connection
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    // Reset connection state
    setIsConnected(false);
    reconnectAttemptsRef.current = 0;
    
    // Create a new connection
    connect();
  }, [connect]);
  
  return {
    isConnected,
    isConnecting,
    messages,
    typingUsers,
    onlineUsers,
    updateMessages,
    sendMessage,
    sendTyping,
    notifyFileUpload,
    reconnect,
  };
};