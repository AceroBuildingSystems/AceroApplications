"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Plus, Trash, Loader2, AlertCircle, CheckSquare, Badge, Edit, Calendar,
    Clock, RefreshCw, X, AlertTriangle, CheckCircle, ChevronDown, ChevronRight
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useCreateTicketTaskMutation, useUpdateTicketTaskMutation, useChangeTaskStatusMutation } from '@/services/endpoints/ticketTaskApi';
import { toast } from 'react-toastify';
import { useGetUsersQuery } from '@/services/endpoints/usersApi';
import DashboardLoader from '@/components/ui/DashboardLoader';
import { formatDistanceToNow, format, isPast, isToday, addDays, addWeeks, addMonths, addYears, differenceInDays, isFuture, isBefore } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion, AnimatePresence, progress } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DatePicker } from '../ui/date-picker';
import { MONGO_MODELS, SUCCESS } from '@/shared/constants';
import { useCreateApplicationMutation } from '@/services/endpoints/applicationApi';
import { useLazyGetMasterQuery } from '@/services/endpoints/masterApi';
import { filter } from 'lodash';
import { stat } from 'fs';

// Define types for task completion history
interface CompletionHistoryEntry {
    date: string;
    status: string;
}

interface SubTaskComponentProps {
    ticket: any;
    tasks: any[];
    isLoading: boolean;
    userId: string;
    canEdit: boolean;
    ticketStatus: string;
    requestType: string;
    userList: any[];
    onClose: (ticketData: any) => void;
}

