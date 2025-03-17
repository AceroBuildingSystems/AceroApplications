// src/app/dashboard/ticket/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useGetTicketsQuery } from '@/services/endpoints/ticketApi';
import { useGetMasterQuery } from '@/services/endpoints/masterApi';
import DashboardLoader from '@/components/ui/DashboardLoader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useUserAuthorised from '@/hooks/useUserAuthorised';
import { 
  Plus, LayoutDashboard, LayoutList, Filter, Search,
  ListFilter, X, ChevronDown, Loader2, Settings, RefreshCw,
  Table
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import TicketBoardComponent from '@/components/TicketComponent/TicketBoardComponent';
import TicketComponent from '@/components/TicketComponent/TicketComponent';
import TicketStatisticsComponent from '@/components/TicketComponent/TicketStatisticsComponent';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from 'react-toastify';

const TicketDashboardPage = () => {
  const { user, status } = useUserAuthorised();
  const router = useRouter();
  
  const [view, setView] = useState('board');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setpPriorityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch tickets
  const { data: ticketsData = {}, isLoading: ticketsLoading, refetch } = useGetTicketsQuery({
    sort: { createdAt: -1 }
  });
  
  // Fetch departments
  const { data: departmentData = {}, isLoading: departmentLoading } = useGetMasterQuery({
    db: 'DEPARTMENT_MASTER',
    filter: { isActive: true },
    sort: { name: 1 }
  });
  
  const loading = ticketsLoading || departmentLoading || status === 'loading';
  
  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast.success("Tickets refreshed");
  };
  
  // Filter tickets
  const filteredTickets = ticketsData?.data?.filter(ticket => {
    // Department filter
    if (departmentFilter && departmentFilter !== 'all_departments' && ticket.department._id !== departmentFilter) return false;
    
    // Status filter
    if (statusFilter && statusFilter !== 'all_statuses' && ticket.status !== statusFilter) return false;
    
    // Priority filter
    if (priorityFilter && priorityFilter !== 'all_priorities' && ticket.priority !== priorityFilter) return false;
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        ticket.title.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query) ||
        ticket._id.toString().toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  const handleTicketClick = (ticketId: string) => {
    router.push(`/dashboard/ticket/${ticketId}`);
  };
  
  return (
    <DashboardLoader loading={loading}>
      <div className="space-y-6 max-w-full">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">Tickets</h1>
            <p className="text-sm text-gray-500">
              Manage and track all support tickets
              {filteredTickets && (
                <span className="ml-1 text-gray-700">
                  ({filteredTickets.length} {filteredTickets.length === 1 ? 'ticket' : 'tickets'})
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Options</span>
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push('/dashboard/ticket/categories')}>
                  Categories
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/ticket/skills')}>
                  User Skills
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowFilters(!showFilters)}>
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              className="flex items-center gap-1"
              onClick={() => router.push('/dashboard/ticket/create')}
            >
              <Plus className="h-4 w-4" />
              <span>Create Ticket</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="board" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center">
              <TabsList className="mr-4">
                <TabsTrigger value="board" className="flex items-center gap-1">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Board</span>
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center gap-1">
                  <LayoutList className="h-4 w-4" />
                  <span>List</span>
                </TabsTrigger>
                <TabsTrigger value="statistics" className="flex items-center gap-1">
                  <Table className="h-4 w-4" />
                  <span>Stats</span>
                </TabsTrigger>
              </TabsList>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {(departmentFilter && departmentFilter !== 'all_departments') || 
                 (statusFilter && statusFilter !== 'all_statuses') || 
                 (priorityFilter && priorityFilter !== 'all_priorities') ? (
                  <Badge className="ml-1 bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
                    Active
                  </Badge>
                ) : null}
              </Button>
            </div>
            
            <div className="relative max-w-xs sm:max-w-sm w-full">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-8"
              />
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-0 top-0 h-full px-2"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-gray-50 border border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center">
                      <ListFilter className="h-4 w-4 mr-2" />
                      Filter Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Department</label>
                        <Select onValueChange={setDepartmentFilter} value={departmentFilter}>
                          <SelectTrigger>
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
                        <label className="text-sm font-medium mb-1.5 block">Status</label>
                        <Select onValueChange={setStatusFilter} value={statusFilter}>
                          <SelectTrigger>
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
                        <label className="text-sm font-medium mb-1.5 block">Priority</label>
                        <Select onValueChange={setpPriorityFilter} value={priorityFilter}>
                          <SelectTrigger>
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
                    
                    <div className="flex justify-end mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="mr-2"
                        onClick={() => {
                          setDepartmentFilter('');
                          setStatusFilter('');
                          setpPriorityFilter('');
                          setSearchQuery('');
                        }}
                      >
                        Reset Filters
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => setShowFilters(false)}
                      >
                        Apply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
          
          <TabsContent value="board">
            <TicketBoardComponent 
              tickets={filteredTickets || []} 
              onTicketClick={handleTicketClick}
              userId={user?._id}
            />
          </TabsContent>
          
          <TabsContent value="list">
            <div className="space-y-4">
              {filteredTickets?.length > 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.05 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {filteredTickets.map((ticket, index) => (
                    <motion.div
                      key={ticket._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <TicketComponent 
                        ticket={ticket} 
                        onClick={() => handleTicketClick(ticket._id)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <Search className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No tickets found</h3>
                  <p className="text-gray-500 mb-4 text-center max-w-md">
                    {searchQuery 
                      ? `No tickets match your search "${searchQuery}"`
                      : "No tickets match your current filters"}
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setDepartmentFilter('');
                        setStatusFilter('');
                        setpPriorityFilter('');
                        setSearchQuery('');
                      }}
                    >
                      Reset Filters
                    </Button>
                    <Button onClick={() => router.push('/dashboard/ticket/create')}>
                      Create New Ticket
                    </Button>
                  </div>
                </div>
              )}
            </div>
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