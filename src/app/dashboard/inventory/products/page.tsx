"use client";

import React, { useState } from 'react';
import { useGetProductsQuery, useGetProductCategoriesQuery } from '@/services/endpoints/inventoryApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
    Package, 
    Users, 
    Plus,
    ArrowUpDown,
    Edit,
    Trash2,
    MoreHorizontal,
    FileText,
    History
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from '@/components/ui/checkbox';
import MasterComponent from '@/components/MasterComponent/MasterComponent';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProductForm from '@/components/InventoryComponent/ProductForm';
import { MONGO_MODELS, SUCCESS } from '@/shared/constants';
import { toast } from 'react-toastify';
import useUserAuthorised from '@/hooks/useUserAuthorised';

interface Product {
    _id: string;
    code: string;
    name: string;
    type: 'INVENTORY' | 'ASSET';
    category: {
        _id: string;
        name: string;
        specificationTemplate: {
            version: number;
            fields: Array<{
                name: string;
                type: string;
                isRequired: boolean;
                validation?: {
                    min?: number;
                    max?: number;
                };
                enumValues?: string[];
                unit?: string;
            }>;
        };
    };
    specifications: Record<string, any>;
    description?: string;
    isActive: boolean;
    inventory?: {
        availableQuantity: number;
        minQuantity: number;
        totalQuantity: number;
        warehouse: {
            _id: string;
            name: string;
        };
    };
    maintenance?: Array<{
        status: 'PENDING' | 'COMPLETED' | 'OVERDUE';
        date: string;
        notes?: string;
    }>;
}

type ProductType = 'INVENTORY' | 'ASSET';

interface ProductFormData extends Partial<Product> {
    type: ProductType;
}

export default function ProductsPage() {
    const { user } = useUserAuthorised();
    const [activeTab, setActiveTab] = useState<ProductType>('INVENTORY');
    const [showDialog, setShowDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductFormData | null>(null);
    const [action, setAction] = useState<'Add' | 'Edit'>('Add');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: products = [], isLoading: productsLoading } = useGetProductsQuery({});
    const { data: categories = [], isLoading: categoriesLoading } = useGetProductCategoriesQuery({});

    const inventoryProducts = products.filter(p => p.type === 'INVENTORY');
    const assetProducts = products.filter(p => p.type === 'ASSET');

    const statusData = [{ _id: true, name: 'Active' }, { _id: false, name: 'InActive' }];

    const handleAdd = (type: ProductType) => {
        setSelectedProduct({ type });
        setAction('Add');
        setShowDialog(true);
    };

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setAction('Edit');
        setShowDialog(true);
    };

    const handleSubmit = async (formData: any) => {
        setIsSubmitting(true);
        try {
            // Handle form submission
            toast.success(`${formData.type === 'INVENTORY' ? 'Product' : 'Asset'} ${action === 'Add' ? 'added' : 'updated'} successfully`);
            setShowDialog(false);
        } catch (error) {
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns = [
        {
            id: "select",
            header: ({ table }: { table: any }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }: { row: any }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "code",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span>Code</span>
                    <ArrowUpDown size={15} />
                </button>
            ),
            cell: ({ row }: { row: any }) => (
                <div className='text-blue-500' onClick={() => handleEdit(row.original)}>
                    {row.getValue("code")}
                </div>
            ),
        },
        {
            accessorKey: "name",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span>Name</span>
                    <ArrowUpDown size={15} />
                </button>
            ),
            cell: ({ row }: { row: any }) => (
                <div className='text-blue-500' onClick={() => handleEdit(row.original)}>
                    {row.getValue("name")}
                </div>
            ),
        },
        {
            accessorKey: "category.name",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span>Category</span>
                    <ArrowUpDown size={15} />
                </button>
            ),
            cell: ({ row }: { row: any }) => (
                <div>{row.original.category?.name}</div>
            ),
        },
        {
            accessorKey: "inventory.availableQuantity",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span>Available Quantity</span>
                    <ArrowUpDown size={15} />
                </button>
            ),
            cell: ({ row }: { row: any }) => (
                <div>{row.original.inventory?.availableQuantity || 0}</div>
            ),
        },
        {
            accessorKey: "inventory.warehouse.name",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span>Warehouse</span>
                    <ArrowUpDown size={15} />
                </button>
            ),
            cell: ({ row }: { row: any }) => (
                <div>{row.original.inventory?.warehouse?.name || '-'}</div>
            ),
        },
        {
            accessorKey: "isActive",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span>Status</span>
                    <ArrowUpDown size={15} />
                </button>
            ),
            cell: ({ row }: { row: any }) => (
                <div>
                    {statusData.find(status => status._id === row.getValue("isActive"))?.name}
                </div>
            ),
        },
        {
            id: "actions",
            cell: ({ row }: { row: any }) => {
                const product = row.original;
                
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(product)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <History className="mr-2 h-4 w-4" />
                                Transaction History
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const inventoryConfig = {
        searchFields: [
            { 
                key: "name", 
                label: 'name', 
                type: "text" as const, 
                placeholder: 'Search by name' 
            },
            { 
                key: "code", 
                label: 'code', 
                type: "text" as const, 
                placeholder: 'Search by code' 
            },
        ],
        filterFields: [
            {
                key: "isActive",
                label: "Status",
                type: "select" as const,
                placeholder: "Filter by status",
                options: ["Active", "Inactive"]
            },
            {
                key: "category",
                label: "Category",
                type: "select" as const,
                placeholder: "Filter by category",
                options: categories.map(c => c.name)
            }
        ],
        dataTable: {
            columns: columns,
            data: inventoryProducts,
        },
        buttons: [
            { 
                label: 'Add Inventory Item', 
                action: () => handleAdd('INVENTORY'), 
                icon: Plus, 
                className: 'bg-primary' 
            }
        ]
    };

    const assetConfig = {
        ...inventoryConfig,
        dataTable: {
            columns: columns.filter(c => !c.accessorKey?.includes('inventory')),
            data: assetProducts,
        },
        buttons: [
            { 
                label: 'Add Asset', 
                action: () => handleAdd('ASSET'), 
                icon: Plus, 
                className: 'bg-primary' 
            }
        ]
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Products & Assets</h2>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ProductType)}>
                <TabsList>
                    <TabsTrigger value="INVENTORY" className="flex items-center">
                        <Package className="mr-2 h-4 w-4" />
                        Inventory Items
                    </TabsTrigger>
                    <TabsTrigger value="ASSET" className="flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        Assets
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="INVENTORY">
                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory Items</CardTitle>
                            <CardDescription>
                                Manage your inventory items, stock levels, and warehouses
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MasterComponent config={inventoryConfig} loadingState={productsLoading} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="ASSET">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assets</CardTitle>
                            <CardDescription>
                                Manage your assets, assignments, and maintenance schedules
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MasterComponent config={assetConfig} loadingState={productsLoading} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {selectedProduct && (
                <Dialog open={showDialog} onOpenChange={setShowDialog}>
                    <DialogContent className="sm:max-w-[800px]">
                        <DialogHeader>
                            <DialogTitle>
                                {action} {selectedProduct.type === 'INVENTORY' ? 'Product' : 'Asset'}
                            </DialogTitle>
                        </DialogHeader>
                        <ProductForm
                            type={selectedProduct.type}
                            initialData={selectedProduct}
                            onSubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}