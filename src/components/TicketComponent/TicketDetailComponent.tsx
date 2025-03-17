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
import { motion, AnimatePresence } from 'framer-motion';

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
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Back to tickets link */}
          <Button 
            variant="ghost" 
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-indigo-700 group transition-all"
            onClick={() => router.push('/dashboard/ticket')}
          >
            <ArrowLeftCircle className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to All Tickets</span>
          </Button>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Ticket Info */}
            <Card className="lg:col-span-3 border border-gray-200 shadow-sm overflow-hidden bg-white">
              <CardHeader className="pb-4 border-b border-gray-100 bg-white">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon()}
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-blue-600 mr-3">
                          {ticket.ticketId || `TKT-${ticket._id.toString().substr(-8)}`}
                        </CardTitle>
                        <motion.div 
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                        </motion.div>
                        <motion.div 
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.1 }}
                        >
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        </motion.div>
                      </div>
                    </div>
                    <CardTitle className="text-2xl mt-1 font-bold text-gray-800">{ticket.title}</CardTitle>
                  </div>
                  
                  <div className="flex gap-2 self-start md:self-center">
                    {canEdit && ticket.status !== 'CLOSED' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="flex items-center h-9 px-3 shadow-sm border-gray-200 hover:border-indigo-300 gap-1">
                            Actions <ChevronDown className="h-4 w-4 opacity-70" />
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
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Button 
                          variant="default" 
                          onClick={onEditClick}
                          className="flex items-center gap-2 h-9 shadow-sm bg-indigo-600 hover:bg-indigo-700"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="py-6">
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h3 className="font-medium mb-3 text-gray-700 text-sm">Description</h3>
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 shadow-sm">
                      <p className="text-gray-700 whitespace-pre-line">
                        {ticket.description}
                      </p>
                    </div>
                  </motion.div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-gray-50/80 transition-colors group">
                            <span className="text-xs text-gray-500 mb-1">Department</span>
                            <div className="flex items-center gap-1 text-sm font-medium">
                              <Users className="h-4 w-4 text-indigo-600 group-hover:text-indigo-500 transition-colors" />
                              <p>{ticket.department.name}</p>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ticket department</p>
                        </TooltipContent>
                      </Tooltip>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-gray-50/80 transition-colors group">
                            <span className="text-xs text-gray-500 mb-1">Category</span>
                            <div className="flex items-center gap-1 text-sm font-medium">
                              <Tag className="h-4 w-4 text-indigo-600 group-hover:text-indigo-500 transition-colors" />
                              <p>{ticket.category.name}</p>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ticket category</p>
                        </TooltipContent>
                      </Tooltip>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-gray-50/80 transition-colors group">
                            <span className="text-xs text-gray-500 mb-1">Created</span>
                            <div className="flex items-center gap-1 text-sm font-medium">
                              <Clock className="h-4 w-4 text-indigo-600 group-hover:text-indigo-500 transition-colors" />
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
                    </motion.div>
                    
                    {ticket.dueDate && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-gray-50/80 transition-colors group">
                              <span className="text-xs text-gray-500 mb-1">Due Date</span>
                              <div className="flex items-center gap-1 text-sm font-medium">
                                <CalendarIcon className="h-4 w-4 text-indigo-600 group-hover:text-indigo-500 transition-colors" />
                                <p>{format(new Date(ticket.dueDate), 'PPP')}</p>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Due by {format(new Date(ticket.dueDate), 'PPP')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </motion.div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Sidebar */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="overflow-hidden border border-gray-200 shadow-sm">
                  <CardHeader className="bg-gray-50/70 pb-3">
                    <CardTitle className="text-sm text-gray-700">Created by</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-blue-100">
                        <AvatarFallback className="bg-blue-100 text-blue-800 font-medium">
                          {`${ticket.creator.firstName[0]}${ticket.creator.lastName[0]}`}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{`${ticket.creator.firstName} ${ticket.creator.lastName}`}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="overflow-hidden border border-gray-200 shadow-sm">
                  <CardHeader className="bg-gray-50/70 pb-3">
                    <CardTitle className="text-sm text-gray-700">Assigned to</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {ticket.assignee ? (
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-indigo-100">
                          <AvatarFallback className="bg-indigo-100 text-indigo-800 font-medium">
                            {`${ticket.assignee.firstName[0]}${ticket.assignee.lastName[0]}`}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{`${ticket.assignee.firstName} ${ticket.assignee.lastName}`}</p>
                          <p className="text-xs text-gray-500">
                            {ticket.assignedAt ? format(new Date(ticket.assignedAt), 'MMM d, yyyy') : 'Date not available'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 bg-gray-200 border-2 border-gray-100">
                          <AvatarFallback className="text-gray-500">?</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-gray-500 font-medium">Unassigned</p>
                          {canEdit && ticket.status !== 'CLOSED' && (
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setIsAssignDialogOpen(true)}
                                className="mt-2 h-8 text-xs bg-white border-gray-200 hover:bg-gray-50 hover:border-indigo-300"
                              >
                                <User className="h-3.5 w-3.5 mr-1" />
                                Assign now
                              </Button>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* Progress widget */}
              {ticket.totalEfforts > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="overflow-hidden border border-gray-200 shadow-sm">
                    <CardHeader className="bg-gray-50/70 pb-3">
                      <CardTitle className="text-sm text-gray-700">Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-lg font-bold text-indigo-600">{progressPercentage}%</span>
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-800 border-indigo-200">
                          {ticket.efforts} / {ticket.totalEfforts} points
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
        
        <Tabs defaultValue="tasks" className="mt-8 animate-fade-in">
          <TabsList className="h-12 rounded-lg">
            <TabsTrigger 
              value="tasks" 
              className="flex items-center gap-2 data-[state=active]:shadow-sm rounded-lg h-10 data-[state=active]:text-indigo-700"
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
              className="flex items-center gap-2 data-[state=active]:shadow-sm rounded-lg h-10 data-[state=active]:text-indigo-700"
            >
              <Paperclip className="h-4 w-4" />
              <span>Files</span>
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="flex items-center gap-2 data-[state=active]:shadow-sm rounded-lg h-10 data-[state=active]:text-indigo-700"
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
            <TabsContent value="tasks" className="mt-6">
              <TicketTaskComponent 
                ticketId={ticket._id} 
                tasks={tasksData?.data || []} 
                isLoading={tasksLoading}
                userId={userId}
                canEdit={canEdit}
                ticketStatus={ticket.status}
              />
            </TabsContent>
            
            <TabsContent value="attachments" className="mt-6">
              <TicketAttachmentComponent
                ticketId={ticket._id}
                attachments={[]} // This would normally come from an API call
                isLoading={false}
                userId={userId}
                canEdit={canEdit && ticket.status !== 'CLOSED'}
              />
            </TabsContent>
            
            <TabsContent value="history" className="mt-6">
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