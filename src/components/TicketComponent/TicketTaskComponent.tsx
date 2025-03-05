// src/components/TicketComponent/TicketTaskComponent.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateTicketTaskMutation, useUpdateTicketTaskMutation, useChangeTaskStatusMutation } from '@/services/endpoints/ticketTaskApi';
import { toast } from 'react-toastify';
import DashboardLoader from '@/components/ui/DashboardLoader';
import { formatDistanceToNow } from 'date-fns';
import { Progress } from '@/components/ui/progress';

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
  const [taskEfforts, setTaskEfforts] = useState(1);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  
  const [createTask, { isLoading: isCreating }] = useCreateTicketTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTicketTaskMutation();
  const [changeStatus, { isLoading: isChangingStatus }] = useChangeTaskStatusMutation();
  
  const handleOpenDialog = (task = null) => {
    if (task) {
      setSelectedTask(task);
      setTaskTitle(task.title);
      setTaskDescription(task.description || '');
      setTaskEfforts(task.efforts || 1);
    } else {
      setSelectedTask(null);
      setTaskTitle('');
      setTaskDescription('');
      setTaskEfforts(1);
    }
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedTask(null);
  };
  
  const handleSubmitTask = async () => {
    if (!taskTitle.trim()) return;
    
    try {
      if (selectedTask) {
        // Update existing task code remains the same
      } else {
        // Fixed task creation
        console.log("Creating task with data:", {
          ticket: ticketId,
          title: taskTitle,
          description: taskDescription,
          status: 'TODO',
          efforts: taskEfforts,
          addedBy: userId,
          updatedBy: userId
        });
        
        await createTask({
          action: 'create',
          data: {
            ticket: ticketId,
            title: taskTitle,
            description: taskDescription,
            status: 'TODO',
            efforts: taskEfforts,
            addedBy: userId,
            updatedBy: userId
          }
        }).unwrap();
        
        toast.success('Task created successfully');
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error("Task creation error:", error);
      toast.error('Failed to create task');
    }
  };
  
  const handleToggleTaskStatus = async (task: any) => {
    try {
      const newStatus = task.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
      const progress = newStatus === 'COMPLETED' ? 100 : 0;
      
      await changeStatus({
        action: 'changeStatus',
        data: {
          _id: task._id,
          status: newStatus,
          progress,
          updatedBy: userId,
          ticket: ticketId
        }
      }).unwrap();
      
      toast.success(`Task marked as ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };
  
  const handleChangeProgress = async (task: any, progress: number) => {
    try {
      await updateTask({
        action: 'update',
        data: {
          _id: task._id,
          progress,
          updatedBy: userId
        }
      }).unwrap();
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };
  
  // Check if creating/editing tasks is allowed based on ticket status
  const canCreateTasks = canEdit && ['NEW', 'ASSIGNED', 'IN_PROGRESS'].includes(ticketStatus);
  
  return (
    <Card>
      <CardContent className="p-4">
        <DashboardLoader loading={isLoading}>
          <div className="space-y-6">
            {canCreateTasks && (
              <div className="mb-4">
                <Button 
                  onClick={() => handleOpenDialog()}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </div>
            )}
            
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tasks created yet. Break down this ticket into manageable tasks!
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div 
                    key={task._id} 
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        checked={task.status === 'COMPLETED'}
                        onCheckedChange={() => handleToggleTaskStatus(task)}
                        disabled={!canEdit || isChangingStatus}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className={`font-medium ${task.status === 'COMPLETED' ? 'line-through text-gray-500' : ''}`}>
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="mt-1 text-sm text-gray-700 whitespace-pre-line">
                                {task.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                            </span>
                            {canEdit && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleOpenDialog(task)}
                              >
                                Edit
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <div className="text-sm">
                            <span className="text-gray-500">Effort:</span>{' '}
                            <span className="font-medium">{task.efforts || 1} points</span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-center text-sm mb-1">
                              <span className="text-gray-500">Progress:</span>
                              <span className="font-medium">{task.progress || 0}%</span>
                            </div>
                            <Progress value={task.progress || 0} className="h-2" />
                          </div>
                          
                          {canEdit && task.status !== 'COMPLETED' && (
                            <Select
                              value={task.progress?.toString()}
                              onValueChange={(value) => handleChangeProgress(task, parseInt(value))}
                            >
                              <SelectTrigger className="w-24">
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
            )}
          </div>
        </DashboardLoader>
      </CardContent>
      
      {/* Task Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
            <DialogDescription>
              {selectedTask 
                ? 'Update the task details below' 
                : 'Break down your ticket into manageable tasks'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="What needs to be done?"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Add any details or instructions"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="efforts">Effort Points (1-10)</Label>
              <Select
                value={taskEfforts.toString()}
                onValueChange={(value) => setTaskEfforts(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select effort" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 5, 8, 10].map((value) => (
                    <SelectItem key={value} value={value.toString()}>
                      {value} {value === 1 ? 'point' : 'points'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitTask}
              disabled={!taskTitle.trim() || isCreating || isUpdating}
            >
              {selectedTask ? 'Update Task' : 'Add Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TicketTaskComponent;