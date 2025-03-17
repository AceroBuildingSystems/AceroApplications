// src/components/TicketComponent/TicketDetailComponent.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  CalendarIcon, Clock, Edit, MessageSquare, Tag, Users, 
  ChevronDown, CheckSquare, Paperclip, FileText, AlertCircle,
  ClipboardList, User, BarChart, CheckCircle2, Lock, ArrowLeftCircle
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useGetTicketCommentsQuery } from '@/services/endpoints/ticketCommentApi';
import { useGetTicketTasksQuery } from '@/services/endpoints/ticketTaskApi';
import { useGetTicketHistoryQuery } from '@/services/endpoints/ticketHistoryApi';
import TicketTaskComponent from './TicketTaskComponent';
import TicketHistoryComponent from './TicketHistoryComponent';
import { useGetMasterQuery } from '@/services/endpoints/masterApi';
import { 
  useAssignTicketMutation, 
  useChangeTicketStatusMutation, 
  useAutoAssignTicketMutation 
} from '@/services/endpoints/ticketApi';
import TicketStatusChangeComponent from './TicketStatusChangeComponent';
import TicketAutoAssignComponent from './TicketAutoAssignComponent';
import TicketAttachmentComponent from './TicketAttachmentComponent';
import CollapsibleChat from './CollapsibleChat';
import { getStatusColor, getPriorityColor } from '@/lib/getStatusColor';
import { useRouter } from 'next/navigation';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';

interface TicketDetailComponentProps {
  ticket: any;
  onEditClick: () => void;
  userId: string;
  userRole: string;
}

