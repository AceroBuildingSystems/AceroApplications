// src/app/dashboard/ticket/[id]/page.tsx
"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetTicketsQuery } from '@/services/endpoints/ticketApi';
import { useGetTicketCommentsQuery } from '@/services/endpoints/ticketCommentApi';
import { useGetTicketTasksQuery } from '@/services/endpoints/ticketTaskApi';
import { useGetTicketHistoryQuery } from '@/services/endpoints/ticketHistoryApi';
import useUserAuthorised from '@/hooks/useUserAuthorised';
import DashboardLoader from '@/components/ui/DashboardLoader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MessageSquare, CheckSquare, Clock, Edit, MoreHorizontal } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const TicketDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user, status } = useUserAuthorised();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch ticket data
  const { data: ticketData = {}, isLoading: ticketLoading } = useGetTicketsQuery({
    id: id as string
  });
  
  // Fetch ticket comments, tasks, and history
  const { data: commentsData = {}, isLoading: commentsLoading } = useGetTicketCommentsQuery({ ticketId: id as string });
  const { data: tasksData = {}, isLoading: tasksLoading } = useGetTicketTasksQuery({ ticketId: id as string });
  const { data: historyData = {}, isLoading: historyLoading } = useGetTicketHistoryQuery({ ticketId: id as string });
  
  const ticket = ticketData?.data?.[0];
  const loading = ticketLoading || status === 'loading';
  
  // Status and priority styling
  const getStatusColor = (status) => {
    const statusMap = {
      NEW: 'bg-blue-100 text-blue-800',
      ASSIGNED: 'bg-indigo-100 text-indigo-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
    };
    return statusMap[status?.toUpperCase()] || statusMap.NEW;
  };
  
  const getPriorityColor = (priority) => {
    const priorityMap = {
      HIGH: 'bg-red-100 text-red-800',
      MEDIUM: 'bg-orange-100 text-orange-800',
      LOW: 'bg-green-100 text-green-800',
    };
    return priorityMap[priority?.toUpperCase()] || priorityMap.MEDIUM;
  };
  
  // Calculate progress percentage
  const calculateProgress = (ticket) => {
    if (!ticket) return 0;
    const { efforts, totalEfforts } = ticket;
    return totalEfforts > 0 ? Math.round((efforts / totalEfforts) * 100) : 0;
  };
  
  const progressPercentage = calculateProgress(ticket);
  
  if (loading) {
    return <DashboardLoader loading={true} />;
  }
  
  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <h2 className="text-2xl font-semibold mb-2">Ticket Not Found</h2>
        <p className="text-gray-500 mb-4">The ticket you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => router.push('/dashboard/ticket')}>Return to Tickets</Button>
      </div>
    );
  }
  
  return (
    <DashboardLoader loading={loading}>
      <TooltipProvider>
        <div className="container px-4 py-6 mx-auto max-w-7xl">
          {/* Back Button & Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                className="mr-2 p-2"
                onClick={() => router.push('/dashboard/ticket')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold">
                    TKT-{ticket._id.toString().substr(-8)}
                  </h1>
                  <Badge className={getStatusColor(ticket.status)}>
                    {ticket.status}
                  </Badge>
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                </div>
                <h2 className="text-lg md:text-xl mt-1 text-gray-700">
                  {ticket.title}
                </h2>
              </div>
            </div>
            
            <div className="flex items-center gap-2 self-end md:self-auto">
              <Button
                onClick={() => {/* Logic for editing */}}
                className="flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" /> 
                Edit
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Assign Ticket</DropdownMenuItem>
                  <DropdownMenuItem>Change Status</DropdownMenuItem>
                  <DropdownMenuItem>Add to Sprint</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Close Ticket</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Main Content Area - Responsive Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Ticket Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Content Tabs for Mobile and Tablet */}
              <div className="block lg:hidden">
                <Tabs defaultValue="overview" onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview">
                    <TicketOverview ticket={ticket} progressPercentage={progressPercentage} />
                  </TabsContent>
                  
                  <TabsContent value="activity">
                    <TicketActivity 
                      comments={commentsData?.data || []} 
                      history={historyData?.data || []} 
                      isLoading={commentsLoading || historyLoading}
                      ticketId={id as string}
                      userId={user?._id}
                    />
                  </TabsContent>
                  
                  <TabsContent value="tasks">
                    <TicketTasks 
                      tasks={tasksData?.data || []} 
                      isLoading={tasksLoading}
                      ticketId={id as string}
                      userId={user?._id}
                    />
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* Desktop Layout - Always Show Overview First */}
              <div className="hidden lg:block">
                <TicketOverview ticket={ticket} progressPercentage={progressPercentage} />
              </div>
              
              {/* Tabs For Activity and Tasks on Desktop */}
              <div className="hidden lg:block">
                <Tabs defaultValue="activity">
                  <TabsList>
                    <TabsTrigger value="activity" className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Activity & Comments
                    </TabsTrigger>
                    <TabsTrigger value="tasks" className="flex items-center">
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Tasks
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="activity" className="mt-4">
                    <TicketActivity 
                      comments={commentsData?.data || []} 
                      history={historyData?.data || []} 
                      isLoading={commentsLoading || historyLoading}
                      ticketId={id as string}
                      userId={user?._id}
                    />
                  </TabsContent>
                  
                  <TabsContent value="tasks" className="mt-4">
                    <TicketTasks 
                      tasks={tasksData?.data || []} 
                      isLoading={tasksLoading}
                      ticketId={id as string}
                      userId={user?._id}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            
            {/* Right Column - Meta Information */}
            <div className="space-y-6">
              {/* People Card */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium mb-4">People</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Reported by</span>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{`${ticket.creator.firstName[0]}${ticket.creator.lastName[0]}`}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{`${ticket.creator.firstName} ${ticket.creator.lastName}`}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Assigned to</span>
                      {ticket.assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>{`${ticket.assignee.firstName[0]}${ticket.assignee.lastName[0]}`}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{`${ticket.assignee.firstName} ${ticket.assignee.lastName}`}</span>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline">Assign</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Dates Card */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium mb-4">Dates</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Created</span>
                      <Tooltip>
                        <TooltipTrigger className="text-sm">
                          {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                        </TooltipTrigger>
                        <TooltipContent>
                          {format(new Date(ticket.createdAt), 'PPpp')}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Updated</span>
                      <Tooltip>
                        <TooltipTrigger className="text-sm">
                          {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                        </TooltipTrigger>
                        <TooltipContent>
                          {format(new Date(ticket.updatedAt), 'PPpp')}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    
                    {ticket.dueDate && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Due Date</span>
                        <span className="text-sm">{format(new Date(ticket.dueDate), 'PP')}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Details Card */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium mb-4">Details</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Department</span>
                      <span className="text-sm">{ticket.department.name}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Category</span>
                      <span className="text-sm">{ticket.category.name}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Total Effort</span>
                      <span className="text-sm">{ticket.totalEfforts || 0} points</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Completed</span>
                      <span className="text-sm">{ticket.efforts || 0} points</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Related Tickets (if any) */}
              {/* Additional meta information */}
            </div>
          </div>
        </div>
      </TooltipProvider>
    </DashboardLoader>
  );
};

// Ticket Overview Component
const TicketOverview = ({ ticket, progressPercentage }) => {
  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <h3 className="text-lg font-medium mb-4">Description</h3>
        <div className="prose max-w-none">
          <p className="whitespace-pre-line text-gray-700">
            {ticket.description}
          </p>
        </div>
        
        {(ticket.totalEfforts > 0 || progressPercentage > 0) && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-medium">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Ticket Activity Component (Comments & History)
const TicketActivity = ({ comments, history, isLoading, ticketId, userId }) => {
  const [newComment, setNewComment] = useState('');
  
  // Merge comments and history, sort by date
  const combinedActivity = [...comments, ...history]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return (
    <Card>
      <CardContent className="p-4">
        {/* Comment Input */}
        <div className="mb-4">
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          ></textarea>
          <div className="flex justify-end mt-2">
            <Button disabled={!newComment.trim()}>
              Add Comment
            </Button>
          </div>
        </div>
        
        {/* Activity Timeline */}
        <div className="space-y-4">
          {combinedActivity.map((item) => (
            <div key={item._id} className="flex gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback>
                  {item.user?.firstName?.[0] || 'U'}{item.user?.lastName?.[0] || ''}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium">
                      {`${item.user?.firstName || 'User'} ${item.user?.lastName || ''}`}
                    </span>
                    {item.action && (
                      <span className="text-gray-500 ml-2">
                        {item.action.replace(/_/g, ' ').toLowerCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </span>
                </div>
                
                {item.content && (
                  <p className="mt-1 text-gray-700">{item.content}</p>
                )}
                
                {item.details && (
                  <div className="mt-1 text-sm text-gray-600">
                    {item.details.status && (
                      <p>Status changed to <strong>{item.details.status}</strong></p>
                    )}
                    {item.details.title && (
                      <p>Added task: <strong>{item.details.title}</strong></p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {combinedActivity.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No activity yet. Add a comment to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Ticket Tasks Component
const TicketTasks = ({ tasks, isLoading, ticketId, userId }) => {
  const [taskTitle, setTaskTitle] = useState('');
  
  return (
    <Card>
      <CardContent className="p-4">
        {/* Task Input */}
        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a new task..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
            <Button disabled={!taskTitle.trim()}>
              Add
            </Button>
          </div>
        </div>
        
        {/* Tasks List */}
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task._id} className="p-3 border rounded-lg flex items-start gap-3">
              <input
                type="checkbox"
                checked={task.status === 'COMPLETED'}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className={cn("font-medium", 
                    task.status === 'COMPLETED' && "line-through text-gray-400")}>
                    {task.title}
                  </h4>
                  <Badge className={task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {task.status}
                  </Badge>
                </div>
                
                {task.description && (
                  <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                )}
                
                {/* Task progress if not completed */}
                {task.status !== 'COMPLETED' && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span>Progress: {task.progress || 0}%</span>
                      <div className="flex gap-1">
                        {[0, 25, 50, 75, 100].map((value) => (
                          <button
                            key={value}
                            className={cn(
                              "px-1 py-0.5 rounded text-xs",
                              (task.progress || 0) >= value 
                                ? "bg-blue-100 text-blue-800" 
                                : "bg-gray-100 text-gray-800"
                            )}
                          >
                            {value}%
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full" 
                        style={{ width: `${task.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                  <span>
                    {task.assignee ? `Assigned to ${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'}
                  </span>
                  <span>
                    {task.efforts || 1} points
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {tasks.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No tasks yet. Add tasks to track progress!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketDetailPage;