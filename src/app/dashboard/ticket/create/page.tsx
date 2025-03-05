// src/app/dashboard/ticket/create/page.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateTicketMutation } from '@/services/endpoints/ticketApi';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import useUserAuthorised from '@/hooks/useUserAuthorised';
import DashboardLoader from '@/components/ui/DashboardLoader';
import TicketFormComponent from '@/components/TicketComponent/TicketFormComponent';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CreateTicketPage = () => {
  const router = useRouter();
  const { user, status } = useUserAuthorised();
  const [createTicket, { isLoading: isCreating }] = useCreateTicketMutation();
  
  const handleSubmit = async (data: any) => {
    try {
      const response = await createTicket({
        action: 'create',
        data
      }).unwrap();
      
      toast.success('Ticket created successfully');
      router.push(`/dashboard/ticket/${response.data._id}`);
    } catch (error) {
      toast.error('Failed to create ticket');
    }
  };
  
  return (
    <DashboardLoader loading={status === 'loading' || isCreating}>
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="mr-4"
            onClick={() => router.push('/dashboard/ticket')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Create Ticket</h1>
        </div>
        
        <TicketFormComponent 
          onSubmit={handleSubmit}
          userId={user?._id}
          isEdit={false}
        />
      </div>
    </DashboardLoader>
  );
};

export default CreateTicketPage;