// src/components/TicketComponent/MessageReactions.tsx
import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Smile, Plus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface Reaction {
  emoji: string;
  userId: string;
  createdAt?: Date;
}

interface MessageReactionsProps {
  reactions: Reaction[];
  messageId: string;
  userId: string;
  onAddReaction: (emoji: string) => void;
  position?: 'left' | 'right';
}

// Common emojis that can be used for reactions
const commonEmojis = ['👍', '👎', '❤️', '😄', '😢', '🎉', '😮', '🙏'];

const MessageReactions: React.FC<MessageReactionsProps> = ({ 
  reactions = [], 
  messageId, 
  userId,
  onAddReaction,
  position = 'left'
}) => {
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  
  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    const { emoji } = reaction;
    
    if (!acc[emoji]) {
      acc[emoji] = [];
    }
    
    acc[emoji].push(reaction.userId);
    
    return acc;
  }, {} as Record<string, string[]>);
  
  // Check if current user has reacted with emoji
  const hasUserReacted = (emoji: string) => {
    return groupedReactions[emoji]?.includes(userId) || false;
  };
  
  // Handle reaction click (toggle)
  const handleReactionClick = (emoji: string) => {
    onAddReaction(emoji);
  };
  
  // Format reaction count with user information
  const formatReactionTooltip = (emoji: string, userIds: string[]) => {
    if (userIds.length === 1) {
      return `1 reaction`;
    }
    return `${userIds.length} reactions`;
  };
  
  return (
    <div className={cn(
      "flex flex-wrap gap-1 mt-1",
      position === 'right' ? "justify-end" : "justify-start"
    )}>
      {/* Display existing reactions */}
      {Object.entries(groupedReactions).map(([emoji, userIds]) => (
        <TooltipProvider key={emoji}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-1 text-xs",
                  hasUserReacted(emoji)
                    ? "bg-blue-100 hover:bg-blue-200 text-blue-800"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                )}
                onClick={() => handleReactionClick(emoji)}
              >
                <span className="mr-1">{emoji}</span>
                <span>{userIds.length}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{formatReactionTooltip(emoji, userIds)}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      
      {/* Add Reaction Button */}
      <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
        <PopoverTrigger asChild>
          <button
            className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600"
          >
            <Plus className="h-3 w-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align={position === 'right' ? 'end' : 'start'}>
          <div className="flex flex-wrap gap-2 max-w-[200px]">
            {commonEmojis.map(emoji => (
              <button
                key={emoji}
                className="text-xl hover:bg-gray-100 p-1 rounded-lg cursor-pointer"
                onClick={() => {
                  handleReactionClick(emoji);
                  setIsEmojiPickerOpen(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MessageReactions;