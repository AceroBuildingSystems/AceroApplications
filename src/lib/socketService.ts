// src/lib/socketService.ts
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import { EventEmitter } from 'events';

export interface SocketUser {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface ChatMessage {
  _id: string;
  ticket: string;
  user: SocketUser;
  content: string;
  attachments?: Array<{
    fileName: string;
    fileType: string;
    fileSize: number;
    url: string;
    uploadedAt: Date;
  }>;
  replyTo?: string;
  replyToUser?: SocketUser;
  replyToContent?: string;
  mentions?: string[];
  reactions?: Array<{
    emoji: string;
    userId: string;
    createdAt: Date;
  }>;
  isEdited?: boolean;
  readBy?: string[];
  deliveredAt?: Date;
  readAt?: Date;
  createdAt: string;
  isPending?: boolean;
  error?: boolean;
}

export interface MessageReaction {
  emoji: string;
  messageId: string;
  reactions: Array<{
    emoji: string;
    userId: string;
    createdAt: Date;
  }>;
}

interface SocketServiceOptions {
  serverUrl?: string;
  autoConnect?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

export class SocketService extends EventEmitter {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private serverUrl: string;
  private autoConnect: boolean;
  private reconnectionAttempts: number;
  private reconnectionDelay: number;
  private connectionAttempts: number = 0;
  private currentTicketId: string | null = null;
  private currentUserId: string | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private isInitialized: boolean = false;
  
  private messagesCache: Map<string, ChatMessage[]> = new Map();
  private typingUsersMap: Map<string, boolean> = new Map();
  private onlineUsersMap: Map<string, string> = new Map();
  private reactionsCache: Map<string, MessageReaction> = new Map();
  private pendingMessages: Map<string, ChatMessage> = new Map();
  private pendingReactions: Map<string, { messageId: string, emoji: string }> = new Map();
  
  private constructor(options: SocketServiceOptions = {}) {
    super();
    this.serverUrl = options.serverUrl || `/api/socketio`;
    this.autoConnect = options.autoConnect !== undefined ? options.autoConnect : true;
    this.reconnectionAttempts = options.reconnectionAttempts || 5;
    this.reconnectionDelay = options.reconnectionDelay || 3000;
    
    // Setup periodic sync to ensure messages get saved
    this.setupPeriodicSync();
    
    if (this.autoConnect) {
      this.init();
    }
  }
  
  /**
   * Setup periodic sync to ensure pending messages get saved
   */
  private setupPeriodicSync(): void {
    // Every 30 seconds, check for pending messages and try to save them
    setInterval(() => {
      this.syncPendingMessages();
    }, 30000);
  }
  
  /**
   * Sync pending messages with the server
   */
  private syncPendingMessages(): void {
    if (this.pendingMessages.size === 0) return;
    
    // If connected, try to resend pending messages
    if (this.socket?.connected) {
      this.resendPendingMessages();
    } else {
      // Otherwise, try to save via REST API
      this.pendingMessages.forEach(message => {
        if (!message.error) {
          this.savePendingMessageToDatabase(message);
        }
      });
    }
  }
  
  /**
   * Get the singleton instance of SocketService
   */
  public static getInstance(options?: SocketServiceOptions): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService(options);
    }
    return SocketService.instance;
  }
  
  /**
   * Initialize the socket connection
   */
  public init(): void {
    if (this.isInitialized || this.socket) return;
    
    console.log('Initializing socket connection...');
    this.isInitialized = true;
    
    try {
      this.socket = io({
        path: this.serverUrl,
        reconnection: true,
        reconnectionAttempts: this.reconnectionAttempts,
        reconnectionDelay: this.reconnectionDelay,
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });
      
      this.setupEventListeners();
      this.startPingInterval();
    } catch (error) {
      console.error('Socket initialization error:', error);
      this.isInitialized = false;
      this.emit('error', { message: 'Failed to initialize socket connection' });
    }
  }
  
