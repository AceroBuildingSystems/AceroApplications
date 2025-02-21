"use client";

import { type ColumnDef } from "@tanstack/react-table";
import React, { useState } from 'react';
import { useGetProductsQuery } from '@/services/endpoints/inventoryApi';
import { useGetMasterQuery } from '@/services/endpoints/masterApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import { Loader2, ArrowUpDown, UserCheck, Building2, History } from 'lucide-react';
import { DataTable } from '@/components/TableComponent/TableComponent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MONGO_MODELS } from '@/shared/constants';

interface Asset {
    _id: string;
    name: string;
    code: string;
    type: 'ASSET';
    category: {
        _id: string;
        name: string;
    };
    currentAssignment?: {
        assignedTo: {
            type: 'USER' | 'DEPARTMENT';
            _id: string;
            name: string;
        };
        assignedAt: string;
        dueDate?: string;
    };
}

interface User {
    _id: string;
    name: string;
    email: string;
}

interface Department {
    _id: string;
    name: string;
    code: string;
}

interface MasterResponse<T> {
    status: string;
    data: T[];
}

const AssignmentType = z.enum(['USER', 'DEPARTMENT']);
type AssignmentType = z.infer<typeof AssignmentType>;

const assignmentSchema = z.object({
    asset: z.string().min(1, 'Asset is required'),
    assignmentType: AssignmentType,
    assignedTo: z.string().min(1, 'Assignee is required'),
    dueDate: z.string().optional(),
    notes: z.string().optional(),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

interface AssignmentHistory {
    _id: string;
    asset: Asset;
    assignedTo: {
        type: 'USER' | 'DEPARTMENT';
        _id: string;
        name: string;
    };
    assignedAt: string;
    returnedAt: string;
    notes?: string;
}

export default function AssignmentPage() {
    const [showAssignDialog, setShowAssignDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
    
    const { data: assets = [] } = useGetProductsQuery({
        filter: { type: 'ASSET' }
    });

    const { data: usersData } = useGetMasterQuery<MasterResponse<User>>({
        db: MONGO_MODELS.USER_MASTER,
        sort: { name: -1 }
    });

    const { data: departmentsData } = useGetMasterQuery<MasterResponse<Department>>({
        db: MONGO_MODELS.DEPARTMENT_MASTER,
        sort: { name: -1 }
    });

    const form = useForm<AssignmentFormData>({
        resolver: zodResolver(assignmentSchema),
        defaultValues: {
            asset: '',
            assignmentType: 'USER',
            assignedTo: '',
            dueDate: '',
            notes: '',
        },
    });
    
    const users = usersData?.data || [];
    const departments = departmentsData?.data || [];

    const handleAssign = async (data: AssignmentFormData) => {
        setIsSubmitting(true);
        try {
            // Handle assignment
            toast.success('Asset assigned successfully');
            setShowAssignDialog(false);
            form.reset();
        } catch (error) {
            toast.error('Failed to assign asset');
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns: ColumnDef<Asset>[] = [
        {
            accessorKey: "code",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span>Asset Code</span>
                    <ArrowUpDown size={15} />
                </button>
            ),
        },
        {
            accessorKey: "name",
            header: "Asset Name",
        },
        {
            accessorKey: "category.name",
            header: "Category",
        },
        {
            accessorKey: "currentAssignment.assignedTo",
            header: "Assigned To",
            cell: ({ row }: { row: any }) => {
                const assignment = row.original.currentAssignment;
                if (!assignment) return '-';
                return (
                    <div className="flex items-center">
                        {assignment.assignedTo.type === 'USER' ? (
                            <UserCheck className="h-4 w-4 mr-2" />
                        ) : (
                            <Building2 className="h-4 w-4 mr-2" />
                        )}
                        {assignment.assignedTo.name}
                    </div>
                );
            },
        },
        {
            accessorKey: "currentAssignment.assignedAt",
            header: "Assigned Date",
            cell: ({ row }: { row: any }) => {
                const date = row.original.currentAssignment?.assignedAt;
                return date ? new Date(date).toLocaleDateString() : '-';
            },
        },
        {
            accessorKey: "currentAssignment.dueDate",
            header: "Due Date",
            cell: ({ row }: { row: any }) => {
                const date = row.original.currentAssignment?.dueDate;
                return date ? new Date(date).toLocaleDateString() : '-';
            },
        },
    ];

    const historyColumns: ColumnDef<AssignmentHistory>[] = [
        {
            accessorKey: "asset.code",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span>Asset Code</span>
                    <ArrowUpDown size={15} />
                </button>
            ),
        },
        {
            accessorKey: "asset.name",
            header: "Asset Name",
        },
        {
            accessorKey: "asset.category.name",
            header: "Category",
            cell: ({ row }: { row: any }) => {
                return (
                    <div>{row.original.asset.category.name}</div>
                );
            },
        },
        {
            accessorKey: "assignedTo",
            header: "Assigned To",
            cell: ({ row }: { row: any }) => (
                <div className="flex items-center">
                    {row.original.assignedTo.type === 'USER' ? (
                        <UserCheck className="h-4 w-4 mr-2" />
                    ) : (
                        <Building2 className="h-4 w-4 mr-2" />
                    )}
                    {row.original.assignedTo.name}
                </div>
            ),
        },
        {
            accessorKey: "assignedAt",
            header: "Assigned Date",
            cell: ({ row }: { row: any }) => new Date(row.original.assignedAt).toLocaleDateString(),
        },
        {
            accessorKey: "returnedAt",
            header: "Returned Date",
            cell: ({ row }: { row: any }) => new Date(row.original.returnedAt).toLocaleDateString(),
        },
        {
            accessorKey: "duration",
            header: "Duration",
            cell: ({ row }: { row: any }) => {
                const start = new Date(row.original.assignedAt);
                const end = new Date(row.original.returnedAt);
                const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                return `${days} days`;
            },
        },
    ];

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Asset Assignment</h2>
                <Button onClick={() => setShowAssignDialog(true)}>
                    Assign Asset
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'current' | 'history')}>
                <TabsList>
                    <TabsTrigger value="current" className="flex items-center">
                        <UserCheck className="mr-2 h-4 w-4" />
                        Current Assignments
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center">
                        <History className="mr-2 h-4 w-4" />
                        Assignment History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="current">
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Assignments</CardTitle>
                            <CardDescription>
                                View and manage current asset assignments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable 
                                columns={columns}
                                data={assets.filter((a: Asset) => a.currentAssignment)}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assignment History</CardTitle>
                            <CardDescription>
                                View historical asset assignments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable 
                                columns={historyColumns}
                                data={[]} // Will be populated with assignment history
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Assign Asset</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAssign)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="asset"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Asset</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select asset" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {assets
                                                    .filter((a: Asset) => !a.currentAssignment)
                                                    .map((asset: Asset) => (
                                                        <SelectItem key={asset._id} value={asset._id}>
                                                            {asset.name} ({asset.code})
                                                        </SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="assignmentType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assignment Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="USER">User</SelectItem>
                                                <SelectItem value="DEPARTMENT">Department</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="assignedTo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assign To</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select assignee" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {form.watch('assignmentType') === 'USER' ? (
                                                    users.map((user: User) => (
                                                        <SelectItem key={user._id} value={user._id}>
                                                            {user.name}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    departments.map((dept: Department) => (
                                                        <SelectItem key={dept._id} value={dept._id}>
                                                            {dept.name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Due Date (Optional)</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            When the asset should be returned
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes</FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                placeholder="Add any additional notes here"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Optional notes about this assignment
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowAssignDialog(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Assign Asset
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}