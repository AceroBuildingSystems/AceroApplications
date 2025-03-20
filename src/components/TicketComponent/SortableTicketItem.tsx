// src/components/TicketComponent/SortableTicketItem.tsx
"use client";

import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import TicketComponent from './TicketComponent';

interface SortableTicketItemProps {
  id: string;
  ticket: any;
  onTicketClick: (id: string) => void;
}

export function SortableTicketItem({ id, ticket, onTicketClick }: SortableTicketItemProps) {
  const [isHovering, setIsHovering] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useDraggable({
    id: id,
    data: {
      ticket: ticket
    }
  });

  // Adjust the style to handle the appearance/disappearance more smoothly
  const style = {
    // Only apply transform when actually moving (not when appearing/disappearing)
    transform: CSS.Transform.toString(transform),
    
    // Disable transitions when completing a drag to prevent snapping
    transition: isDragging 
      ? 'none' // No transition during drag
      : 'all 300ms cubic-bezier(0.2, 0, 0.2, 1)', // Smooth transition otherwise
    
    // Fade out when dragging starts, but do it immediately
    opacity: isDragging ? 0 : 1,
    visibility: isDragging ? 'hidden' : 'visible',
    
    // Keep space in the document flow to prevent layout shifts
    height: isDragging ? 'auto' : 'auto',
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging) {
      onTicketClick(id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="mb-2 relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div 
        className={`bg-white rounded-md transition-transform duration-200 
                   ${isHovering ? 'shadow-md translate-y-[-1px]' : 'shadow-sm'}`}
        onClick={handleClick}
      >
        <TicketComponent ticket={ticket} />
        
        {/* Invisible drag handle that covers the entire component */}
        <div 
          className="absolute inset-0 cursor-grab opacity-0"
          {...attributes}
          {...listeners}
        />
      </div>
    </div>
  );
}