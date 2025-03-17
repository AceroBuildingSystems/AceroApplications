// src/app/dashboard/ticket/page.tsx
"use client";

import React, { useState } from 'react';
import { useGetTicketsQuery } from '@/services/endpoints/ticketApi';
import { useGetMasterQuery } from '@/services/endpoints/masterApi';
import DashboardLoader from '@/components/ui/DashboardLoader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useUserAuthorised from '@/hooks/useUserAuthorised';
import { ListFilter, Plus, LayoutDashboard, LayoutList } from 'lucide-react';
import { useRouter } from 'next/navigation';
import TicketBoardComponent from '@/components/TicketComponent/TicketBoardComponent';
import TicketComponent from '@/components/TicketComponent/TicketComponent';
import TicketStatisticsComponent from '@/components/TicketComponent/TicketStatisticsComponent';

const TicketDashboardPage = () => {
  const { user, status } = useUserAuthorised();
  const router = useRouter();
  
  const [view, setView] = useState('board');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setpPriorityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch tickets
  const { data: ticketsData = {}, isLoading: ticketsLoading } = useGetTicketsQuery({
    sort: { createdAt: -1 }
  });
  
  // Fetch departments
  const { data: departmentData = {}, isLoading: departmentLoading } = useGetMasterQuery({
    db: 'DEPARTMENT_MASTER',
    filter: { isActive: true },
    sort: { name: 1 }
  });
  
  const loading = ticketsLoading || departmentLoading || status === 'loading';
  
  // Filter tickets
  const filteredTickets = ticketsData?.data?.filter(ticket => {
    // Department filter
    if (departmentFilter && departmentFilter !== 'all_departments' && ticket.department._id !== departmentFilter) return false;
    
    // Status filter
    if (statusFilter && statusFilter !== 'all_statuses' && ticket.status !== statusFilter) return false;
    
    // Priority filter
    if (priorityFilter && priorityFilter !== 'all_priorities' && ticket.priority !== priorityFilter) return false;
    
    // Rest of the filtering logic remains the same
    return true;
  });
  
  const handleTicketClick = (ticketId: string) => {
    router.push(`/dashboard/ticket/${ticketId}`);
  };

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    return (
      ticket.title.toLowerCase().includes(query) ||
      ticket.description.toLowerCase().includes(query) ||
      ticket._id.toString().toLowerCase().includes(query) // Use _id instead of ticketId
    );
  }
  
  return (
    <DashboardLoader loading={loading}>
      <div className="space-y-6 max-w-[90vw] lg:max-w-[95vw] mx-auto px-4">
  <Tabs defaultValue="tickets" className="space-y-6">
    <div className='flex flex-col sm:flex-row w-full gap-4 items-center justify-between'>
      <TabsList className='w-full sm:w-auto rounded-xl shadow-sm bg-white border'>
        <TabsTrigger className='rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary' value="tickets">Tickets</TabsTrigger>
        <TabsTrigger className='rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary' value="statistics">Statistics</TabsTrigger>
      </TabsList>
      
      <Button size="sm" className="w-full sm:w-auto gap-2 rounded-xl shadow-sm hover:shadow-md transition-all bg-primary hover:bg-primary/90"
        onClick={() => router.push('/dashboard/ticket/create')}>
        <Plus className="h-4 w-4" />
        Create Ticket
      </Button>
    </div>
    
    <TabsContent value="tickets" className="space-y-6">
      <Card className="overflow-hidden border-none shadow-md">
        <CardHeader className="pb-3 bg-gray-50/50">
          <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
            <ListFilter className="h-5 w-5 text-primary" />
            Filters
          </CardTitle>
          <CardDescription>Filter tickets by different criteria</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            
            <div>
              <Select onValueChange={setDepartmentFilter} value={departmentFilter}>
                <SelectTrigger className="rounded-xl border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_departments">All Departments</SelectItem> 
                  {departmentData?.data?.map(dept => (
                    <SelectItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select onValueChange={setStatusFilter} value={statusFilter}>
                <SelectTrigger className="rounded-xl border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_statuses">All Statuses</SelectItem>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="ASSIGNED">Assigned</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select onValueChange={setpPriorityFilter} value={priorityFilter}>
                <SelectTrigger className="rounded-xl border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary">
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_priorities">All Priorities</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-between mt-6">
            <div className="text-sm font-medium text-gray-700">
              {filteredTickets?.length || 0} tickets found
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={view === 'board' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('board')}
                className={view === 'board' ? 'bg-primary hover:bg-primary/90 rounded-lg shadow-sm' : 'rounded-lg'}
              >
                <LayoutDashboard className="h-4 w-4 mr-1" />
                Board
              </Button>
              <Button
                variant={view === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('list')}
                className={view === 'list' ? 'bg-primary hover:bg-primary/90 rounded-lg shadow-sm' : 'rounded-lg'}
              >
                <LayoutList className="h-4 w-4 mr-1" />
                List
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {view === 'board' ? (
        <TicketBoardComponent 
          tickets={filteredTickets || []} 
          onTicketClick={handleTicketClick}
          userId={user?._id}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTickets?.length > 0 ? (
            filteredTickets.map(ticket => (
              <TicketComponent 
                key={ticket._id} 
                ticket={ticket} 
                onClick={() => handleTicketClick(ticket._id)}
              />
            ))
          ) : (
            <div className="text-center py-16 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              <LayoutList className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">No tickets found</p>
              <p className="text-gray-500 mb-6">Try adjusting your filters or create a new ticket.</p>
              <Button 
                onClick={() => router.push('/dashboard/ticket/create')}
                className="gap-2 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <Plus className="h-4 w-4" />
                Create Ticket
              </Button>
            </div>
          )}
        </div>
      )}
    </TabsContent>
    
    <TabsContent value="statistics">
      <TicketStatisticsComponent 
        tickets={ticketsData?.data || []}
        departmentFilter={departmentFilter}
      />
    </TabsContent>
  </Tabs>
</div>
    </DashboardLoader>
  );
};

export default TicketDashboardPage;