// src/components/TicketComponent/TicketFormComponent.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetMasterQuery } from '@/services/endpoints/masterApi';
import { useGetTicketCategoriesQuery } from '@/services/endpoints/ticketCategoryApi';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

// Define validation schema
const ticketSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  department: z.string({ required_error: "Department is required" }),
  category: z.string({ required_error: "Category is required" }),
  priority: z.string({ required_error: "Priority is required" }),
  dueDate: z.date().optional(),
});

interface TicketFormComponentProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  userId: string;
  isEdit?: boolean;
}

const TicketFormComponent: React.FC<TicketFormComponentProps> = ({ 
  onSubmit, 
  initialData, 
  userId,
  isEdit = false
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>(initialData?.department?._id || '');
  
  const { data: departmentData = [], isLoading: departmentLoading } = useGetMasterQuery({
    db: 'DEPARTMENT_MASTER',
    filter: { isActive: true },
    sort: { name: 1 },
  });
  
  const { data: categoryData = [], isLoading: categoryLoading, refetch: refetchCategories } = useGetTicketCategoriesQuery({
    departmentId: selectedDepartment
  });
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(ticketSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      description: initialData.description,
      department: initialData.department?._id,
      category: initialData.category?._id,
      priority: initialData.priority,
      dueDate: initialData.dueDate ? new Date(initialData.dueDate) : undefined,
    } : {
      priority: 'MEDIUM'
    }
  });
  
  // Watch for department changes
  const watchedDepartment = watch('department');
  
  useEffect(() => {
    if (watchedDepartment && watchedDepartment !== selectedDepartment) {
      setSelectedDepartment(watchedDepartment);
      // Clear category selection when department changes
      setValue('category', '');
    }
  }, [watchedDepartment, selectedDepartment, setValue]);
  
  useEffect(() => {
    if (selectedDepartment) {
      refetchCategories();
    }
  }, [selectedDepartment, refetchCategories]);
  
  const handleFormSubmit = (data: any) => {
    const formData = {
      ...data,
      creator: userId,
      addedBy: userId,
      updatedBy: userId,
      ...(isEdit && initialData ? { _id: initialData._id } : {})
    };
    onSubmit(formData);
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Ticket' : 'Create New Ticket'}</CardTitle>
          <CardDescription>
            {isEdit 
              ? 'Update the ticket details below' 
              : 'Fill in the details below to create a new support ticket'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              placeholder="Enter a clear title for your issue"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Describe your issue"
              rows={5}
              className="resize-none"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="department" className="text-sm font-medium">
                Department
              </label>
              <Select 
                onValueChange={(value) => setValue('department', value)} 
                defaultValue={initialData?.department?._id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departmentData?.data?.map((dept: any) => (
                    <SelectItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-sm text-red-500">{errors.department.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category
              </label>
              <Select 
                onValueChange={(value) => setValue('category', value)}
                defaultValue={initialData?.category?._id}
                disabled={!selectedDepartment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryData?.data?.map((cat: any) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category.message}</p>
              )}
              {!selectedDepartment && (
                <p className="text-sm text-amber-500">Select a department first</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">
                Priority
              </label>
              <Select 
                onValueChange={(value) => setValue('priority', value)}
                defaultValue={initialData?.priority || 'MEDIUM'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-red-500">{errors.priority.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="dueDate" className="text-sm font-medium">
                Due Date (Optional)
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watch('dueDate') ? (
                      format(watch('dueDate'), 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watch('dueDate')}
                    onSelect={(date) => setValue('dueDate', date)}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit">
            {isEdit ? 'Update Ticket' : 'Create Ticket'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TicketFormComponent;