// src/hooks/useSocketIo.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import getSocketService, { ChatMessage, MessageReaction } from '@/lib/socketService';

interface UseSocketIoProps {
  ticketId: string;
  userId: string;
  roomId?: string;
}

export const useSocketIo = ({ ticketId, userId, roomId }: UseSocketIoProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [onlineUsers, setOnlineUsers] = useState<Record<string, string>>({});
  const socketServiceRef = useRef(getSocketService());
  const [messageReactions, setMessageReactions] = useState<Record<string, any>>({});
  
  // Initialize socket service
  useEffect(() => {
    const socketService = getSocketService();
    
    // Set initial states
    console.log("Socket connection status:", socketService.isConnected());
    setIsConnected(socketService.isConnected());
    setIsConnecting(!socketService.isConnected());
    setMessages(socketService.getMessages());
    setTypingUsers(socketService.getTypingUsers());
    setOnlineUsers(socketService.getOnlineUsers());
    setMessageReactions(socketService.getMessageReactions());
    
    // Join the ticket room
    socketService.joinTicketRoom(ticketId, userId, roomId);
    
    // Event listeners
    const handleConnected = () => {
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionError(null);
      console.log("Socket connected event received");
    };
    
    const handleDisconnected = () => {
      setIsConnected(false);
      setIsConnecting(false);
    };
    
    const handleReconnecting = () => {
      console.log("Socket reconnecting...");
      setIsConnecting(true);
    };
    
    const handleError = (error: Error) => {
      setConnectionError(error);
      setIsConnecting(false);
    };
    
    const handleMessagesUpdated = (updatedMessages: ChatMessage[]) => {
      console.log(`Received ${updatedMessages.length} messages`);
      setMessages(updatedMessages);
    };
    
    const handleTypingUpdated = (typingStatus: Record<string, boolean>) => {
      setTypingUsers(typingStatus);
    };
    
    const handleUserStatusUpdated = (statusMap: Record<string, string>) => {
      setOnlineUsers(statusMap);
    };
    
    const handleReactionsUpdated = (reactionsData: Record<string, any>) => {
      setMessageReactions(reactionsData);
    };
    
    // Register all event listeners
    socketService.on('connected', handleConnected);
    socketService.on('disconnected', handleDisconnected);
    socketService.on('reconnecting', handleReconnecting);
    socketService.on('error', handleError);
    socketService.on('messages-updated', handleMessagesUpdated);
    socketService.on('typing-updated', handleTypingUpdated);
    socketService.on('user-status-updated', handleUserStatusUpdated);
    socketService.on('reactions-updated', handleReactionsUpdated);
    
    socketServiceRef.current = socketService;
    // Update connection state
    setIsConnected(socketService.isConnected());
    setIsConnecting(!socketService.isConnected());
    
    // Cleanup function
    return () => {
      socketService.removeListener('connected', handleConnected);
      socketService.removeListener('disconnected', handleDisconnected);
      socketService.removeListener('reconnecting', handleReconnecting);
      socketService.removeListener('error', handleError);
      socketService.removeListener('messages-updated', handleMessagesUpdated);
      socketService.removeListener('typing-updated', handleTypingUpdated);
      socketService.removeListener('user-status-updated', handleUserStatusUpdated);
      socketService.removeListener('reactions-updated', handleReactionsUpdated);
      
      // Leave the ticket room
      socketService.leaveTicketRoom();
    };
  }, [ticketId, userId, roomId]);
  
  // Callback functions to interact with the socket
  const updateMessages = useCallback((newMessages: ChatMessage[]) => {
    const socketService = socketServiceRef.current;
    socketService.updateMessages(newMessages);
  }, []);
  
  const sendMessage = useCallback((content: string, attachments: any[] = [], replyTo?: string, mentions: string[] = []) => {
    const socketService = getSocketService();
    return socketService.sendMessage(content, attachments, replyTo, mentions);
  }, []);
  
  const editMessage = useCallback((messageId: string, newContent: string) => {
    const socketService = socketServiceRef.current;
    socketService.editMessage(messageId, newContent);
  }, []);
  
  const addReaction = useCallback((messageId: string, emoji: string) => {
    const socketService = socketServiceRef.current;
    socketService.addReaction(messageId, emoji);
  }, []);
  
  const removeReaction = useCallback((messageId: string, emoji: string) => {
    const socketService = socketServiceRef.current;
    socketService.removeReaction(messageId, emoji);
  }, []);
  
  const markMessagesAsRead = useCallback((messageIds: string[]) => {
    const socketService = socketServiceRef.current;
    socketService.markMessagesAsRead(messageIds);
  }, []);
  
  const sendTyping = useCallback((isTyping: boolean) => {
    const socketService = socketServiceRef.current;
    socketService.sendTyping(isTyping);
  }, []);
  
  const updateStatus = useCallback((status: string) => {
    const socketService = getSocketService();
    socketService.updateStatus(status);
  }, []);
  
  const notifyFileUpload = useCallback((fileInfo: any) => {
    const socketService = socketServiceRef.current;
    socketService.notifyFileUpload(fileInfo);
  }, []);
  
  const reconnect = useCallback(() => {
    console.log("Manually reconnecting socket...");
    const socketService = socketServiceRef.current;
    socketService.reconnect();
    setIsConnecting(true);
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
    removeReaction,
    markMessagesAsRead,
    sendTyping,
    updateStatus,
    notifyFileUpload,
    reconnect
  };
};