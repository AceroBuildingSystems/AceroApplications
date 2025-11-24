// src/components/TicketComponent/TicketRecurringComponent.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Loader2, AlertCircle, Calendar, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUpdateTicketMutation } from '@/services/endpoints/ticketApi';
import { toast } from 'react-toastify';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { MONGO_MODELS, SUCCESS } from '@/shared/constants';
import { useCreateApplicationMutation } from '@/services/endpoints/applicationApi';

interface TicketEditComponentProps {
    ticket: any
    ticketId: string;
    isOpen: boolean;
    onClose: (updatedTicket) => void;
    userId: string;
}

const TicketEditComponent: React.FC<TicketEditComponentProps> = ({
    ticket,
    ticketId,
    isOpen,
    onClose,
    userId
}) => {


    const [updateTicket, { isLoading: isUpdating }] = useUpdateTicketMutation();

    const [createMaster, { isLoading: isCreatingMaster }] = useCreateApplicationMutation();
    // Reset form when dialog opens


    const handleSubmit = async () => {
        try {
            // setFormError(null);
            // let formattedData = {};
            // if (!enabled) {
            //     formattedData = {
            //         db: MONGO_MODELS.TASK,
            //         action: 'update',
            //         filter: { "_id": ticketId },
            //         data: {
            //             taskType: enabled ? 'recurring' : 'one-time',
            //             // recurring: { intervalType: type, isRecurring: enabled, customDays: type === 'custom' ? parseInt(interval) || 1 : 0 },
            //             updatedBy: userId
            //         },
            //     };
            // }
            // else {
            //     formattedData = {
            //         db: MONGO_MODELS.TASK,
            //         action: 'update',
            //         filter: { "_id": ticketId },
            //         data: {
            //             taskType: enabled ? 'recurring' : 'one-time',
            //             recurring: { intervalType: type, isRecurring: enabled, customDays: type === 'custom' ? parseInt(interval) || 1 : 0 },
            //             updatedBy: userId
            //         },
            //     };
            // }

            // const response: any = await createMaster(formattedData);

            // if (response.data && response.data.status === SUCCESS) {
            //     toast.success(`Recurring settings updated successfully`, {
            //         position: "bottom-right"
            //     });

            // }
            // onClose(response.data?.data || []);
            // const nextDate = enabled ? calculateNextRecurringDate() : undefined;

            // await updateTicket({
            //   _id: ticketId,
            //   isRecurring: enabled,
            //   recurringType: type,
            //   recurringInterval: parseInt(interval) || 1,
            //   recurringEndDate: endDate,
            //   nextRecurringDate: nextDate,
            //   updatedBy: userId
            // }).unwrap();

            // toast.success('Recurring settings updated successfully');
            // onClose();
        } catch (error) {
            // console.error('Failed to update recurring settings:', error);
            // setFormError('Failed to update recurring settings. Please try again.');
            // toast.error('Failed to update recurring settings');
        }
    };

    return (
       
    );
};

export default TicketEditComponent;