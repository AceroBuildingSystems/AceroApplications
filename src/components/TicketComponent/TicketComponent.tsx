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
  // Status color mappings with more vibrant, accessible colors
  const statusColors = {
    'NEW': 'bg-blue-100 text-blue-700 border border-blue-200',
    'ASSIGNED': 'bg-indigo-100 text-indigo-700 border border-indigo-200',
    'IN_PROGRESS': 'bg-amber-100 text-amber-700 border border-amber-200',
    'RESOLVED': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    'CLOSED': 'bg-gray-100 text-gray-700 border border-gray-200'
  };
  
  const priorityColors = {
    'HIGH': 'bg-rose-100 text-rose-700 border border-rose-200',
    'MEDIUM': 'bg-orange-100 text-orange-700 border border-orange-200',
    'LOW': 'bg-emerald-100 text-emerald-700 border border-emerald-200'
  };
  
  const statusColor = statusColors[ticket.status.toUpperCase()] || statusColors.NEW;
  const priorityColor = priorityColors[ticket.priority.toUpperCase()] || priorityColors.MEDIUM;
  
  return (
    <TooltipProvider>
      <Card className={cn(
        "w-full transition-all duration-150 overflow-hidden relative group",
        "border border-gray-200 hover:border-primary/20",
        "hover:shadow-md shadow-sm",
        className
      )}>
        {/* Priority indicator stripe */}
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-1",
          ticket.priority === 'HIGH' ? 'bg-rose-500' :
          ticket.priority === 'MEDIUM' ? 'bg-orange-500' : 'bg-emerald-500'
        )} />
        
        {/* Card body with improved padding */}
        <div className="p-4 pl-6">
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <Tooltip>
              <TooltipTrigger className="text-sm font-semibold text-primary hover:underline">
                {ticket.ticketId || `TKT-${ticket._id.toString().substr(-8)}`}
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-white shadow-md border border-gray-100 p-3 rounded-lg">
                <p className="font-medium mb-1">Ticket Details</p>
                <p className="text-xs text-gray-600">Created: {new Date(ticket.createdAt).toLocaleString()}</p>
                <p className="text-xs text-gray-600">Updated: {new Date(ticket.updatedAt).toLocaleString()}</p>
              </TooltipContent>
            </Tooltip>
            
            <div className="flex gap-2">
              <Badge className={cn("px-2 py-1 text-xs font-medium rounded-md", statusColor)}>
                {ticket.status}
              </Badge>
              <Badge className={cn("px-2 py-1 text-xs font-medium rounded-md", priorityColor)}>
                {ticket.priority}
              </Badge>
            </div>
          </div>
          
          {/* Title */}
          <h3 className="text-sm font-semibold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {ticket.title}
          </h3>
          
          {/* Truncated description */}
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
            </TooltipTrigger>
            <TooltipContent className="max-w-md p-3 bg-white shadow-md border border-gray-100 rounded-lg">
              <p className="text-sm text-gray-700">{ticket.description}</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Improved meta info with better spacing */}
          <div className="flex items-center text-xs text-gray-500 gap-4 mb-3">
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-1.5">
                <Tag size={12} className="text-gray-400" />
                <span className="truncate max-w-[8rem] font-medium">{ticket.category.name}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Category: {ticket.category.name}</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-1.5">
                <Clock size={12} className="text-gray-400" />
                <span className="truncate font-medium">{formatDistanceToNow(new Date(ticket.createdAt), {addSuffix: true})}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Created {new Date(ticket.createdAt).toLocaleString()}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          {/* Divider */}
          <div className="border-t border-gray-100 my-2"></div>
          
          {/* User attribution with better visual presentation */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-2">
                <div className="flex items-center justify-center bg-gray-100 rounded-full w-5 h-5 text-[10px] font-bold">
                  {ticket.creator.firstName[0]}
                </div>
                <span className="font-medium">{ticket.creator.lastName}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Created by: {ticket.creator.firstName} {ticket.creator.lastName}</p>
              </TooltipContent>
            </Tooltip>
            
            {ticket.assignee && (
              <>
                <span className="text-gray-300 mx-2">→</span>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-2">
                    <div className="flex items-center justify-center bg-blue-100 text-blue-700 rounded-full w-5 h-5 text-[10px] font-bold">
                      {ticket.assignee.firstName[0]}
                    </div>
                    <span className="font-medium">{ticket.assignee.lastName}</span>
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