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
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm({
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
  
  // Watch handlers remain the same
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
    <Card className="w-full max-w-3xl mx-auto border-none shadow-lg overflow-hidden">
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <CardHeader className="pb-6 bg-gray-50/70">
          <CardTitle className="text-2xl text-gray-800">{isEdit ? 'Edit Ticket' : 'Create New Ticket'}</CardTitle>
          <CardDescription className="text-gray-600">
            {isEdit 
              ? 'Update the ticket details below' 
              : 'Fill in the details below to create a new support ticket'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Title field */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium flex items-center text-gray-700">
              Title
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <Input
                id="title"
                placeholder="Enter a clear title for your issue"
                {...register('title')}
                className={cn(
                  "rounded-lg border-gray-200 focus:border-primary focus:ring-primary",
                  errors.title ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                )}
                aria-invalid={errors.title ? "true" : "false"}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1 ml-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.title.message}
                </p>
              )}
            </div>
          </div>
          
          {/* Description field */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium flex items-center text-gray-700">
              Description
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <Textarea
                id="description"
                placeholder="Describe your issue in detail"
                rows={6}
                className={cn(
                  "resize-none rounded-lg border-gray-200 focus:border-primary focus:ring-primary",
                  errors.description ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                )}
                {...register('description')}
                aria-invalid={errors.description ? "true" : "false"}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1 ml-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Department field */}
            <div className="space-y-2">
              <label htmlFor="department" className="text-sm font-medium flex items-center text-gray-700">
                Department
                <span className="text-red-500 ml-1">*</span>
              </label>
              <Select 
                onValueChange={(value) => setValue('department', value)} 
                defaultValue={initialData?.department?._id}
              >
                <SelectTrigger className={cn(
                  "rounded-lg border-gray-200 focus:border-primary focus:ring-primary",
                  errors.department ? "border-red-300" : ""
                )}>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  {departmentData?.data?.map((dept: any) => (
                    <SelectItem key={dept._id} value={dept._id} className="cursor-pointer">
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-sm text-red-500 mt-1 ml-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.department.message}
                </p>
              )}
            </div>
            
            {/* Category field */}
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium flex items-center text-gray-700">
                Category
                <span className="text-red-500 ml-1">*</span>
              </label>
              <Select 
                onValueChange={(value) => setValue('category', value)}
                defaultValue={initialData?.category?._id}
                disabled={!selectedDepartment}
              >
                <SelectTrigger className={cn(
                  "rounded-lg border-gray-200 focus:border-primary focus:ring-primary",
                  errors.category ? "border-red-300" : "",
                  !selectedDepartment ? "opacity-60" : ""
                )}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  {categoryData?.data?.map((cat: any) => (
                    <SelectItem key={cat._id} value={cat._id} className="cursor-pointer">
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500 mt-1 ml-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.category.message}
                </p>
              )}
              {!selectedDepartment && (
                <p className="text-sm text-amber-500 mt-1 ml-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Select a department first
                </p>
              )}
            </div>
            
            {/* Priority field */}
            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium flex items-center text-gray-700">
                Priority
                <span className="text-red-500 ml-1">*</span>
              </label>
              <Select 
                onValueChange={(value) => setValue('priority', value)}
                defaultValue={initialData?.priority || 'MEDIUM'}
              >
                <SelectTrigger className="rounded-lg border-gray-200 focus:border-primary focus:ring-primary">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="LOW" className="cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                      Low
                    </div>
                  </SelectItem>
                  <SelectItem value="MEDIUM" className="cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>
                      Medium
                    </div>
                  </SelectItem>
                  <SelectItem value="HIGH" className="cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-rose-500 mr-2"></div>
                      High
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-red-500 mt-1 ml-1">
                  {errors.priority.message}
                </p>
              )}
            </div>
            
            {/* Due Date field */}
            <div className="space-y-2">
              <label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
                Due Date (Optional)
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal rounded-lg border-gray-200",
                      !watch('dueDate') ? "text-gray-500" : "text-gray-900"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                    {watch('dueDate') ? (
                      format(watch('dueDate'), 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-lg shadow-md" align="start">
                  <Calendar
                    mode="single"
                    selected={watch('dueDate')}
                    onSelect={(date) => setValue('dueDate', date)}
                    initialFocus
                    disabled={(date) => date < new Date()}
                    className="rounded-lg border-none"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between py-6 bg-gray-50/70">
          <Button 
            type="button" 
            variant="outline" 
            className="rounded-lg border-gray-200 hover:border-gray-300"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="rounded-lg bg-primary hover:bg-primary/90 shadow-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEdit ? 'Update Ticket' : 'Create Ticket'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TicketFormComponent;