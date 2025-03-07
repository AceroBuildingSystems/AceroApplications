// src/components/TicketComponent/MessageBubble.tsx
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CornerUpRight, Check, CheckCircle, Clock, Edit, 
  Trash, MessageSquare, Download, Reply, MoreVertical, Pencil
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/types/next';
import MessageReactions from './MessageReactions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';

interface MessageBubbleProps {
  message: ChatMessage;
  currentUserId: string;
  onReply: (message: ChatMessage) => void;
  onReaction: (messageId: string, emoji: string) => void;
  onEdit: (messageId: string, newContent: string) => void;
  formatMessageContent: (content: string) => React.ReactNode;
  getFileIcon: (fileType: string) => React.ReactNode;
  formatFileSize: (bytes: number) => string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  currentUserId,
  onReply,
  onReaction,
  onEdit,
  formatMessageContent,
  getFileIcon,
  formatFileSize
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  
  const isCurrentUser = message.user._id === currentUserId;
  
  // Handle edit submission
  const handleSubmitEdit = () => {
    if (editedContent.trim() !== message.content) {
      onEdit(message._id, editedContent);
    }
    setIsEditing(false);
  };
  
  // Cancel edit
  const handleCancelEdit = () => {
    setEditedContent(message.content);
    setIsEditing(false);
  };
  
  // Check if the message is less than 5 minutes old (for edit capability)
  const canEdit = () => {
    if (!isCurrentUser) return false;
    
    const messageTime = new Date(message.createdAt).getTime();
    const now = Date.now();
    const fiveMinutesInMs = 5 * 60 * 1000;
    
    return (now - messageTime) < fiveMinutesInMs;
  };
  
  return (
    <div className={cn(
      "flex gap-3",
      isCurrentUser ? "flex-row-reverse" : ""
    )}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        {message.user.avatar ? (
          <AvatarImage src={message.user.avatar} />
        ) : (
          <AvatarFallback>
            {`${message.user.firstName[0]}${message.user.lastName[0]}`}
          </AvatarFallback>
        )}
      </Avatar>
      
      <div className={cn(
        "max-w-[80%]",
        isCurrentUser ? "items-end" : ""
      )}>
        <div className={cn(
          "rounded-lg px-4 py-2 relative",
          isCurrentUser 
            ? "bg-blue-500 text-white" 
            : "bg-gray-100 text-gray-800"
        )}>
          <div className="flex justify-between items-center mb-1">
            <span className={cn(
              "font-medium text-xs",
              isCurrentUser ? "text-blue-100" : "text-gray-600"
            )}>
              {isCurrentUser ? 'You' : `${message.user.firstName} ${message.user.lastName}`}
            </span>
            <div className="flex items-center gap-1">
              <span className={cn(
                "text-xs",
                isCurrentUser ? "text-blue-100" : "text-gray-500"
              )}>
                {format(new Date(message.createdAt), 'h:mm a')}
                {message.isEdited && (
                  <span className="ml-1 text-xs italic">
                    (edited)
                  </span>
                )}
              </span>
              
              {/* Message status indicators */}
              {isCurrentUser && (
                <span className="ml-1">
                  {message.readBy && message.readBy.length > 1 ? (
                    <CheckCircle className="h-3 w-3 text-blue-200" />
                  ) : message.deliveredAt ? (
                    <Check className="h-3 w-3 text-blue-200" />
                  ) : (
                    <Clock className="h-3 w-3 text-blue-200" />
                  )}
                </span>
              )}
              
              {/* Message options dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "h-5 w-5 p-0 hover:bg-opacity-20", 
                      isCurrentUser ? "hover:bg-blue-600" : "hover:bg-gray-200"
                    )}
                  >
                    <MoreVertical className={cn(
                      "h-3 w-3",
                      isCurrentUser ? "text-blue-100" : "text-gray-500"
                    )} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isCurrentUser ? "end" : "start"} side="top">
                  <DropdownMenuItem onClick={() => onReply(message)}>
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </DropdownMenuItem>
                  
                  {canEdit() && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {message.replyTo && (
            <div className={cn(
              "text-xs p-2 rounded mb-2 flex flex-col gap-1",
              isCurrentUser 
                ? "bg-blue-600 border-l-2 border-blue-300" 
                : "bg-gray-200 border-l-2 border-gray-400"
            )}>
              <span className={cn(
                "font-medium flex items-center gap-1",
                isCurrentUser ? "text-blue-100" : "text-gray-700"
              )}>
                <CornerUpRight className="h-3 w-3" />
                Replying to {message.replyToUser?.firstName || "User"}
              </span>
              <span className={cn(
                "italic line-clamp-1",
                isCurrentUser ? "text-blue-100" : "text-gray-600"
              )}>
                {message.replyToContent || "Original message"}
              </span>
            </div>
          )}
          
          {isEditing ? (
            <div className="mt-1">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className={cn(
                  "min-h-[60px] text-sm p-2 resize-none border-0",
                  isCurrentUser ? "bg-blue-600 text-white" : "bg-white text-gray-800"
                )}
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleCancelEdit}
                  className={isCurrentUser ? "text-blue-200 hover:text-white hover:bg-blue-600" : ""}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleSubmitEdit}
                  className={isCurrentUser ? "bg-blue-700 hover:bg-blue-800" : ""}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className={cn(
              "whitespace-pre-line break-words",
              isCurrentUser ? "text-white" : "text-gray-800"
            )}>
              {formatMessageContent(message.content)}
            </div>
          )}
        </div>
        
        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <MessageReactions
            reactions={message.reactions}
            messageId={message._id}
            userId={currentUserId}
            onAddReaction={(emoji) => onReaction(message._id, emoji)}
            position={isCurrentUser ? 'right' : 'left'}
          />
        )}
        
        {/* Display attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.attachments.map((attachment, index) => (
              <div key={index} className={cn(
                "rounded-lg overflow-hidden",
                isCurrentUser ? "ml-auto" : ""
              )}>
                {attachment.fileType.startsWith('image/') ? (
                  <div className="relative group">
                    <img 
                      src={attachment.url} 
                      alt={attachment.fileName}
                      className="max-w-[200px] max-h-[200px] rounded-lg object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button size="icon" variant="secondary" asChild>
                        <a href={attachment.url} download target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className={cn(
                    "flex items-center gap-2 p-2 rounded-lg",
                    isCurrentUser ? "bg-blue-100" : "bg-gray-200"
                  )}>
                    {getFileIcon(attachment.fileType)}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate max-w-[150px]">
                        {attachment.fileName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatFileSize(attachment.fileSize)}
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7" asChild>
                      <a href={attachment.url} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Message actions */}
        <div className={cn(
          "flex mt-1 text-xs text-gray-500 gap-2",
          isCurrentUser ? "justify-end" : ""
        )}>
          <button 
            className="hover:text-gray-700"
            onClick={() => onReply(message)}
          >
            Reply
          </button>
          
          {!message.reactions || message.reactions.length === 0 ? (
            <MessageReactions
              reactions={[]}
              messageId={message._id}
              userId={currentUserId}
              onAddReaction={(emoji) => onReaction(message._id, emoji)}
              position={isCurrentUser ? 'right' : 'left'}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;