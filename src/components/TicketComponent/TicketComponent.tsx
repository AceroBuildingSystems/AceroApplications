// src/components/TicketComponent/TicketComponent.tsx
"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Clock, Tag, AlertCircle, CheckCircle2, BarChart, UserCircle2, Lock, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getStatusColor, getPriorityColor } from '@/lib/getStatusColor';
import { motion } from 'framer-motion';

interface TicketComponentProps {
  ticket: {
    _id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    department: { name: string };
    category: { name: string };
    creator: { firstName: string; lastName: string };
    assignee?: { firstName: string; lastName: string };
    createdAt: Date;
    updatedAt: Date;
    commentCount?: number;
  };
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const TicketComponent: React.FC<TicketComponentProps> = ({ 
  ticket, 
  className, 
  onClick,
  style
}) => {
  // Card icon based on status
  const StatusIcon = () => {
    switch(ticket.status.toUpperCase()) {
      case 'NEW': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'ASSIGNED': return <UserCircle2 className="h-4 w-4 text-indigo-500" />;
      case 'IN_PROGRESS': return <BarChart className="h-4 w-4 text-amber-500" />;
      case 'RESOLVED': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'CLOSED': return <Lock className="h-4 w-4 text-gray-500" />;
      default: return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  // Get formatted dates
  const createdAtFormatted = formatDistanceToNow(new Date(ticket.createdAt), {addSuffix: true});
  const updatedAtFormatted = formatDistanceToNow(new Date(ticket.updatedAt), {addSuffix: true});
  
  // Extract first letter of names safely
  const creatorInitial = ticket.creator?.firstName ? ticket.creator.firstName.charAt(0) : '?';
  const assigneeInitial = ticket.assignee?.firstName ? ticket.assignee.firstName.charAt(0) : '?';
  
  return (
    <TooltipProvider>
      <motion.div 
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        whileTap={{ y: -1, transition: { duration: 0.1 } }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card 
          className={cn(
            "w-full border-l-3 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer bg-card group",
            ticket.status === 'NEW' ? "border-l-blue-500" :
            ticket.status === 'ASSIGNED' ? "border-l-indigo-500" :
            ticket.status === 'IN_PROGRESS' ? "border-l-amber-500" :
            ticket.status === 'RESOLVED' ? "border-l-green-500" :
            "border-l-gray-500",
            className
          )}
          style={style}
          onClick={onClick}
        >
          <div className="p-3">
            {/* Ticket header with ID and status */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <StatusIcon />
                <Tooltip delayDuration={300}>
                  <TooltipTrigger className="ml-2 text-xs font-mono text-muted-foreground group-hover:text-primary transition-colors">
                    TKT-{String(ticket._id).substr(-8)}
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-sm shadow-md bg-popover border-border">
                    <div className="space-y-1">
                      <p className="text-xs">Created: {new Date(ticket.createdAt).toLocaleString()}</p>
                      <p className="text-xs">Last updated: {new Date(ticket.updatedAt).toLocaleString()}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              <div className="flex gap-1.5">
                <Badge className={cn(
                  "text-xs py-0 h-5 font-medium border shadow-sm badge-hover",
                  getStatusColor(ticket.status)
                )}>
                  {String(ticket.status).replace(/_/g, ' ')}
                </Badge>
                <Badge className={cn(
                  "text-xs py-0 h-5 font-medium border shadow-sm badge-hover", 
                  getPriorityColor(ticket.priority)
                )}>
                  {String(ticket.priority)}
                </Badge>
              </div>
            </div>
            
            {/* Title and description */}
            <div className="mb-3">
              <h3 className="text-sm font-medium text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                {String(ticket.title)}
              </h3>
              
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <p className="text-xs text-muted-foreground line-clamp-2">{String(ticket.description)}</p>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm shadow-md bg-popover border-border">
                  <p className="text-xs">{String(ticket.description)}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            {/* Footer information */}
            <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-xs text-muted-foreground pt-2 border-t border-border">
              {/* Left column */}
              <div className="flex items-center gap-1.5">
                <Tooltip delayDuration={300}>
                  <TooltipTrigger className="flex items-center gap-1 truncate">
                    <Tag size={12} className="flex-shrink-0" />
                    <span className="truncate max-w-[6rem]">{String(ticket.category?.name || 'Uncategorized')}</span>
                  </TooltipTrigger>
                  <TooltipContent className="shadow-md bg-popover border-border">
                    <p className="text-xs">Category: {String(ticket.category?.name || 'Uncategorized')}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              {/* Right column */}
              <div className="flex items-center gap-1.5 justify-end">
                <Tooltip delayDuration={300}>
                  <TooltipTrigger className="flex items-center gap-1 truncate">
                    <Clock size={12} className="flex-shrink-0" />
                    <span className="truncate">{createdAtFormatted}</span>
                  </TooltipTrigger>
                  <TooltipContent className="shadow-md bg-popover border-border">
                    <p className="text-xs">Created {new Date(ticket.createdAt).toLocaleString()}</p>
                    <p className="text-xs">Updated {new Date(ticket.updatedAt).toLocaleString()}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              {/* Comment count */}
              {ticket.commentCount && ticket.commentCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger className="flex items-center gap-1">
                      <MessageSquare size={12} className="flex-shrink-0" />
                      <span>{ticket.commentCount}</span>
                    </TooltipTrigger>
                    <TooltipContent className="shadow-md bg-popover border-border">
                      <p className="text-xs">{ticket.commentCount} comment{ticket.commentCount !== 1 ? 's' : ''}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
              
              {/* Creator and assignee information */}
              <div className="flex items-center gap-1 justify-end col-span-2 mt-0.5">
                <Tooltip delayDuration={300}>
                  <TooltipTrigger className="flex items-center gap-1">
                    <div className="flex items-center justify-center bg-muted rounded-full w-4 h-4 text-[9px] font-medium text-muted-foreground">
                      {creatorInitial}
                    </div>
                    <span className="text-xs truncate max-w-[4rem]">{String(ticket.creator?.lastName || '')}</span>
                  </TooltipTrigger>
                  <TooltipContent className="shadow-md bg-popover border-border">
                    <p className="text-xs">Created by: {String(ticket.creator?.firstName || '')} {String(ticket.creator?.lastName || '')}</p>
                  </TooltipContent>
                </Tooltip>
                
                {ticket.assignee && (
                  <>
                    <span className="text-border mx-0.5">→</span>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger className="flex items-center gap-1">
                        <div className="flex items-center justify-center bg-primary/10 rounded-full w-4 h-4 text-[9px] font-medium text-primary">
                          {assigneeInitial}
                        </div>
                        <span className="text-xs truncate max-w-[4rem]">{String(ticket.assignee?.lastName || '')}</span>
                      </TooltipTrigger>
                      <TooltipContent className="shadow-md bg-popover border-border">
                        <p className="text-xs">Assigned to: {String(ticket.assignee?.firstName || '')} {String(ticket.assignee?.lastName || '')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
};

export default TicketComponent;