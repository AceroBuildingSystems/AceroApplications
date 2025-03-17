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
}

const TicketComponent: React.FC<TicketComponentProps> = ({ ticket, className, onClick }) => {
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
  
  return (
    <TooltipProvider>
      <motion.div 
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card 
          className={cn(
            "w-full border-l-4 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer bg-white",
            ticket.status === 'NEW' ? "border-l-blue-500" :
            ticket.status === 'ASSIGNED' ? "border-l-indigo-500" :
            ticket.status === 'IN_PROGRESS' ? "border-l-amber-500" :
            ticket.status === 'RESOLVED' ? "border-l-green-500" :
            "border-l-gray-500",
            className
          )}
          onClick={onClick}
        >
          <div className="p-4">
            {/* Ticket header with ID and status */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <StatusIcon />
                <Tooltip>
                  <TooltipTrigger className="ml-2 text-xs font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                    TKT-{ticket._id.toString().substr(-8)}
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-sm">
                    <div className="space-y-1">
                      <p className="text-xs">Created: {new Date(ticket.createdAt).toLocaleString()}</p>
                      <p className="text-xs">Last updated: {new Date(ticket.updatedAt).toLocaleString()}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              <div className="flex gap-1.5">
                <Badge className={cn(
                  "text-[10px] py-0 h-5 font-medium border shadow-sm",
                  getStatusColor(ticket.status)
                )}>
                  {ticket.status}
                </Badge>
                <Badge className={cn(
                  "text-[10px] py-0 h-5 font-medium border shadow-sm", 
                  getPriorityColor(ticket.priority)
                )}>
                  {ticket.priority}
                </Badge>
              </div>
            </div>
            
            {/* Title and description */}
            <div className="mb-3">
              <h3 className="text-sm font-bold text-gray-800 line-clamp-1 mb-1">
                {ticket.title}
              </h3>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-xs text-gray-600 line-clamp-2">{ticket.description}</p>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p className="text-xs">{ticket.description}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            {/* Footer information */}
            <div className="flex justify-between items-center text-[10px] text-gray-500 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1">
                    <Tag size={10} className="opacity-70" />
                    <span className="truncate max-w-[5rem]">{ticket.category.name}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Category: {ticket.category.name}</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1">
                    <Clock size={10} className="opacity-70" />
                    <span className="truncate">{formatDistanceToNow(new Date(ticket.createdAt), {addSuffix: true})}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Created {new Date(ticket.createdAt).toLocaleString()}</p>
                  </TooltipContent>
                </Tooltip>

                {ticket.commentCount && ticket.commentCount > 0 && (
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1">
                      <MessageSquare size={10} className="opacity-70" />
                      <span>{ticket.commentCount}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{ticket.commentCount} comment{ticket.commentCount !== 1 ? 's' : ''}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              
              <div className="flex items-center gap-1.5">
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1">
                    <div className="flex items-center justify-center bg-gray-100 rounded-full w-4 h-4 text-[8px] font-bold">
                      {ticket.creator.firstName[0]}
                    </div>
                    <span>{ticket.creator.lastName}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Created by: {ticket.creator.firstName} {ticket.creator.lastName}</p>
                  </TooltipContent>
                </Tooltip>
                
                {ticket.assignee && (
                  <>
                    <span className="text-gray-300">→</span>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-1">
                        <div className="flex items-center justify-center bg-indigo-100 rounded-full w-4 h-4 text-[8px] font-bold text-indigo-700">
                          {ticket.assignee.firstName[0]}
                        </div>
                        <span>{ticket.assignee.lastName}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Assigned to: {ticket.assignee.firstName} {ticket.assignee.lastName}</p>
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