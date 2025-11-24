// src/components/TicketComponent/TicketStatusChangeComponent.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-toastify';
import { useChangeTicketStatusMutation } from '@/services/endpoints/ticketApi';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MONGO_MODELS, SUCCESS } from '@/shared/constants';
import { useCreateApplicationMutation } from '@/services/endpoints/applicationApi';

interface TicketStatusChangeComponentProps {
  ticketId: string;
  currentStatus: string;
  userId: string;
  isOpen: boolean;
  onClose: (status?: string) => void;
  hasAssignee: boolean;
  requestType: string;
}

const TicketStatusChangeComponent: React.FC<TicketStatusChangeComponentProps> = ({
  ticketId,
  currentStatus,
  userId,
  isOpen,
  onClose,
  hasAssignee,
  requestType
}) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [statusWarning, setStatusWarning] = useState('');
  const [changeStatus, { isLoading }] = useChangeTicketStatusMutation();
  const [createMaster, { isLoading: isCreatingMaster }] = useCreateApplicationMutation();

  // Reset selected status when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(currentStatus);
      setStatusWarning('');
    }
  }, [isOpen, currentStatus]);

  // Handle status selection with validation
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);

    // Status transition validation
    if (!hasAssignee && (status === 'IN_PROGRESS' || status === 'RESOLVED')) {
      setStatusWarning('This ticket needs to be assigned before it can be moved to this status.');
    } else if (currentStatus === 'NEW' && status === 'RESOLVED') {
      setStatusWarning('Tickets should go through In Progress before being Resolved.');
    } else if (currentStatus === 'CLOSED' && status !== 'CLOSED') {
      setStatusWarning('Closed tickets cannot be reopened. Please create a new ticket if needed.');
    } else {
      setStatusWarning('');
    }
  };

  // Handle status update
  const handleUpdateStatus = async () => {
    if (!selectedStatus || selectedStatus === currentStatus) return;

    // Final validation before submission
    if (!hasAssignee && (selectedStatus === 'IN_PROGRESS' || selectedStatus === 'RESOLVED')) {
      toast.error('Please assign this ticket first');
      return;
    }

    try {
      if (requestType === 'task') {
        const formattedData = {
          db: MONGO_MODELS.TASK,
          action: 'update',
          filter: { "_id": ticketId },
          data: {
            status: selectedStatus,
            updatedBy: userId,
            ...(selectedStatus === 'Completed' && { progress: 100 })
          }

        };

        console.log('Task Data to Save:', formattedData);

        const response: any = await createMaster(formattedData);

        console.log('Task Response:', response);
        if (response.data && response.data.status === SUCCESS) {
          toast.success(`Task status updated to ${selectedStatus}`, {
            position: "bottom-right"
          });

        }
        onClose(response?.data?.data);

      } else {
        await changeStatus({
          ticketId,
          status: selectedStatus,
          updatedBy: userId
        }).unwrap();

        toast.success(`Ticket status updated to ${selectedStatus}`);
        onClose(selectedStatus);
      }




    } catch (error) {
      toast.error('Failed to update ticket status');
    }
  };

  // Get available next statuses based on current status
  const getAvailableStatuses = () => {
    switch (currentStatus) {
      case 'NEW':
        return hasAssignee
          ? ['NEW', 'ASSIGNED', 'IN_PROGRESS']
          : ['NEW', 'ASSIGNED'];
      case 'ASSIGNED':
        return ['ASSIGNED', 'IN_PROGRESS', 'NEW'];
      case 'IN_PROGRESS':
        return ['IN_PROGRESS', 'RESOLVED', 'ASSIGNED'];
      case 'RESOLVED':
        return ['RESOLVED', 'CLOSED', 'IN_PROGRESS'];
      case 'CLOSED':
        return ['CLOSED']; // Can't change status once closed
      default:
        return ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    }
  };

  const getAvailableTaskStatuses = (addedBy?: string) => {
    let statuses = [];

    switch (currentStatus) {
      case 'Pending':
        statuses = ['In Progress', 'Completed', 'Closed'];
        break;
      case 'In Progress':
        statuses = ['Pending', 'Completed', 'Closed'];
        break;
      case 'Completed':
        statuses = ['Pending', 'In Progress', 'Closed'];
        break;
      case 'Closed':
        statuses = ['Closed'];
        break;
      default:
        statuses = ['Pending', 'In Progress', 'Completed', 'Closed'];
    }

    // Only allow "Closed" if current user is the task creator

    if (addedBy !== userId) {
      statuses = statuses.filter((s) => s !== 'Closed');
    }

    console.log({ statuses }, addedBy, userId);
    return statuses;


  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose('')}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change {requestType === 'task' ? 'Task' : 'Ticket'} Status</DialogTitle>
          <DialogDescription>
            Update the status of this {requestType === 'task' ? 'task' : 'ticket'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Status</Label>
            <div className="p-2 bg-gray-100 rounded text-gray-700 font-medium">
              {currentStatus}
            </div>
          </div>

          <div className="space-y-2">
            <Label>New Status</Label>
            <Select onValueChange={handleStatusChange} value={selectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {requestType === 'task'
                  ? getAvailableTaskStatuses().map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </SelectItem>
                  ))
                  : getAvailableStatuses().map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}

              </SelectContent>
            </Select>
          </div>

          {statusWarning && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                {statusWarning}
              </AlertDescription>
            </Alert>
          )}

          {selectedStatus?.toUpperCase() === 'CLOSED' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Note</AlertTitle>
              <AlertDescription>
                Closing a {requestType === 'task' ? 'task' : 'ticket'} is permanent. You won't be able to reopen it afterward.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onClose('')}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            disabled={
              !selectedStatus ||
              selectedStatus === currentStatus ||
              isLoading ||
              (currentStatus?.toUpperCase() === 'CLOSED')
            }
          >
            {isLoading ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TicketStatusChangeComponent;