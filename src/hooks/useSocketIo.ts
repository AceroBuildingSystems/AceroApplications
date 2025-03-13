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
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [joinedUsers, setJoinedUsers] = useState<{userId: string, username: string, timestamp: Date}[]>([]);
  const [leftUsers, setLeftUsers] = useState<{userId: string, username: string, timestamp: Date}[]>([]);
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
    
    // Set up event listeners
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
    
    const handleReconnectFailed = () => {
      setIsConnecting(false);
      setConnectionError(new Error('Failed to reconnect after multiple attempts'));
    };
    
    const handleConnectError = (error: Error) => {
      setConnectionError(error);
    };
    
    const handleError = (error: Error) => {
      setConnectionError(error);
    };
    
    const handleUserJoined = (data: {userId: string, username: string, timestamp: Date}) => {
      console.log('User joined:', data);
      if (data.userId !== userId) {
        setJoinedUsers(prev => [...prev, data]);
      }
    };
    
    const handleUserLeft = (data: {userId: string, username: string, timestamp: Date}) => {
      console.log('User left:', data);
      if (data.userId !== userId) {
        setLeftUsers(prev => [...prev, data]);
      }
    };
    
    const handleMessagesUpdated = (updatedMessages: ChatMessage[]) => {
      console.log(`Received ${updatedMessages.length} messages`);
      setMessages(updatedMessages);
    };
    
    const handleTypingUpdated = (typingStatus: Record<string, boolean>) => {
      setTypingUsers(typingStatus);
    };
    
    const handleUserStatusUpdated = (statusObj: Record<string, string>) => {
      setOnlineUsers(statusObj);
    };
    
    const handleReactionsUpdated = (reactions: Record<string, MessageReaction>) => {
      setMessageReactions(reactions);
    console.log('Reactions updated:', reactions);
    };
    
    // Register event listeners
    socketService.on('connected', handleConnected);
    socketService.on('disconnected', handleDisconnected);
    socketService.on('reconnecting', handleReconnecting);
    socketService.on('reconnect_failed', handleReconnectFailed);
    socketService.on('connect_error', handleConnectError);
    socketService.on('error', handleError);
    socketService.on('user-joined', handleUserJoined);
    socketService.on('user-left', handleUserLeft);
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
      socketService.off('connected', handleConnected);
      socketService.off('disconnected', handleDisconnected);
      socketService.off('reconnecting', handleReconnecting);
      socketService.off('reconnect_failed', handleReconnectFailed);
      socketService.off('connect_error', handleConnectError);
      socketService.off('error', handleError);
      socketService.off('user-joined', handleUserJoined);
      socketService.off('user-left', handleUserLeft);
      socketService.off('messages-updated', handleMessagesUpdated);
      socketService.off('typing-updated', handleTypingUpdated);
      socketService.off('user-status-updated', handleUserStatusUpdated);
      socketService.off('reactions-updated', handleReactionsUpdated);
      
      // Leave the room when component unmounts
      socketService.leaveTicketRoom();
    };
  }, [ticketId, userId, roomId]);
  
  // Callback functions to interact with the socket
  const updateMessages = useCallback((newMessages: ChatMessage[]) => {
    const socketService = socketServiceRef.current;
    socketService.updateMessages(newMessages);
  }, []);
  
  const sendMessage = useCallback((content: string, attachments: any[] = [], replyTo?: string, mentions: string[] = []) => {
    const socketService = socketServiceRef.current;
    return socketService.sendMessage(content, attachments, replyTo, mentions);
  }, []);
  
  const editMessage = useCallback((messageId: string, newContent: string) => {
    const socketService = socketServiceRef.current;
    socketService.editMessage(messageId, newContent);
  }, []);
  
  const addReaction = useCallback((messageId: string, emoji: string) => {
    const socketService = socketServiceRef.current;
    socketService.addReaction(messageId, emoji);
    
    // Log for debugging
    console.log(`Adding reaction ${emoji} to message ${messageId}`);
  }, []);
  
  const removeReaction = useCallback((messageId: string, emoji: string) => {
    const socketService = socketServiceRef.current;
    socketService.removeReaction(messageId, emoji);
    
    // Log for debugging
    console.log(`Removing reaction ${emoji} from message ${messageId}`);
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
    joinedUsers,
    leftUsers,
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