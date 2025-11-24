"use client";

import React, { useEffect, useState } from 'react';
import { addDays, addWeeks, addMonths } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  CalendarIcon, Clock, Edit, MessageSquare, Tag, Users,
  ChevronDown, CheckSquare, Paperclip, FileText, AlertCircle,
  ClipboardList, User, BarChart, CheckCircle2, Lock, ArrowLeft,
  RefreshCw, UserPlus, ExternalLink, MoreHorizontal, Calendar,
  History
} from 'lucide-react';
import { format, formatDistanceToNow, isPast, isToday } from 'date-fns';
import { useGetTicketCommentsQuery } from '@/services/endpoints/ticketCommentApi';
import { useGetTicketTasksQuery } from '@/services/endpoints/ticketTaskApi';
import { useGetTicketHistoryQuery } from '@/services/endpoints/ticketHistoryApi';
import TicketTaskComponent from './TicketTaskComponent';
import TicketHistoryComponent from './TicketHistoryComponent';
import { useGetMasterQuery } from '@/services/endpoints/masterApi';
import {
  useAssignTicketMutation,
  useChangeTicketStatusMutation,
  useAutoAssignTicketMutation
} from '@/services/endpoints/ticketApi';
import TicketStatusChangeComponent from './TicketStatusChangeComponent';
import TicketAutoAssignComponent from './TicketAutoAssignComponent';
import TicketAttachmentComponent from './TicketAttachmentComponent';
import TicketAssigneesComponent from './TicketAssigneesComponent';
import TicketRecurringComponent from './TicketRecurringComponent';
import CollapsibleChat from './CollapsibleChat';
import { getStatusColor, getPriorityColor } from '@/lib/getStatusColor';
import { useRouter } from 'next/navigation';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import TicketProgressChangeComponent from './TicketProgressChangeComponent';
import SmartDeskDialog from '../SupportDeskComponent/FormComponent';
import { HRMSFormConfig } from '@/types/hrms';
import { HRMS_WORKFLOW_TEMPLATES } from '@/types/workflow';
import TaskHistoryComponent from './TaskHistoryComponent';
import TaskCommentsComponent from './TaskCommentsComponent';
import { MONGO_MODELS, SUCCESS } from '@/shared/constants';
import { useCreateApplicationMutation } from '@/services/endpoints/applicationApi';
import { toast } from 'react-toastify';
import SubTaskComponent from './SubTaskComponent';

interface TicketDetailComponentProps {
  ticket: any;
  onEditClick: () => void;
  userId: string;
  userRole: string;
  requestType: string;
  user: any;
  userList: any[];
}

