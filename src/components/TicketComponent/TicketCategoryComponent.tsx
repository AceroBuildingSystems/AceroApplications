// src/components/TicketComponent/TicketCategoryComponent.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateTicketCategoryMutation, useUpdateTicketCategoryMutation } from '@/services/endpoints/ticketCategoryApi';
import { toast } from 'react-toastify';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Plus, Edit, Trash } from 'lucide-react';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
  } from '@/components/ui/dropdown-menu';
import { useGetMasterQuery } from '@/services/endpoints/masterApi';

interface TicketCategoryComponentProps {
  departments: any[];
  categories: any[];
  userId: string;
  isAdmin: boolean;
}

const TicketCategoryComponent: React.FC<TicketCategoryComponentProps> = ({
  departments,
  categories,
  userId,
  isAdmin
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  
  const [createCategory, { isLoading: isCreating }] = useCreateTicketCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateTicketCategoryMutation();
  
  const handleOpenDialog = (category = null) => {
    if (category) {
      setSelectedCategory(category);
      setName(category.name);
      setDescription(category.description || '');
      setDepartmentId(category.department._id);
    } else {
      setSelectedCategory(null);
      setName('');
      setDescription('');
      setDepartmentId('');
    }
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedCategory(null);
  };
  
  const handleSubmit = async () => {
    if (!name.trim() || !departmentId) return;
    
    try {
      if (selectedCategory) {
        // Update existing category
        await updateCategory({
          action: 'update',
          data: {
            _id: selectedCategory._id,
            name,
            description,
            department: departmentId,
            updatedBy: userId
          }
        }).unwrap();
        toast.success('Category updated successfully');
      } else {
        // Create new category
        console.log('Creating category', name, description, departmentId, userId);
        await createCategory({
          action: 'create',
          data: {
            name,
            description,
            department: departmentId,
            isActive: true,
            addedBy: userId,
            updatedBy: userId
          }
        }).unwrap();
        toast.success('Category created successfully');
      }
      
      handleCloseDialog();
    } catch (error) {
      toast.error(selectedCategory ? 'Failed to update category' : 'Failed to create category');
    }
  };
  
  // Group categories by department
  const categoriesByDepartment = departments.map(dept => {
    return {
      department: dept,
      categories: categories.filter(cat => cat.department._id === dept._id)
    };
  });
  
  return (
    <div className="space-y-6 overflow-auto h-max-[60vh] w-full ">
 
        <div className="flex justify-end">
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
 
      
      {categoriesByDepartment.map(group => (
        <Card key={group.department._id} className="relative">
          <CardHeader>
            <CardTitle>{group.department.name}</CardTitle>
            <CardDescription>
              {group.categories.length} {group.categories.length === 1 ? 'category' : 'categories'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.categories.length > 0 ? (
                group.categories.map(category => (
                  <Card key={category._id} className="h-full">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        {isAdmin && (
                          <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(category)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">
                        {category.description || 'No description provided'}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No categories found for this department.
                  {isAdmin && (
                    <div className="mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setDepartmentId(group.department._id);
                          handleOpenDialog();
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Category
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            <DialogDescription>
              {selectedCategory 
                ? 'Update the category details below' 
                : 'Create a new ticket category for your department'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={departmentId}
                onValueChange={setDepartmentId}
                disabled={!!selectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter category name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a description for this category"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!name.trim() || !departmentId || isCreating || isUpdating}
            >
              {selectedCategory ? 'Update Category' : 'Create Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TicketCategoryComponent;