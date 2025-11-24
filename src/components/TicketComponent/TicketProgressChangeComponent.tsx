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
import { Input } from '../ui/input';

interface TicketProgressChangeComponentProps {
    ticket: any;
    ticketId: string;
    userId: string;
    isOpen: boolean;
    onClose: (updatedTicket?: any) => void;
    requestType: string;
}

const TicketProgressChangeComponent: React.FC<TicketProgressChangeComponentProps> = ({
    ticket,
    ticketId,
    userId,
    isOpen,
    onClose,
    requestType
}) => {
    const [statusWarning, setStatusWarning] = useState('');
    const [changeStatus, { isLoading }] = useChangeTicketStatusMutation();
    const [createMaster, { isLoading: isCreatingMaster }] = useCreateApplicationMutation();

    const [progress, setProgress] = useState('');

    // Handle status update
    const handleUpdateStatus = async () => {


        try {
            const value = Number(progress);

            // 1️⃣ Check if it’s a valid number
            if (isNaN(value)) {
                toast.error("Please enter a valid number.", { position: "bottom-right" });
                return;
            }

            // 2️⃣ Check if it’s positive
            if (value <= 0) {
                toast.error("Please enter a positive number greater than zero.", { position: "bottom-right" });
                return;
            }

            if (requestType === 'task') {
                const formattedData = {
                    db: MONGO_MODELS.TASK,
                    action: 'update',
                    filter: { "_id": ticketId },
                    data: {
                        progress: progress,
                        updatedBy: userId,
                        ...(progress === '100' && { status: 'Completed' })
                    },
                };

                console.log('Task Data to Save:', formattedData);

                const response: any = await createMaster(formattedData);

                console.log('Task Response:', response);
                if (response.data && response.data.status === SUCCESS) {
                    toast.success(`Task progress updated successfully`, {
                        position: "bottom-right"
                    });

                }
                onClose(response?.data?.data);

            } else {
                // await changeStatus({
                //     ticketId,
                //     status: selectedStatus,
                //     updatedBy: userId
                // }).unwrap();

                // toast.success(`Ticket status updated to ${selectedStatus}`);
                // onClose(selectedStatus);
            }




        } catch (error) {
            toast.error('Failed to update ticket status');
        }
    };


    return (
        <Dialog open={isOpen} onOpenChange={() => onClose(ticket)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update {requestType === 'task' ? 'Task' : 'Ticket'} Progress</DialogTitle>
                    <DialogDescription>
                        Update the progress of this {requestType === 'task' ? 'task' : 'ticket'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* <div className="space-y-2">
                        <Label>Current Status</Label>
                        <div className="p-2 bg-gray-100 rounded text-gray-700 font-medium">
                            {currentStatus}
                        </div>
                    </div> */}

                    <div className="space-y-2">
                        <Label>Progress Percent</Label>
                        <Input value={progress} onChange={(e) => setProgress(e.target.value)}></Input>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onClose(ticket)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpdateStatus}
                        disabled={
                            progress.trim() === ''
                        }
                    >
                        {isLoading ? 'Updating...' : 'Update Progress'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default TicketProgressChangeComponent;