const TicketDetailComponent: React.FC<TicketDetailComponentProps> = ({
  ticket,
  onEditClick,
  userId,
  userRole,
  requestType,
  user,
  userList
}) => {
  console.log('ticket', ticket, userId, userRole);
  const router = useRouter();

  const [workflowType, setWorkflowType]: any = useState('task');
  const [workflowConfig, setWorkflowConfig]: any = useState(null);
  const [formConfig, setFormConfig] = useState<HRMSFormConfig | null>(null);

  const [isDialogOpen, setDialogOpen] = useState(false);

  const [createMaster, { isLoading: isCreatingMaster }] = useCreateApplicationMutation();

  useEffect(() => {
    // Simulate fetching or selecting workflow config
    if (workflowType) {
      const config = HRMS_WORKFLOW_TEMPLATES[workflowType.toUpperCase()];
      setWorkflowConfig(config);
    }
  }, [workflowType]);


  const closeDialog = async () => {
    setIsEditDialogOpen(false);

  };
  const { data: taskData = { data: [] }, isLoading: tasksLoading, refetch }: any = useGetMasterQuery({
    db: MONGO_MODELS.TASK,
    sort: { createdAt: '-1' },
    filter: { parentTaskId: ticket?._id, isSubtask: true }
  });

  console.log({ taskData });
  const { data: historyData = { data: [] }, isLoading: historyLoading } = useGetTicketHistoryQuery({
    ticketId: ticket._id
  });

  const [ticketData, setTicketData] = useState(() => {
    const assignees =
      ticket?.assignees?.length > 0
        ? ticket.assignees.map(a => (typeof a === 'object' ? a._id : a))
        : ticket?.assignee
          ? [typeof ticket.assignee === 'object' ? ticket.assignee._id : ticket.assignee]
          : [];

    return { ...ticket, assignees };
  });

  const getAssignees = () => {
    if (ticket.assignees && ticket.assignees.length > 0) {
      return ticket.assignees;
    } else if (ticket.assignee) {
      return [ticket.assignee];
    }
    return [];
  };
  // State for dialogs
  const [assignees, setAssignees] = useState(getAssignees());
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
  const [isAutoAssignDialogOpen, setIsAutoAssignDialogOpen] = useState(false);
  const [isAssigneesDialogOpen, setIsAssigneesDialogOpen] = useState(false);
  const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Calculate progress percentage
  const progressPercentage = requestType === 'task' ? ticketData.progress > 0
    ? Math.round((ticketData.progress))
    : 0 : ticket.totalEfforts > 0
    ? Math.round((ticket.efforts / ticket.totalEfforts) * 100)
    : 0;

  // Check if user can edit this ticket
  const canEdit = userId === ticket?.creator?._id || ticket?.addedBy ||
    (ticket.assignees && ticket.assignees.some((a: any) => a._id === userId)) ||
    userId === ticket.assignee?._id ||
    userRole === 'Admin';

  // Get assignees from ticket (handle both new and old format)


  // Get status badge colors based on status
  const getStatusBadgeStyles = (status: any) => {
    switch (status.toUpperCase()) {
      case 'NEW':
        return "bg-blue-50 text-blue-700 ring-blue-600/20 hover:bg-blue-200";
      case 'PENDING':
        return "bg-blue-50 text-blue-700 ring-blue-600/20  hover:bg-blue-200";
      case 'ASSIGNED':
        return "bg-indigo-50 text-indigo-700 ring-indigo-600/20 hover:bg-indigo-200";
      case 'IN_PROGRESS':
        return "bg-amber-50 text-amber-700 ring-amber-600/30 hover:bg-amber-200";
      case 'RESOLVED':
        return "bg-emerald-50 text-emerald-700 ring-emerald-600/20 hover:bg-emerald-200";
      case 'CLOSED':
        return "bg-gray-100 text-gray-700 ring-gray-600/10 hover:bg-gray-200";
      default:
        return "bg-blue-50 text-blue-700 ring-blue-600/20 hover:bg-blue-200";
    }
  };

  // Get priority badge colors based on priority
  const getPriorityBadgeStyles = (priority: any) => {
    switch (priority.toUpperCase()) {
      case 'CRITICAL':
        return "bg-red-50 text-red-700 ring-red-600/20 hover:bg-red-200";
      case 'HIGH':
        return "bg-orange-50 text-orange-700 ring-orange-600/20 hover:bg-orange-200";
      case 'MEDIUM':
        return "bg-orange-50 text-orange-700 ring-orange-600/20 hover:bg-orange-200";
      case 'LOW':
        return "bg-green-50 text-green-700 ring-green-600/20 hover:bg-green-200";
      case 'NORMAL':
        return "bg-green-50 text-green-700 ring-green-600/20 hover:bg-green-200";
      default:
        return "bg-orange-50 text-orange-700 ring-orange-600/20 hover:bg-orange-200";
    }
  };


  // Check if due date is past or today
  const isDueDateCritical = ticket.dueDate && isPast(new Date(ticket.dueDate)) && !isToday(new Date(ticket.dueDate));
  const isDueDateToday = ticket.dueDate && isToday(new Date(ticket.dueDate));



  const getNextRecurringDate = (ticket: any) => {
    if (!ticket.recurring || !ticket.startDateTime) return null;

    const start = new Date(ticket.startDateTime);
    const { intervalType, customDays, isRecurring } = ticket.recurring;

    // if (!isRecurring) return null;

    let nextDate: Date;

    switch (intervalType) {
      case 'daily':
        nextDate = addDays(start, 1);
        break;

      case 'weekly':
        nextDate = addWeeks(start, 1);
        break;

      case 'monthly':
        nextDate = addMonths(start, 1);
        break;

      case 'custom':
        nextDate = addDays(start, customDays || 0); // add custom number of days
        break;

      default:
        nextDate = start; // fallback to startDateTime
    }

    return nextDate;
  };

  async function addCommentToTask(taskId: string, text: string) {
    const newComment = {
      text,
      commentedBy: userId,
      commentedAt: new Date(),
    };
    console.log('adding comment', newComment, userId);
    const formattedData = {
      db: MONGO_MODELS.TASK,
      action: "update",
      filter: { _id: taskId },
      data: {
        comments: [...ticket.comments, newComment], // full array with the new comment
        updatedBy: userId
      }
    };

    const response: any = await createMaster(formattedData);

    if (response?.data && response?.data?.status === SUCCESS) {
      // Update local state with the new comment
      setTicketData((prev: any) => ({
        ...prev,
        comments: [...(prev.comments || []), newComment],
      }));

      toast.success("Comment posted successfully", { position: "bottom-right" });
    }
  }



  return (
    <div className="space-y-4">
      {/* Top navigation bar */}
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary group transition-all duration-200"
            onClick={() => router.push(`${requestType === 'task' ? '/dashboard/supportDesk/task' : '/dashboard/ticket'}`)}

          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>{requestType === 'task' ? 'Back to tasks' : 'Back to tickets'}</span>
          </Button>
        </motion.div>

        {canEdit && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex gap-2"
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 border-border/50 shadow-sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 shadow-dropdown">
                <DropdownMenuItem
                  onClick={() => setIsStatusDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <ClipboardList className="h-4 w-4" />
                  Change Status
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setIsAssigneesDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Manage Assignees
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setIsRecurringDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Recurring Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="default"
                // onClick={onEditClick}
                onClick={() => setIsEditDialogOpen(true)}
                className="flex items-center gap-2 h-9 shadow-sm"
              >
                <Edit className="h-4 w-4" />
                {requestType === 'task' ? 'Edit Task' : 'Edit Ticket'}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Ticket header section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex-shrink-0 px-2.5 py-1.5 rounded-md bg-primary/10 text-primary font-medium text-sm">
              {requestType === 'task' ? ticket.taskId : `${ticket.ticketId || `TKT-${ticket._id.toString().substr(-8)}`}`}
            </div>

            <Badge className={`px-2.5 py-1 text-xs font-medium ring-1  ${getStatusBadgeStyles(ticket?.status)} `}>
              {ticket.status?.toUpperCase()}
            </Badge>

            <Badge className={`px-2.5 py-1 text-xs font-medium ring-1 ${getPriorityBadgeStyles(ticket?.priority)}`}>
              {ticket.priority?.toUpperCase()}
            </Badge>
          </div>

          <h1 className="text-2xl font-bold text-foreground/90">{requestType ? ticket?.subject : ticket?.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-1">
            <div className={`flex items-center gap-1.5 ${requestType === 'task' ? 'hidden' : ''}`}>
              <Users className="h-4 w-4 text-muted-foreground" />
              {ticket?.department?.name}
            </div>

            <div className={`flex items-center gap-1.5 `}>
              <Users className="h-4 w-4 text-muted-foreground" />
              {requestType === 'task' ? userList?.find(data => data?._id === ticket?.addedBy)?.displayName?.toProperCase() : ticket.creator?.displayName}
            </div>

            <div className={`flex items-center gap-1.5 ${requestType === 'task' ? 'hidden' : ''}`}>
              <Tag className="h-4 w-4 text-muted-foreground" />
              {ticket?.category?.name}
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span title={format(new Date(ticket.createdAt), 'PPP p')}>
                {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
              </span>
            </div>

            {ticket.dueDate && (
              <div className={`flex items-center gap-1.5 ${isDueDateCritical ? 'text-red-500' : isDueDateToday ? 'text-amber-500' : ''}`}>
                <Calendar className={`h-4 w-4 ${isDueDateCritical ? 'text-red-500' : isDueDateToday ? 'text-amber-500' : 'text-muted-foreground'}`} />
                <span title={format(new Date(ticket.dueDate), 'PPP')}>
                  Due {formatDistanceToNow(new Date(ticket.dueDate), { addSuffix: true })}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main content grid */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side - Main content */}
        <div className="lg:col-span-2 space-y-6 ">
          {/* Description card */}
          <div
          // initial={{ opacity: 0, y: 20 }}
          // animate={{ opacity: 1, y: 0 }}
          // transition={{ duration: 0.5 }}


          >
            <Card className="overflow-hidden shadow-card border-border/40  bg-gray-50">
              <CardHeader className="bg-card/50 py-2 px-4 border-b border-border/10  bg-gray-100">
                <CardTitle className="text-base text-foreground/80 ">Description</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="prose prose-gray prose-sm max-w-none">
                  <p className="whitespace-pre-line text-foreground/80 leading-relaxed">
                    {ticket?.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6"
          >
            <Tabs defaultValue={requestType === 'task' && assignees.length < 2 ? 'attachments' : 'tasks'} className="w-full">
              <div className="border-b border-border/20">
                <TabsList className="bg-transparent">
                  <TabsTrigger
                    value="tasks"
                    className={`text-sm font-medium data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:border-b-2 border-b-2 border-transparent rounded-none bg-transparent py-3 px-4 ${requestType === 'task' && assignees.length < 2 && `hidden`}`}
                  >
                    <CheckSquare className="h-4 w-4 mr-2" />
                    <span>Sub Tasks</span>
                    {taskData?.data?.length > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">
                        {taskData.data.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="attachments"
                    className="text-sm font-medium data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:border-b-2 border-b-2 border-transparent rounded-none bg-transparent py-3 px-4"
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    <span>Files</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="text-sm font-medium data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:border-b-2 border-b-2 border-transparent rounded-none bg-transparent py-3 px-4"
                  >
                    <History className="h-4 w-4 mr-2" />
                    <span>History</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="comments"
                    className="text-sm font-medium data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:border-b-2 border-b-2 border-transparent rounded-none bg-transparent py-3 px-4"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    <span>Comments</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="tasks" className="mt-6 animate-slide-in">
                <SubTaskComponent
                  ticket={ticket}
                  tasks={taskData?.data || []}
                  isLoading={tasksLoading}
                  userId={userId}
                  canEdit={canEdit}
                  ticketStatus={ticket.status}
                  requestType={requestType}
                  userList={userList?.filter(u => u.department?._id === user?.department?._id)}
                  onClose={async (ticketData) => {
                    if (ticketData) setTicketData(ticketData);
                    await refetch();
                  }}
                />
              </TabsContent>

              <TabsContent value="attachments" className="mt-6 animate-slide-in">
                <TicketAttachmentComponent
                  ticketId={ticketData?._id}
                  attachments={ticketData?.attachments || []} // This would normally come from an API call
                  isLoading={false}
                  userId={userId}
                  canEdit={canEdit && ticketData.status?.toUpperCase() !== 'CLOSED'}
                  requestType={requestType}
                  userList={userList}
                  ticket={ticket}
                  onClose={(updatedTicket) => {

                    if (updatedTicket) setTicketData(updatedTicket);
                  }}

                />
              </TabsContent>

              <TabsContent value="history" className="mt-6 animate-slide-in">
                <TaskHistoryComponent
                  history={ticketData?.history || []}
                  isLoading={false}
                  requestType={requestType}
                />
              </TabsContent>

              <TabsContent value="comments" className="mt-6 animate-slide-in">
                <TaskCommentsComponent
                  comments={ticketData?.comments || []}
                  currentUser={user}
                  isLoading={false}
                  onAddComment={async (text) => {
                    await addCommentToTask(ticket._id, text);
                  }}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* Right side - Sidebar */}
        <aside className="space-y-5">
          {/* Status icon card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="overflow-hidden border-border/30 shadow-card">
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  {/* Status icon section */}
                  {/* Status icon section */}
                  <div
                    className={`flex items-center justify-center w-20 ${(() => {
                      const status = (ticketData?.status || '').toUpperCase();
                      if (['NEW', 'PENDING'].includes(status)) return 'bg-blue-50';
                      if (status === 'ASSIGNED') return 'bg-indigo-50';
                      if (status === 'IN_PROGRESS' || status === 'IN PROGRESS') return 'bg-amber-50';
                      if (['RESOLVED', 'COMPLETED'].includes(status)) return 'bg-emerald-50';
                      if (status === 'CLOSED') return 'bg-gray-100';
                      return 'bg-gray-100';
                    })()
                      }`}
                  >
                    {(() => {
                      const status = (ticketData?.status || '').toUpperCase();
                      if (['NEW', 'PENDING'].includes(status)) return <AlertCircle className="h-8 w-8 text-blue-600" />;
                      if (status === 'ASSIGNED') return <User className="h-8 w-8 text-indigo-600" />;
                      if (status === 'IN_PROGRESS' || status === 'IN PROGRESS') return <BarChart className="h-8 w-8 text-amber-600" />;
                      if (['RESOLVED', 'COMPLETED'].includes(status)) return <CheckCircle2 className="h-8 w-8 text-emerald-600" />;
                      if (status === 'CLOSED') return <Lock className="h-8 w-8 text-gray-600" />;
                      return <AlertCircle className="h-8 w-8 text-gray-400" />; // default fallback
                    })()}
                  </div>


                  {/* Status details */}
                  <div className="flex-1 p-4 bg-gray-50">
                    <p className="text-xs text-muted-foreground">Current Status</p>
                    <p className="text-base font-medium">{ticketData?.status}</p>

                    {ticketData.status !== 'CLOSED' && canEdit && (
                      <button
                        onClick={() => setIsStatusDialogOpen(true)}
                        className="text-xs text-primary hover:text-primary/80 font-medium mt-1 flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Change status
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Progress card */}
          {ticketData.progress >= 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="overflow-hidden border-border/30 shadow-card">
                <CardHeader className="py-2 border-b border-border/10 flex flex-row items-center justify-between bg-gray-100">
                  <CardTitle className="text-sm text-foreground/70">Progress</CardTitle>
                  {canEdit && ticket.status?.toUpperCase() !== 'CLOSED' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsProgressDialogOpen(true)}
                      className="h-7 w-7 p-0 rounded-full hover:bg-muted"
                    >
                      <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-4 bg-gray-50">
                  <div className="flex flex-col space-y-3">
                    <div className="w-full bg-muted/80 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-700 ease-in-out ${progressPercentage == 100 ? ' bg-emerald-600' : 'bg-primary '}`}
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className={`text-lg font-bold ${progressPercentage == 100 ? ' text-emerald-600' : 'text-primary '}`}>{progressPercentage}%</span>
                      {/* <Badge variant="outline" className="bg-primary/5 text-primary/80 border-primary/20">
                        {ticket.efforts} / {ticket.totalEfforts} points
                      </Badge> */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Progress card */}
          {ticket.totalEfforts > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="overflow-hidden border-border/30 shadow-card">
                <CardHeader className="py-2 border-b border-border/10 flex flex-row items-center justify-between bg-gray-100">
                  <CardTitle className="text-sm text-foreground/70">Progress</CardTitle>
                  {canEdit && ticket.status !== 'CLOSED' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsRecurringDialogOpen(true)}
                      className="h-7 w-7 p-0 rounded-full hover:bg-muted"
                    >
                      <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-3">
                    <div className="w-full bg-muted/80 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-700 ease-in-out"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-primary">{progressPercentage}%</span>
                      <Badge variant="outline" className="bg-primary/5 text-primary/80 border-primary/20">
                        {ticket.efforts} / {ticket.totalEfforts} points
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Assignees card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="overflow-hidden border-border/30 shadow-card">
              <CardHeader className="py-2 border-b border-border/10 flex flex-row items-center justify-between bg-gray-100">
                <CardTitle className="text-sm text-foreground/70">Assignees</CardTitle>
                {canEdit && ticket.status !== 'CLOSED' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAssigneesDialogOpen(true)}
                    className="h-7 w-7 p-0 rounded-full hover:bg-muted"
                  >
                    <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-4 bg-gray-50">
                {assignees.length > 0 ? (
                  <div className="space-y-4">
                    {assignees.map((assignee: any) => (
                      <div key={assignee._id} className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border-2 border-primary/10">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                            {`${assignee.displayName.split(" ")?.[0]?.[0]}${assignee.displayName.split(" ")?.[1]?.[0]}`}
                          </AvatarFallback>
                        </Avatar>
                        <div >
                          <p className="font-medium text-sm">{`${assignee.displayName}`}</p>
                          <p className={`text-xs text-muted-foreground ${requestType === 'task' ? 'hidden' : ''}`}>
                            {requestType === 'task' ? ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM d, yyyy') : 'Date not available' : ticket.assignedAt ? format(new Date(ticket.assignedAt), 'MMM d, yyyy') : 'Date not available'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 space-y-3">
                    <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
                      <User className="h-6 w-6 text-muted-foreground/70" />
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground font-medium">Unassigned</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">No team members assigned to this ticket</p>
                    </div>
                    {canEdit && ticket.status !== 'CLOSED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAssigneesDialogOpen(true)}
                        className="mt-2 text-xs border-border/50"
                      >
                        <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                        Assign ticket
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Created by card */}
          {/* <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="overflow-hidden border-border/30 shadow-card">
              <CardHeader className="pb-3 border-b border-border/10">
                <CardTitle className="text-sm text-foreground/70">Created by</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border-2 border-primary/10">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                      {`${ticket.creator?.firstName?.[0]}${ticket.creator?.lastName?.[0]}`}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{`${ticket.creator?.firstName} ${ticket.creator?.lastName}`}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(ticket.createdAt), 'MMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div> */}

          {/* Recurring settings card */}
          {requestType === 'task' && (<motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card className="overflow-hidden border-border/30 shadow-card">
              <CardHeader className="py-2 border-b border-border/10 flex flex-row items-center justify-between bg-gray-100">
                <CardTitle className="text-sm text-foreground/70">Recurring</CardTitle>
                {canEdit && ticket.status !== 'CLOSED' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsRecurringDialogOpen(true)}
                    className="h-7 w-7 p-0 rounded-full hover:bg-muted"
                  >
                    <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-4  bg-gray-50">
                {ticketData.taskType === 'recurring' ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 text-sm">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <RefreshCw className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <span className="font-medium">Recurring Task</span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {/* {ticket.nextRecurringDate ?
                            `Next: ${format(new Date(ticket.nextRecurringDate), 'MMMM d, yyyy')}` :
                            'No upcoming recurrence'
                          } */}


                          Next: {format(getNextRecurringDate(ticketData) as Date, 'MMMM d, yyyy')}


                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 text-sm">
                    <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <span className="font-medium">One-time task</span>
                      <p className="text-xs text-muted-foreground mt-0.5">Not a recurring task</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>)}
        </aside>
      </div>

      {/* Collapsible Chat Component */}
      {requestType !== 'task' && <CollapsibleChat
        ticketId={ticket._id}
        userId={userId}
        currentUser={{
          _id: userId,
          firstName: ticket.creator?.firstName,
          lastName: ticket.creator?.lastName,
          ...(ticket.creator?.avatar && { avatar: ticket.creator?.avatar })
        }}
      />}

      {/* Status Change Component */}
      <TicketStatusChangeComponent
        ticketId={ticket._id}
        currentStatus={selectedStatus ? selectedStatus : ticket.status}
        userId={userId}
        isOpen={isStatusDialogOpen}
        onClose={(updatedTicket) => {
          setIsStatusDialogOpen(false);
          if (updatedTicket) setTicketData(updatedTicket);
        }}
        hasAssignee={getAssignees().length > 0}
        requestType={requestType}
      />

      <TicketProgressChangeComponent
        ticket={ticket}
        ticketId={ticket._id}
        userId={userId}
        isOpen={isProgressDialogOpen}
        onClose={(updatedTicket) => {
          setIsProgressDialogOpen(false);
          if (updatedTicket) setTicketData(updatedTicket);
        }}
        requestType={requestType}
      />


      {/* Auto Assign Component */}
      <TicketAutoAssignComponent
        ticket={ticket}
        userId={userId}
        isOpen={isAutoAssignDialogOpen}
        onClose={() => setIsAutoAssignDialogOpen(false)}
      />

      {/* Assignees Management Component */}
      <TicketAssigneesComponent
        ticketId={ticket._id}
        currentAssignees={assignees}
        isOpen={isAssigneesDialogOpen}
        onClose={(updatedAssignees) => {
          setIsAssigneesDialogOpen(false);
          if (updatedAssignees?.length > 0) {
            setAssignees(updatedAssignees); // ✅ update UI instantly
          }
        }}
        userId={userId}
        requestType={requestType}
        user={user}

      />

      {/* Recurring Settings Component */}
      <TicketRecurringComponent
        ticketId={ticket._id}
        isRecurring={ticket.isRecurring || false}
        recurringType={ticket.recurring?.intervalType || 'weekly'}
        recurringEndDate={ticket.recurringEndDate}
        recurringInterval={ticket.recurringInterval || 1}
        isOpen={isRecurringDialogOpen}
        onClose={(updatedTicket) => {
          setIsRecurringDialogOpen(false);
          if (updatedTicket) setTicketData(updatedTicket);
        }}
        userId={userId}
      />

      <SmartDeskDialog isOpen={isEditDialogOpen}
        closeDialog={closeDialog}
        formConfig={formConfig}
        workflowType={workflowConfig?.workflowType}
        initialFormConfig={workflowConfig}
        departments={[]}
        users={userList || []}
        designations={[]}
        employeeTypes={[]}
        action={'Update'}
        locationData={[]}
        recruitymentTypes={[]}
        initialData={ticketData}
        visaTypes={[]}
        currentIndex={0}
        countryData={[]}
        currencyData={[]}
      />
      {/* <TicketEditComponent
        ticket={ticketData}
        ticketId={ticket._id}
        isOpen={isEditDialogOpen}
        onClose={(updatedTicket) => {
          setIsEditDialogOpen(false);
          if (updatedTicket) setTicketData(updatedTicket);
        }}
        userId={userId}
      /> */}
    </div>
  );
};

export default TicketDetailComponent;