const SubTaskComponent: React.FC<SubTaskComponentProps> = ({
    ticket,
    tasks,
    isLoading,
    userId,
    canEdit,
    ticketStatus,
    requestType,
    userList,
    onClose
}) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [taskEfforts, setTaskEfforts] = useState('1');
    const [taskDueDate, setTaskDueDate] = useState<Date>(addDays(new Date(), 1)); // Default to tomorrow
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringType, setRecurringType] = useState('WEEKLY');
    const [recurringInterval, setRecurringInterval] = useState('1');
    const [recurringEndDate, setRecurringEndDate] = useState<Date | null>(null);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    const [todayCompleted, setTodayCompleted] = useState<boolean>(false);
    const [localTasks, setTasks] = useState<any[]>(tasks);
    const [assignee, setAssignee] = useState<string | null>(null);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [taskHistory, setTaskHistory] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [createMaster, { isLoading: isCreatingMaster }] = useCreateApplicationMutation();

    const [selectedAssignee, setSelectedAssignee] = useState('');
    const [getTasks, { data: taskData, isLoading: taskLoading }] = useLazyGetMasterQuery();

    // Update localTasks when tasks prop changes
    useEffect(() => {
        setTasks(tasks);
    }, [tasks]);

    console.log({ ticket }, 'here', ticket);
    const [createTask, { isLoading: isCreating }] = useCreateTicketTaskMutation();
    const [updateTask, { isLoading: isUpdating }] = useUpdateTicketTaskMutation();
    const [changeStatus, { isLoading: isChangingStatus }] = useChangeTaskStatusMutation();

    const { data: usersData, isLoading: usersLoading } = useGetUsersQuery();
    const availableUsers = usersData || [];

    const handleOpenDialog = (task: any = null) => {
        setFormError(null);

        if (task && typeof task === 'object') {
            setSelectedTask(task);
            setTaskTitle(task.title || '');
            setTaskDescription(task.description || '');
            setTaskEfforts((task.efforts || 1).toString());
            setTaskDueDate(task.dueDate ? new Date(task.dueDate) : addDays(new Date(), 1));
            setIsRecurring(task.isRecurring || false);
            setRecurringType(task.recurringType || 'WEEKLY');
            setRecurringInterval((task.recurringInterval || 1).toString());
            setRecurringEndDate(task.recurringEndDate ? new Date(task.recurringEndDate) : null);
            setAssignee(task.assignee?._id || null);
            setTodayCompleted(task.todayCompleted || false);
        } else {
            setSelectedTask(null);
            setTaskTitle('');
            setTaskDescription('');
            setTaskEfforts('1');
            setTaskDueDate(addDays(new Date(), 1));
            setIsRecurring(false);
            setRecurringType('WEEKLY');
            setRecurringInterval('1');
            setAssignee(null);
            setRecurringEndDate(null);
            setTodayCompleted(false);
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setSelectedTask(null);
        setFormError(null);
    };

    const validateForm = () => {
        if (!taskTitle.trim()) {
            setFormError("Task title is required");
            return false;
        }

        // if (!taskDueDate) {
        //     setFormError("Due date is required");
        //     return false;
        // }

        if (!ticket?._id) {
            setFormError("Ticket ID is missing");
            console.error("Ticket ID is missing");
            return false;
        }

        return true;
    };

    // Calculate next recurring date based on current settings
    const calculateNextRecurringDate = (baseDate: Date = new Date(), type = recurringType, intervalValue = recurringInterval) => {
        const interval = parseInt(recurringInterval) || 1;

        switch (type) {
            case 'DAILY': return addDays(baseDate, interval);
            case 'WEEKLY': return addWeeks(baseDate, interval);
            case 'MONTHLY': return addMonths(baseDate, interval);
            case 'YEARLY': return addYears(baseDate, interval);
            case 'CUSTOM': return addYears(baseDate, interval); // Use CUSTOM for yearly recurrence
            default: return addWeeks(baseDate, interval);
        }
    };

    const handleSubmitTask = async () => {
        if (!validateForm()) return;

        try {
            setIsSubmitting(true);
            const date = new Date();
            const year = date.getFullYear().toString().slice(-2); // e.g. "25"
            const month = String(date.getMonth() + 1).padStart(2, '0'); // e.g. "10"
            const prefix = `STSK-${year}`; // Example: TSK-2510

            // ✅ Step 2: Fetch existing tasks for this month to determine sequence
            const res: any = await getTasks({
                db: MONGO_MODELS.TASK,
                filter: { taskId: { $regex: `^${prefix}` } },
                sort: { createdAt: 'asc' }
            }).unwrap();

            const taskCount = res?.data?.length || 0;
            const nextSeq = String(taskCount + 1).padStart(5, '0'); // 0001, 0002...
            const generatedTaskId = `${prefix}-${nextSeq}`;

            console.log('Generated Task ID:', generatedTaskId);
            const { createdAt, updatedAt, _id, taskId, ...restOfTicket } = ticket || {};

            const formattedData = {
                db: MONGO_MODELS.TASK,
                action: "create",
                data: {
                    ...restOfTicket,
                    taskId: generatedTaskId,
                    subject: taskTitle,
                    description: taskDescription,
                    status: 'Pending',
                    taskType: 'one-time',
                    progress: 0,
                    assignees: [selectedAssignee],
                    parentTaskId: ticket?._id,             // reference to the parent task
                    isSubtask: true,          // mark this as a subtask
                    addedBy: userId,          // current user
                    updatedBy: userId
                },
            };

            console.log('Task Data to Save:', formattedData);

            const response: any = await createMaster(formattedData);

            if (response?.data && response?.data?.status === SUCCESS) {
                toast.success("Subtask created successfully");
                // optionally refresh parent task or local state
            }

            handleCloseDialog();
            onClose('');
        } catch (error) {
            console.error("Task operation error:", error);

            // Extract the error message for better user feedback
            let errorMsg = "Failed to save task";

            // Safely extract error message
            const errorObj = error as any;
            if (errorObj?.data?.message) {
                errorMsg = typeof errorObj.data.message === 'string'
                    ? errorObj.data.message
                    : JSON.stringify(errorObj.data.message);
            } else if (errorObj?.message) {
                errorMsg = errorObj.message;
            }

            setFormError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleTaskStatus = async (task: any) => {
        try {
            const newStatus = task.status?.toUpperCase() === 'COMPLETED' ? 'In Progress' : 'Completed';
            const progress = newStatus === 'Completed' ? 100 : task.progress || 0;

            const statusPayload = {
                status: newStatus,
                progress,
                updatedBy: userId,
            };

            const formattedData = {
                db: MONGO_MODELS.TASK,
                filter: { '_id': task._id },
                action: "update",
                data: statusPayload,
            };

            console.log('Task Data to Save:', formattedData);
            const response: any = await createMaster(formattedData);

            toast.success(`Subtask status updated to ${newStatus}`);

            const parentTaskId = task.parentTaskId;
            if (parentTaskId) {
                // const allSubtasks = await getTasks(parentTaskId); // your API to get subtasks
                const allSubtasksRes: any = await getTasks({
                    db: MONGO_MODELS.TASK,
                    filter: { parentTaskId: parentTaskId?._id },
                    sort: { createdAt: 'asc' }
                }).unwrap();

                const allSubtasks = allSubtasksRes?.data || [];

                // 3️⃣ Calculate the average progress
                const totalProgress = allSubtasks.reduce(
                    (acc, t) => acc + t.progress,
                    0
                );
                const averageProgress = Math.round(totalProgress / allSubtasks.length);
                const finalStatus = averageProgress === 100 ? 'Completed' : task.status || 'In Progress';
                const formattedDataTask = {
                    db: MONGO_MODELS.TASK,
                    filter: { '_id': parentTaskId?._id },
                    action: "update",
                    data: {
                        progress: averageProgress,         // current user
                        status: finalStatus,
                        updatedBy: userId
                    },
                };


                const response: any = await createMaster(formattedDataTask);

                if (response?.data && response?.data?.status === SUCCESS) {
                    toast.success(`Main task progress updated to ${averageProgress}%`);
                    onClose(response?.data?.data);
                    // optionally refresh parent task or local state
                }

            }
        } catch (error) {
            console.error("Status change error:", error);
            toast.error('Failed to update task status');
        }
    };

    const handleChangeProgress = async (task: any, progress: number) => {
        try {
            console.log({ task });
            const formattedData = {
                db: MONGO_MODELS.TASK,
                filter: { '_id': task._id },
                action: "update",
                data: {
                    progress: progress,       // current user
                    status: 'In Progress',
                    updatedBy: userId
                },
            };

            console.log('Task Data to Save:', formattedData);
            const response: any = await createMaster(formattedData);

            toast.success(`Subtask progress updated to ${progress}%`);

            const parentTaskId = task.parentTaskId;
            if (parentTaskId) {
                // const allSubtasks = await getTasks(parentTaskId); // your API to get subtasks
                const allSubtasksRes: any = await getTasks({
                    db: MONGO_MODELS.TASK,
                    filter: { parentTaskId: parentTaskId?._id },
                    sort: { createdAt: 'asc' }
                }).unwrap();

                const allSubtasks = allSubtasksRes?.data || [];

                // 3️⃣ Calculate the average progress
                const totalProgress = allSubtasks.reduce(
                    (acc, t) => acc + t.progress,
                    0
                );
                const averageProgress = Math.round(totalProgress / allSubtasks.length);
                const finalStatus = averageProgress === 100 ? 'Completed' : task.status || 'In Progress';
                const formattedDataTask = {
                    db: MONGO_MODELS.TASK,
                    filter: { '_id': parentTaskId?._id },
                    action: "update",
                    data: {
                        progress: averageProgress,         // current user
                        status: finalStatus,
                        updatedBy: userId
                    },
                };


                const response: any = await createMaster(formattedDataTask);

                if (response?.data && response?.data?.status === SUCCESS) {
                    toast.success(`Main task progress updated to ${averageProgress}%`);
                    onClose(response?.data?.data);
                    // optionally refresh parent task or local state
                }

            }
        } catch (error) {
            console.error("Progress update error:", error);
            toast.error('Failed to update progress');
        }
    };

    const handleToggleTodayCompleted = async (task: any, completed: boolean) => {
        try {
            // Update the task locally for immediate UI feedback
            const updatedTasks = localTasks.map(t =>
                t._id === task._id ? { ...t, todayCompleted: completed } : t
            );

            // Update the tasks state with the new array
            setTasks(updatedTasks);

            // If task is marked as completed and is recurring, add to history
            if (completed && task.isRecurring) {
                // Find the task in our local state
                const taskToUpdate = updatedTasks.find(t => t._id === task._id);

                if (taskToUpdate) {
                    // Add to completion history if it doesn't exist already
                    if (!taskToUpdate.completionHistory) {
                        taskToUpdate.completionHistory = [];
                    }

                    // Add new completion record
                    taskToUpdate.completionHistory.push({
                        date: new Date().toISOString(),
                        status: 'COMPLETED'
                    });

                    // Calculate next occurrence date
                    const nextDate = calculateNextRecurringDate(new Date());

                    // Update the next recurring date
                    if (nextDate) {
                        taskToUpdate.nextRecurringDate = nextDate.toISOString();
                    }
                }
            }

            // Send API request
            await updateTask({
                _id: task._id,
                todayCompleted: completed,
                updatedBy: userId,
                completionHistory: task.completionHistory || []
            }).unwrap();

            // Show success message
            toast.success(completed ? 'Today\'s task marked as completed' : 'Today\'s task marked as incomplete');
        } catch (error) {
            console.error("Task completion update error:", error);
            toast.error('Failed to update task completion status');
        }
    };

    // Check if a task is overdue
    const isTaskOverdue = (task: any) => {
        if (!task.dueDate || task.status === 'COMPLETED') return false;
        const dueDate = new Date(task.dueDate);
        return isPast(dueDate) && !isToday(dueDate);
    };

    // Get due date status text and color
    const getDueDateStatus = (task: any) => {
        if (!task.dueDate) return { text: 'No due date', color: 'text-muted-foreground' };

        const dueDate = new Date(task.dueDate);
        const today = new Date();
        const daysRemaining = differenceInDays(dueDate, today);

        if (task.status === 'COMPLETED') {
            return { text: 'Completed', color: 'text-emerald-600' };
        }

        if (isToday(dueDate)) {
            return { text: 'Due today', color: 'text-amber-600 font-medium' };
        }

        if (isPast(dueDate)) {
            return {
                text: `Overdue by ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) !== 1 ? 's' : ''}`,
                color: 'text-red-600 font-medium'
            };
        }

        if (daysRemaining <= 2) {
            return {
                text: `Due in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`,
                color: 'text-amber-600'
            };
        }

        return {
            text: `Due in ${daysRemaining} days`,
            color: 'text-primary'
        };
    };

    // Toggle task expanded state
    const toggleTaskExpanded = (taskId: string) => {
        setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
    };

    // Can create tasks based on ticket status
    const canCreateTasks = canEdit && ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'Pending', 'In Progress'].includes(ticketStatus);

    // Calculate total progress
    const calculateTotalProgress = (taskList: any[] = localTasks) => {
        if (taskList.length === 0) return 0;
        console.log({ taskList });
        const totalTasks = taskList.length;
        const completedTasks = taskList.filter(task => task.status === 'COMPLETED').length;
        const progressSum = taskList.reduce((sum, task) => sum + (task.progress || 0), 0);

        return Math.round(progressSum / totalTasks);
    };

    const handleAssignee = (assignee: string) => {
        setSelectedAssignee(assignee);


    };

    return (
        <TooltipProvider>
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-semibold">{requestType === 'task' ? 'Sub Tasks' : 'Tasks and Subtasks'}</h3>
                        <p className="text-sm text-muted-foreground">Break down this task into manageable sub tasks</p>
                    </div>

                    {canCreateTasks && (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                                onClick={() => handleOpenDialog()}
                                className="gap-2 text-xs"
                                size="sm"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                {requestType === 'task' ? 'Add Sub Task' : 'Add Task'}
                            </Button>
                        </motion.div>
                    )}
                </div>

                <DashboardLoader loading={isLoading}>
                    <div className="divide-y divide-border/40">
                        {localTasks.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center py-12 px-4"
                            >
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <CheckSquare className="h-8 w-8 text-primary/60" />
                                </div>
                                <h4 className="text-base font-medium mb-2">{requestType === 'task' ? 'No subtasks created yet' : 'No tasks created yet'}</h4>
                                <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                                    {requestType === 'task' ? 'Break down this task into smaller, manageable sub tasks to track progress more effectively.' : 'Break down this ticket into smaller, manageable tasks to track progress more effectively.'}
                                </p>
                                {canCreateTasks && (
                                    <Button
                                        onClick={() => handleOpenDialog()}
                                        variant="outline"
                                        className="gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        {requestType === 'task' ? 'Create First Sub Task' : 'Create First Task'}
                                    </Button>
                                )}
                            </motion.div>
                        ) : (
                            <div>
                                {/* Overall progress */}
                                {/* <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-4 rounded-lg bg-card/50 border border-border/50 mb-4 bg-gray-50"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm">Overall Progress</span>
                                        <span className="text-sm font-medium text-primary">{calculateTotalProgress(localTasks)}%</span>
                                    </div>
                                    <div className="w-full bg-muted/60 rounded-full h-2">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${calculateTotalProgress(localTasks)}%` }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            className="bg-primary h-2 rounded-full"
                                        ></motion.div>
                                    </div>

                                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                        <span>{localTasks.filter(t => t.status === 'COMPLETED').length} of {localTasks.length} tasks completed</span>
                                        <span>Total effort: {localTasks.reduce((sum, task) => sum + (task.efforts || 1), 0)} points</span>
                                    </div>
                                </motion.div> */}

                                {/* Task list */}
                                <div className="rounded-lg border border-border/50 overflow-hidden">
                                    <div className="space-y-0 divide-y divide-border/30">
                                        {localTasks.map((task, index) => {
                                            const dueDateStatus = getDueDateStatus(task);
                                            return (
                                                <motion.div
                                                    key={task._id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className={cn(
                                                        "px-4 py-3 transition-colors",
                                                        task.status?.toUpperCase() === 'COMPLETED' ? "bg-muted/30" : "bg-gray-50",
                                                        expandedTaskId === task._id ? "bg-primary/5" : ""
                                                    )}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="pt-0.5">
                                                            <Checkbox
                                                                checked={task.status?.toUpperCase() === 'COMPLETED'}
                                                                onCheckedChange={() => handleToggleTaskStatus(task)}
                                                                disabled={!canEdit || isChangingStatus}
                                                                className={cn(
                                                                    task.status?.toUpperCase() === 'COMPLETED' ? "border-primary text-primary" : ""
                                                                )}
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between">
                                                                {/* <button
                                                                    className="text-left group flex items-center gap-2"
                                                                    onClick={() => toggleTaskExpanded(task._id)}
                                                                >
                                                                    {expandedTaskId === task._id ? (
                                                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                                    ) : (
                                                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                                    )}
                                                                    <h4 className={cn(
                                                                        "font-medium text-sm transition-colors",
                                                                        task.status === 'COMPLETED' ? "line-through text-muted-foreground" : "text-foreground group-hover:text-primary"
                                                                    )}>
                                                                        {task.title}
                                                                    </h4>
                                                                </button> */}

                                                                <div>
                                                                    {task?.subject}
                                                                </div>
                                                                <div className="flex items-center space-x-2 ml-2">
                                                                    <div className={cn(
                                                                        "text-xs font-medium h-5 px-2 py-0.5 rounded-full border",
                                                                        task.status?.toUpperCase() === 'COMPLETED'
                                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                                            : "bg-amber-50 text-amber-700 border-amber-200"
                                                                    )}>
                                                                        {task?.status || 'In Progress'}
                                                                    </div>
                                                                    {canEdit && (
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    onClick={() => handleOpenDialog(task)}
                                                                                    className="h-7 w-7 rounded-full p-0 hover:bg-muted"
                                                                                >
                                                                                    <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                                                                                </Button>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                <p>Edit task</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Due date and recurring status */}
                                                            <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-600">
                                                                {/* <div className={cn(
                                                                    "flex items-center gap-1.5",
                                                                    dueDateStatus.color
                                                                )}>
                                                                    {isTaskOverdue(task) ? (
                                                                        <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                                                                    ) : (
                                                                        <Calendar className="h-3.5 w-3.5" />
                                                                    )}
                                                                    <span>{task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No date'} - {dueDateStatus.text}</span>
                                                                </div>

                                                                {task.isRecurring && (
                                                                    <div className="flex items-center gap-1.5 text-primary">
                                                                        <RefreshCw className="h-3.5 w-3.5" />
                                                                        <span>
                                                                            {task.recurringInterval > 1 ? `Every ${task.recurringInterval} ` : 'Every '}
                                                                            {task.recurringType.toLowerCase() === 'daily' ? 'day' : ''}
                                                                            {task.recurringType.toLowerCase() === 'weekly' ? 'week' : ''}
                                                                            {task.recurringType.toLowerCase() === 'monthly' || task.recurringType.toLowerCase() === 'custom' ? 'month' : ''}
                                                                            {task.recurringType.toLowerCase() === 'yearly' ? 'year' : ''}
                                                                            {task.recurringInterval > 1 ? 's' : ''}
                                                                        </span>
                                                                    </div>
                                                                )} */}

                                                                {task?.description}
                                                            </div>

                                                            {/* Task description and details */}
                                                            {/*  */}

                                                            <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                                                {/* <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                                    <div className="inline-flex items-center gap-1.5">
                                                                        <CheckSquare className="h-3.5 w-3.5 text-primary/70" />
                                                                        <span className="font-medium text-foreground/80">{task.efforts || 1} pts</span>
                                                                    </div>
                                                                </div> */}

                                                                <div className="flex-1">
                                                                    <div className="flex justify-between items-center text-xs mb-1">
                                                                        <span className="text-muted-foreground">Progress:</span>
                                                                        <span className="font-medium text-foreground/80">{task.progress || 0}%</span>
                                                                    </div>
                                                                    <div className="w-full bg-muted/60 rounded-full h-1.5">
                                                                        <div
                                                                            className={cn(
                                                                                "h-1.5 rounded-full transition-all duration-300",
                                                                                task.status?.toUpperCase() === 'COMPLETED' ? "bg-emerald-500" : "bg-primary"
                                                                            )}
                                                                            style={{ width: `${task.progress || 0}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>

                                                                {canEdit && task.status?.toUpperCase() !== 'COMPLETED' && (
                                                                    <Select
                                                                        value={task.progress?.toString()}
                                                                        onValueChange={(value) => handleChangeProgress(task, parseInt(value))}
                                                                    >
                                                                        <SelectTrigger className="w-24 h-8 text-xs rounded-md text-foreground/80">
                                                                            <SelectValue placeholder="Progress" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="0">0%</SelectItem>
                                                                            <SelectItem value="25">25%</SelectItem>
                                                                            <SelectItem value="50">50%</SelectItem>
                                                                            <SelectItem value="75">75%</SelectItem>
                                                                            <SelectItem value="100">100%</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </DashboardLoader>

                {/* Task Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{selectedTask ? 'Edit Sub Task' : 'Add New Sub Task'}</DialogTitle>
                            <DialogDescription>
                                {selectedTask
                                    ? 'Update the sub task details below'
                                    : 'Break down your task into manageable sub tasks'
                                }
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {formError && (
                                <Alert variant="destructive" className="rounded-md">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{formError}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="title">
                                    Task Title <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    value={taskTitle}
                                    onChange={(e) => setTaskTitle(e.target.value)}
                                    placeholder="What needs to be done?"

                                />
                                {!taskTitle.trim() && (
                                    <p className="text-sm text-red-500 flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        Title is required
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    value={taskDescription}
                                    onChange={(e) => setTaskDescription(e.target.value)}
                                    placeholder="Add any details or instructions"
                                    rows={3}
                                    className="rounded-md resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Assign To</Label>
                                <Select onValueChange={handleAssignee} value={selectedAssignee}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select assignee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ticket?.assignees?.map((user) => (
                                            <SelectItem key={user._id} value={user._id}>
                                                {user.displayName?.toProperCase()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>

                                </Select>

                            </div>



                        </div>

                        <DialogFooter className="mt-6">
                            <Button variant="outline" onClick={handleCloseDialog} className="rounded-md">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmitTask}
                                disabled={!taskTitle.trim() || isCreating || isUpdating || isSubmitting}
                                className="rounded-md"
                                variant="default"
                            >
                                {isCreating || isUpdating || isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {selectedTask ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    selectedTask ? 'Update Sub Task' : 'Add Sub Task'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
};

export default SubTaskComponent;