// src/app/dashboard/ticket/[id]/page.tsx
"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetTicketsQuery, useUpdateTicketMutation } from '@/services/endpoints/ticketApi';
import { useGetTicketCommentsQuery } from '@/services/endpoints/ticketCommentApi';
import { useGetTicketTasksQuery } from '@/services/endpoints/ticketTaskApi';
import { useGetTicketHistoryQuery } from '@/services/endpoints/ticketHistoryApi';
import useUserAuthorised from '@/hooks/useUserAuthorised';
import DashboardLoader from '@/components/ui/DashboardLoader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import TicketFormComponent from '@/components/TicketComponent/TicketFormComponent';
import TicketDetailComponent from '@/components/TicketComponent/TicketDetailComponent';
import { toast } from 'react-toastify';

const TicketDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user, status } = useUserAuthorised();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Fetch ticket data
  const { data: ticketData = {}, isLoading: ticketLoading, refetch: refetchTicket } = useGetTicketsQuery({
    id: id as string
  });
  
  // Fetch ticket comments, tasks, and history
  const { data: commentsData = {}, isLoading: commentsLoading } = useGetTicketCommentsQuery({ ticketId: id as string });
  const { data: tasksData = {}, isLoading: tasksLoading } = useGetTicketTasksQuery({ ticketId: id as string });
  const { data: historyData = {}, isLoading: historyLoading } = useGetTicketHistoryQuery({ ticketId: id as string });
  
  // Update ticket mutation
  const [updateTicket, { isLoading: isUpdating }] = useUpdateTicketMutation();
  
  const ticket = ticketData?.data?.[0];
  const loading = ticketLoading || status === 'loading' || isUpdating;
  
  // Handle ticket edit submission
  const handleEditSubmit = async (formData) => {
    try {
      await updateTicket({
        action: 'update',
        data: {
          ...formData,
          _id: id,
        }
      }).unwrap();
      
      toast.success('Ticket updated successfully');
      setIsEditDialogOpen(false);
      refetchTicket(); // Refresh ticket data
    } catch (error) {
      toast.error('Failed to update ticket');
    }
  };
  
  // Check if user can edit this ticket
  const canEdit = user && ticket && (
    user._id === ticket.creator._id || 
    user._id === ticket.assignee?._id || 
    user.role?.name?.toUpperCase() === 'ADMIN'
  );
  
  if (loading && !ticket) {
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
                    {ticket.ticketId || `TKT-${ticket._id.toString().substr(-8)}`}
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
              {canEdit && (
                <Button
                  onClick={() => setIsEditDialogOpen(true)}
                  className="flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" /> 
                  Edit
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEdit && ticket.status !== 'CLOSED' && (
                    <>
                      <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                        Edit Ticket
                      </DropdownMenuItem>
                      <DropdownMenuItem>Change Status</DropdownMenuItem>
                      {!ticket.assignee && (
                        <DropdownMenuItem>Assign Ticket</DropdownMenuItem>
                      )}
                    </>
                  )}
                  <DropdownMenuItem onClick={() => router.push(`/dashboard/ticket/create`)}>
                    Create New Ticket
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Use TicketDetailComponent to display ticket details */}
          <TicketDetailComponent 
            ticket={ticket}
            onEditClick={() => setIsEditDialogOpen(true)}
            userId={user?._id}
            userRole={user?.role?.name}
          />
          
          {/* Edit Ticket Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Edit Ticket</DialogTitle>
                <DialogDescription>
                  Update the details for ticket {ticket.ticketId || `TKT-${ticket._id.toString().substr(-8)}`}
                </DialogDescription>
              </DialogHeader>
              
              <TicketFormComponent 
                onSubmit={handleEditSubmit}
                initialData={ticket}
                userId={user?._id}
                isEdit={true}
              />
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    </DashboardLoader>
  );
};

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

export default TicketDetailPage;