// src/components/TicketComponent/SortableTicketItem.tsx
"use client";

import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import TicketComponent from './TicketComponent';
import { motion } from 'framer-motion';

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
    
    // No transition to prevent the snapping issue when drag ends
    transition: 'none',
    
    // Hide the original immediately when dragging starts
    opacity: isDragging ? 0 : 1,
    visibility: isDragging ? 'hidden' : 'visible',
    
    // Set position to position:fixed when dragging to avoid layout shifts
    position: isDragging ? 'fixed' : 'relative',
    zIndex: isDragging ? -1 : 'auto',
    pointerEvents: isDragging ? 'none' : 'auto',
    
    // Prevent other styles from interfering
    willChange: isDragging ? 'transform' : 'auto',
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
      data-ticket-id={id}
      data-draggable={true}
      className="mb-3 relative animate-fade-in"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div 
        className={`bg-white rounded-lg border border-border/50 transition-all duration-200 
                  ${isHovering ? 'shadow-md translate-y-[-2px] border-primary/20' : 'shadow-card'}`}
        onClick={handleClick}
      >
        <TicketComponent ticket={ticket} />
        
        {/* Improved visual feedback for draggable area with grab cursor */}
        <div 
          className={`absolute inset-0 cursor-grab active:cursor-grabbing rounded-lg transition-opacity duration-200 
                    ${isHovering ? 'bg-primary/5 opacity-30' : 'opacity-0'}`}
          {...attributes}
          {...listeners}
        >
          {/* Subtle drag indicator that only appears on hover */}
          {isHovering && (
            <div className="absolute top-1 right-1 bg-primary/10 rounded-full p-1">
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="text-primary/60"
              >
                <path 
                  d="M8 6H9.5M9.5 6H11M9.5 6V4.5M9.5 6V7.5M8 12H9.5M9.5 12H11M9.5 12V10.5M9.5 12V13.5M8 18H9.5M9.5 18H11M9.5 18V16.5M9.5 18V19.5M15 6H16.5M16.5 6H18M16.5 6V4.5M16.5 6V7.5M15 12H16.5M16.5 12H18M16.5 12V10.5M16.5 12V13.5M15 18H16.5M16.5 18H18M16.5 18V16.5M16.5 18V19.5" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}