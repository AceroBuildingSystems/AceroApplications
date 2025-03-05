// src/components/TicketComponent/TicketDetailComponent.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Clock, Edit, MessageSquare, Tag, Users } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useGetTicketCommentsQuery } from '@/services/endpoints/ticketCommentApi';
import { useGetTicketTasksQuery } from '@/services/endpoints/ticketTaskApi';
import { useGetTicketHistoryQuery } from '@/services/endpoints/ticketHistoryApi';
import TicketCommentComponent from './TicketCommentComponent';
import TicketTaskComponent from './TicketTaskComponent';
import TicketHistoryComponent from './TicketHistoryComponent';

import { useGetMasterQuery } from '@/services/endpoints/masterApi';
import { useAssignTicketMutation } from '@/services/endpoints/ticketApi';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'react-toastify';
import { useAutoAssignTicketMutation } from '@/services/endpoints/ticketApi';


interface TicketDetailComponentProps {
  ticket: any;
  onEditClick: () => void;
  userId: string;
  userRole: string;
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

const TicketDetailComponent: React.FC<TicketDetailComponentProps> = ({ 
  ticket, 
  onEditClick,
  userId,
  userRole
}) => {
  const { data: commentsData = {}, isLoading: commentsLoading } = useGetTicketCommentsQuery({ 
    ticketId: ticket._id 
  });
  
  const { data: tasksData = {}, isLoading: tasksLoading } = useGetTicketTasksQuery({ 
    ticketId: ticket._id 
  });
  
  const { data: historyData = {}, isLoading: historyLoading } = useGetTicketHistoryQuery({ 
    ticketId: ticket._id 
  });

  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
const [selectedAssignee, setSelectedAssignee] = useState('');
const [assignTicket, { isLoading: isAssigning }] = useAssignTicketMutation();
const [autoAssignTicket] = useAutoAssignTicketMutation();

const { data: departmentUsersData = {}, isLoading: usersLoading } = useGetMasterQuery({
  db: 'USER_MASTER',
  filter: { 
    department: ticket.department._id,
    isActive: true
  }
}, { skip: !ticket?.department?._id });
const handleAutoAssign = async () => {
  try {
    await autoAssignTicket({
      ticketId: ticket._id,
      departmentId: ticket.department._id,
      categoryId: ticket.category._id,
      updatedBy: userId
    }).unwrap();
    
    toast.success('Ticket auto-assigned successfully');
  } catch (error) {
    toast.error('Failed to auto-assign ticket');
  }
};
// Add this function to handle assignment:
const handleAssignTicket = async () => {
  if (!selectedAssignee) return;
  
  try {
    await assignTicket({
      ticketId: ticket._id,
      assigneeId: selectedAssignee,
      updatedBy: userId
    }).unwrap();
    
    toast.success('Ticket assigned successfully');
    setIsAssignDialogOpen(false);
  } catch (error) {
    toast.error('Failed to assign ticket');
  }
};
  
  // Calculate progress percentage
  const progressPercentage = ticket.totalEfforts > 0 
    ? Math.round((ticket.efforts / ticket.totalEfforts) * 100) 
    : 0;
  
  // Check if user can edit this ticket
  const canEdit = userId === ticket.creator._id || userId === ticket.assignee?._id || userRole === 'ADMIN';
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-blue-600">{ticket.ticketId}</CardTitle>
                <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
              </div>
              <CardTitle className="text-xl">{ticket.title}</CardTitle>
            </div>
            {canEdit && (
              <Button variant="outline" size="sm" onClick={onEditClick}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Ticket
              </Button>
            )}
          </div>

                {canEdit && (
        <div className="flex gap-2">
          {ticket.status !== 'CLOSED' && (
            <Button 
              variant={ticket.assignee ? "outline" : "default"} 
              onClick={() => setIsAssignDialogOpen(true)}
            >
              {ticket.assignee ? 'Reassign' : 'Assign Ticket'}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onEditClick}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Ticket
          </Button>
        </div>
      )}

      {canEdit && ticket.status !== 'CLOSED' && (
        <Button 
          variant="outline" 
          onClick={handleAutoAssign}
        >
          Auto-Assign
        </Button>
      )}

        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-line">{ticket.description}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <h4 className="text-sm text-gray-500 mb-1">Department</h4>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-gray-600" />
                  <p>{ticket.department.name}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm text-gray-500 mb-1">Category</h4>
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4 text-gray-600" />
                  <p>{ticket.category.name}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm text-gray-500 mb-1">Created</h4>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <p title={format(new Date(ticket.createdAt), 'PPP p')}>
                    {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              
              {ticket.dueDate && (
                <div>
                  <h4 className="text-sm text-gray-500 mb-1">Due Date</h4>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4 text-gray-600" />
                    <p>{format(new Date(ticket.dueDate), 'PPP')}</p>
                  </div>
                </div>
              )}
            </div>
            
            <Separator />
            
            <div className="flex flex-wrap gap-6">
              <div>
                <h4 className="text-sm text-gray-500 mb-1">Created by</h4>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>{`${ticket.creator.firstName[0]}${ticket.creator.lastName[0]}`}</AvatarFallback>
                  </Avatar>
                  <p>{`${ticket.creator.firstName} ${ticket.creator.lastName}`}</p>
                </div>
              </div>
              
              {ticket.assignee && (
                <div>
                  <h4 className="text-sm text-gray-500 mb-1">Assigned to</h4>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{`${ticket.assignee.firstName[0]}${ticket.assignee.lastName[0]}`}</AvatarFallback>
                    </Avatar>
                    <p>{`${ticket.assignee.firstName} ${ticket.assignee.lastName}`}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Progress bar */}
            {ticket.totalEfforts > 0 && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-medium">Progress</h4>
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
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="comments">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comments
            {commentsData?.data?.length > 0 && (
              <Badge variant="outline" className="ml-1">
                {commentsData.data.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="tasks">
            Tasks
            {tasksData?.data?.length > 0 && (
              <Badge variant="outline" className="ml-1">
                {tasksData.data.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">
            History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="comments">
          <TicketCommentComponent 
            ticketId={ticket._id} 
            comments={commentsData?.data || []} 
            isLoading={commentsLoading}
            userId={userId}
            currentUserName={`${ticket.creator.firstName} ${ticket.creator.lastName}`}
          />
        </TabsContent>
        
        <TabsContent value="tasks">
          <TicketTaskComponent 
            ticketId={ticket._id} 
            tasks={tasksData?.data || []} 
            isLoading={tasksLoading}
            userId={userId}
            canEdit={canEdit}
            ticketStatus={ticket.status}
          />
        </TabsContent>
        
        <TabsContent value="history">
          <TicketHistoryComponent 
            history={historyData?.data || []} 
            isLoading={historyLoading}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{ticket.assignee ? 'Reassign Ticket' : 'Assign Ticket'}</DialogTitle>
      <DialogDescription>
        Select a user to assign this ticket to
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Assignee</Label>
        <Select onValueChange={setSelectedAssignee} value={selectedAssignee}>
          <SelectTrigger>
            <SelectValue placeholder="Select user" />
          </SelectTrigger>
          <SelectContent>
            {departmentUsersData?.data?.map(user => (
              <SelectItem key={user._id} value={user._id}>
                {`${user.firstName} ${user.lastName}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
    
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
        Cancel
      </Button>
      <Button 
        onClick={handleAssignTicket}
        disabled={!selectedAssignee || isAssigning}
      >
        {isAssigning ? 'Assigning...' : 'Assign Ticket'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
};

export default TicketDetailComponent;