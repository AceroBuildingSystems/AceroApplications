// src/components/TicketComponent/SortableTicketItem.tsx
"use client";

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import TicketComponent from './TicketComponent';
import { GripVertical } from 'lucide-react';

interface SortableTicketItemProps {
  id: string;
  ticket: any;
  onTicketClick: (id: string) => void;
}

export function SortableTicketItem({ id, ticket, onTicketClick }: SortableTicketItemProps) {
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition || 'transform 250ms cubic-bezier(0.25, 1, 0.5, 1)',
    opacity: isDragging ? 0 : 1,
    visibility: isDragging ? 'hidden' : 'visible', // Use visibility instead of opacity for complete hiding
    pointerEvents: isDragging ? 'none' : 'all'
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
      className="relative mb-3 group"
      data-ticket-id={id}
    >
      {/* Drag handle */}
      <div 
        className={`absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab 
                    z-10 bg-gray-100 rounded-l-md transition-colors
                    ${isDragging ? 'bg-blue-100' : 'hover:bg-gray-200'}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={18} className={isDragging ? 'text-blue-500' : 'text-gray-500'} />
      </div>
      
      {/* Clickable ticket with padding for the handle */}
      <div 
        className="pl-8 transition-opacity duration-200" 
        onClick={handleClick}
      >
        <TicketComponent ticket={ticket} />
      </div>
    </div>
  );
}