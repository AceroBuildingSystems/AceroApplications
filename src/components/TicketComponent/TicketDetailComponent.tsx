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
import TicketChat from './TicketChat';
import { cn } from '@/lib/utils';

interface TicketDetailComponentProps {
  ticket: any;
  onEditClick: () => void;
  userId: string;
  userRole: string;
}

const getStatusColor = (status) => {
  const statusMap = {
    NEW: 'bg-blue-100 text-blue-800 border border-blue-200',
    ASSIGNED: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
    IN_PROGRESS: 'bg-amber-100 text-amber-800 border border-amber-200',
    RESOLVED: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    CLOSED: 'bg-gray-100 text-gray-800 border border-gray-200',
  };
  return statusMap[status?.toUpperCase()] || statusMap.NEW;
};

const getPriorityColor = (priority) => {
  const priorityMap = {
    HIGH: 'bg-rose-100 text-rose-800 border border-rose-200',
    MEDIUM: 'bg-orange-100 text-orange-800 border border-orange-200',
    LOW: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  };
  return priorityMap[priority?.toUpperCase()] || priorityMap.MEDIUM;
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
    <div className="space-y-8">
    <Card className="border-none shadow-md overflow-hidden">
      <CardHeader className="pb-4 bg-gray-50/70">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <CardTitle className="text-xl md:text-2xl font-bold text-gray-800">
                {ticket.ticketId || `TKT-${ticket._id.toString().substr(-8)}`}
              </CardTitle>
              <Badge className={cn("px-2.5 py-0.5 text-xs font-medium rounded-md", getStatusColor(ticket.status))}>
                {ticket.status}
              </Badge>
              <Badge className={cn("px-2.5 py-0.5 text-xs font-medium rounded-md", getPriorityColor(ticket.priority))}>
                {ticket.priority}
              </Badge>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
              {ticket.title}
            </h2>
          </div>
          
          <div className="flex items-center gap-2 self-end md:self-auto">
            {canEdit && ticket.status !== 'CLOSED' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-lg border-gray-200 hover:border-primary hover:bg-gray-50">
                    Actions <ChevronDown className="ml-2 h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-lg">
                  <DropdownMenuItem onClick={onEditClick} className="cursor-pointer">
                    <Edit className="mr-2 h-4 w-4 text-primary" />
                    Edit Ticket
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsStatusDialogOpen(true)} className="cursor-pointer">
                    <Tag className="mr-2 h-4 w-4 text-primary" />
                    Change Status
                  </DropdownMenuItem>
                  {!ticket.assignee ? (
                    <>
                      <DropdownMenuItem onClick={() => setIsAssignDialogOpen(true)} className="cursor-pointer">
                        <Users className="mr-2 h-4 w-4 text-primary" />
                        Assign Manually
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleShowAutoAssign} className="cursor-pointer">
                        <Users className="mr-2 h-4 w-4 text-primary" />
                        Auto-Assign
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem onClick={() => setIsAssignDialogOpen(true)} className="cursor-pointer">
                      <Users className="mr-2 h-4 w-4 text-primary" />
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
                className="flex items-center gap-2 rounded-lg bg-primary hover:bg-primary/90 shadow-sm"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-8">
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 text-lg">Description</h3>
            <p className="text-gray-700 whitespace-pre-line bg-gray-50/50 p-4 rounded-lg border border-gray-100">{ticket.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Department</h4>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <p className="font-medium text-gray-800">{ticket.department.name}</p>
              </div>
            </div>
            
            <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Category</h4>
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                <p className="font-medium text-gray-800">{ticket.category.name}</p>
              </div>
            </div>
            
            <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Created</h4>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <p className="font-medium text-gray-800" title={format(new Date(ticket.createdAt), 'PPP p')}>
                  {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            
            {ticket.dueDate && (
              <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Due Date</h4>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  <p className="font-medium text-gray-800">{format(new Date(ticket.dueDate), 'PPP')}</p>
                </div>
              </div>
            )}
          </div>
          
          <Separator className="my-2" />
          
          <div className="flex flex-wrap gap-8">
            <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100 min-w-[250px]">
              <h4 className="text-sm font-medium text-gray-500 mb-3">Created by</h4>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-gray-200">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">{`${ticket.creator.firstName[0]}${ticket.creator.lastName[0]}`}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-800">{`${ticket.creator.firstName} ${ticket.creator.lastName}`}</p>
                  <p className="text-xs text-gray-500">Creator</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100 min-w-[250px]">
              <h4 className="text-sm font-medium text-gray-500 mb-3">Assigned to</h4>
              {ticket.assignee ? (
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">{`${ticket.assignee.firstName[0]}${ticket.assignee.lastName[0]}`}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-800">{`${ticket.assignee.firstName} ${ticket.assignee.lastName}`}</p>
                    <p className="text-xs text-gray-500">Assignee</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-gray-200">
                    <AvatarFallback className="bg-gray-100 text-gray-400">?</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <p className="text-gray-500 font-medium">Unassigned</p>
                    {canEdit && ticket.status !== 'CLOSED' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsAssignDialogOpen(true)}
                        className="rounded-lg border-gray-200 hover:border-primary hover:bg-gray-50"
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
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-800">Progress</h4>
                <span className="text-sm font-semibold text-primary">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    
    <Tabs defaultValue="comments" className="w-full">
      <TabsList className="grid w-full grid-cols-4 rounded-lg bg-gray-100 p-1">
        <TabsTrigger value="comments" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Comments</span>
            {commentsData?.data?.length > 0 && (
              <Badge variant="outline" className="ml-1 bg-primary/10 text-primary border-primary/20">
                {commentsData.data.length}
              </Badge>
            )}
          </div>
        </TabsTrigger>
        <TabsTrigger value="tasks" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            <span>Tasks</span>
            {tasksData?.data?.length > 0 && (
              <Badge variant="outline" className="ml-1 bg-primary/10 text-primary border-primary/20">
                {tasksData.data.length}
              </Badge>
            )}
          </div>
        </TabsTrigger>
        <TabsTrigger value="attachments" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
          <div className="flex items-center gap-2">
            <Paperclip className="h-4 w-4" />
            <span>Files</span>
          </div>
        </TabsTrigger>
        <TabsTrigger value="history" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>History</span>
          </div>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="comments" className="mt-6">
        <TicketChat
          ticketId={ticket._id}
          userId={userId}
          roomId={ticket.roomId || `ticket-${ticket._id}`}
          currentUser={{
            _id: userId,
            firstName: ticket.creator.firstName,
            lastName: ticket.creator.lastName,
            ...(ticket.creator.avatar && { avatar: ticket.creator.avatar })
          }}
          isLoading={commentsLoading}
        />
      </TabsContent>
      
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