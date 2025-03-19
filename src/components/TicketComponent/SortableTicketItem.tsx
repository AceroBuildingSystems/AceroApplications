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

  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition: 'transform 250ms cubic-bezier(0.2, 0, 0.2, 1), opacity 200ms ease',
    // Hide the original ticket completely when dragging
    opacity: isDragging ? 0 : 1,
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
      style={dragStyle}
      className="mb-2"
      data-ticket-id={id}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div 
        className={`bg-white rounded-md transition-all duration-200 
                   ${isHovering ? 'shadow-md translate-y-[-1px]' : 'shadow-sm'}
                   ${isDragging ? 'ring-2 ring-primary/30' : ''}`}
        onClick={handleClick}
      >
        {/* The actual ticket component */}
        <div className="p-[1px]">
          <TicketComponent ticket={ticket} />
        </div>
        
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