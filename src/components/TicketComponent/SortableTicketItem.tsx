// src/components/TicketComponent/SortableTicketItem.tsx
"use client";

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import TicketComponent from './TicketComponent';
import { GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';

interface SortableTicketItemProps {
  id: string;
  ticket: any;
  onTicketClick: (id: string) => void;
  columnColor?: string;
}

export function SortableTicketItem({ id, ticket, onTicketClick, columnColor = 'blue' }: SortableTicketItemProps) {
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
    pointerEvents: isDragging ? 'none' : 'all',
    zIndex: isDragging ? 50 : 'auto'
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging) {
      onTicketClick(id);
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className="relative mb-3 group animate-fade-in"
      data-ticket-id={id}
      layout
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.98, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Drag handle with animation */}
      <motion.div 
        className={`absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab 
                    z-10 rounded-l-md transition-colors opacity-0 group-hover:opacity-100
                    ${isDragging ? `bg-${columnColor}-100` : `hover:bg-${columnColor}-100`}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        {...attributes}
        {...listeners}
        style={{
          backgroundColor: isDragging ? `var(--${columnColor}-100)` : undefined
        }}
      >
        <GripVertical size={18} className={isDragging ? `text-${columnColor}-500` : 'text-gray-400'} 
          style={{
            color: isDragging ? `var(--${columnColor}-500)` : undefined
          }}
        />
      </motion.div>
      
      {/* Clickable ticket with padding for the handle */}
      <div 
        className="pl-6 transition-all duration-200" 
        onClick={handleClick}
      >
        <TicketComponent 
          ticket={ticket} 
          className={isDragging ? `ring-2 ring-${columnColor}-400 shadow-lg` : ''}
        />
      </div>
    </motion.div>
  );
}