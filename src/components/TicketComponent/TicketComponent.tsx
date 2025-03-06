// src/components/TicketComponent/TicketComponent.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarIcon, Clock, Tag, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface TicketComponentProps {
  ticket: {
    _id: string;
    ticketId: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    department: {
      name: string;
    };
    category: {
      name: string;
    };
    creator: {
      firstName: string;
      lastName: string;
    };
    assignee?: {
      firstName: string;
      lastName: string;
    };
    dueDate?: Date;
    createdAt: Date;
    updatedAt: Date;
    efforts: number;
    totalEfforts: number;
  };
  onClick?: () => void;
  classname?:string;
}

const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case 'NEW':
      return 'bg-blue-100 text-blue-800';
    case 'ASSIGNED':
      return 'bg-indigo-100 text-indigo-800';
    case 'IN_PROGRESS':
      return 'bg-yellow-100 text-yellow-800';
    case 'RESOLVED':
      return 'bg-green-100 text-green-800';
    case 'CLOSED':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority.toUpperCase()) {
    case 'HIGH':
      return 'bg-red-100 text-red-800';
    case 'MEDIUM':
      return 'bg-orange-100 text-orange-800';
    case 'LOW':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const TicketComponent: React.FC<TicketComponentProps> = ({ ticket, onClick, className = ''  }) => {
  // Calculate progress percentage
  const progressPercentage = ticket.totalEfforts > 0 
    ? Math.round((ticket.efforts / ticket.totalEfforts) * 100) 
    : 0;

  return (
    <Card className="w-full hover:shadow-md hover:cursor-pointer transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex flex-col justify-between items-start">
          <div>
          <CardTitle className="text-blue-600">TKT-{ticket._id.toString().substr(-8)}</CardTitle>
            <CardDescription className="text-base font-medium">{ticket.title}</CardDescription>
          </div>
          <div className="flex w-full  gap-2">
            <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
            <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-700 mb-4 line-clamp-2">{ticket.description}</p>
        
        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Tag size={14} />
            <span>{ticket.category.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{ticket.department.name}</span>
          </div>
          {ticket.dueDate && (
            <div className="flex items-center gap-1">
              <CalendarIcon size={14} />
              <span>{new Date(ticket.dueDate).toLocaleDateString()}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
        
        {/* Progress bar */}
        {ticket.totalEfforts > 0 && (
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium">Progress</span>
              <span className="text-xs font-medium">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2 justify-between">

        <div className='flex flex-col gap-2'>
          <div className="flex flex-col gap-2">
            <span className="text-xs text-gray-500">Created by:</span>
            <div className='flex items-center gap-2'>
            <Avatar className="h-6 w-6">
              <AvatarFallback>{`${ticket.creator.firstName[0]}${ticket.creator.lastName[0]}`}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{`${ticket.creator.firstName} ${ticket.creator.lastName}`}</span>
            </div>
          </div>
          
          {ticket.assignee && (
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-2">
              <span className="text-xs text-gray-500">Assigned to:</span>
              <div className='flex items-center gap-2 w-full overflow-hidden'>

              <Avatar className="h-6 w-6">
                <AvatarFallback>{`${ticket.assignee.firstName[0]}${ticket.assignee.lastName[0]}`}</AvatarFallback>
              </Avatar>
              <span className="text-sm break-keep">{`${ticket.assignee.firstName} ${ticket.assignee.lastName}`}</span>
              </div>
                </div>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default TicketComponent;