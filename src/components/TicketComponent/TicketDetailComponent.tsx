// src/components/TicketComponent/TicketDetailComponent.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Clock, Edit, MessageSquare, Tag, Users, ChevronDown, CheckSquare, Paperclip, FileText } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useGetTicketCommentsQuery } from '@/services/endpoints/ticketCommentApi';
import { useGetTicketTasksQuery } from '@/services/endpoints/ticketTaskApi';
import { useGetTicketHistoryQuery } from '@/services/endpoints/ticketHistoryApi';
import TicketCommentComponent from './TicketCommentComponent';
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
import TicketChatSystem from './TicketChatSystem';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-toastify';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EnhancedTicketChat from './EnhancedTicketChat';

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

  // State for dialogs
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isAutoAssignDialogOpen, setIsAutoAssignDialogOpen] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  
  // RTK mutations
  const [assignTicket, { isLoading: isAssigning }] = useAssignTicketMutation();
  const [changeStatus, { isLoading: isChangingStatus }] = useChangeTicketStatusMutation();
  const [autoAssignTicket, { isLoading: isAutoAssigning }] = useAutoAssignTicketMutation();

  // Fetch department users for assignment
  const { data: departmentUsersData = {}, isLoading: usersLoading } = useGetMasterQuery({
    db: 'USER_MASTER',
    filter: { 
      department: ticket.department._id,
      isActive: true
    }
  }, { skip: !ticket?.department?._id });

  // Handle ticket assignment
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
      setSelectedAssignee('');
    } catch (error) {
      toast.error('Failed to assign ticket');
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-blue-600">{ticket.ticketId || `TKT-${ticket._id.toString().substr(-8)}`}</CardTitle>
                <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
              </div>
              <CardTitle className="text-xl">{ticket.title}</CardTitle>
            </div>
            
            <div className="flex gap-2">
              {canEdit && ticket.status !== 'CLOSED' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center">
                      Actions <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEditClick}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Ticket
                    </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => setIsStatusDialogOpen(true)}>
                      Change Status
                    </DropdownMenuItem>
                    {!ticket.assignee ? (
                      <>
                        <DropdownMenuItem onClick={() => setIsAssignDialogOpen(true)}>
                          Assign Manually
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleShowAutoAssign}>
                          Auto-Assign
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem onClick={() => setIsAssignDialogOpen(true)}>
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
                  className="flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
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
              
              <div>
                <h4 className="text-sm text-gray-500 mb-1">Assigned to</h4>
                {ticket.assignee ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{`${ticket.assignee.firstName[0]}${ticket.assignee.lastName[0]}`}</AvatarFallback>
                    </Avatar>
                    <p>{`${ticket.assignee.firstName} ${ticket.assignee.lastName}`}</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-gray-500">Unassigned</p>
                    {canEdit && ticket.status !== 'CLOSED' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsAssignDialogOpen(true)}
                      >
                        Assign
                      </Button>
                    )}
                  </div>
                )}
              </div>
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comments
            {commentsData?.data?.length > 0 && (
              <Badge variant="outline" className="ml-1">
                {commentsData.data.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Tasks
            {tasksData?.data?.length > 0 && (
              <Badge variant="outline" className="ml-1">
                {tasksData.data.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="attachments" className="flex items-center gap-2">
            <Paperclip className="h-4 w-4" />
            Files
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="comments">
          <EnhancedTicketChat
            ticketId={ticket._id}
            userId={userId}
            currentUser={{
              _id: userId,
              firstName: ticket.creator.firstName,
              lastName: ticket.creator.lastName
            }}
            isLoading={commentsLoading}
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
        
        <TabsContent value="attachments">
          <TicketAttachmentComponent
            ticketId={ticket._id}
            attachments={[]} // This would normally come from an API call
            isLoading={false}
            userId={userId}
            canEdit={canEdit && ticket.status !== 'CLOSED'}
          />
        </TabsContent>
        
        <TabsContent value="history">
          <TicketHistoryComponent 
            history={historyData?.data || []} 
            isLoading={historyLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Assign Ticket Dialog */}
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
  );
};

export default TicketDetailComponent;