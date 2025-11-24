"use client";

import React, { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetTicketTasksQuery } from '@/services/endpoints/ticketTaskApi';
import DashboardLoader from '@/components/ui/DashboardLoader';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { MONGO_MODELS } from '@/shared/constants';
import { useGetMasterQuery } from '@/services/endpoints/masterApi';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import TicketDetailComponent from '@/components/TicketComponent/TicketDetailComponent';
import useUserAuthorised from '@/hooks/useUserAuthorised';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { DialogHeader } from '@/components/ui/dialog';
import TicketFormComponent from '@/components/TicketComponent/TicketFormComponent';

const TaskDetailPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get('taskId');
  const { user: authorisedUser, status } = useUserAuthorised();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const user = authorisedUser && '_id' in authorisedUser ? authorisedUser as { _id: string; role?: { name?: string } } : undefined;
  console.log("Task ID:", taskId);
  // Fetch task data
  const { data: taskData = { data: [] }, isLoading: tasksLoading, refetch } = useGetMasterQuery({
    db: MONGO_MODELS.TASK,
    sort: { createdAt: '-1' },
    filter: { '_id': taskId }
  });

  const { data: usersData = [], isLoading: userLoading }: any = useGetMasterQuery({
    db: 'USER_MASTER',
    filter: { isActive: true },
    sort: { empId: 'asc' },
  });

  const users = usersData?.data || [];

  const userOptions = useMemo(() =>
    users.map((user: any) => ({
      ...user, // keep all original fields
      name: user?.displayName ? user.displayName : `${user.firstName}`,

    })),
    [users]
  );

  console.log("Task ID:", taskData);
  const task = taskData?.data?.[0];

  const loading = tasksLoading;

  const handleEditSubmit = async (formData: any) => {
    try {
      // await updateTicket({
      //   action: 'update',
      //   data: {
      //     ...formData,
      //     _id: id,
      //   }
      // }).unwrap();

      // toast.success('Ticket updated successfully');
      // setIsEditDialogOpen(false);
      // refetchTicket(); // Refresh ticket data
    } catch (error) {
      toast.error('Failed to update ticket');
    }
  };

  if (tasksLoading) {
    return (
      <DashboardLoader loading={true}>
        <div />
      </DashboardLoader>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <h2 className="text-2xl font-semibold mb-2">Task Not Found</h2>
        <p className="text-gray-500 mb-4">The task you’re looking for doesn’t exist or you don’t have permission to view it.</p>
        <Button onClick={() => router.push('/dashboard/supportDesk/task')}>Return to Tasks</Button>
      </div>
    );
  }

  return (
    <DashboardLoader loading={loading}>
      <TooltipProvider>
        <div className="container px-4 py-4 mx-auto max-w-7xl">


          {/* Use TicketDetailComponent to display ticket details */}
          <TicketDetailComponent
            ticket={task}
            onEditClick={() => { setIsEditDialogOpen(true); console.log('Edit Clicked', isEditDialogOpen); }}
            userId={user?._id || ''}
            userRole={user?.role?.name || ''}
            requestType="task"
            user={user}
            userList={userOptions}
          />

          {/* Edit Ticket Dialog */}
          {/* <Dialog open={!isEditDialogOpen} onOpenChange={isEditDialogOpen ? () => setIsEditDialogOpen(false) : undefined}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Edit Ticket</DialogTitle>
                <DialogDescription>
                  Update the details for ticket
                </DialogDescription>
              </DialogHeader>

              <TicketFormComponent
                onSubmit={handleEditSubmit}
                initialData={task}
                userId={user?._id || ''}
                isEdit={true}
              />
            </DialogContent>
          </Dialog> */}
        </div>
      </TooltipProvider>
    </DashboardLoader>
  );
};

// Status and priority styling
const getStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-800',
    ASSIGNED: 'bg-indigo-100 text-indigo-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    RESOLVED: 'bg-green-100 text-green-800',
    CLOSED: 'bg-gray-100 text-gray-800',
  };
  return statusMap[status.toUpperCase()] || statusMap.NEW;
};

const getPriorityColor = (priority: any) => {
  const priorityMap = {
    HIGH: 'bg-red-100 text-red-800',
    MEDIUM: 'bg-orange-100 text-orange-800',
    LOW: 'bg-green-100 text-green-800',
  };
  return priorityMap[(priority?.toUpperCase() as keyof typeof priorityMap)] || priorityMap.MEDIUM;
};

export default TaskDetailPage;
