"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useGetTicketsQuery } from '@/services/endpoints/ticketApi';
import { useGetMasterQuery } from '@/services/endpoints/masterApi';
import DashboardLoader from '@/components/ui/DashboardLoader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/inputSearch';
import { Button } from '@/components/ui/button';
import useUserAuthorised from '@/hooks/useUserAuthorised';
import {
    Plus, LayoutDashboard, LayoutList, Filter, Search,
    ListFilter, X, ChevronDown, Loader2, Settings, RefreshCw,
    Table, Inbox, AlertTriangle, Check,
    FileDown,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    CalendarDays,
    FileText,
    MoreHorizontal
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
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Checkbox } from '@radix-ui/react-checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { assign } from 'lodash';
import MasterComponent from '@/components/MasterComponent/MasterComponent';
import moment from "moment";
import { ChevronsUpDown } from "lucide-react";
import { HRMSFormConfig } from '@/types/hrms';
import { HRMS_WORKFLOW_TEMPLATES } from '@/types/workflow';
import SmartDeskDialog from '@/components/SupportDeskComponent/FormComponent';
import { MONGO_MODELS } from '@/shared/constants';

const TicketDashboardPage = () => {
    const { user, status }: any = useUserAuthorised();
    const router = useRouter();

    const [workflowType, setWorkflowType]: any = useState('task');
    const [workflowConfig, setWorkflowConfig]: any = useState(null);
    const [formConfig, setFormConfig] = useState<HRMSFormConfig | null>(null);

    const [view, setView] = useState('list');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDialogOpen, setDialogOpen] = useState(false);

    const [initialData, setInitialData]: any = useState({});

    const [action, setAction] = useState('Add');

    const isAdmin = user?.role?.name === 'Admin'; // adjust this based on your actual role field

    const filter = !isAdmin
        ? {
            $or: [
                { creator: user._id },
                { assignee: user._id },
                { assignees: user._id }
            ]
        }
        : undefined;

    useEffect(() => {
        // Simulate fetching or selecting workflow config
        if (workflowType) {
            const config = HRMS_WORKFLOW_TEMPLATES[workflowType.toUpperCase()];
            setWorkflowConfig(config);
        }
    }, [workflowType]);

    // Fetch tickets
    const { data: taskData = { data: [] }, isLoading: tasksLoading, refetch } = useGetMasterQuery({
        db: MONGO_MODELS.TASK,
        filter: { isSubtask: false },
        sort: { createdAt: '-1' },
    });

    // Fetch departments
    const { data: departmentData = { data: [] }, isLoading: departmentLoading } = useGetMasterQuery({
        db: 'DEPARTMENT_MASTER',
        filter: { isActive: true },
        sort: { name: 'asc' }
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

    const loading = tasksLoading || userLoading || departmentLoading;

    // Handle manual refresh
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetch();
        setIsRefreshing(false);
        toast.success("Tasks refreshed");
    };

    // Filter tickets
    const filteredTickets = taskData?.data?.filter((ticket: any) => {
        // Department filter
        if (departmentFilter && departmentFilter !== 'all_departments' && ticket.department._id !== departmentFilter) return false;

        // Status filter
        if (statusFilter && statusFilter !== 'all_statuses' && ticket.status !== statusFilter) return false;

        // Priority filter
        if (priorityFilter && priorityFilter !== 'all_priorities' && ticket.priority !== priorityFilter) return false;

        // Search query
        if (searchQuery) {
            const query = searchQuery?.toLowerCase();
            return (
                ticket?.title?.toLowerCase().includes(query) || ticket?.subject?.toLowerCase().includes(query) || ticket?.taskId?.toLowerCase().includes(query) ||
                ticket?.description?.toLowerCase().includes(query) ||
                ticket._id.toString().toLowerCase().includes(query)
            );
        }

        return true;
    });

    const handleTaskClick = (ticketId: any) => {
        router.push(`/dashboard/supportDesk/task/view?taskId=${ticketId}`);
    };

    // Get active filters count
    const getActiveFiltersCount = () => {
        let count = 0;
        if (departmentFilter && departmentFilter !== 'all_departments') count++;
        if (statusFilter && statusFilter !== 'all_statuses') count++;
        if (priorityFilter && priorityFilter !== 'all_priorities') count++;
        return count;
    };

    // Animation variants
    const microButtonAnimation = {
        hover: { scale: 1.03, y: -1, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" },
        tap: { scale: 0.97, y: 1, boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)" },
        transition: { type: "spring", stiffness: 500, damping: 25 }
    };

    // Staggered children animation for the dashboard content
    const dashboardStaggerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.07,
                delayChildren: 0.05
            }
        }
    };

    const dashboardItemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 400, damping: 30 }
        }
    };

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

    // Reset all filters
    const resetFilters = () => {
        setDepartmentFilter('');
        setStatusFilter('');
        setPriorityFilter('');
        setSearchQuery('');
    };

    const ticketColumns = [
        {
            id: "select",
            header: ({ table }: any) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }: any) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "taskId",
            header: ({ column }: any) => (
                <button
                    className="group flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span>Task No</span>
                    <ChevronsUpDown
                        size={15}
                        className={`transition-opacity duration-150 ${column.getIsSorted()
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                            }`}
                    />
                </button>
            ),
            cell: ({ row }: any) => <div className='text-blue-500' onClick={() => handleTaskClick(row.original._id)}>{row.original.taskId}</div>,
        },
        {
            accessorKey: "subject",
            header: "Task Details",
            cell: ({ row }: any) => {
                const data = row.original;
                return (
                    <div className="space-y-1">
                        {/* Task Title */}
                        <div className="font-medium text-black">
                            {data.subject || "Untitled Task"}
                        </div>

                        {/* Meta Info Line */}
                        <div className="text-sm text-black flex flex-wrap gap-x-2">
                            <span>
                                <span className="text-gray-600">Status:</span>{" "}
                                <span className={
                                    data.status?.toProperCase() === "Pending"
                                        ? "text-red-600"
                                        : data.status?.toProperCase() === "In Progress"
                                            ? "text-yellow-600"
                                            : data.status?.toProperCase() === "Closed"
                                                ? "text-green-600"
                                                : "text-blue-600"
                                }>{data.status}</span>
                            </span>
                            <span className='text-gray-600'>|</span>
                            <span>
                                <span className="text-gray-600">Priority:</span>{" "}
                                <span
                                    className={
                                        data.priority?.toProperCase() === "Critical"
                                            ? "text-red-600"
                                            : data.priority?.toProperCase() === "High"
                                                ? "text-yellow-600"
                                                : "text-green-600"
                                    }
                                >
                                    {data.priority?.toProperCase() || "—"}
                                </span>
                            </span>
                            <span className='text-gray-600'>|</span>
                            <span>
                                <span className="text-gray-600">Assignee:</span>{" "}
                                {data.assignees?.length
                                    ? data.assignees
                                        .map(
                                            (a: any) =>
                                                `${a.displayName?.toProperCase() || ""}`.trim()
                                        )
                                        .join(", ")
                                    : "—"}
                            </span>
                        </div>

                        {/* Dates */}
                        <div className="text-sm text-black flex flex-wrap gap-x-2">
                            <span>
                                <span className="text-gray-600">Start Date:</span>{" "}
                                {data.startDateTime
                                    ? moment(data.startDateTime).format("DD-MMM-YYYY hh:mm A")
                                    : "—"}
                            </span>
                            <span className='text-gray-600'>|</span>
                            <span>
                                <span className="text-gray-600">End Date:</span>{" "}
                                {data.endDateTime
                                    ? moment(data.endDateTime).format("DD-MMM-YYYY hh:mm A")
                                    : "—"}
                            </span>
                        </div>
                    </div>
                );
            },
        },

        // 🟧 Progress column (example: 70%)

        {
            accessorKey: "createdAt",
            header: "Created On",
            cell: ({ row }: any) => (
                <div>{moment(row.original.createdAt).format("DD-MMM-YYYY hh:mm A")}</div>
            ),
        },
        {
            accessorKey: "overdueDays",
            header: "Overdue Days",
            cell: ({ row }: any) => {
                const end = moment(row.original.endDateTime);
                const now = moment();
                const overdue = now.isAfter(end) ? now.diff(end, "days") : 0;

                return (
                    <div
                        className={`text-sm ${overdue > 0 ? "text-red-600 font-semibold" : ""
                            }`}
                    >
                        {overdue > 0 ? `${overdue} day(s)` : ""}
                    </div>
                );
            },
        },
        {
            accessorKey: "progress",
            header: "Progress",
            cell: ({ row }: any) => {
                const progress = row.original.progress ?? 0;
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-28 bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full "
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-sm text-gray-700">{progress}%</span>
                    </div>
                );
            },
        },



        // 🟥 Overdue Days column

        // {
        //     accessorKey: "priority",
        //     header: "Priority",
        //     cell: ({ row }: any) => {
        //         const p = row.original.priority;
        //         const color =
        //             p === "High" ? "text-red-600" : p === "Medium" ? "text-yellow-600" : "text-green-600";
        //         return <div className={color}>{p}</div>;
        //     },
        // },
        // {
        //     accessorKey: "status",
        //     header: "Status",
        //     cell: ({ row }: any) => (
        //         <div className="capitalize">{row.original.status}</div>
        //     ),
        // },
        // {
        //     accessorKey: "assignedTo",
        //     header: "Assigned To",
        //     cell: ({ row }: any) => (
        //         <div>{row.original.assignedTo?.displayName || "—"}</div>
        //     ),
        // },



        // {
        //     id: "actions",
        //     header: "",
        //     cell: ({ row }: any) => (
        //         <div
        //             onClick={() => handleTicketClick(row.original._id)}
        //             className="text-blue-600 cursor-pointer hover:underline"
        //         >
        //             View
        //         </div>
        //     ),
        // },
    ];

    const ticketConfig = {
        title: "Tickets List",
        // filterFields: [
        //     { key: "priority", label: "Priority", type: "select", data: ["Low", "Medium", "High"], placeholder: "Filter by Priority" },
        //     { key: "status", label: "Status", type: "select", data: ["Open", "In Progress", "Closed"], placeholder: "Filter by Status" },
        //     { key: "assignedTo", label: "Assigned To", type: "select", data: userList, placeholder: "Filter by User" },
        // ],
        dataTable: {
            columns: ticketColumns,
            data: filteredTickets,
        },
        // buttons: [
        //     {
        //         label: "Create Ticket",
        //         action: () => router.push("/dashboard/ticket/create"),
        //         icon: Plus,
        //         className: "bg-blue-600 hover:bg-blue-700 duration-300",
        //     },
        // ],
    };

    const handleTask = () => {

        setInitialData({});

        setAction('Add');
        setDialogOpen(true);


    };

    const closeDialog = async () => {
        setDialogOpen(false);

        setInitialData({});
        await refetch();
    };

    console.log("Filtered Tickets:", filteredTickets);

    // Replace your current return(...) with this block
    return (
        <DashboardLoader loading={loading}>
            <motion.div
                className="flex flex-col h-[90vh] overflow-hidden"
                variants={dashboardStaggerVariants}
                initial="hidden"
                animate="visible"
            >

                {/* ✅ HEADER (Sticky) */}
                <motion.div
                    variants={dashboardItemVariants}
                    className="sticky top-0 z-30 bg-white/80 dark:bg-background/80 backdrop-blur-md shadow-sm py-4 px-4 "
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                                <motion.span>Tasks</motion.span>
                                {filteredTickets && (
                                    <Badge className="ml-2 bg-primary/10 text-primary font-medium hover:bg-green-200">
                                        {filteredTickets.length} {filteredTickets.length === 1 ? 'task' : 'tasks'}
                                    </Badge>
                                )}
                            </h1>
                            <p className="text-sm text-muted-foreground">Track and manage tasks efficiently</p>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center gap-3">
                            <Button size="sm" variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Refresh
                            </Button>
                            <DropdownMenu>
                                {/* <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="outline">
                                        <Settings className="h-4 w-4 mr-1" /> Options
                                    </Button>
                                </DropdownMenuTrigger> */}
                                {/* <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => router.push('/dashboard/ticket/categories')}>
                                        Categories
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push('/dashboard/ticket/skills')}>
                                        User Skills
                                    </DropdownMenuItem>
                                </DropdownMenuContent> */}
                            </DropdownMenu>
                            <Button className="flex items-center gap-1.5 h-9" onClick={handleTask}>
                                <Plus className="h-4 w-4" /> Create Task
                            </Button>
                        </div>
                    </div>

                    {/* ✅ TABS + FILTERS (inside header) */}
                    <div className="mt-4">
                        <Tabs defaultValue="list" onValueChange={setView}>
                            {/* Tabs Bar + Filters Toggle */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/60 dark:bg-card/60 backdrop-blur-sm rounded-lg p-2 py-3 border border-border/30">
                                <div className="flex items-center gap-2">

                                    {/* <TabsList className="p-1 bg-muted/40 rounded-lg">
                                        <TabsTrigger value="list">List</TabsTrigger>
                                        <TabsTrigger value="board">Board</TabsTrigger>
                                        <TabsTrigger value="statistics">Stats</TabsTrigger>
                                    </TabsList> */}
                                    <TabsList className="mr-2 p-1 bg-muted/40 rounded-lg backdrop-blur-md">
                                        {['list', 'board', 'statistics'].map((tabValue, index) => (
                                            <TabsTrigger
                                                key={tabValue}
                                                value={tabValue}
                                                className={`flex items-center gap-1.5 focus-ring transition-all duration-300 rounded-md relative overflow-hidden 
      data-[state=active]:bg-white/90 dark:data-[state=active]:bg-secondary/90 data-[state=active]:shadow-sm`}
                                            >
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.1 * index, duration: 0.3 }}
                                                    className="flex items-center gap-1.5"
                                                >
                                                    {tabValue === 'board' && <LayoutDashboard className="h-4 w-4" />}
                                                    {tabValue === 'list' && <LayoutList className="h-4 w-4" />}
                                                    {tabValue === 'statistics' && <Table className="h-4 w-4" />}
                                                    <span className="capitalize">{tabValue === 'statistics' ? 'Stats' : tabValue}</span>
                                                </motion.div>
                                                {view === tabValue && (
                                                    <motion.div
                                                        layoutId="activeTab"
                                                        className="absolute inset-0 bg-primary/5 rounded-md -z-10"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ duration: 0.3 }}
                                                    />
                                                )}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                    <Button size="sm" variant="outline" onClick={() => setShowFilters(!showFilters)}>
                                        <motion.div
                                            animate={showFilters ? { rotate: 180 } : { rotate: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Filter className="h-4 w-4" />
                                        </motion.div>
                                        <span>Filters</span>
                                        {getActiveFiltersCount() > 0 && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                            >
                                                <Badge className="ml-1 badge-status bg-primary/15 text-primary text-xs px-1.5 py-0.5 rounded-full">
                                                    {getActiveFiltersCount()}
                                                </Badge>
                                            </motion.div>
                                        )}
                                    </Button>


                                </div>

                                <div className="max-w-xs w-full">
                                    <Input placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                </div>
                            </div>

                            {/* ✅ Filters (Still in header) */}
                            <AnimatePresence>
                                {showFilters && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="mt-3"
                                    >
                                        <Card className="p-0 shadow-sm border border-border/20 rounded-xl overflow-hidden bg-white/90 dark:bg-card/90 backdrop-blur-md">
                                            {/* <CardHeader className="pb-3 pt-3 border-b border-border/20 bg-muted/10">
                                                <CardTitle className="text-base flex items-center">
                                                    <ListFilter className="h-4 w-4 mr-2 text-primary" /> Filter Options
                                                </CardTitle>
                                            </CardHeader> */}
                                            <CardContent className="pt-4">
                                                <div className="flex justify-between gap-2 items-center">
                                                    {/* Department Filter */}
                                                    <div className='w-full'>
                                                        <label className="text-sm font-medium block mb-1">Department</label>
                                                        <Select onValueChange={setDepartmentFilter} value={departmentFilter}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select Department" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="all_departments">All Departments</SelectItem>
                                                                {departmentData?.data?.map((dept) => (
                                                                    <SelectItem key={dept._id} value={dept._id}>{dept.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {/* Status */}
                                                    <div className='w-full'>
                                                        <label className="text-sm font-medium block mb-1">Status</label>
                                                        <Select onValueChange={setStatusFilter} value={statusFilter}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select Status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="all_statuses">All Statuses</SelectItem>
                                                                <SelectItem value="Pending">Pending</SelectItem>
                                                                <SelectItem value="In Progress">In Progress</SelectItem>
                                                                <SelectItem value="Completed">Completed</SelectItem>
                                                                <SelectItem value="Closed">Closed</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {/* Priority */}
                                                    <div className='w-full'>
                                                        <label className="text-sm font-medium block mb-1">Priority</label>
                                                        <Select onValueChange={setPriorityFilter} value={priorityFilter}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select Priority" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="all_priorities">All Priorities</SelectItem>
                                                                <SelectItem value="critical">Critical</SelectItem>
                                                                <SelectItem value="high">High</SelectItem>
                                                                <SelectItem value="normal">Normal</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="mt-6 ml-4">
                                                        <Button className='' variant="outline" size="sm" onClick={resetFilters}>Reset</Button>
                                                        {/* <Button className='w-full' size="sm" onClick={() => setShowFilters(false)}>Apply</Button> */}
                                                    </div>
                                                </div>


                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Tabs>
                    </div>
                </motion.div>

                {/* ✅ MAIN CONTENT (Only this scrolls) */}
                <div className="flex-1 overflow-y-auto ">
                    <Tabs value={view}>
                        <TabsContent value="list" className="p-0 m-0">
                            {filteredTickets?.length > 0 ? (
                                <MasterComponent
                                    config={ticketConfig}
                                    loadingState={loading}
                                    rowClassMap={undefined}
                                    summary={false}
                                />
                            ) : (
                                <div className="p-4 text-center text-muted-foreground">No tickets found</div>
                            )}
                        </TabsContent>

                        <TabsContent value="board" className="p-4 py-3">
                            <TicketBoardComponent tickets={filteredTickets || []} onTicketClick={handleTaskClick} userId={user?._id} userData={userOptions} requestType='task' />
                        </TabsContent>

                        <TabsContent value="statistics" className="">
                            <TicketStatisticsComponent tickets={taskData?.data || []} departmentFilter={departmentFilter} />
                        </TabsContent>
                    </Tabs>
                </div>

            </motion.div>
            <SmartDeskDialog isOpen={isDialogOpen}
                closeDialog={closeDialog}
                formConfig={formConfig}
                workflowType={workflowConfig?.workflowType}
                initialFormConfig={workflowConfig}
                departments={[]}
                users={userOptions}
                designations={[]}
                employeeTypes={[]}
                action={action}
                locationData={[]}
                recruitymentTypes={[]}
                initialData={initialData}
                visaTypes={[]}
                currentIndex={0}
                countryData={[]}
                currencyData={[]}
            />
        </DashboardLoader>


    );


    // return (
    //     <DashboardLoader loading={loading}>
    //         <div className="flex flex-col h-screen overflow-hidden">
    //             {/* Header Section */}
    //             <motion.div
    //                 variants={dashboardItemVariants}
    //                 initial="hidden"
    //                 animate="visible"
    //                 className="z-40 sticky top-0 bg-white/75 dark:bg-background/75 backdrop-blur-md shadow-sm py-4 px-4"
    //             >
    //                 <div className="max-w-full mx-auto">
    //                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

    //                         <div className="flex-1">
    //                             <h1 className="text-2xl font-bold mb-1 flex items-center gap-2 text-foreground">
    //                                 <motion.span
    //                                     initial={{ opacity: 0, x: -5 }}
    //                                     animate={{ opacity: 1, x: 0 }}
    //                                     transition={{ duration: 0.4, delay: 0.1 }}
    //                                 >Tasks</motion.span>
    //                                 {filteredTickets && (
    //                                     <motion.div
    //                                         initial={{ scale: 0, opacity: 0 }}
    //                                         animate={{ scale: 1, opacity: 1 }}
    //                                         transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.3 }}
    //                                     >
    //                                         <Badge className="ml-2 badge-status bg-primary/10 text-primary font-medium px-2.5 py-0.5 text-xs hover:bg-white/80 dark:hover:bg-secondary/80 transition-colors duration-200">
    //                                             {filteredTickets.length} {filteredTickets.length === 1 ? 'task' : 'tasks'}
    //                                         </Badge>
    //                                     </motion.div>
    //                                 )}
    //                             </h1>
    //                             <motion.p
    //                                 className="text-sm text-muted-foreground"
    //                                 initial={{ opacity: 0 }}
    //                                 animate={{ opacity: 1 }}
    //                                 transition={{ duration: 0.4, delay: 0.2 }}
    //                             >
    //                                 Track and manage tasks efficiently
    //                             </motion.p>
    //                         </div>

    //                         <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap justify-end">
    //                             <motion.div
    //                             // whileHover={microButtonAnimation.hover}
    //                             // whileTap={microButtonAnimation.tap}
    //                             // transition={microButtonAnimation.transition}
    //                             >
    //                                 <Button
    //                                     size="sm"
    //                                     variant="outline"
    //                                     className="focus-ring h-9 rounded-lg border-border/40 bg-white/50 dark:bg-card/50"
    //                                     onClick={handleRefresh}
    //                                     disabled={isRefreshing}
    //                                 >
    //                                     {isRefreshing ? (
    //                                         <motion.div
    //                                             animate={{ rotate: 360 }}
    //                                             transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    //                                         >
    //                                             <Loader2 className="h-4 w-4" />
    //                                         </motion.div>
    //                                     ) : (
    //                                         <motion.div
    //                                             whileHover={{ rotate: 180 }}
    //                                             transition={{ duration: 0.3, ease: "easeInOut" }}
    //                                         >
    //                                             <RefreshCw className="h-4 w-4" />
    //                                         </motion.div>
    //                                     )}
    //                                     <span className="hidden sm:inline ml-1.5">Refresh</span>
    //                                 </Button>
    //                             </motion.div>

    //                             <motion.div
    //                             // whileHover={microButtonAnimation.hover}
    //                             // whileTap={microButtonAnimation.tap}
    //                             // transition={microButtonAnimation.transition}
    //                             >
    //                                 <DropdownMenu>
    //                                     <DropdownMenuTrigger asChild>
    //                                         <Button
    //                                             size="sm"
    //                                             variant="outline"
    //                                             className="focus-ring h-9 rounded-lg border-border/40 bg-white/50 dark:bg-card/50"
    //                                         >
    //                                             <motion.div
    //                                                 whileHover={{ rotate: 45 }}
    //                                                 transition={{ duration: 0.3, ease: "easeInOut" }}
    //                                             >
    //                                                 <Settings className="h-4 w-4" />
    //                                             </motion.div>
    //                                             <span className="hidden sm:inline ml-1.5">Options</span>
    //                                             <motion.div
    //                                                 animate={{ y: [0, 2, 0] }}
    //                                                 transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
    //                                             >
    //                                                 <ChevronDown className="h-4 w-4 ml-1 opacity-70" />
    //                                             </motion.div>
    //                                         </Button>
    //                                     </DropdownMenuTrigger>
    //                                     <DropdownMenuContent align="end" className="shadow-lg rounded-lg border-border/40 bg-white dark:bg-card animate-in slide-in-from-top-5 zoom-in-95 duration-200">
    //                                         <DropdownMenuItem
    //                                             onClick={() => router.push('/dashboard/ticket/categories')}
    //                                             className="cursor-pointer hover:bg-muted focus:bg-muted rounded-md transition-all duration-200"
    //                                         >
    //                                             Categories
    //                                         </DropdownMenuItem>
    //                                         <DropdownMenuItem
    //                                             onClick={() => router.push('/dashboard/ticket/skills')}
    //                                             className="cursor-pointer hover:bg-muted focus:bg-muted rounded-md transition-all duration-200"
    //                                         >
    //                                             User Skills
    //                                         </DropdownMenuItem>
    //                                         {/* <DropdownMenuSeparator className="bg-border/30" /> */}
    //                                         {/* <DropdownMenuItem 
    //                   onClick={() => setShowFilters(!showFilters)}
    //                   className="cursor-pointer hover:bg-muted focus:bg-muted rounded-md transition-all duration-200"
    //                 >
    //                   {showFilters ? 'Hide Filters' : 'Show Filters'}
    //                 </DropdownMenuItem> */}
    //                                     </DropdownMenuContent>
    //                                 </DropdownMenu>
    //                             </motion.div>

    //                             <motion.div
    //                             // whileHover={microButtonAnimation.hover}
    //                             // whileTap={microButtonAnimation.tap}
    //                             // transition={microButtonAnimation.transition}
    //                             >
    //                                 <Button
    //                                     className="flex items-center gap-1.5 h-9 shadow-sm focus-ring rounded-lg"
    //                                     onClick={() => router.push('/dashboard/ticket/create')}
    //                                 >
    //                                     <motion.div
    //                                         whileHover={{ rotate: 90 }}
    //                                         transition={{ duration: 0.2 }}
    //                                     >
    //                                         <Plus className="h-4 w-4" />
    //                                     </motion.div>
    //                                     <span>Create Task</span>
    //                                 </Button>
    //                             </motion.div>
    //                         </div>
    //                     </div>
    //                 </div>
    //             </motion.div>

    //             {/* Tabs & Search Section */}
    //             <div className="flex-1 overflow-y-auto">
    //                 <Tabs
    //                     defaultValue="list"
    //                     className=""
    //                     onValueChange={(value) => setView(value)}
    //                 >
    //                     <motion.div
    //                         variants={dashboardItemVariants}
    //                         className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl p-2 shadow-sm border border-border/30"
    //                     >
    //                         <div className="flex items-center flex-wrap sm:flex-nowrap gap-2">
    //     <TabsList className="mr-2 p-1 bg-muted/40 rounded-lg backdrop-blur-md">
    //         {['list', 'board', 'statistics'].map((tabValue, index) => (
    //             <TabsTrigger
    //                 key={tabValue}
    //                 value={tabValue}
    //                 className={`flex items-center gap-1.5 focus-ring transition-all duration-300 rounded-md relative overflow-hidden 
    //   data-[state=active]:bg-white/90 dark:data-[state=active]:bg-secondary/90 data-[state=active]:shadow-sm`}
    //             >
    //                 <motion.div
    //                     initial={{ opacity: 0, scale: 0.8 }}
    //                     animate={{ opacity: 1, scale: 1 }}
    //                     transition={{ delay: 0.1 * index, duration: 0.3 }}
    //                     className="flex items-center gap-1.5"
    //                 >
    //                     {tabValue === 'board' && <LayoutDashboard className="h-4 w-4" />}
    //                     {tabValue === 'list' && <LayoutList className="h-4 w-4" />}
    //                     {tabValue === 'statistics' && <Table className="h-4 w-4" />}
    //                     <span className="capitalize">{tabValue === 'statistics' ? 'Stats' : tabValue}</span>
    //                 </motion.div>
    //                 {view === tabValue && (
    //                     <motion.div
    //                         layoutId="activeTab"
    //                         className="absolute inset-0 bg-primary/5 rounded-md -z-10"
    //                         initial={{ opacity: 0 }}
    //                         animate={{ opacity: 1 }}
    //                         transition={{ duration: 0.3 }}
    //                     />
    //                 )}
    //             </TabsTrigger>
    //         ))}
    //     </TabsList>

    //                             <motion.div
    //                             // whileHover={microButtonAnimation.hover}
    //                             // whileTap={microButtonAnimation.tap}
    //                             // transition={microButtonAnimation.transition}
    //                             >
    //                                 <Button
    //                                     variant="outline"
    //                                     size="sm"
    //                                     className="flex items-center gap-1.5 transition-all duration-200 h-9 rounded-lg focus-ring "
    //                                     onClick={() => setShowFilters(!showFilters)}
    //                                 >
    //                                     <motion.div
    //                                         animate={showFilters ? { rotate: 180 } : { rotate: 0 }}
    //                                         transition={{ duration: 0.3 }}
    //                                     >
    //                                         <Filter className="h-4 w-4" />
    //                                     </motion.div>
    //                                     <span>Filters</span>
    //                                     {getActiveFiltersCount() > 0 && (
    //                                         <motion.div
    //                                             initial={{ scale: 0 }}
    //                                             animate={{ scale: 1 }}
    //                                             transition={{ type: "spring", stiffness: 500, damping: 15 }}
    //                                         >
    //                                             <Badge className="ml-1 badge-status bg-primary/15 text-primary text-xs px-1.5 py-0.5 rounded-full">
    //                                                 {getActiveFiltersCount()}
    //                                             </Badge>
    //                                         </motion.div>
    //                                     )}
    //                                 </Button>
    //                             </motion.div>
    //                         </div>

    //                         <motion.div
    //                             variants={dashboardItemVariants}
    //                             className="relative max-w-xs sm:max-w-sm w-full group"
    //                         >

    //                             <Input
    //                                 type='text'
    //                                 placeholder="Search tasks..."
    //                                 value={searchQuery}
    //                                 onChange={(e) => setSearchQuery(e.target.value)}

    //                             />
    //                             <AnimatePresence>
    //                                 {searchQuery && (
    //                                     <motion.div
    //                                         initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
    //                                         animate={{ opacity: 1, scale: 1, rotate: 0 }}
    //                                         exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
    //                                         transition={{ type: "spring", stiffness: 300, damping: 20 }}
    //                                     >
    //                                         <Button
    //                                             variant="ghost"
    //                                             size="sm"
    //                                             className="absolute right-1 top-0 h-full px-2 text-muted-foreground hover:text-primary transition-colors duration-200"
    //                                             onClick={() => setSearchQuery('')}
    //                                         >
    //                                             <X className="h-4 w-4" />
    //                                         </Button>
    //                                     </motion.div>
    //                                 )}
    //                             </AnimatePresence>
    //                         </motion.div>
    //                     </motion.div>

    //                     {/* Filters Section */}
    // <AnimatePresence>
    //     {showFilters && (
    //         <motion.div
    //             initial={{ opacity: 0, height: 0, y: -20 }}
    //             animate={{ opacity: 1, height: "auto", y: 0 }}
    //             exit={{ opacity: 0, height: 0, y: -20 }}
    //             transition={{
    //                 type: "spring",
    //                 stiffness: 300,
    //                 damping: 30,
    //                 opacity: { duration: 0.2 }
    //             }}
    //         >
    //             <Card className="shadow-sm border border-border/20 rounded-xl overflow-hidden bg-white/90 dark:bg-card/90 backdrop-blur-md">
    //                 <CardHeader className="pb-3 border-b border-border/20 bg-muted/10">
    //                     <CardTitle className="text-base flex items-center text-foreground font-medium">
    //                         <motion.div
    //                             initial={{ rotate: -90, opacity: 0 }}
    //                             animate={{ rotate: 0, opacity: 1 }}
    //                             transition={{ duration: 0.3 }}
    //                         >
    //                             <ListFilter className="h-4 w-4 mr-2 text-primary" />
    //                         </motion.div>
    //                         Filter Options
    //                     </CardTitle>
    //                 </CardHeader>
    //                 <CardContent className="pt-4">
    //                     <motion.div
    //                         className="grid grid-cols-1 md:grid-cols-3 gap-4"
    //                         initial="hidden"
    //                         animate="visible"
    //                         variants={{
    //                             hidden: { opacity: 0 },
    //                             visible: {
    //                                 opacity: 1,
    //                                 transition: { staggerChildren: 0.07 }
    //                             }
    //                         }}
    //                     >
    //                         <motion.div
    //                             className="space-y-1.5"
    //                             variants={{
    //                                 hidden: { opacity: 0, y: 10 },
    //                                 visible: { opacity: 1, y: 0 }
    //                             }}
    //                         >
    //                             <label className="text-sm font-medium mb-1.5 block text-foreground">Department</label>
    //                             <Select onValueChange={setDepartmentFilter} value={departmentFilter}>
    //                                 <SelectTrigger className="rounded-lg border-border/30 focus:border-primary/40 transition-all duration-200 bg-white/70 dark:bg-card/70 backdrop-blur-sm">
    //                                     <SelectValue placeholder="Select Department" />
    //                                 </SelectTrigger>
    //                                 <SelectContent className="shadow-lg rounded-lg border-border/30 bg-white/95 dark:bg-card/95 backdrop-blur-lg">
    //                                     <SelectItem value="all_departments" className="cursor-pointer focus:bg-muted hover:bg-muted/50 rounded-md">All Departments</SelectItem>
    //                                     {departmentData?.data?.map((dept: any) => (
    //                                         <SelectItem key={dept._id} value={dept._id} className="cursor-pointer focus:bg-muted hover:bg-muted/50 rounded-md">
    //                                             {dept.name}
    //                                         </SelectItem>
    //                                     ))}
    //                                 </SelectContent>
    //                             </Select>
    //                         </motion.div>

    //                         <motion.div
    //                             className="space-y-1.5"
    //                             variants={{
    //                                 hidden: { opacity: 0, y: 10 },
    //                                 visible: { opacity: 1, y: 0 }
    //                             }}
    //                         >
    //                             <label className="text-sm font-medium mb-1.5 block text-foreground">Status</label>
    //                             <Select onValueChange={setStatusFilter} value={statusFilter}>
    //                                 <SelectTrigger className="rounded-lg border-border/30 focus:border-primary/40 transition-all duration-200 bg-white/70 dark:bg-card/70 backdrop-blur-sm">
    //                                     <SelectValue placeholder="Select Status" />
    //                                 </SelectTrigger>
    //                                 <SelectContent className="shadow-lg rounded-lg border-border/30 bg-white/95 dark:bg-card/95 backdrop-blur-lg">
    //                                     <SelectItem value="all_statuses" className="cursor-pointer focus:bg-muted hover:bg-muted/50 rounded-md">All Statuses</SelectItem>
    //                                     <SelectItem value="NEW" className="cursor-pointer focus:bg-muted hover:bg-muted/50 rounded-md">New</SelectItem>
    //                                     <SelectItem value="ASSIGNED" className="cursor-pointer focus:bg-muted hover:bg-muted/50 rounded-md">Assigned</SelectItem>
    //                                     <SelectItem value="IN_PROGRESS" className="cursor-pointer focus:bg-muted hover:bg-muted/50 rounded-md">In Progress</SelectItem>
    //                                     <SelectItem value="RESOLVED" className="cursor-pointer focus:bg-muted hover:bg-muted/50 rounded-md">Resolved</SelectItem>
    //                                     <SelectItem value="CLOSED" className="cursor-pointer focus:bg-muted hover:bg-muted/50 rounded-md">Closed</SelectItem>
    //                                 </SelectContent>
    //                             </Select>
    //                         </motion.div>

    //                         <motion.div
    //                             className="space-y-1.5"
    //                             variants={{
    //                                 hidden: { opacity: 0, y: 10 },
    //                                 visible: { opacity: 1, y: 0 }
    //                             }}
    //                         >
    //                             <label className="text-sm font-medium mb-1.5 block text-foreground">Priority</label>
    //                             <Select onValueChange={setPriorityFilter} value={priorityFilter}>
    //                                 <SelectTrigger className="rounded-lg border-border/30 focus:border-primary/40 transition-all duration-200 bg-white/70 dark:bg-card/70 backdrop-blur-sm">
    //                                     <SelectValue placeholder="Select Priority" />
    //                                 </SelectTrigger>
    //                                 <SelectContent className="shadow-lg rounded-lg border-border/30 bg-white/95 dark:bg-card/95 backdrop-blur-lg">
    //                                     <SelectItem value="all_priorities" className="cursor-pointer focus:bg-muted hover:bg-muted/50 rounded-md">All Priorities</SelectItem>
    //                                     <SelectItem value="HIGH" className="cursor-pointer focus:bg-muted hover:bg-muted/50 rounded-md">High</SelectItem>
    //                                     <SelectItem value="MEDIUM" className="cursor-pointer focus:bg-muted hover:bg-muted/50 rounded-md">Medium</SelectItem>
    //                                     <SelectItem value="LOW" className="cursor-pointer focus:bg-muted hover:bg-muted/50 rounded-md">Low</SelectItem>
    //                                 </SelectContent>
    //                             </Select>
    //                         </motion.div>
    //                     </motion.div>

    //                     <div className="flex justify-end mt-5">
    //                         <motion.div
    //                             whileHover={microButtonAnimation.hover}
    //                             whileTap={microButtonAnimation.tap}
    //                             transition={microButtonAnimation.transition}
    //                             className="mr-2"
    //                         >
    //                             <Button
    //                                 variant="outline"
    //                                 size="sm"
    //                                 className="focus-ring rounded-lg border-border/30 bg-white/70 dark:bg-card/70"
    //                                 onClick={resetFilters}
    //                             >
    //                                 Reset Filters
    //                             </Button>
    //                         </motion.div>
    //                         <motion.div
    //                             whileHover={microButtonAnimation.hover}
    //                             whileTap={microButtonAnimation.tap}
    //                             transition={microButtonAnimation.transition}
    //                         >
    //                             <Button
    //                                 size="sm"
    //                                 className="shadow-sm focus-ring rounded-lg"
    //                                 onClick={() => setShowFilters(false)}
    //                             >
    //                                 Apply
    //                             </Button>
    //                         </motion.div>
    //                     </div>
    //                 </CardContent>
    //             </Card>
    //         </motion.div>
    //     )}
    // </AnimatePresence>

    //                     {/* Board View */}
    //                     <TabsContent value="board" className="mt-0 pt-4">
    //                         <motion.div
    //                             key="board-view"
    //                             initial={{ opacity: 0, y: 10 }}
    //                             animate={{ opacity: 1, y: 0 }}
    //                             exit={{ opacity: 0, y: -10 }}
    //                             transition={{ duration: 0.3 }}
    //                             variants={dashboardItemVariants}
    //                         >
    //                             <TicketBoardComponent
    //                                 tickets={filteredTickets || []}
    //                                 onTicketClick={handleTicketClick}
    //                                 userId={user?._id}
    //                             />
    //                         </motion.div>
    //                     </TabsContent>

    //                     {/* List View */}
    //                     <TabsContent value="list" className="flex-1  p-0 m-0 h-[calc(100vh-340px)]">
    //                         {filteredTickets?.length > 0 ? (
    //                             <MasterComponent
    //                                 config={ticketConfig}
    //                                 loadingState={loading}
    //                                 rowClassMap={undefined}
    //                                 summary={false}
    //                             />
    //                         ) : (
    //                             "No tickets found"
    //                         )}
    //                     </TabsContent>

    //                     {/* Statistics View */}
    //                     <TabsContent value="statistics" className="mt-0 pt-2">
    //                         <motion.div
    //                             key="statistics-view"
    //                             initial={{ opacity: 0, y: 10 }}
    //                             animate={{ opacity: 1, y: 0 }}
    //                             exit={{ opacity: 0, y: -10 }}
    //                             transition={{ duration: 0.3 }}
    //                             variants={dashboardItemVariants}
    //                         >
    //                             <TicketStatisticsComponent
    //                                 tickets={ticketsData?.data || []}
    //                                 departmentFilter={departmentFilter}
    //                             />
    //                         </motion.div>
    //                     </TabsContent>
    //                 </Tabs>
    //             </div>
    //         </div>
    //     </DashboardLoader>
    // );
};

export default TicketDashboardPage;