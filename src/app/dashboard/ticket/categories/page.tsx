// src/app/dashboard/ticket/categories/page.tsx
"use client";

import React from 'react';
import { useGetMasterQuery } from '@/services/endpoints/masterApi';
import { useGetTicketCategoriesQuery } from '@/services/endpoints/ticketCategoryApi';
import useUserAuthorised from '@/hooks/useUserAuthorised';
import DashboardLoader from '@/components/ui/DashboardLoader';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import TicketCategoryComponent from '@/components/TicketComponent/TicketCategoryComponent';

const TicketCategoriesPage = () => {
  const router = useRouter();
  const { user, status } = useUserAuthorised();
  
  // Get departments
  const { data: departmentData = {}, isLoading: departmentLoading } = useGetMasterQuery({
    db: 'DEPARTMENT_MASTER',
    filter: { isActive: true },
    sort: { name: 1 }
  });
  
  // Get all categories
  const { data: categoryData = {}, isLoading: categoryLoading } = useGetTicketCategoriesQuery({});
  
  const loading = departmentLoading || categoryLoading || status === 'loading';
  
  // Check if user is admin
  const isAdmin = user?.role?.name?.toUpperCase() === 'ADMIN';
  
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
          <h1 className="text-3xl font-bold">Ticket Categories</h1>
        </div>
        
        <TicketCategoryComponent 
          departments={departmentData?.data || []}
          categories={categoryData?.data || []}
          userId={user?._id}
          isAdmin={isAdmin}
        />
      </div>
    </DashboardLoader>
  );
};

export default TicketCategoriesPage;