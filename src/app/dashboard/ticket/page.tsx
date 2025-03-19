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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const filterVariants = {
    hidden: { opacity: 0, height: 0, y: -10 },
    visible: { 
      opacity: 1, 
      height: "auto", 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      } 
    },
    exit: { 
      opacity: 0, 
      height: 0, 
      y: -10, 
      transition: { 
        duration: 0.2, 
        ease: "easeInOut" 
      } 
    }
  };
  
  return (
    <DashboardLoader loading={loading}>
      <div className="space-y-6 max-w-full">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-lg shadow-card px-6 py-5 border"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                <span>Tickets</span>
                {filteredTickets && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, delay: 0.3 }}
                  >
                    <Badge className="ml-2 badge-status bg-primary/10 text-primary">
                      {filteredTickets.length} {filteredTickets.length === 1 ? 'ticket' : 'tickets'}
                    </Badge>
                  </motion.div>
                )}
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage and track all support tickets efficiently
              </p>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap justify-end">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="btn-hover-effect focus-ring h-9"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline ml-1.5">Refresh</span>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="btn-hover-effect focus-ring h-9"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="hidden sm:inline ml-1.5">Options</span>
                      <ChevronDown className="h-4 w-4 ml-1 opacity-70" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="shadow-dropdown animate-fade-in">
                    <DropdownMenuItem 
                      onClick={() => router.push('/dashboard/ticket/categories')}
                      className="cursor-pointer"
                    >
                      Categories
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => router.push('/dashboard/ticket/skills')}
                      className="cursor-pointer"
                    >
                      User Skills
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setShowFilters(!showFilters)}
                      className="cursor-pointer"
                    >
                      {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  className="flex items-center gap-1.5 h-9 shadow-md btn-hover-effect focus-ring"
                  onClick={() => router.push('/dashboard/ticket/create')}
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Ticket</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <Tabs 
          defaultValue="board" 
          className="space-y-4"
          onValueChange={(value) => setView(value)}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card rounded-lg p-3 shadow-sm border">
            <div className="flex items-center flex-wrap sm:flex-nowrap gap-2">
              <TabsList className="mr-2">
                <TabsTrigger 
                  value="board" 
                  className="flex items-center gap-1.5 focus-ring transition-all duration-200"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Board</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="list" 
                  className="flex items-center gap-1.5 focus-ring transition-all duration-200"
                >
                  <LayoutList className="h-4 w-4" />
                  <span>List</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="statistics" 
                  className="flex items-center gap-1.5 focus-ring transition-all duration-200"
                >
                  <Table className="h-4 w-4" />
                  <span>Stats</span>
                </TabsTrigger>
              </TabsList>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1.5 transition-all duration-200 h-9 rounded-lg focus-ring"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                  {(departmentFilter && departmentFilter !== 'all_departments') || 
                   (statusFilter && statusFilter !== 'all_statuses') || 
                   (priorityFilter && priorityFilter !== 'all_priorities') ? (
                    <Badge className="ml-1 badge-status bg-primary/10 text-primary">
                      Active
                    </Badge>
                  ) : null}
                </Button>
              </motion.div>
            </div>
            
            <div className="relative max-w-xs sm:max-w-sm w-full group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 input-modern"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute right-1 top-0 h-full px-2 text-muted-foreground hover:text-primary"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <AnimatePresence>
            {showFilters && (
              <motion.div
                variants={filterVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Card className="shadow-card card-hover">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-base flex items-center">
                      <ListFilter className="h-4 w-4 mr-2 text-primary" />
                      Filter Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium mb-1.5 block">Department</label>
                        <Select onValueChange={setDepartmentFilter} value={departmentFilter}>
                          <SelectTrigger className="input-modern">
                            <SelectValue placeholder="Select Department" />
                          </SelectTrigger>
                          <SelectContent className="shadow-dropdown">
                            <SelectItem value="all_departments" className="cursor-pointer">All Departments</SelectItem> 
                            {departmentData?.data?.map(dept => (
                              <SelectItem key={dept._id} value={dept._id} className="cursor-pointer">
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium mb-1.5 block">Status</label>
                        <Select onValueChange={setStatusFilter} value={statusFilter}>
                          <SelectTrigger className="input-modern">
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                          <SelectContent className="shadow-dropdown">
                            <SelectItem value="all_statuses" className="cursor-pointer">All Statuses</SelectItem>
                            <SelectItem value="NEW" className="cursor-pointer">New</SelectItem>
                            <SelectItem value="ASSIGNED" className="cursor-pointer">Assigned</SelectItem>
                            <SelectItem value="IN_PROGRESS" className="cursor-pointer">In Progress</SelectItem>
                            <SelectItem value="RESOLVED" className="cursor-pointer">Resolved</SelectItem>
                            <SelectItem value="CLOSED" className="cursor-pointer">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium mb-1.5 block">Priority</label>
                        <Select onValueChange={setpPriorityFilter} value={priorityFilter}>
                          <SelectTrigger className="input-modern">
                            <SelectValue placeholder="Select Priority" />
                          </SelectTrigger>
                          <SelectContent className="shadow-dropdown">
                            <SelectItem value="all_priorities" className="cursor-pointer">All Priorities</SelectItem>
                            <SelectItem value="HIGH" className="cursor-pointer">High</SelectItem>
                            <SelectItem value="MEDIUM" className="cursor-pointer">Medium</SelectItem>
                            <SelectItem value="LOW" className="cursor-pointer">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-5">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="mr-2"
                      >
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="btn-hover-effect focus-ring"
                          onClick={() => {
                            setDepartmentFilter('');
                            setStatusFilter('');
                            setpPriorityFilter('');
                            setSearchQuery('');
                          }}
                        >
                          Reset Filters
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          size="sm"
                          className="shadow-md btn-hover-effect focus-ring"
                          onClick={() => setShowFilters(false)}
                        >
                          Apply
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
          
          <TabsContent value="board" className="mt-0 pt-2">
            <motion.div
              key="board-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <TicketBoardComponent 
                tickets={filteredTickets || []} 
                onTicketClick={handleTicketClick}
                userId={user?._id}
              />
            </motion.div>
          </TabsContent>
          
          <TabsContent value="list" className="mt-0 pt-2">
            <motion.div
              key="list-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4">
                {filteredTickets?.length > 0 ? (
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {filteredTickets.map((ticket) => (
                      <motion.div
                        key={ticket._id}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, y: -2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        className="card-hover"
                      >
                        <TicketComponent 
                          ticket={ticket} 
                          onClick={() => handleTicketClick(ticket._id)}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    className="flex flex-col items-center justify-center py-16 rounded-lg shadow-sm border"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <motion.div 
                      className="bg-muted p-4 rounded-full mb-4 text-primary"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17, delay: 0.3 }}
                    >
                      <Search className="h-10 w-10" />
                    </motion.div>
                    <motion.h3 
                      className="text-xl font-medium mb-2"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                    >
                      No tickets found
                    </motion.h3>
                    <motion.p 
                      className="text-muted-foreground mb-6 text-center max-w-md"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.3 }}
                    >
                      {searchQuery 
                        ? `No tickets match your search "${searchQuery}"`
                        : "No tickets match your current filters"}
                    </motion.p>
                    <motion.div 
                      className="flex gap-3"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.3 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          variant="outline"
                          className="btn-hover-effect focus-ring"
                          onClick={() => {
                            setDepartmentFilter('');
                            setStatusFilter('');
                            setpPriorityFilter('');
                            setSearchQuery('');
                          }}
                        >
                          Reset Filters
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          onClick={() => router.push('/dashboard/ticket/create')}
                          className="shadow-md btn-hover-effect focus-ring"
                        >
                          Create New Ticket
                        </Button>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="statistics" className="mt-0 pt-2">
            <motion.div
              key="statistics-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <TicketStatisticsComponent 
                tickets={ticketsData?.data || []}
                departmentFilter={departmentFilter}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLoader>
  );
};

export default TicketDashboardPage;