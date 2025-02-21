"use client";

import React, { useState } from 'react';
import { useGetProductsQuery, useGetWarehousesQuery } from '@/services/endpoints/inventoryApi';
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
import { Loader2, ArrowUpDown } from 'lucide-react';
import { DataTable } from '@/components/TableComponent/TableComponent';

const transferSchema = z.object({
    product: z.string().min(1, 'Product is required'),
    fromWarehouse: z.string().min(1, 'Source warehouse is required'),
    toWarehouse: z.string().min(1, 'Destination warehouse is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    notes: z.string().optional(),
}).refine(data => data.fromWarehouse !== data.toWarehouse, {
    message: "Source and destination warehouses must be different",
    path: ["toWarehouse"],
});

export default function TransferPage() {
    const [showTransferDialog, setShowTransferDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data: products = [] } = useGetProductsQuery({
        filter: { type: 'INVENTORY' }
    });
    const { data: warehouses = [] } = useGetWarehousesQuery({});

    const form = useForm({
        resolver: zodResolver(transferSchema),
        defaultValues: {
            product: '',
            fromWarehouse: '',
            toWarehouse: '',
            quantity: 1,
            notes: '',
        },
    });

    const handleTransfer = async (data: z.infer<typeof transferSchema>) => {
        setIsSubmitting(true);
        try {
            // Handle transfer
            toast.success('Stock transfer initiated successfully');
            setShowTransferDialog(false);
            form.reset();
        } catch (error) {
            toast.error('Failed to initiate transfer');
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns = [
        {
            accessorKey: "createdAt",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span>Date</span>
                    <ArrowUpDown size={15} />
                </button>
            ),
        },
        {
            accessorKey: "product.name",
            header: "Product",
        },
        {
            accessorKey: "fromWarehouse.name",
            header: "From Warehouse",
        },
        {
            accessorKey: "toWarehouse.name",
            header: "To Warehouse",
        },
        {
            accessorKey: "quantity",
            header: "Quantity",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }: { row: any }) => (
                <div className={`px-2 py-1 rounded-full text-xs inline-block
                    ${row.getValue("status") === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                      row.getValue("status") === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {row.getValue("status")}
                </div>
            ),
        },
    ];

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Stock Transfer</h2>
                <Button onClick={() => setShowTransferDialog(true)}>
                    New Transfer
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Transfers</CardTitle>
                    <CardDescription>
                        View and manage stock transfers between warehouses
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable 
                        columns={columns}
                        data={[]} // Will be populated with transfer history
                    />
                </CardContent>
            </Card>

            <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>New Stock Transfer</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleTransfer)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="product"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select product" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {products.map((product: any) => (
                                                    <SelectItem key={product._id} value={product._id}>
                                                        {product.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="fromWarehouse"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>From Warehouse</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select source warehouse" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {warehouses.map((warehouse: any) => (
                                                    <SelectItem key={warehouse._id} value={warehouse._id}>
                                                        {warehouse.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="toWarehouse"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>To Warehouse</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select destination warehouse" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {warehouses.map((warehouse: any) => (
                                                    <SelectItem key={warehouse._id} value={warehouse._id}>
                                                        {warehouse.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number" 
                                                min={1}
                                                {...field}
                                                onChange={e => field.onChange(parseInt(e.target.value))}
                                            />
                                        </FormControl>
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
                                            Optional notes about this transfer
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowTransferDialog(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Initiate Transfer
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}