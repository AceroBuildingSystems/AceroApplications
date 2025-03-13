// src/components/TicketComponent/MessageReactions.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Smile, Plus } from 'lucide-react';

interface Reaction {
  emoji: string;
  userId: string;
  createdAt: Date;
}

interface MessageReactionsProps {
  reactions: Reaction[];
  messageId: string;
  userId: string;
  onAddReaction: (emoji: string) => void;
  position: string;
}

const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '👏', '🎉', '🔥', '✅', '❌'];

const MessageReactions: React.FC<MessageReactionsProps> = ({
  reactions,
  messageId,
  userId,
  onAddReaction,
  position
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isCurrentUser = position === 'right';
  
  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, Reaction[]>);
  
  // Handle clicking on a reaction
  const handleReactionClick = (emoji: string) => {
    onAddReaction(emoji);
  };
  
  // Handle adding a new reaction
  const handleAddReaction = (emoji: string) => {
    onAddReaction(emoji);
    setShowEmojiPicker(false);
  };
  
  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  if (reactions.length === 0 && !showEmojiPicker) {
    return null;
  }
  
  return (
    <div className={`flex flex-wrap gap-1 mt-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {Object.entries(groupedReactions).map(([emoji, users]) => {
        const hasReacted = users.some(r => r.userId === userId);
        
        return (
          <Button
            key={emoji}
            variant="ghost"
            size="sm"
            className={`
              h-6 px-1.5 py-0 rounded-full text-xs flex items-center gap-1
              ${hasReacted ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'hover:bg-gray-100'}
            `}
            onClick={() => handleReactionClick(emoji)}
          >
            <span>{emoji}</span>
            <span className="text-xs">{users.length}</span>
          </Button>
        );
      })}
      
      <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 rounded-full hover:bg-gray-100"
            ref={triggerRef}
          >
            <Plus className="h-3.5 w-3.5 text-gray-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-2" 
          align={isCurrentUser ? 'end' : 'start'} 
          side="bottom"
          sideOffset={5}
          forceMount
        >
          <div className="flex flex-wrap gap-2 max-w-[200px]">
            {commonEmojis.map(emoji => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleAddReaction(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MessageReactions;