  /**
   * Set up event listeners for socket events
   */
  private setupEventListeners(): void {
    if (!this.socket) return;
    
    // Connection events
    this.socket.on('connect', this.handleConnect.bind(this));
    this.socket.on('disconnect', this.handleDisconnect.bind(this));
    this.socket.on('connect_error', this.handleConnectError.bind(this));
    this.socket.on('error', this.handleError.bind(this));
    
    // Message events
    this.socket.on('message', this.handleMessage.bind(this));
    this.socket.on('message-ack', this.handleMessageAck.bind(this));
    this.socket.on('typing', this.handleTyping.bind(this));
    this.socket.on('message-reaction', this.handleMessageReaction.bind(this));
    this.socket.on('message-reaction-update', this.handleMessageReactionUpdate.bind(this));
    this.socket.on('file-upload', this.handleFileUpload.bind(this));
    
    // Read receipts
    this.socket.on('read-receipt', this.handleReadReceipt.bind(this));
    this.socket.on('read-receipt-update', this.handleReadReceiptUpdate.bind(this));
    this.socket.on('messages-read', this.handleMessagesRead.bind(this));
    
    // User status
    this.socket.on('user-status', this.handleUserStatus.bind(this));
    this.socket.on('online-users-update', this.handleOnlineUsersUpdate.bind(this));
    
    // System events
    this.socket.on('joined', this.handleJoinedRoom.bind(this));
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.emit('error', error);
    });
  }
  
  /**
   * Connect to a ticket room
   */
  public joinTicketRoom(ticketId: string, userId: string): void {
    if (!this.socket || !this.socket.connected) {
      this.init();
    }
    
    this.currentTicketId = ticketId;
    this.currentUserId = userId;
    
    if (this.socket?.connected) {
      this.socket.emit('join', { ticketId, userId });
      this.emit('joining', { ticketId });
    } else {
      // Queue join for when connection is established
      this.once('connected', () => {
        this.socket?.emit('join', { ticketId, userId });
        this.emit('joining', { ticketId });
      });
    }
    
    // Set auth data for reconnection
    if (this.socket) {
      this.socket.auth = { userId };
    }
  }
  
  /**
   * Leave the current ticket room
   */
  public leaveTicketRoom(): void {
    if (this.socket && this.currentTicketId) {
      this.socket.emit('leave', this.currentTicketId);
      this.currentTicketId = null;
    }
  }
  
  /**
   * Send a message
   */
  public sendMessage(
    content: string, 
    attachments: any[] = [], 
    replyTo?: string, 
    mentions: string[] = []
  ): string {
    // Generate a temporary ID for the message
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    if (!this.currentTicketId || !this.currentUserId) {
      console.error('Cannot send message: Missing ticketId/userId');
      return tempId;
    }
    
    // Create a pending message object
    const pendingMessage: ChatMessage = {
      _id: tempId,
      ticket: this.currentTicketId,
      user: { 
        _id: this.currentUserId,
        firstName: '', // Will be populated from the server response
        lastName: ''
      },
      content,
      attachments,
      ...(replyTo && { replyTo }),
      mentions,
      createdAt: new Date().toISOString(),
      isPending: true,
      readBy: [this.currentUserId]
    };
    
    // Add to pending messages
    this.pendingMessages.set(tempId, pendingMessage);
    
    // Add to current message list and notify subscribers
    this.addMessageToCache(pendingMessage);
    
    // If socket is connected, send to server
    if (this.socket && this.socket.connected) {
      this.socket.emit('message', {
        ticketId: this.currentTicketId,
        userId: this.currentUserId,
        content,
        attachments,
        replyTo,
        mentions,
        tempId
      });
    } else {
      // If socket is not connected, fall back to REST API
      this.savePendingMessageToDatabase(pendingMessage);
    }
    
    return tempId;
  }
  
  /**
   * Save pending message to database via REST API
   * This serves as a fallback when socket is not connected
   */
  private async savePendingMessageToDatabase(message: ChatMessage): Promise<void> {
    try {
      // Create the payload structure required by the API
      const payload = {
        action: 'create',
        data: {
          ticket: message.ticket,
          user: message.user._id,
          content: message.content,
          attachments: message.attachments || [],
          replyTo: message.replyTo,
          mentions: message.mentions || [],
          addedBy: message.user._id,
          updatedBy: message.user._id
        }
      };
      
      // Make the API call
      const response = await fetch('/api/ticket-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'SUCCESS' || data.status === 'Success') {
        // If successful, update the pending message with real ID
        const actualMessage = data.data;
        this.handleMessageAck({
          messageId: actualMessage._id,
          tempId: message._id,
          status: 'delivered',
          timestamp: actualMessage.createdAt
        });
      }
    } catch (error) {
      console.error('Failed to save message via API:', error);
      
      // Mark message as having an error
      const pendingMessage = this.pendingMessages.get(message._id);
      if (pendingMessage) {
        pendingMessage.error = true;
        this.updateMessageInCache(message._id, pendingMessage);
      }
    }
  }
  
  /**
   * Edit a message
   */
  public editMessage(messageId: string, newContent: string): void {
    if (!this.socket || !this.currentTicketId || !this.currentUserId) {
      console.error('Cannot edit message: Socket not connected or missing ticketId/userId');
      return;
    }
    
    // Send edit request
    this.socket.emit('edit-message', {
      messageId,
      ticketId: this.currentTicketId,
      userId: this.currentUserId,
      content: newContent
    });
    
    // Optimistically update the message in cache
    this.updateMessageInCache(messageId, {
      content: newContent,
      isEdited: true
    });
  }
  
  /**
   * Add a reaction to a message
   */
  public addReaction(messageId: string, emoji: string): void {
    if (!this.socket || !this.currentTicketId || !this.currentUserId) {
      console.error('Cannot add reaction: Socket not connected or missing ticketId/userId');
      return;
    }
    
    // Store pending reaction
    const pendingKey = `${messageId}-${emoji}`;
    this.pendingReactions.set(pendingKey, { messageId, emoji });
    
    // Optimistically update cache
    this.updateMessageReactionInCache(messageId, emoji, this.currentUserId, true);
    
    // Send reaction
    this.socket.emit('message-reaction', {
      messageId,
      ticketId: this.currentTicketId, 
      userId: this.currentUserId,
      emoji,
      action: 'add'
    });
  }
  
  /**
   * Remove a reaction from a message
   */
  public removeReaction(messageId: string, emoji: string): void {
    if (!this.socket || !this.currentTicketId || !this.currentUserId) {
      console.error('Cannot remove reaction: Socket not connected or missing ticketId/userId');
      return;
    }
    
    // Optimistically update cache
    this.updateMessageReactionInCache(messageId, emoji, this.currentUserId, false);
    
    // Send reaction removal
    this.socket.emit('message-reaction', {
      messageId,
      ticketId: this.currentTicketId,
      userId: this.currentUserId,
      emoji,
      action: 'remove'
    });
  }
  
  /**
   * Mark messages as read
   */
  public markMessagesAsRead(messageIds: string[]): void {
    if (!this.socket || !this.currentTicketId || !this.currentUserId || messageIds.length === 0) {
      return;
    }
    
    // Send read receipt
    this.socket.emit('read-receipt', {
      messageIds,
      userId: this.currentUserId,
      ticketId: this.currentTicketId
    });
    
    // Optimistically update cache
    messageIds.forEach(id => {
      this.updateMessageInCache(id, {
        readBy: [...(this.getMessageFromCache(id)?.readBy || []), this.currentUserId]
      });
    });
  }
  
  /**
   * Send typing status
   */
  public sendTyping(isTyping: boolean): void {
    if (!this.socket || !this.currentTicketId || !this.currentUserId) {
      return;
    }
    
    this.socket.emit('typing', {
      ticketId: this.currentTicketId,
      userId: this.currentUserId,
      isTyping
    });
  }
  
  /**
   * Update user status
   */
  public updateStatus(status: string): void {
    if (!this.socket || !this.currentUserId) {
      return;
    }
    
    this.socket.emit('user-status', {
      userId: this.currentUserId,
      status,
      ticketId: this.currentTicketId
    });
  }
  
  /**
   * Notify about file upload
   */
  public notifyFileUpload(fileInfo: any): void {
    if (!this.socket || !this.currentTicketId) {
      return;
    }
    
    this.socket.emit('file-upload', {
      ticketId: this.currentTicketId,
      fileInfo
    });
  }
  
  /**
   * Update messages in cache when received from server
   */
  public updateMessages(messages: ChatMessage[]): void {
    if (!this.currentTicketId) return;
    
    // Replace entire cache for this ticket
    this.messagesCache.set(this.currentTicketId, messages);
    this.emit('messages-updated', messages);
  }
  
  /**
   * Get all cached messages for current ticket
   */
  public getMessages(): ChatMessage[] {
    if (!this.currentTicketId) return [];
    return this.messagesCache.get(this.currentTicketId) || [];
  }
  
  /**
   * Get typing users for current ticket
   */
  public getTypingUsers(): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    this.typingUsersMap.forEach((isTyping, userId) => {
      result[userId] = isTyping;
    });
    return result;
  }
  
  /**
   * Get online users
   */
  public getOnlineUsers(): Record<string, string> {
    const result: Record<string, string> = {};
    this.onlineUsersMap.forEach((status, userId) => {
      result[userId] = status;
    });
    return result;
  }
  
  /**
   * Get message reactions
   */
  public getMessageReactions(): Record<string, any> {
    const result: Record<string, any> = {};
    this.reactionsCache.forEach((reaction, messageId) => {
      result[messageId] = reaction;
    });
    return result;
  }
  
  /**
   * Check if socket is connected
   */
  public isConnected(): boolean {
    return this.socket?.connected || false;
  }
  
  /**
   * Force reconnection
   */
  public reconnect(): void {
    if (this.socket) {
      this.socket.connect();
    } else {
      this.init();
    }
  }
  
  /**
   * Clean up resources
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
    
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    this.isInitialized = false;
    this.currentTicketId = null;
    this.currentUserId = null;
    this.removeAllListeners();
  }
  
  /**
   * Start ping interval to keep connection alive
   */
  private startPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    
    this.pingInterval = setInterval(() => {
      if (this.socket?.connected) {
        fetch('/api/socket', { method: 'POST' })
          .catch(err => console.error('Ping error:', err));
      }
    }, 30000); // 30 seconds
  }
  
  /**
   * Handle socket connect event
   */
  private handleConnect(): void {
    console.log('Socket connected');
    this.connectionAttempts = 0;
    this.emit('connected');
    
    // Rejoin room if needed
    if (this.currentTicketId && this.currentUserId) {
      this.socket?.emit('join', { 
        ticketId: this.currentTicketId, 
        userId: this.currentUserId 
      });
    }
    
    // Fetch messages from server to ensure we have the latest
    this.fetchMessagesFromServer();
    
    // Resend any pending messages
    this.resendPendingMessages();
  }
  
  /**
   * Fetch messages from server using REST API
   * This ensures we have the latest messages even after connection issues
   */
  private async fetchMessagesFromServer(): Promise<void> {
    if (!this.currentTicketId) return;
    
    try {
      const response = await fetch(`/api/ticket-comment?ticketId=${this.currentTicketId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'SUCCESS' || data.status === 'Success') {
        const serverMessages = data.data || [];
        
        // Merge with our current messages
        this.mergeWithServerMessages(serverMessages);
      }
    } catch (error) {
      console.error('Failed to fetch messages via API:', error);
    }
  }
  
  /**
   * Merge server messages with current cached messages
   */
  private mergeWithServerMessages(serverMessages: ChatMessage[]): void {
    if (!this.currentTicketId || !serverMessages.length) return;
    
    const currentMessages = this.messagesCache.get(this.currentTicketId) || [];
    const pendingMessages = Array.from(this.pendingMessages.values());
    
    // Identify messages that are in the cache but not on the server (still pending)
    const pendingMessageIds = pendingMessages.map(msg => msg._id);
    
    // Create a map of server message IDs for quick lookup
    const serverMessageIds = new Set(serverMessages.map(msg => msg._id));
    
    // Create a new merged array
    const mergedMessages = [
      ...serverMessages,
      // Add any pending messages that aren't yet on the server
      ...pendingMessages.filter(msg => !serverMessageIds.has(msg._id))
    ];
    
    // Sort by created date
    mergedMessages.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    // Update the cache
    this.messagesCache.set(this.currentTicketId, mergedMessages);
    this.emit('messages-updated', mergedMessages);
  }
  
  /**
   * Handle socket disconnect event
   */
  private handleDisconnect(reason: string): void {
    console.log('Socket disconnected:', reason);
    this.emit('disconnected', reason);
    
    // If disconnected due to transport error, try to reconnect
    if (reason === 'transport error' || reason === 'ping timeout') {
      if (this.connectionAttempts < this.reconnectionAttempts) {
        this.connectionAttempts++;
        this.emit('reconnecting', this.connectionAttempts);
        
        setTimeout(() => {
          this.reconnect();
        }, this.reconnectionDelay);
      } else {
        this.emit('reconnect_failed');
      }
    }
  }
  
  /**
   * Handle connection error
   */
  private handleConnectError(error: any): void {
    console.error('Socket connection error:', error);
    this.emit('connect_error', error);
  }
  
  /**
   * Handle socket error
   */
  private handleError(error: any): void {
    console.error('Socket error:', error);
    this.emit('error', error);
  }
  
  /**
   * Handle incoming message
   */
  private handleMessage(message: ChatMessage): void {
    // Replace any pending message with real message
    this.resolvePendingMessage(message);
    
    // Add message to cache
    this.addMessageToCache(message);
    
    // Automatically mark as read if from others
    if (message.user._id !== this.currentUserId) {
      this.markMessagesAsRead([message._id]);
    }
  }
  
  /**
   * Handle message acknowledgement
   */
  private handleMessageAck(ack: { messageId: string, tempId?: string, status: string, timestamp: string }): void {
    // If this is a response to a pending message, update it
    if (ack.tempId && this.pendingMessages.has(ack.tempId)) {
      const pendingMessage = this.pendingMessages.get(ack.tempId);
      if (pendingMessage) {
        // Remove the pending flag and update ID
        pendingMessage.isPending = false;
        pendingMessage._id = ack.messageId;
        pendingMessage.deliveredAt = new Date(ack.timestamp);
        
        // Update in cache with new ID
        this.removeMessageFromCache(ack.tempId);
        this.addMessageToCache(pendingMessage);
        
        // Clean up pending message
        this.pendingMessages.delete(ack.tempId);
      }
    }
  }
  
  /**
   * Handle typing event
   */
  private handleTyping(data: { userId: string, isTyping: boolean }): void {
    this.typingUsersMap.set(data.userId, data.isTyping);
    this.emit('typing-updated', this.getTypingUsers());
  }
  
  /**
   * Handle message reaction
   */
  private handleMessageReaction(reaction: MessageReaction): void {
    this.reactionsCache.set(reaction.messageId, reaction);
    
    // Update message in cache
    const message = this.getMessageFromCache(reaction.messageId);
    if (message) {
      message.reactions = reaction.reactions;
      this.updateMessageInCache(reaction.messageId, message);
    }
    
    this.emit('reactions-updated', this.getMessageReactions());
  }
  
  /**
   * Handle message reaction update
   */
  private handleMessageReactionUpdate(data: { messageId: string, reactions: any[] }): void {
    const { messageId, reactions } = data;
    
    // Update message in cache
    const message = this.getMessageFromCache(messageId);
    if (message) {
      message.reactions = reactions;
      this.updateMessageInCache(messageId, message);
    }
    
    // Update reactions cache
    this.reactionsCache.set(messageId, {
      messageId,
      emoji: '',
      reactions
    });
    
    this.emit('reactions-updated', this.getMessageReactions());
  }
  
  /**
   * Handle file upload notification
   */
  private handleFileUpload(fileInfo: any): void {
    this.emit('file-uploaded', fileInfo);
  }
  
  /**
   * Handle read receipt
   */
  private handleReadReceipt(data: { userId: string, messageId: string }): void {
    const { userId, messageId } = data;
    
    // Update message in cache
    const message = this.getMessageFromCache(messageId);
    if (message) {
      message.readBy = [...(message.readBy || []), userId];
      message.isRead = true;
      message.readAt = new Date();
      this.updateMessageInCache(messageId, message);
    }
  }
  
  /**
   * Handle read receipt update
   */
  private handleReadReceiptUpdate(data: { messageIds: string[], userId: string, timestamp: Date }): void {
    const { messageIds, userId, timestamp } = data;
    
    // Update messages in cache
    messageIds.forEach(messageId => {
      const message = this.getMessageFromCache(messageId);
      if (message) {
        message.readBy = [...(message.readBy || []), userId];
        message.isRead = true;
        message.readAt = timestamp;
        this.updateMessageInCache(messageId, message);
      }
    });
  }
  
  /**
   * Handle messages read event
   */
  private handleMessagesRead(data: { userId: string, messageIds: string[], timestamp: Date }): void {
    const { messageIds, userId, timestamp } = data;
    
    // Update messages in cache
    messageIds.forEach(messageId => {
      const message = this.getMessageFromCache(messageId);
      if (message) {
        message.readBy = [...(message.readBy || []), userId];
        message.isRead = true;
        message.readAt = timestamp;
        this.updateMessageInCache(messageId, message);
      }
    });
  }
  
  /**
   * Handle user status
   */
  private handleUserStatus(data: { userId: string, status: string }): void {
    const { userId, status } = data;
    this.onlineUsersMap.set(userId, status);
    this.emit('user-status-updated', this.getOnlineUsers());
  }
  
  /**
   * Handle online users update
   */
  private handleOnlineUsersUpdate(statusObj: Record<string, string>): void {
    // Clear existing map
    this.onlineUsersMap.clear();
    
    // Fill with new data
    Object.entries(statusObj).forEach(([userId, status]) => {
      this.onlineUsersMap.set(userId, status);
    });
    
    this.emit('user-status-updated', this.getOnlineUsers());
  }
  
  /**
   * Handle joined room event
   */
  private handleJoinedRoom(data: { ticketId: string, success: boolean }): void {
    if (data.success) {
      this.emit('joined', data.ticketId);
    }
  }
  
  /**
   * Add a message to the cache
   */
  private addMessageToCache(message: ChatMessage): void {
    if (!this.currentTicketId) return;
    
    const messages = this.messagesCache.get(this.currentTicketId) || [];
    
    // Find if message already exists to avoid duplicates
    const existingIndex = messages.findIndex(m => m._id === message._id);
    
    if (existingIndex >= 0) {
      // Replace existing message
      messages[existingIndex] = message;
    } else {
      // Add new message
      messages.push(message);
      
      // Sort messages by creation date
      messages.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
    
    this.messagesCache.set(this.currentTicketId, messages);
    this.emit('messages-updated', messages);
  }
  
  /**
   * Remove a message from the cache
   */
  private removeMessageFromCache(messageId: string): void {
    if (!this.currentTicketId) return;
    
    const messages = this.messagesCache.get(this.currentTicketId) || [];
    const updatedMessages = messages.filter(m => m._id !== messageId);
    
    this.messagesCache.set(this.currentTicketId, updatedMessages);
    this.emit('messages-updated', updatedMessages);
  }
  
  /**
   * Update a message in the cache
   */
  private updateMessageInCache(messageId: string, updates: Partial<ChatMessage>): void {
    if (!this.currentTicketId) return;
    
    const messages = this.messagesCache.get(this.currentTicketId) || [];
    const messageIndex = messages.findIndex(m => m._id === messageId);
    
    if (messageIndex >= 0) {
      messages[messageIndex] = { ...messages[messageIndex], ...updates };
      this.messagesCache.set(this.currentTicketId, messages);
      this.emit('messages-updated', messages);
    }
  }
  
  /**
   * Get a message from the cache
   */
  private getMessageFromCache(messageId: string): ChatMessage | undefined {
    if (!this.currentTicketId) return undefined;
    
    const messages = this.messagesCache.get(this.currentTicketId) || [];
    return messages.find(m => m._id === messageId);
  }
  
  /**
   * Update message reaction in cache
   */
  private updateMessageReactionInCache(
    messageId: string, 
    emoji: string, 
    userId: string, 
    isAdding: boolean
  ): void {
    const message = this.getMessageFromCache(messageId);
    
    if (message) {
      if (!message.reactions) {
        message.reactions = [];
      }
      
      if (isAdding) {
        // Check if reaction already exists
        const existingReaction = message.reactions.find(
          r => r.emoji === emoji && r.userId === userId
        );
        
        if (!existingReaction) {
          message.reactions.push({
            emoji,
            userId,
            createdAt: new Date()
          });
        }
      } else {
        // Remove reaction
        message.reactions = message.reactions.filter(
          r => !(r.emoji === emoji && r.userId === userId)
        );
      }
      
      this.updateMessageInCache(messageId, { reactions: message.reactions });
    }
  }
  
  /**
   * Resolve a pending message with the actual message from the server
   */
  private resolvePendingMessage(message: ChatMessage): void {
    if (!message || !this.pendingMessages.size) return;
    
    // Check if this message resolves any pending messages
    this.pendingMessages.forEach((pendingMsg, tempId) => {
      if (
        pendingMsg.content === message.content &&
        pendingMsg.user._id === message.user._id &&
        Math.abs(new Date(pendingMsg.createdAt).getTime() - new Date(message.createdAt).getTime()) < 30000
      ) {
        // This is likely the same message
        this.removeMessageFromCache(tempId);
        this.pendingMessages.delete(tempId);
      }
    });
  }
  
  /**
   * Resend any pending messages after reconnection
   */
  private resendPendingMessages(): void {
    if (!this.socket || !this.currentTicketId || !this.currentUserId) return;
    
    // Resend all pending messages
    this.pendingMessages.forEach((message, tempId) => {
      this.socket?.emit('message', {
        ticketId: this.currentTicketId,
        userId: this.currentUserId,
        content: message.content,
        attachments: message.attachments || [],
        replyTo: message.replyTo,
        mentions: message.mentions || [],
        tempId
      });
    });
    
    // Resend any pending reactions
    this.pendingReactions.forEach((data, key) => {
      this.socket?.emit('message-reaction', {
        messageId: data.messageId,
        ticketId: this.currentTicketId,
        userId: this.currentUserId,
        emoji: data.emoji,
        action: 'add'
      });
    });
  }
}

export default SocketService.getInstance;