const TicketDetailComponent: React.FC<TicketDetailComponentProps> = ({ 
  ticket, 
  onEditClick,
  userId,
  userRole
}) => {
  const router = useRouter();
  const { data: tasksData = {}, isLoading: tasksLoading } = useGetTicketTasksQuery({ 
    ticketId: ticket._id 
  });
  
  const { data: historyData = {}, isLoading: historyLoading } = useGetTicketHistoryQuery({ 
    ticketId: ticket._id 
  });

  // State for dialogs
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isAutoAssignDialogOpen, setIsAutoAssignDialogOpen] = useState(false);
  
  // Get status icon based on ticket status
  const getStatusIcon = () => {
    switch(ticket.status.toUpperCase()) {
      case 'NEW': return <AlertCircle className="h-5 w-5 text-blue-600" />;
      case 'ASSIGNED': return <User className="h-5 w-5 text-indigo-600" />;
      case 'IN_PROGRESS': return <BarChart className="h-5 w-5 text-amber-600" />;
      case 'RESOLVED': return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      case 'CLOSED': return <Lock className="h-5 w-5 text-gray-600" />;
      default: return <AlertCircle className="h-5 w-5 text-blue-600" />;
    }
  };

  // Handle showing auto-assignment dialog
  const handleShowAutoAssign = () => {
    setIsAutoAssignDialogOpen(true);
  };
  
  // Calculate progress percentage
  const progressPercentage = ticket.totalEfforts > 0 
    ? Math.round((ticket.efforts / ticket.totalEfforts) * 100) 
    : 0;
  
  // Check if user can edit this ticket
  const canEdit = userId === ticket.creator._id || userId === ticket.assignee?._id || userRole === 'ADMIN';
  
  return (
    <TooltipProvider>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Back to tickets link */}
          <Button 
            variant="ghost" 
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-indigo-700"
            onClick={() => router.push('/dashboard/ticket')}
          >
            <ArrowLeftCircle className="h-4 w-4" />
            Back to All Tickets
          </Button>
          
          <Card className="border border-gray-200 shadow-sm overflow-hidden bg-white">
            <CardHeader className="pb-4 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon()}
                    <CardTitle className="text-blue-600 flex items-center">
                      {ticket.ticketId || `TKT-${ticket._id.toString().substr(-8)}`}
                      <div className="flex items-center ml-3 gap-2">
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>
                    </CardTitle>
                  </div>
                  <CardTitle className="text-xl mt-2">{ticket.title}</CardTitle>
                </div>
                
                <div className="flex gap-2">
                  {canEdit && ticket.status !== 'CLOSED' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-1">
                          Actions <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={onEditClick} className="flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          Edit Ticket
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem 
                          onClick={() => setIsStatusDialogOpen(true)}
                          className="flex items-center gap-2"
                        >
                          <ClipboardList className="h-4 w-4" />
                          Change Status
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        {!ticket.assignee ? (
                          <>
                            <DropdownMenuItem 
                              onClick={() => setIsAssignDialogOpen(true)}
                              className="flex items-center gap-2"
                            >
                              <User className="h-4 w-4" />
                              Assign Manually
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={handleShowAutoAssign}
                              className="flex items-center gap-2"
                            >
                              <Users className="h-4 w-4" />
                              Auto-Assign
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => setIsAssignDialogOpen(true)}
                            className="flex items-center gap-2"
                          >
                            <User className="h-4 w-4" />
                            Reassign Ticket
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  
                  {canEdit && (
                    <Button 
                      variant="default" 
                      onClick={onEditClick}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-5">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2 text-gray-700">Description</h3>
                  <p className="text-gray-700 whitespace-pre-line bg-gray-50 p-4 rounded-md border border-gray-100">
                    {ticket.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-3 bg-gray-50 rounded-md border border-gray-100 flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">Department</span>
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Users className="h-4 w-4 text-indigo-600" />
                          <p>{ticket.department.name}</p>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ticket department</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-3 bg-gray-50 rounded-md border border-gray-100 flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">Category</span>
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Tag className="h-4 w-4 text-indigo-600" />
                          <p>{ticket.category.name}</p>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ticket category</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-3 bg-gray-50 rounded-md border border-gray-100 flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">Created</span>
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Clock className="h-4 w-4 text-indigo-600" />
                          <p title={format(new Date(ticket.createdAt), 'PPP p')}>
                            {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Created on {format(new Date(ticket.createdAt), 'PPP p')}</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  {ticket.dueDate && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-3 bg-gray-50 rounded-md border border-gray-100 flex flex-col">
                          <span className="text-xs text-gray-500 mb-1">Due Date</span>
                          <div className="flex items-center gap-1 text-sm font-medium">
                            <CalendarIcon className="h-4 w-4 text-indigo-600" />
                            <p>{format(new Date(ticket.dueDate), 'PPP')}</p>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Due by {format(new Date(ticket.dueDate), 'PPP')}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex flex-wrap gap-6 py-2">
                  <div className="p-3 bg-gray-50 rounded-md border border-gray-100 flex flex-col min-w-[200px]">
                    <h4 className="text-sm text-gray-500 mb-2">Created by</h4>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                        <AvatarFallback className="bg-blue-100 text-blue-800">{`${ticket.creator.firstName[0]}${ticket.creator.lastName[0]}`}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{`${ticket.creator.firstName} ${ticket.creator.lastName}`}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-md border border-gray-100 flex flex-col min-w-[200px]">
                    <h4 className="text-sm text-gray-500 mb-2">Assigned to</h4>
                    {ticket.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                          <AvatarFallback className="bg-indigo-100 text-indigo-800">{`${ticket.assignee.firstName[0]}${ticket.assignee.lastName[0]}`}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{`${ticket.assignee.firstName} ${ticket.assignee.lastName}`}</p>
                          <p className="text-xs text-gray-500">
                            {ticket.assignedAt ? format(new Date(ticket.assignedAt), 'MMM d, yyyy') : 'Date not available'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 bg-gray-200 text-gray-500 border-2 border-white shadow-sm">
                          <AvatarFallback>?</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-gray-500">Unassigned</p>
                          {canEdit && ticket.status !== 'CLOSED' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setIsAssignDialogOpen(true)}
                              className="mt-1 h-7 text-xs"
                            >
                              Assign
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Progress bar */}
                {ticket.totalEfforts > 0 && (
                  <div className="p-4 bg-gray-50 rounded-md border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-sm text-gray-700">Progress</h4>
                      <div className="flex items-center">
                        <span className="text-sm font-medium mr-2">{progressPercentage}%</span>
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-800 border-indigo-200">
                          {ticket.efforts} / {ticket.totalEfforts} points
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <Tabs defaultValue="tasks" className="animate-fade-in">
          <TabsList className="grid w-full grid-cols-3 p-0 bg-gray-50 rounded-lg">
            <TabsTrigger 
              value="tasks" 
              className="flex items-center gap-2 data-[state=active]:bg-white rounded-lg"
            >
              <CheckSquare className="h-4 w-4" />
              <span>Tasks</span>
              {tasksData?.data?.length > 0 && (
                <Badge variant="secondary" className="ml-1 bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
                  {tasksData.data.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="attachments" 
              className="flex items-center gap-2 data-[state=active]:bg-white rounded-lg"
            >
              <Paperclip className="h-4 w-4" />
              <span>Files</span>
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="flex items-center gap-2 data-[state=active]:bg-white rounded-lg"
            >
              <FileText className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger>
          </TabsList>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <TabsContent value="tasks" className="mt-4">
              <TicketTaskComponent 
                ticketId={ticket._id} 
                tasks={tasksData?.data || []} 
                isLoading={tasksLoading}
                userId={userId}
                canEdit={canEdit}
                ticketStatus={ticket.status}
              />
            </TabsContent>
            
            <TabsContent value="attachments" className="mt-4">
              <TicketAttachmentComponent
                ticketId={ticket._id}
                attachments={[]} // This would normally come from an API call
                isLoading={false}
                userId={userId}
                canEdit={canEdit && ticket.status !== 'CLOSED'}
              />
            </TabsContent>
            
            <TabsContent value="history" className="mt-4">
              <TicketHistoryComponent 
                history={historyData?.data || []} 
                isLoading={historyLoading}
              />
            </TabsContent>
          </motion.div>
        </Tabs>

        {/* Collapsible Chat Component */}
        <CollapsibleChat
          ticketId={ticket._id}
          userId={userId}
          currentUser={{
            _id: userId,
            firstName: ticket.creator.firstName,
            lastName: ticket.creator.lastName,
            ...(ticket.creator.avatar && { avatar: ticket.creator.avatar })
          }}
        />

        {/* Status Change Component */}
        <TicketStatusChangeComponent
          ticketId={ticket._id}
          currentStatus={ticket.status}
          userId={userId}
          isOpen={isStatusDialogOpen}
          onClose={() => setIsStatusDialogOpen(false)}
          hasAssignee={!!ticket.assignee}
        />
        
        {/* Auto Assign Component */}
        <TicketAutoAssignComponent
          ticket={ticket}
          userId={userId}
          isOpen={isAutoAssignDialogOpen}
          onClose={() => setIsAutoAssignDialogOpen(false)}
        />
      </div>
    </TooltipProvider>
  );
};

export default TicketDetailComponent;