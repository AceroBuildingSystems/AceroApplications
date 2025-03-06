// src/components/TicketComponent/TicketComponent.tsx
"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Clock, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
  };
  className?: string;
}

const TicketComponent: React.FC<TicketComponentProps> = ({ ticket, className }) => {
  // Color mappings
  const statusColors = {
    'NEW': 'bg-blue-100 text-blue-800',
    'ASSIGNED': 'bg-indigo-100 text-indigo-800',
    'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
    'RESOLVED': 'bg-green-100 text-green-800',
    'CLOSED': 'bg-gray-100 text-gray-800'
  };
  
  const priorityColors = {
    'HIGH': 'bg-red-100 text-red-800',
    'MEDIUM': 'bg-orange-100 text-orange-800',
    'LOW': 'bg-green-100 text-green-800'
  };
  
  const statusColor = statusColors[ticket.status.toUpperCase()] || statusColors.NEW;
  const priorityColor = priorityColors[ticket.priority.toUpperCase()] || priorityColors.MEDIUM;
  
  return (
    <TooltipProvider>
      <Card className={cn("w-full shadow-sm hover:shadow-md transition-shadow overflow-hidden hover:cursor-pointer ", className)}>
        {/* Card body with minimal padding */}
        <div className="p-2.5">
          {/* Header row */}
          <div className="flex items-center justify-between mb-1.5">
            <Tooltip>
              <TooltipTrigger className="text-xs font-medium text-blue-600">
                TKT-{ticket._id.toString().substr(-8)}
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Created: {new Date(ticket.createdAt).toLocaleString()}</p>
                <p>Last updated: {new Date(ticket.updatedAt).toLocaleString()}</p>
              </TooltipContent>
            </Tooltip>
            
            <div className="flex gap-1">
              <Badge className={cn("text-[10px] py-0 h-4 px-1", statusColor)}>
                {ticket.status}
              </Badge>
              <Badge className={cn("text-[10px] py-0 h-4 px-1", priorityColor)}>
                {ticket.priority}
              </Badge>
            </div>
          </div>
          
          {/* Title */}
          <h3 className="text-xs font-medium mb-1 line-clamp-1">
            {ticket.title}
          </h3>
          
          {/* Truncated description */}
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-xs text-gray-500 mb-1.5 line-clamp-1">{ticket.description}</p>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{ticket.description}</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Compact meta info */}
          <div className="flex items-center text-[10px] text-gray-500 gap-2">
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-0.5">
                <Tag size={10} className="opacity-70" />
                <span className="truncate max-w-[4rem]">{ticket.category.name.split(' ')[0]}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Category: {ticket.category.name}</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-0.5">
                <Clock size={10} className="opacity-70" />
                <span className="truncate">{formatDistanceToNow(new Date(ticket.createdAt), {addSuffix: true})}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Created {new Date(ticket.createdAt).toLocaleString()}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          {/* Divider */}
          <div className="my-1 border-t border-gray-100"></div>
          
          {/* Ultra-compact attribution */}
          <div className="flex items-center justify-between text-[10px] text-gray-600">
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-0.5">
                <div className="flex items-center justify-center bg-gray-100 rounded-full w-3.5 h-3.5 text-[8px] font-bold">
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
                <span className="text-gray-300 mx-0.5">→</span>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-0.5">
                    <div className="flex items-center justify-center bg-gray-100 rounded-full w-3.5 h-3.5 text-[8px] font-bold">
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
      </Card>
    </TooltipProvider>
  );
};

export default TicketComponent;