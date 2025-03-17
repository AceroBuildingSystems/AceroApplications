// src/components/TicketComponent/TicketChat.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetTicketCommentsQuery, useUploadFileMutation } from '@/services/endpoints/ticketCommentApi';
import { useGetMasterQuery } from '@/services/endpoints/masterApi';
import DashboardLoader from '@/components/ui/DashboardLoader';
import debounce from 'lodash/debounce';
import { toast } from 'react-toastify';
import { useSocketIo } from '@/hooks/useSocketIo';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import MessageBubble from './MessageBubble';

import {
  Paperclip,
  Send,
  File,
  X,
  AtSign,
  CornerUpRight,
  Smile,
  Loader2,
  Image as ImageIcon,
  Video,
  RefreshCw,
  WifiOff,
  Users,
  User,
  Clock
} from 'lucide-react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface TicketChatProps {
  ticketId: string;
  userId: string;
  currentUser: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  roomId?: string;
  isLoading?: boolean;
  isMinimal?: boolean;  // New prop for minimal mode in the collapsible view
}

const TicketChat: React.FC<TicketChatProps> = ({
  ticketId,
  userId,
  currentUser,
  roomId,
  isLoading: propLoading = false,
  isMinimal = false
}) => {
  // State
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentionsPopover, setShowMentionsPopover] = useState(false);
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [replyingTo, setReplyingTo] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch comments
  const { data: commentsData = {}, isLoading: commentsLoading, refetch: refetchComments } = useGetTicketCommentsQuery({ 
    ticketId 
  });
  
  // File upload mutation
  const [uploadFileMutation, { isLoading: isUploading }] = useUploadFileMutation();
  
  // Fetch team members for mentions
  const { data: teamMembersData = {}, isLoading: teamMembersLoading } = useGetMasterQuery({
    db: 'USER_MASTER',
    filter: { isActive: true },
    sort: { firstName: 1 }
  });

  const teamMembers = teamMembersData?.data || [];
  
  // Socket.io integration
  const { 
    isConnected, 
    isConnecting,
    connectionError,
    messages: socketMessages,
    typingUsers,
    onlineUsers,
    updateMessages,
    sendMessage,
    editMessage,
    addReaction,
    markMessagesAsRead,
    sendTyping,
    notifyFileUpload,
    reconnect
  } = useSocketIo({ 
    ticketId, 
    userId,
    roomId
  });
  
  // Initialize socket messages with data from API
  useEffect(() => {
    if (commentsData?.data?.length > 0 && updateMessages) {
      updateMessages(commentsData.data);
    }
  }, [commentsData?.data, updateMessages]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [socketMessages]);
  
  // Mark unread messages as read
  useEffect(() => {
    if (document.visibilityState === 'visible') {
      const unreadMessageIds = socketMessages
        .filter(msg => 
          msg.user._id !== userId && 
          (!msg.readBy || !msg.readBy.includes(userId))
        )
        .map(msg => msg._id);
      
      if (unreadMessageIds.length > 0) {
        markMessagesAsRead(unreadMessageIds);
      }
    }
  }, [socketMessages, userId, markMessagesAsRead]);
  
  // Handle typing status with debounce
  const debouncedTyping = useRef(
    debounce((isTyping: boolean) => {
      sendTyping(isTyping);
    }, 300)
  ).current;
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
    }
  };
  
  // Handle file removal
  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  // Handle file upload
  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) return [];
    
    const uploadedFiles = [];
    
    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('ticketId', ticketId);
      formData.append('userId', userId);
      
      try {
        // Use your upload API endpoint
        const response = await fetch('/api/file-upload', {
          method: 'POST',
          body: formData,
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
          uploadedFiles.push(result.data);
          notifyFileUpload?.(result.data);
        } else {
          throw new Error(result.message || 'Upload failed');
        }
      } catch (error) {
        console.error('File upload error:', error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    
    return uploadedFiles;
  };
  
  // Handle message input for mentions
  const handleMessageInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    // Send typing indicator
    if (value.length > 0) {
      debouncedTyping(true);
    } else {
      debouncedTyping(false);
    }
    
    // Check for mention patterns
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const atSignIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atSignIndex !== -1 && (atSignIndex === 0 || textBeforeCursor[atSignIndex - 1] === ' ')) {
      const query = textBeforeCursor.substring(atSignIndex + 1);
      if (!query.includes(' ')) {
        setMentionQuery(query);
        setMentionStartIndex(atSignIndex);
        setShowMentionsPopover(true);
        return;
      }
    }
    
    setShowMentionsPopover(false);
  };
  
  // Insert mention into message
  const insertMention = (user: any) => {
    if (mentionStartIndex === -1) return;
    
    const beforeMention = message.substring(0, mentionStartIndex);
    const afterMention = message.substring(mentionStartIndex + mentionQuery.length + 1);
    const mentionText = `@${user.firstName} ${user.lastName} `;
    
    setMessage(beforeMention + mentionText + afterMention);
    setShowMentionsPopover(false);
    
    // Set focus back to textarea and place cursor after mention
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const cursorPosition = beforeMention.length + mentionText.length;
        textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  };
  
  // Filter team members for mention suggestions
  const filteredTeamMembers = teamMembers.filter(user => 
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(mentionQuery.toLowerCase())
  );
  
  // Handle reply to a message
  const handleReply = (message: any) => {
    setReplyingTo(message);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  
  // Cancel reply
  const cancelReply = () => {
    setReplyingTo(null);
  };
  
  // Extract mentions from message
  const extractMentions = (content: string): string[] => {
    const mentions: string[] = [];
    const mentionRegex = /@([a-zA-Z]+ [a-zA-Z]+)/g;
    const matches = content.match(mentionRegex) || [];
    
    matches.forEach(match => {
      const name = match.substring(1).trim();
      const user = teamMembers.find(
        u => `${u.firstName} ${u.lastName}`.toLowerCase() === name.toLowerCase()
      );
      if (user) mentions.push(user._id);
    });
    
    return mentions;
  };
  
  // Handle message submission
  const handleSubmit = async () => {
    if ((!message.trim() && selectedFiles.length === 0) || isSubmitting || isUploading) return;
    
    try {
      setIsSubmitting(true);
      
      // Upload files first if any
      const uploadedFiles = await handleFileUpload();
      
      // Extract mentions
      const mentionedUserIds = extractMentions(message);
      
      // Send message via Socket.io
      sendMessage(message, uploadedFiles, replyingTo?._id, mentionedUserIds);
      
      // Clear state
      setMessage('');
      setSelectedFiles([]);
      setReplyingTo(null);
      
      // Refresh comments after a delay
      setTimeout(() => {
        try { refetchComments(); } catch (e) { /* Ignore if component unmounted */ }
      }, 1000);
    } catch (error) {
      console.error("Message submission error:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Group messages by date
  const groupMessagesByDate = () => {
    const groups: { [key: string]: any[] } = {};
    
    socketMessages.forEach(message => {
      const date = new Date(message.createdAt).toISOString().split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages
    }));
  };
  
  const messageGroups = groupMessagesByDate();
  
  // Format content to highlight mentions
  const formatMessageContent = (content: string) => {
    const parts = [];
    const mentionRegex = /@([a-zA-Z]+ [a-zA-Z]+)/g;
    let lastIndex = 0;
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{content.substring(lastIndex, match.index)}</span>);
      }
      
      const mentionName = match[1];
      parts.push(
        <Badge variant="secondary" className="font-normal" key={`mention-${match.index}`}>
          @{mentionName}
        </Badge>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < content.length) {
      parts.push(<span key={`text-${lastIndex}`}>{content.substring(lastIndex)}</span>);
    }
    
    return parts;
  };
  
  // Extract all participants
  const participants = Array.from(new Set(
    socketMessages.map(msg => msg.user._id)
  )).map(userId => {
    const user = socketMessages.find(msg => msg.user._id === userId)?.user;
    return user ? {
      ...user,
      status: onlineUsers[userId] || 'offline'
    } : null;
  }).filter(Boolean);
  
  // Get icon based on file type
  const getFileIcon = (fileType: string) => {
    if (!fileType) return <File className="h-4 w-4" />;
    
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (fileType.startsWith('video/')) {
      return <Video className="h-4 w-4" />;
    } else if (fileType.includes('pdf')) {
      return <File className="h-4 w-4 text-red-500" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  // Generate list of typing users
  const typingIndicator = Object.entries(typingUsers)
    .filter(([id, isTyping]) => isTyping && id !== userId)
    .map(([id]) => {
      const user = teamMembers.find(user => user._id === id);
      return user ? `${user.firstName} ${user.lastName}` : 'Someone';
    });
  
  const isLoading = propLoading || commentsLoading || teamMembersLoading;
  
  // Handle keyboard shortcuts for sending messages
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  // Status component for connection status display
  const ConnectionStatus = () => {
    if (isConnected) {
      return (
        <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 flex items-center gap-1 animate-fade-in">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className={cn("transition-all", isMinimal ? "hidden" : "hidden sm:inline")}>Connected</span>
        </Badge>
      );
    }
    
    if (isConnecting) {
      return (
        <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700 flex items-center gap-1 animate-pulse">
          <Clock className="h-3 w-3 animate-spin" />
          <span className={cn("transition-all", isMinimal ? "hidden" : "hidden sm:inline")}>Connecting...</span>
        </Badge>
      );
    }
    
    return (
      <div className="flex items-center gap-1 ml-2">
        <Badge variant="outline" className="bg-red-50 text-red-700 flex items-center gap-1">
          <WifiOff className="h-3 w-3" />
          <span className={cn("transition-all", isMinimal ? "hidden" : "hidden sm:inline")}>Offline</span>
        </Badge>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={reconnect} 
          className="h-6 p-0 px-1"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
    );
  };
  
  return (
    <div className={cn("flex flex-col h-full overflow-hidden rounded-lg border border-gray-200 shadow-sm bg-white", 
      isMinimal ? "max-h-[500px]" : "")
    }>
      {/* Header */}
      <div className="p-3 flex justify-between items-center border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <Badge className="bg-indigo-100 text-indigo-800 font-medium px-2 py-1 h-6">
            Chat
          </Badge>
          <ConnectionStatus />
        </div>
        
        <div className="flex items-center gap-2">
          {/* Participants dropdown */}
          <DropdownMenu open={showParticipants} onOpenChange={setShowParticipants}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
              >
                <Users className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="py-2 px-3 text-sm font-medium border-b">
                Chat Participants ({participants.length})
              </div>
              <div className="max-h-60 overflow-y-auto">
                {participants.map((user: any) => (
                  <div 
                    key={user._id} 
                    className="py-2 px-3 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback>
                            {user.firstName?.[0] || ''}
                            {user.lastName?.[0] || ''}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white",
                          user.status === 'online' ? 'bg-green-500' : 'bg-gray-300'
                        )} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={
                        user._id === userId 
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                          : 'bg-gray-50 text-gray-600'
                      }
                    >
                      {user._id === userId ? 'You' : ''}
                    </Badge>
                  </div>
                ))}
              </div>
              {participants.length === 0 && (
                <div className="py-6 text-center text-gray-500">
                  <User className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p>No participants yet</p>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Messages Area */}
      <DashboardLoader loading={isLoading}>
        <ScrollArea className="flex-1 p-4">
          {socketMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10 text-gray-500">
              <div className="bg-gray-100 rounded-full p-4 mb-3">
                <AtSign className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-center font-medium mb-1">No messages yet</p>
              <p className="text-sm text-center max-w-xs">
                Be the first to send a message in this conversation
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messageGroups.map(group => (
                <div key={group.date}>
                  <div className="flex justify-center my-4">
                    <Badge variant="outline" className="bg-gray-50 px-3 py-1">
                      {format(new Date(group.date), 'EEEE, MMMM d, yyyy')}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {group.messages.map((message: any) => (
                      <div key={message._id} id={`message-${message._id}`}>
                        <MessageBubble
                          message={message}
                          currentUserId={userId}
                          onReply={handleReply}
                          onReaction={addReaction}
                          onEdit={editMessage}
                          formatMessageContent={formatMessageContent}
                          getFileIcon={getFileIcon}
                          formatFileSize={formatFileSize}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              <AnimatePresence>
                {typingIndicator.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-gray-500 italic flex items-center ml-12 mt-2"
                  >
                    <div className="flex gap-1 items-center">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="h-1.5 w-1.5 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                        className="h-1.5 w-1.5 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                        className="h-1.5 w-1.5 bg-gray-400 rounded-full"
                      />
                    </div>
                    <span className="ml-2">
                      {typingIndicator.join(', ')} {typingIndicator.length === 1 ? 'is' : 'are'} typing
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </DashboardLoader>
      
      {/* Message Input Area */}
      <div className="p-3 border-t border-gray-100">
        {!isConnected && !isConnecting && (
          <div className="mb-3 p-2 bg-yellow-50 text-yellow-800 text-sm rounded flex items-center justify-between">
            <div className="flex items-center">
              <WifiOff className="h-4 w-4 mr-2" />
              You're offline. Messages will be sent when reconnected.
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={reconnect}
              className="h-7 text-xs bg-white"
            >
              Reconnect
            </Button>
          </div>
        )}
        
        {/* Reply indicator */}
        <AnimatePresence>
          {replyingTo && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col text-sm bg-indigo-50 p-2 mb-2 rounded-md border-l-2 border-indigo-400"
            >
              <div className="flex justify-between items-center mb-1">
                <div className="font-medium text-indigo-700 flex items-center">
                  <CornerUpRight className="h-3 w-3 mr-1" />
                  Replying to {replyingTo.user.firstName} {replyingTo.user.lastName}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600" 
                  onClick={cancelReply}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-gray-600 line-clamp-1 text-xs italic">
                {replyingTo.content}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="relative">
          <Textarea
            placeholder="Type a message... (Ctrl+Enter to send)"
            value={message}
            onChange={handleMessageInput}
            onKeyDown={handleKeyDown}
            className="min-h-[80px] resize-none pr-12"
            rows={3}
            ref={textareaRef}
          />
          
          <div className="absolute right-2 bottom-2 flex items-center">
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-indigo-600 rounded-full"
              onClick={() => fileInputRef.current?.click()}
              type="button"
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-indigo-600 rounded-full"
                >
                  <AtSign className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0">
                <Command>
                  <CommandInput placeholder="Search team members..." />
                  <CommandList className="max-h-40">
                    {filteredTeamMembers.length > 0 ? (
                      filteredTeamMembers.map(user => (
                        <CommandItem
                          key={user._id}
                          onSelect={() => insertMention(user)}
                          className="flex items-center gap-2 p-2"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>{`${user.firstName[0]}${user.lastName[0]}`}</AvatarFallback>
                          </Avatar>
                          <span>{user.firstName} {user.lastName}</span>
                        </CommandItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-gray-500">No matches found</div>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-indigo-600 rounded-full"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="end">
                <div className="grid grid-cols-8 gap-2">
                  {['😊', '👍', '❤️', '😂', '🎉', '🙏', '👏', '🔥', 
                    '😢', '😡', '🤔', '👀', '✅', '⚠️', '⭐', '💯'].map(emoji => (
                    <motion.button
                      key={emoji}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-xl hover:bg-gray-100 p-1 rounded-lg cursor-pointer"
                      onClick={() => {
                        setMessage(m => m + emoji + ' ');
                        setTimeout(() => {
                          if (textareaRef.current) {
                            textareaRef.current.focus();
                          }
                        }, 0);
                      }}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <Button 
              className={cn(
                "rounded-full ml-1",
                (!message.trim() && selectedFiles.length === 0)
                  ? "bg-gray-200 text-gray-500 hover:bg-gray-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              )}
              size="icon"
              onClick={handleSubmit}
              disabled={(!message.trim() && selectedFiles.length === 0) || isSubmitting || isUploading}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {showMentionsPopover && (
            <div className="absolute z-10 bg-white border shadow-lg rounded-md w-full max-h-48 overflow-y-auto mt-1">
              <Command>
                <CommandInput placeholder="Search team members..." autoFocus />
                <CommandList>
                  {filteredTeamMembers.length > 0 ? (
                    filteredTeamMembers.map(user => (
                      <CommandItem
                        key={user._id}
                        onSelect={() => insertMention(user)}
                        className="flex items-center gap-2 p-2"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{`${user.firstName[0]}${user.lastName[0]}`}</AvatarFallback>
                        </Avatar>
                        <span>{user.firstName} {user.lastName}</span>
                      </CommandItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">No matches found</div>
                  )}
                </CommandList>
              </Command>
            </div>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        
        {/* Selected files preview */}
        <AnimatePresence>
          {selectedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2"
            >
              <div className="flex gap-2 p-2 bg-gray-50 rounded-md border overflow-x-auto">
                {selectedFiles.map((file, index) => (
                  <motion.div 
                    key={index}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex flex-col items-center border rounded-md p-2 bg-white min-w-[80px]"
                  >
                    {file.type.startsWith('image/') ? (
                      <div className="relative w-16 h-16 mb-1 overflow-hidden rounded-md bg-gray-100">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={file.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-16 h-16 mb-1 bg-gray-100 rounded-md">
                        {getFileIcon(file.type)}
                      </div>
                    )}
                    <div className="flex items-center gap-1 w-full justify-between">
                      <span className="text-xs max-w-[60px] truncate">{file.name}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-5 w-5 p-0 text-gray-400 hover:text-red-500"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TicketChat;