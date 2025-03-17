// src/components/TicketComponent/TicketTaskComponent.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash, Loader2, AlertCircle, CheckSquare, Badge, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useCreateTicketTaskMutation, useUpdateTicketTaskMutation, useChangeTaskStatusMutation } from '@/services/endpoints/ticketTaskApi';
import { toast } from 'react-toastify';
import DashboardLoader from '@/components/ui/DashboardLoader';
import { formatDistanceToNow } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface TicketTaskComponentProps {
  ticketId: string;
  tasks: any[];
  isLoading: boolean;
  userId: string;
  canEdit: boolean;
  ticketStatus: string;
}

const TicketTaskComponent: React.FC<TicketTaskComponentProps> = ({
  ticketId,
  tasks,
  isLoading,
  userId,
  canEdit,
  ticketStatus
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskEfforts, setTaskEfforts] = useState('1');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  
  // Debug information
  useEffect(() => {
    console.log("TicketTaskComponent mounted with ticketId:", ticketId);
    console.log("Current tasks:", tasks);
  }, [ticketId, tasks]);
  
  const [createTask, { isLoading: isCreating }] = useCreateTicketTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTicketTaskMutation();
  const [changeStatus, { isLoading: isChangingStatus }] = useChangeTaskStatusMutation();
  
  const handleOpenDialog = (task = null) => {
    setFormError(null);
    
    if (task && typeof task === 'object') {
      setSelectedTask(task);
      setTaskTitle(task.title || '');
      setTaskDescription(task.description || '');
      setTaskEfforts((task.efforts || 1).toString());
    } else {
      setSelectedTask(null);
      setTaskTitle('');
      setTaskDescription('');
      setTaskEfforts('1');
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
    
    if (!ticketId) {
      setFormError("Ticket ID is missing");
      console.error("Ticket ID is missing");
      return false;
    }
    
    return true;
  };
  
  const handleSubmitTask = async () => {
    if (!validateForm()) return;
    
    try {
      if (selectedTask) {
        // Update existing task
        const updatePayload = {
          _id: selectedTask._id,
          title: taskTitle,
          description: taskDescription,
          efforts: parseInt(taskEfforts),
          updatedBy: userId
        };
        
        console.log("Updating task with:", JSON.stringify(updatePayload, null, 2));
        
        await updateTask(updatePayload).unwrap();
        toast.success('Task updated successfully');
      } else {
        // Create new task with proper structure
        const createPayload = {
          ticket: ticketId,
          title: taskTitle,
          description: taskDescription,
          efforts: parseInt(taskEfforts),
          status: 'TODO',
          progress: 0,
          addedBy: userId,
          updatedBy: userId
        };
        
        console.log("Creating task with payload:", JSON.stringify(createPayload, null, 2));
        
        const response = await createTask(createPayload).unwrap();
        console.log("Task creation response:", response);
        
        toast.success('Task created successfully');
      }
      
      handleCloseDialog();
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
    }
  };
  
  const handleToggleTaskStatus = async (task: any) => {
    try {
      const newStatus = task.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
      const progress = newStatus === 'COMPLETED' ? 100 : task.progress || 0;
      
      const statusPayload = {
        _id: task._id,
        status: newStatus,
        progress,
        updatedBy: userId,
        ticket: ticketId
      };
      
      console.log("Changing task status with:", JSON.stringify(statusPayload, null, 2));
      
      await changeStatus(statusPayload).unwrap();
      
      toast.success(`Task marked as ${newStatus}`);
    } catch (error) {
      console.error("Status change error:", error);
      toast.error('Failed to update task status');
    }
  };
  
  const handleChangeProgress = async (task: any, progress: number) => {
    try {
      await updateTask({
        _id: task._id,
        progress,
        updatedBy: userId
      }).unwrap();
      
      toast.success(`Progress updated to ${progress}%`);
    } catch (error) {
      console.error("Progress update error:", error);
      toast.error('Failed to update progress');
    }
  };
  
  // Toggle task expanded state
  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };
  
  // Can create tasks based on ticket status
  const canCreateTasks = canEdit && ['NEW', 'ASSIGNED', 'IN_PROGRESS'].includes(ticketStatus);
  
  // Calculate total progress
  const calculateTotalProgress = () => {
    if (tasks.length === 0) return 0;
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
    const progressSum = tasks.reduce((sum, task) => sum + (task.progress || 0), 0);
    
    return Math.round(progressSum / totalTasks);
  };
  
  return (
    <Card className="border-none shadow-md overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-gray-50/70 border-b p-4 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Tasks</h3>
            <p className="text-sm text-gray-600">Break down this ticket into manageable tasks</p>
          </div>
          
          {canCreateTasks && (
            <Button 
              onClick={() => handleOpenDialog()}
              className="rounded-lg bg-primary hover:bg-primary/90 shadow-sm"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          )}
        </div>
        
        <DashboardLoader loading={isLoading}>
          <div className="divide-y divide-gray-100">
            {tasks.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white">
                <CheckSquare className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-lg font-medium text-gray-700 mb-2">No tasks created yet</p>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">Break down this ticket into smaller, manageable tasks to track progress more effectively.</p>
                {canCreateTasks && (
                  <Button 
                    onClick={() => handleOpenDialog()}
                    variant="outline"
                    className="rounded-lg border-gray-200 hover:border-primary hover:text-primary"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Task
                  </Button>
                )}
              </div>
            ) : (
              <div>
                {/* Overall progress */}
                <div className="p-4 bg-white border-b">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                    <span className="text-sm font-semibold text-primary">{calculateTotalProgress()}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                      style={{ width: `${calculateTotalProgress()}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>{tasks.filter(t => t.status === 'COMPLETED').length} of {tasks.length} tasks completed</span>
                    <span>Total effort: {tasks.reduce((sum, task) => sum + (task.efforts || 1), 0)} points</span>
                  </div>
                </div>
                
                {/* Task list */}
                <div className="space-y-0 divide-y divide-gray-100">
                  {tasks.map((task) => (
                    <div 
                      key={task._id} 
                      className={cn(
                        "px-4 py-3 transition-colors",
                        task.status === 'COMPLETED' ? "bg-gray-50/70" : "bg-white",
                        expandedTaskId === task._id ? "bg-blue-50/50" : ""
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={task.status === 'COMPLETED'}
                          onCheckedChange={() => handleToggleTaskStatus(task)}
                          disabled={!canEdit || isChangingStatus}
                          className={cn(
                            "mt-1",
                            task.status === 'COMPLETED' ? "text-primary border-primary" : ""
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <button 
                              className="text-left group"
                              onClick={() => toggleTaskExpanded(task._id)}
                            >
                              <h4 className={cn(
                                "font-medium text-sm transition-colors",
                                task.status === 'COMPLETED' ? "line-through text-gray-500" : "text-gray-800 group-hover:text-primary"
                              )}>
                                {task.title}
                              </h4>
                            </button>
                            <div className="flex items-center space-x-2 ml-2">
                              <Badge variant="outline" className={cn(
                                "text-xs font-medium h-5",
                                task.status === 'COMPLETED' 
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              )}>
                                {task.status || 'In Progress'}
                              </Badge>
                              {canEdit && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleOpenDialog(task)}
                                  className="h-7 w-7 rounded-full p-0 hover:bg-gray-100"
                                >
                                  <Edit className="h-3 w-3 text-gray-500" />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {/* Task description and details */}
                          <div className={cn(
                            "overflow-hidden transition-all duration-200",
                            expandedTaskId === task._id ? "max-h-96 mt-2" : "max-h-0"
                          )}>
                            {task.description && (
                              <p className="mt-2 text-sm text-gray-700 whitespace-pre-line bg-white p-3 rounded-lg border border-gray-100">
                                {task.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span className="inline-flex items-center gap-1">
                                <CheckSquare className="h-3.5 w-3.5" />
                                <span className="font-medium">{task.efforts || 1} pts</span>
                              </span>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex justify-between items-center text-xs mb-1">
                                <span className="text-gray-500">Progress:</span>
                                <span className="font-medium text-gray-700">{task.progress || 0}%</span>
                              </div>
                              <Progress 
                                value={task.progress || 0} 
                                className={cn(
                                  "h-1.5", 
                                  task.status === 'COMPLETED' ? "bg-gray-200" : "bg-gray-100"
                                )}
                                indicatorClassName={task.status === 'COMPLETED' ? "bg-emerald-500" : "bg-primary"}
                              />
                            </div>
                            
                            {canEdit && task.status !== 'COMPLETED' && (
                              <Select
                                value={task.progress?.toString()}
                                onValueChange={(value) => handleChangeProgress(task, parseInt(value))}
                              >
                                <SelectTrigger className="w-24 h-8 text-xs rounded-lg">
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
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DashboardLoader>
      </CardContent>
      
      {/* Task Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
            <DialogDescription>
              {selectedTask 
                ? 'Update the task details below' 
                : 'Break down your ticket into manageable tasks'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {formError && (
              <Alert variant="destructive" className="rounded-lg">
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
                className={cn(
                  "rounded-lg",
                  !taskTitle.trim() ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                )}
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
                className="rounded-lg resize-none"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="efforts">Effort Points (1-10)</Label>
              <Select
                value={taskEfforts}
                onValueChange={setTaskEfforts}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Select effort" />
                </SelectTrigger>
                <SelectContent>
                  {['1', '2', '3', '5', '8', '10'].map((value) => (
                    <SelectItem key={value} value={value}>
                      {value} {value === '1' ? 'point' : 'points'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 ml-1">
                Higher points indicate more complex tasks
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} className="rounded-lg">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitTask}
              disabled={!taskTitle.trim() || isCreating || isUpdating}
              className="rounded-lg bg-primary hover:bg-primary/90"
            >
              {isCreating || isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {selectedTask ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                selectedTask ? 'Update Task' : 'Add Task'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TicketTaskComponent;