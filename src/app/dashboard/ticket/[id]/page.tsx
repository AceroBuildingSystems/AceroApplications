// src/app/dashboard/ticket/[id]/page.tsx
"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetTicketsQuery, useUpdateTicketMutation } from '@/services/endpoints/ticketApi';
import useUserAuthorised from '@/hooks/useUserAuthorised';
import DashboardLoader from '@/components/ui/DashboardLoader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft } from 'lucide-react';
import TicketDetailComponent from '@/components/TicketComponent/TicketDetailComponent';
import TicketFormComponent from '@/components/TicketComponent/TicketFormComponent';
import { toast } from 'react-toastify';

const TicketDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user, status } = useUserAuthorised();
  const [isEditMode, setIsEditMode] = useState(false);
  
  const { data: ticketData = {}, isLoading: ticketLoading } = useGetTicketsQuery({
    id: id as string
  });
  
  const [updateTicket, { isLoading: isUpdating }] = useUpdateTicketMutation();
  
  const ticket = ticketData?.data?.[0];
  const loading = ticketLoading || status === 'loading' || isUpdating;
  
  const handleEditSubmit = async (data: any) => {
    try {
      await updateTicket({
        action: 'update',
        data: {
          ...data,
          _id: id
        }
      }).unwrap();
      
      toast.success('Ticket updated successfully');
      setIsEditMode(false);
    } catch (error) {
      toast.error('Failed to update ticket');
    }
  };
  
  // Determine user role for permission checks
  const userRole = user?.role?.name?.toUpperCase();
  
  return (
    <DashboardLoader loading={loading}>
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
          <h1 className="text-3xl font-bold">Ticket Details</h1>
        </div>
        
        {ticket ? (
          <>
            {isEditMode ? (
              <Card>
                <CardContent className="p-6">
                  <TicketFormComponent 
                    onSubmit={handleEditSubmit}
                    initialData={ticket}
                    userId={user?._id}
                    isEdit={true}
                  />
                  <div className="mt-4 flex justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditMode(false)}
                      className="mr-2"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <TicketDetailComponent 
                ticket={ticket} 
                onEditClick={() => setIsEditMode(true)} 
                userId={user?._id}
                userRole={userRole}
              />
            )}
          </>
        ) : (
          <Card>
            <CardContent className="p-6 text-center py-10 text-gray-500">
              Ticket not found or you don't have permission to view it.
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLoader>
  );
};

export default TicketDetailPage;