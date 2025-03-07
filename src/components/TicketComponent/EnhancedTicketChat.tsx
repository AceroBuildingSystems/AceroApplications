// src/components/TicketComponent/EnhancedTicketChat.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Command, CommandInput, CommandItem, CommandList, CommandGroup } from '@/components/ui/command';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Paperclip, Send, File, Image, X, AtSign, Reply, CornerUpRight, 
  PlusCircle, UserPlus, Smile, Loader2, MessageSquare, Download, Video,
  Search, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useSocketIo } from '@/hooks/useSocketIo';
import { useGetTicketCommentsQuery, useCreateTicketCommentMutation, useMarkAsReadMutation, useUploadFileMutation } from '@/services/endpoints/ticketCommentApi';
import { useGetMasterQuery } from '@/services/endpoints/masterApi';
import DashboardLoader from '@/components/ui/DashboardLoader';
import debounce from 'lodash/debounce';
import { ChatMessage } from '@/types/next';
import { toast } from 'react-toastify';
import MessageBubble from './MessageBubble';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  department?: any;
}

interface EnhancedTicketChatProps {
  ticketId: string;
  userId: string;
  currentUser: User;
  isLoading?: boolean;
}

const EnhancedTicketChat: React.FC<EnhancedTicketChatProps> = ({
  ticketId,
  userId,
  currentUser,
  isLoading: propLoading = false
}) => {
  // State
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentionsPopover, setShowMentionsPopover] = useState(false);
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'files' | 'participants'>('chat');
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ChatMessage[]>([]);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // RTK Queries
  const { data: commentsData = {}, isLoading: commentsLoading, refetch: refetchComments } = useGetTicketCommentsQuery({ 
    ticketId 
  });
  
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [markAsRead] = useMarkAsReadMutation();
  const [createComment, { isLoading: isCreating }] = useCreateTicketCommentMutation();
  
  // Fetch all team members for mentions and invites
  const { data: teamMembersData = {}, isLoading: teamMembersLoading } = useGetMasterQuery({
    db: 'USER_MASTER',
    filter: { isActive: true },
    sort: { firstName: 1 }
  });

  const teamMembers = teamMembersData?.data || [];
  
  // Socket.io integration
  const { 
    isConnected, 
    messages: socketMessages,
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
  } = useSocketIo({ 
    ticketId, 
    userId 
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
  
  // Mark visible messages as read
  useEffect(() => {
    if (socketMessages.length > 0) {
      const unreadMessageIds = socketMessages
        .filter(msg => msg.user._id !== userId && !msg.readBy?.includes(userId))
        .map(msg => msg._id);
      
      if (unreadMessageIds.length > 0) {
        markAsRead({
          commentIds: unreadMessageIds,
          userId
        }).unwrap()
          .catch(err => console.error('Error marking messages as read:', err));
      }
    }
  }, [socketMessages, userId, markAsRead]);
  
  // Handle typing debounced
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
        const response = await uploadFile(formData).unwrap();
        
        if (response.status === 'success') {
          uploadedFiles.push(response.data);
          notifyFileUpload(response.data);
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
  const insertMention = (user: User) => {
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
  const handleReply = (message: ChatMessage) => {
    setReplyingTo(message);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  
  // Cancel reply
  const cancelReply = () => {
    setReplyingTo(null);
  };
  
  // Handle inviting users
  const handleInviteUsers = () => {
    // This would integrate with your backend to invite users
    // For now, we'll just show a toast
    toast.success(`Invited ${selectedUsers.length} user(s) to the conversation`);
    setInviteDialogOpen(false);
    setSelectedUsers([]);
  };
  
  // Toggle user selection for invites
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
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
  
  // Handle message search
  const handleSearch = (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results = socketMessages.filter(msg => 
      msg.content.toLowerCase().includes(term.toLowerCase())
    );
    
    setSearchResults(results);
  };
  
  // Handle message submission via Socket.io
  const handleSubmit = async () => {
    if ((!message.trim() && selectedFiles.length === 0) || isCreating || isUploading) return;
    
    try {
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
      
      // Also create in database (fallback if socket fails)
      await createComment({
        action: 'create',
        data: {
          ticket: ticketId,
          user: userId,
          content: message,
          attachments: uploadedFiles,
          replyTo: replyingTo?._id,
          mentions: mentionedUserIds,
          addedBy: userId,
          updatedBy: userId
        }
      }).unwrap();
      
      // Refetch comments to ensure data is in sync
      refetchComments();
    } catch (error) {
      console.error("Message submission error:", error);
      toast.error("Failed to send message");
    }
  };
  
  // Group messages by date
  const groupMessagesByDate = () => {
    const groups: { [key: string]: ChatMessage[] } = {};
    
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
  
  // Extract all file attachments for the files tab
  const allFiles = socketMessages
    .filter(msg => msg.attachments && msg.attachments.length > 0)
    .flatMap(msg => msg.attachments.map(att => ({
      ...att,
      uploadedBy: msg.user,
      messageId: msg._id,
      uploadedAt: msg.createdAt
    })));
  
  // Extract all participants
  const participants = Array.from(new Set(
    socketMessages.map(msg => msg.user._id)
  )).map(userId => {
    const user = socketMessages.find(msg => msg.user._id === userId)?.user;
    return {
      ...user,
      status: onlineUsers[userId] || 'offline'
    };
  }).filter(Boolean);
  
  // Get icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    } else if (fileType.startsWith('video/')) {
      return <Video className="h-4 w-4" />;
    } else if (fileType.includes('pdf')) {
      return <File className="h-4 w-4 text-red-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <File className="h-4 w-4 text-blue-500" />;
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return <File className="h-4 w-4 text-green-500" />;
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
  
  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Ticket Chat
            {!isConnected && <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700">Connecting...</Badge>}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSearchDialogOpen(true)}
              className="mr-2"
            >
              <Search className="h-4 w-4 mr-1" />
              Search
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setInviteDialogOpen(true)}
              className="mr-2"
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Invite
            </Button>
            
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="h-9">
                <TabsTrigger value="chat" className="text-xs px-3">
                  Chat
                </TabsTrigger>
                <TabsTrigger value="files" className="text-xs px-3">
                  Files {allFiles.length > 0 && `(${allFiles.length})`}
                </TabsTrigger>
                <TabsTrigger value="participants" className="text-xs px-3">
                  Team {participants.length > 0 && `(${participants.length})`}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 flex flex-col">
        <DashboardLoader loading={isLoading}>
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as any)}
            className="flex-1 flex flex-col"
          >
            {/* Chat Tab */}
            <TabsContent value="chat" className="flex-1 flex flex-col m-0 p-0 data-[state=active]:flex-1">
              {/* Message area */}
              <ScrollArea className="flex-1 p-4">
                {socketMessages.length === 0 ? (
                  <div className="text-center py-20 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-lg font-medium">No messages yet</p>
                    <p className="text-sm">Start the conversation by sending a message.</p>
                  </div>
                ) : (
                  <div>
                    {messageGroups.map(group => (
                      <div key={group.date}>
                        <div className="flex justify-center my-4">
                          <Badge variant="outline" className="bg-gray-50">
                            {format(new Date(group.date), 'EEEE, MMMM d, yyyy')}
                          </Badge>
                        </div>
                        
                        {group.messages.map(message => (
                          <div key={message._id} className="mb-4" id={`message-${message._id}`}>
                            <MessageBubble
                              message={message}
                              currentUserId={userId}
                              onReply={handleReply}
                              onReaction={(messageId, emoji) => addReaction(messageId, emoji)}
                              onEdit={(messageId, newContent) => editMessage(messageId, newContent)}
                              formatMessageContent={formatMessageContent}
                              getFileIcon={getFileIcon}
                              formatFileSize={formatFileSize}
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                    
                    {typingIndicator.length > 0 && (
                      <div className="text-sm text-gray-500 my-2 italic">
                        {typingIndicator.join(', ')} {typingIndicator.length === 1 ? 'is' : 'are'} typing...
                        <span className="inline-block animate-bounce">.</span>
                        <span className="inline-block animate-bounce delay-75">.</span>
                        <span className="inline-block animate-bounce delay-150">.</span>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
              
              {/* Message input area */}
              <div className="p-4 border-t">
                {replyingTo && (
                  <div className="flex flex-col text-sm bg-gray-50 p-3 mb-2 rounded-md border-l-4 border-blue-400">
                    <div className="flex justify-between items-center mb-1">
                      <div className="font-medium text-blue-700 flex items-center">
                        <CornerUpRight className="h-4 w-4 mr-1" />
                        Replying to {replyingTo.user.firstName} {replyingTo.user.lastName}
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={cancelReply}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-gray-700 line-clamp-2 italic pl-2 border-l-2 border-gray-300">
                      {replyingTo.content}
                    </div>
                  </div>
                )}
                
                <div className="relative">
                  <Textarea
                    placeholder="Type a message..."
                    value={message}
                    onChange={handleMessageInput}
                    className="resize-none pr-24"
                    rows={3}
                    ref={textareaRef}
                  />
                  
                  <div className="absolute right-2 bottom-2 flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      type="button"
                      className="h-8 w-8"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Paperclip className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setShowMentionsPopover(true)}
                      className="h-8 w-8"
                    >
                      <AtSign className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      onClick={handleSubmit}
                      disabled={(!message.trim() && selectedFiles.length === 0) || isCreating || isUploading}
                      size="sm" 
                      className="h-8"
                    >
                      {isCreating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {showMentionsPopover && (
                    <div className="absolute z-10 bg-white border shadow-lg rounded-md w-full max-h-48 overflow-y-auto mt-1">
                      <Command>
                        <CommandInput placeholder="Search team members..." />
                        <CommandList>
                          {filteredTeamMembers.length > 0 ? (
                            filteredTeamMembers.map(user => (
                              <CommandItem
                                key={user._id}
                                onSelect={() => insertMention(user)}
                                className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100"
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
                
                {selectedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 p-2 bg-gray-50 rounded-md border">
                    <div className="w-full text-sm font-medium text-gray-700 mb-1">
                      Attachments ({selectedFiles.length})
                    </div>
                    {selectedFiles.map((file, index) => (
                      <div 
                        key={index}
                        className="flex flex-col items-center border rounded-md p-2 bg-white"
                      >
                        {file.type.startsWith('image/') ? (
                          <div className="relative w-24 h-24 mb-1 overflow-hidden rounded-md bg-gray-100">
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={file.name}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-24 h-24 mb-1 bg-gray-100 rounded-md">
                            {getFileIcon(file.type)}
                          </div>
                        )}
                        <div className="flex items-center gap-1 w-full justify-between">
                          <span className="text-xs max-w-[80px] truncate">{file.name}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={() => handleRemoveFile(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {!isConnected && (
                  <div className="mt-2 flex items-center gap-2 bg-yellow-50 text-yellow-800 p-2 rounded-md">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Connecting to chat server...</span>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Files Tab */}
            <TabsContent value="files" className="flex-1 m-0 p-4 data-[state=active]:flex-1 overflow-auto">
              <h3 className="text-lg font-medium mb-4">Files & Attachments</h3>
              
              {allFiles.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <File className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p>No files have been shared in this conversation yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {allFiles.map((file, idx) => (
                    <div key={idx} className="border rounded-md p-3 hover:bg-gray-50 transition-colors flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          {getFileIcon(file.fileType)}
                          <span className="text-sm font-medium ml-1 truncate max-w-[150px]">{file.fileName}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                          <a href={file.url} download target="_blank" rel="noopener noreferrer">
                            <Download className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                      
                      {file.fileType.startsWith('image/') && (
                        <div className="h-32 overflow-hidden rounded-md mb-2 bg-gray-50 flex items-center justify-center">
                          <img src={file.url} alt={file.fileName} className="max-h-full object-contain" />
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center text-xs text-gray-500 mt-auto">
                        <span>
                          {formatFileSize(file.fileSize)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Avatar className="h-4 w-4">
                            <AvatarFallback className="text-[8px]">
                              {`${file.uploadedBy.firstName[0]}${file.uploadedBy.lastName[0]}`}
                            </AvatarFallback>
                          </Avatar>
                          {format(new Date(file.uploadedAt), 'MMM d')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Participants Tab */}
            <TabsContent value="participants" className="flex-1 m-0 p-4 data-[state=active]:flex-1 overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Team Members</h3>
                <Button variant="outline" size="sm" onClick={() => setInviteDialogOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Invite Others
                </Button>
              </div>
              
                                {participants.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <UserPlus className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p>No participants yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {participants.map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar>
                            {user.avatar ? (
                              <AvatarImage src={user.avatar} />
                            ) : (
                              <AvatarFallback>{`${user.firstName[0]}${user.lastName[0]}`}</AvatarFallback>
                            )}
                          </Avatar>
                          <div className={cn(
                            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white",
                            user.status === 'online' ? 'bg-green-500' :
                            user.status === 'away' ? 'bg-yellow-500' :
                            user.status === 'busy' ? 'bg-red-500' :
                            'bg-gray-500'
                          )} />
                        </div>
                        <div>
                          <div className="font-medium">{`${user.firstName} ${user.lastName}`}</div>
                          <div className="flex items-center text-xs text-gray-500">
                            <span className="capitalize">{user.status}</span>
                            {user.status !== 'online' && user.lastActive && (
                              <span className="ml-1">
                                • Last seen {formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={
                        user._id === userId ? 'bg-blue-50 text-blue-700' : 'bg-gray-50'
                      }>
                        {user._id === userId ? 'You' : 'Team Member'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DashboardLoader>
      </CardContent>
      
      {/* Invite Users Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Members</DialogTitle>
            <DialogDescription>
              Add team members to this ticket conversation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Input 
              placeholder="Search for team members..."
              className="mb-4"
            />
            
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {teamMembers
                .filter(user => !participants.some(p => p._id === user._id)) // Only show users not already in the conversation
                .map(user => (
                  <div 
                    key={user._id} 
                    className={cn(
                      "flex items-center justify-between p-2 rounded-md cursor-pointer",
                      selectedUsers.includes(user._id) 
                        ? "bg-blue-50 border border-blue-200" 
                        : "hover:bg-gray-50 border border-transparent"
                    )}
                    onClick={() => toggleUserSelection(user._id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        {user.avatar ? (
                          <AvatarImage src={user.avatar} />
                        ) : (
                          <AvatarFallback>{`${user.firstName[0]}${user.lastName[0]}`}</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <div className="font-medium">{`${user.firstName} ${user.lastName}`}</div>
                        <div className="text-sm text-gray-500">{user.department?.name || 'Team Member'}</div>
                      </div>
                    </div>
                    
                    <div className={cn(
                      "w-5 h-5 rounded-full border flex items-center justify-center",
                      selectedUsers.includes(user._id)
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "border-gray-300"
                    )}>
                      {selectedUsers.includes(user._id) && <Check className="h-3 w-3" />}
                    </div>
                  </div>
                ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleInviteUsers}
              disabled={selectedUsers.length === 0}
            >
              Invite {selectedUsers.length > 0 && `(${selectedUsers.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Search Dialog */}
      <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Search Messages</DialogTitle>
            <DialogDescription>
              Search for messages in this conversation
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button onClick={() => handleSearch(searchTerm)}>
                <Search className="h-4 w-4 mr-1" />
                Search
              </Button>
            </div>
            
            <div className="mt-4 max-h-80 overflow-y-auto">
              {searchResults.length === 0 ? (
                searchTerm ? (
                  <div className="text-center py-6 text-gray-500">
                    No messages found containing "{searchTerm}"
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    Enter search terms to find messages
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  {searchResults.map(message => (
                    <div 
                      key={message._id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSearchDialogOpen(false);
                        // Scroll to this message
                        setTimeout(() => {
                          document.getElementById(`message-${message._id}`)?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{`${message.user.firstName[0]}${message.user.lastName[0]}`}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{message.user.firstName} {message.user.lastName}</span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(message.createdAt), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm line-clamp-2">{message.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// For TypeScript
const Check = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default EnhancedTicketChat;