// src/hooks/useSocketIo.ts
import { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import { useMarkAsReadMutation } from '@/services/endpoints/ticketCommentApi';

interface UseSocketIoProps {
  ticketId: string;
  userId: string;
  roomId?: string;
  currentUser?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

/**
 * Custom hook for Socket.io integration with the chat
 * Optimized to prevent excessive re-renders during typing
 */
export const useSocketIo = ({ ticketId, userId, roomId, currentUser }: UseSocketIoProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  
  // Use refs for frequently changing data to prevent re-renders
  const typingUsersRef = useRef<Record<string, boolean>>({});
  const onlineUsersRef = useRef<Record<string, string>>({});
  
  // Socket reference
  const socketRef = useRef<Socket | null>(null);
  
  // Mutation for marking messages as read
  const [markAsRead] = useMarkAsReadMutation();
  
  // Connect to socket
  const connectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    setIsConnecting(true);
    setConnectionError(null);

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const socket = io(socketUrl, {
      query: {
        ticketId,
        userId,
        roomId: roomId || `ticket-${ticketId}`
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionError(null);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      setIsConnected(false);
      setIsConnecting(false);
      setConnectionError(err.message);
    });

    socket.on('message', (message) => {
      setMessages(prev => [...prev, message]);
      
      // Mark message as read if it's from someone else
      if (message.user._id !== userId) {
        markAsRead({ commentIds: [message._id], userId }).catch(console.error);
      }
    });

    socket.on('messages', (data) => {
      setMessages(data);
    });

    socket.on('typing', ({ userId, isTyping }) => {
      typingUsersRef.current = {
        ...typingUsersRef.current,
        [userId]: isTyping
      };
    });

    socket.on('online_users', (users) => {
      onlineUsersRef.current = users;
    });

    socket.on('file_uploaded', (fileData) => {
      // Find message and add file to attachments
      setMessages(prev => {
        const updatedMessages = JSON.parse(JSON.stringify(prev)); // Deep clone to ensure state update
        const messageIndex = updatedMessages.findIndex(m => m._id === fileData.messageId);
        
        if (messageIndex !== -1) {
          const message = updatedMessages[messageIndex];
          message.attachments = [...(message.attachments || []), fileData];
        }
        
        return updatedMessages;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [ticketId, userId, roomId, markAsRead]);

  // Initialize connection on mount
  useEffect(() => {
    const cleanup = connectSocket();
    return cleanup;
  }, [connectSocket]);

  // Function to update messages from external sources (e.g., API)
  const updateMessages = useCallback((newMessages: any[]) => {
    setMessages(newMessages);
  }, []);

  // Send message
  const sendMessage = useCallback((content: string, attachments = [], replyTo?: string, mentions = []) => {
    if (!socketRef.current) {
      console.warn('Socket not connected. Message will be queued.');
      return null; // Return null to indicate socket is not available
    }
  
    // Generate temporary ID for optimistic updates
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Add message to local state immediately (optimistic update)
    const newMessage = {
      _id: tempId,
      ticket: ticketId,
      user: {
        _id: userId,
        firstName: currentUser?.firstName || "User", // Add current user info for better UX
        lastName: currentUser?.lastName || ""
      },
      content,
      attachments: attachments || [],
      replyTo,
      replyToContent: replyTo ? messages.find(m => m._id === replyTo)?.content : undefined,
      mentions,
      isPending: !isConnected,
      createdAt: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Send to server
    socketRef.current.emit('message', {
      content: content.trim(),
      ticketId,
      userId,
      replyTo,
      attachments,
      mentions,
      tempId
    });
    
    // For attachments, we'll rely on the file_uploaded event to add them
    return tempId;
  }, [ticketId, userId, isConnected, messages, currentUser]);

  // Edit message
  const editMessage = useCallback((messageId: string, newContent: string) => {
    socketRef.current?.emit('edit_message', {
      messageId,
      content: newContent,
      ticketId,
      userId
    });

    // Optimistic update
    setMessages(prev => {
      return prev.map(msg => {
        if (msg._id === messageId) {
          return { ...msg, content: newContent, isEdited: true };
        }
        return msg;
      });
    });
  }, [ticketId, userId]);

  // Add reaction to message
  const addReaction = useCallback((messageId: string, emoji: string) => {
    socketRef.current?.emit('add_reaction', {
      messageId,
      emoji,
      ticketId,
      userId
    });

    // Optimistic update
    setMessages(prev => {
      return prev.map(msg => {
        if (msg._id === messageId) {
          const existingReaction = (msg.reactions || []).find(
            (r:any) => r.emoji === emoji && r.userId === userId
          );

          if (existingReaction) {
            // Remove reaction if already exists
            return {
              ...msg,
              reactions: (msg.reactions || []).filter(
                (r:any) => !(r.emoji === emoji && r.userId === userId)
              )
            };
          } else {
            // Add new reaction
            return {
              ...msg,
              reactions: [
                ...(msg.reactions || []),
                { emoji, userId, createdAt: new Date().toISOString() }
              ]
            };
          }
        }
        return msg;
      });
    });
  }, [ticketId, userId]);

  // Mark messages as read
  const markMessagesAsRead = useCallback((messageIds: string[]) => {
    if (messageIds.length === 0) return;
    
    socketRef.current?.emit('mark_as_read', {
      messageIds,
      userId
    });

    // Optimistic update
    setMessages(prev => {
      return prev.map(msg => {
        if (messageIds.includes(msg._id)) {
          return {
            ...msg,
            readBy: [...(msg.readBy || []), userId]
          };
        }
        return msg;
      });
    });

    // Also update via API for persistence
    markAsRead({ commentIds: messageIds, userId }).catch(console.error);
  }, [userId, markAsRead]);

  // Send typing status
  const sendTyping = useCallback((isTyping: boolean) => {
    socketRef.current?.emit('typing', {
      isTyping,
      ticketId,
      userId
    });
  }, [ticketId, userId]);

  // Update user status
  const updateStatus = useCallback((status: 'online' | 'away' | 'busy' | 'offline') => {
    socketRef.current?.emit('update_status', {
      status,
      userId
    });
  }, [userId]);

  // Notify about file upload
  const notifyFileUpload = useCallback((fileData: any, messageId?: string) => {
    socketRef.current?.emit('file_uploaded', {
      ...fileData,
      ticketId,
      messageId: messageId || fileData.messageId || `temp-${Date.now()}`,
      userId
    });
  }, [ticketId, userId]);

  // Reconnect manually
  const reconnect = useCallback(() => {
    connectSocket();
  }, [connectSocket]);

  // Use refs to expose values that change frequently without causing re-renders 
  const typingUsers = useMemo(() => typingUsersRef.current, []);
  const onlineUsers = useMemo(() => onlineUsersRef.current, []);

  return {
    isConnected,
    isConnecting,
    connectionError,
    messages,
    typingUsers,
    onlineUsers,
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