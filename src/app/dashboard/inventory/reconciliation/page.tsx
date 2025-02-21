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
import { Loader2, ArrowUpDown, Plus, Minus } from 'lucide-react';
import { DataTable } from '@/components/TableComponent/TableComponent';

interface WarehouseInventory {
    warehouse: {
        _id: string;
        name: string;
    };
    availableQuantity: number;
    minQuantity: number;
    totalQuantity: number;
}

interface Product {
    _id: string;
    name: string;
    code: string;
    type: 'INVENTORY' | 'ASSET';
    inventory?: WarehouseInventory[];
}

const reconciliationSchema = z.object({
    warehouse: z.string().min(1, 'Warehouse is required'),
    product: z.string().min(1, 'Product is required'),
    systemQuantity: z.number(),
    actualQuantity: z.number().min(0, 'Quantity cannot be negative'),
    reason: z.string().min(1, 'Reason is required'),
    notes: z.string().optional(),
});

export default function ReconciliationPage() {
    const [showReconcileDialog, setShowReconcileDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    
    const { data: products = [] } = useGetProductsQuery({
        filter: { type: 'INVENTORY' }
    });
    const { data: warehouses = [] } = useGetWarehousesQuery({});

    const form = useForm({
        resolver: zodResolver(reconciliationSchema),
        defaultValues: {
            warehouse: '',
            product: '',
            systemQuantity: 0,
            actualQuantity: 0,
            reason: '',
            notes: '',
        },
    });

    // Watch for product and warehouse changes to update system quantity
    const watchWarehouse = form.watch('warehouse');
    const watchProduct = form.watch('product');

    React.useEffect(() => {
        if (watchProduct && watchWarehouse) {
            const product = products.find((p: Product) => p._id === watchProduct);
            const warehouseStock = product?.inventory?.find(
                (i: WarehouseInventory) => i.warehouse._id === watchWarehouse
            );
            if (warehouseStock) {
                form.setValue('systemQuantity', warehouseStock.availableQuantity);
                setSelectedProduct(product);
            }
        }
    }, [watchProduct, watchWarehouse, products, form]);

    const handleReconcile = async (data: z.infer<typeof reconciliationSchema>) => {
        setIsSubmitting(true);
        try {
            // Handle reconciliation
            toast.success('Stock reconciliation completed successfully');
            setShowReconcileDialog(false);
            form.reset();
        } catch (error) {
            toast.error('Failed to reconcile stock');
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
            accessorKey: "warehouse.name",
            header: "Warehouse",
        },
        {
            accessorKey: "systemQuantity",
            header: "System Quantity",
        },
        {
            accessorKey: "actualQuantity",
            header: "Actual Quantity",
        },
        {
            accessorKey: "difference",
            header: "Difference",
            cell: ({ row }: { row: any }) => {
                const diff = row.original.actualQuantity - row.original.systemQuantity;
                return (
                    <div className={`flex items-center ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : ''}`}>
                        {diff > 0 ? <Plus className="h-4 w-4 mr-1" /> : diff < 0 ? <Minus className="h-4 w-4 mr-1" /> : null}
                        {Math.abs(diff)}
                    </div>
                );
            },
        },
        {
            accessorKey: "reason",
            header: "Reason",
        },
    ];

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Stock Reconciliation</h2>
                <Button onClick={() => setShowReconcileDialog(true)}>
                    New Reconciliation
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Reconciliation History</CardTitle>
                    <CardDescription>
                        View and manage stock reconciliation records
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable 
                        columns={columns}
                        data={[]} // Will be populated with reconciliation history
                    />
                </CardContent>
            </Card>

            <Dialog open={showReconcileDialog} onOpenChange={setShowReconcileDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Stock Reconciliation</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleReconcile)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="warehouse"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Warehouse</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select warehouse" />
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
                                                {products.map((product: Product) => (
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

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="systemQuantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>System Quantity</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number"
                                                    {...field}
                                                    disabled
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Current quantity in system
                                            </FormDescription>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="actualQuantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Actual Quantity</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number"
                                                    min={0}
                                                    {...field}
                                                    onChange={e => field.onChange(parseInt(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Physical count
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="reason"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reason</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select reason" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="PHYSICAL_COUNT">Physical Count</SelectItem>
                                                <SelectItem value="DAMAGED">Damaged Stock</SelectItem>
                                                <SelectItem value="EXPIRED">Expired Stock</SelectItem>
                                                <SelectItem value="THEFT">Theft/Loss</SelectItem>
                                                <SelectItem value="SYSTEM_ERROR">System Error</SelectItem>
                                                <SelectItem value="OTHER">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                                            Optional notes about this reconciliation
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowReconcileDialog(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Submit Reconciliation
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}