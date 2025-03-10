// src/hooks/useSocketIo.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import getSocketService, { ChatMessage, SocketService } from '@/lib/socketService';

interface UseSocketIoProps {
  ticketId: string;
  userId: string;
}

export const useSocketIo = ({ ticketId, userId }: UseSocketIoProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [onlineUsers, setOnlineUsers] = useState<Record<string, string>>({});
  const [messageReactions, setMessageReactions] = useState<Record<string, any>>({});
  
  // Preserve the socket service instance
  const socketService = useRef<SocketService | null>(null);
  
  // Initialize the socket service
  useEffect(() => {
    if (!ticketId || !userId) return;
    
    // Get or create the socket service instance
    socketService.current = getSocketService();
    
    // Set up event listeners
    const handleConnect = () => {
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionError(null);
    };
    
    const handleDisconnect = (reason: string) => {
      setIsConnected(false);
      setConnectionError(`Disconnected: ${reason}`);
    };
    
    const handleError = (error: any) => {
      setConnectionError(error?.message || 'Connection error');
    };
    
    const handleReconnecting = () => {
      setIsConnecting(true);
    };
    
    const handleReconnectFailed = () => {
      setIsConnecting(false);
      setConnectionError('Failed to reconnect after multiple attempts');
    };
    
    const handleMessagesUpdated = (updatedMessages: ChatMessage[]) => {
      setMessages(updatedMessages);
    };
    
    const handleTypingUpdated = (typingData: Record<string, boolean>) => {
      setTypingUsers(typingData);
    };
    
    const handleUserStatusUpdated = (statusData: Record<string, string>) => {
      setOnlineUsers(statusData);
    };
    
    const handleReactionsUpdated = (reactionsData: Record<string, any>) => {
      setMessageReactions(reactionsData);
    };
    
    // Register all event listeners
    const service = socketService.current;
    service.on('connected', handleConnect);
    service.on('disconnected', handleDisconnect);
    service.on('connect_error', handleError);
    service.on('error', handleError);
    service.on('reconnecting', handleReconnecting);
    service.on('reconnect_failed', handleReconnectFailed);
    service.on('messages-updated', handleMessagesUpdated);
    service.on('typing-updated', handleTypingUpdated);
    service.on('user-status-updated', handleUserStatusUpdated);
    service.on('reactions-updated', handleReactionsUpdated);
    
    // Update connection state
    setIsConnected(service.isConnected());
    setIsConnecting(!service.isConnected());
    
    // Join the ticket room
    service.joinTicketRoom(ticketId, userId);
    
    // Set initial state from service
    setMessages(service.getMessages());
    setTypingUsers(service.getTypingUsers());
    setOnlineUsers(service.getOnlineUsers());
    setMessageReactions(service.getMessageReactions());
    
    // Clean up event listeners when unmounting
    return () => {
      if (service) {
        service.removeListener('connected', handleConnect);
        service.removeListener('disconnected', handleDisconnect);
        service.removeListener('connect_error', handleError);
        service.removeListener('error', handleError);
        service.removeListener('reconnecting', handleReconnecting);
        service.removeListener('reconnect_failed', handleReconnectFailed);
        service.removeListener('messages-updated', handleMessagesUpdated);
        service.removeListener('typing-updated', handleTypingUpdated);
        service.removeListener('user-status-updated', handleUserStatusUpdated);
        service.removeListener('reactions-updated', handleReactionsUpdated);
        
        // Leave the ticket room
        service.leaveTicketRoom();
      }
    };
  }, [ticketId, userId]);
  
  // Update messages from external source (e.g., RTK Query)
  const updateMessages = useCallback((newMessages: ChatMessage[]) => {
    if (socketService.current) {
      socketService.current.updateMessages(newMessages);
    }
  }, []);
  
  // Send a new message
  const sendMessage = useCallback((
    content: string, 
    attachments: any[] = [], 
    replyTo?: string, 
    mentions: string[] = []
  ): string => {
    if (!socketService.current) return '';
    return socketService.current.sendMessage(content, attachments, replyTo, mentions);
  }, []);
  
  // Edit a message
  const editMessage = useCallback((messageId: string, newContent: string) => {
    if (socketService.current) {
      socketService.current.editMessage(messageId, newContent);
    }
  }, []);
  
  // Add reaction to message
  const addReaction = useCallback((messageId: string, emoji: string) => {
    if (socketService.current) {
      socketService.current.addReaction(messageId, emoji);
    }
  }, []);
  
  // Mark messages as read
  const markMessagesAsRead = useCallback((messageIds: string[]) => {
    if (socketService.current && messageIds.length > 0) {
      socketService.current.markMessagesAsRead(messageIds);
    }
  }, []);
  
  // Send typing status
  const sendTyping = useCallback((isTyping: boolean) => {
    if (socketService.current) {
      socketService.current.sendTyping(isTyping);
    }
  }, []);
  
  // Update user status
  const updateStatus = useCallback((status: string) => {
    if (socketService.current) {
      socketService.current.updateStatus(status);
    }
  }, []);
  
  // Notify about file upload
  const notifyFileUpload = useCallback((fileInfo: any) => {
    if (socketService.current) {
      socketService.current.notifyFileUpload(fileInfo);
    }
  }, []);
  
  // Force reconnection
  const reconnect = useCallback(() => {
    if (socketService.current) {
      socketService.current.reconnect();
      setIsConnecting(true);
    }
  }, []);
  
  return {
    isConnected,
    isConnecting,
    connectionError,
    messages,
    typingUsers,
    onlineUsers,
    messageReactions,
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