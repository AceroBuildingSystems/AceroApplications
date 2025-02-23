"use client"

import React, { useEffect, useState } from 'react';
import MasterComponent from '@/components/MasterComponent/MasterComponent';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetMasterQuery, useCreateMasterMutation } from '@/services/endpoints/masterApi';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { MONGO_MODELS } from '@/shared/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface ProductFormData {
    _id?: string;
    name: string;
    code: string;
    category: string;
    brand: string;
    model: string;
    description?: string;
    unitOfMeasure: string;
    minimumStockLevel?: number;
    maximumStockLevel?: number;
    reorderPoint?: number;
    unitCost?: number;
    vendor: string;
    alternateVendors?: string[];
    isActive: string;
}

const ProductsPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<"Add" | "Update">("Add");
    const [selectedItem, setSelectedItem] = useState<ProductFormData | null>(null);

    // API hooks
    const { data: productsResponse, isLoading: productsLoading } = useGetMasterQuery({
        db: MONGO_MODELS.PRODUCT_MASTER,
        filter: { isActive: true },
        populate: ['category', 'vendor']
    });

    const { data: categoriesResponse } = useGetMasterQuery({
        db: MONGO_MODELS.PRODUCT_CATEGORY_MASTER,
        filter: { isActive: true }
    });

    const { data: vendorsResponse } = useGetMasterQuery({
        db: MONGO_MODELS.VENDOR_MASTER,
        filter: { isActive: true }
    });

    const [createMaster] = useCreateMasterMutation();

    // Form fields configuration with validation
    const formFields = [
        {
            name: "_id",
            type: "hidden"
        },
        {
            name: "name",
            label: "Name",
            type: "text",
            required: true,
            placeholder: "Enter product name",
            validate: (value: string) => {
                if (value.length < 3) return "Name must be at least 3 characters";
                if (value.length > 100) return "Name must be less than 100 characters";
                return undefined;
            }
        },
        {
            name: "code",
            label: "Code",
            type: "text",
            required: true,
            placeholder: "Enter product code",
            validate: (value: string) => {
                if (!/^[A-Z0-9-]+$/.test(value)) return "Code must contain only uppercase letters, numbers, and hyphens";
                if (value.length < 2) return "Code must be at least 2 characters";
                if (value.length > 20) return "Code must be less than 20 characters";
                return undefined;
            }
        },
        {
            name: "category",
            label: "Category",
            type: "select",
            required: true,
            data: categoriesResponse?.data?.map((cat: any) => ({
                name: cat.name,
                _id: cat._id
            })) || []
        },
        {
            name: "brand",
            label: "Brand",
            type: "text",
            required: true,
            placeholder: "Enter brand name",
            validate: (value: string) => {
                if (value.length < 2) return "Brand must be at least 2 characters";
                if (value.length > 50) return "Brand must be less than 50 characters";
                return undefined;
            }
        },
        {
            name: "model",
            label: "Model",
            type: "text",
            required: true,
            placeholder: "Enter model number",
            validate: (value: string) => {
                if (value.length < 2) return "Model must be at least 2 characters";
                if (value.length > 50) return "Model must be less than 50 characters";
                return undefined;
            }
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Enter product description",
            validate: (value: string) => {
                if (value && value.length > 1000) return "Description must be less than 1000 characters";
                return undefined;
            }
        },
        {
            name: "unitOfMeasure",
            label: "Unit of Measure",
            type: "text",
            required: true,
            placeholder: "Enter unit of measure",
            validate: (value: string) => {
                if (value.length < 1) return "Unit of measure is required";
                if (value.length > 20) return "Unit of measure must be less than 20 characters";
                return undefined;
            }
        },
        {
            name: "minimumStockLevel",
            label: "Minimum Stock Level",
            type: "number",
            placeholder: "Enter minimum stock level",
            validate: (value: number, formData: ProductFormData) => {
                if (value < 0) return "Minimum stock level cannot be negative";
                if (formData.maximumStockLevel && value >= formData.maximumStockLevel) {
                    return "Minimum stock level must be less than maximum stock level";
                }
                return undefined;
            }
        },
        {
            name: "maximumStockLevel",
            label: "Maximum Stock Level",
            type: "number",
            placeholder: "Enter maximum stock level",
            validate: (value: number, formData: ProductFormData) => {
                if (value < 0) return "Maximum stock level cannot be negative";
                if (formData.minimumStockLevel && value <= formData.minimumStockLevel) {
                    return "Maximum stock level must be greater than minimum stock level";
                }
                return undefined;
            }
        },
        {
            name: "reorderPoint",
            label: "Reorder Point",
            type: "number",
            placeholder: "Enter reorder point",
            validate: (value: number, formData: ProductFormData) => {
                if (value < 0) return "Reorder point cannot be negative";
                if (formData.minimumStockLevel && value < formData.minimumStockLevel) {
                    return "Reorder point should be at least the minimum stock level";
                }
                if (formData.maximumStockLevel && value > formData.maximumStockLevel) {
                    return "Reorder point cannot be greater than maximum stock level";
                }
                return undefined;
            }
        },
        {
            name: "unitCost",
            label: "Unit Cost",
            type: "number",
            placeholder: "Enter unit cost",
            validate: (value: number) => {
                if (value < 0) return "Unit cost cannot be negative";
                if (value > 999999999) return "Unit cost is too high";
                return undefined;
            }
        },
        {
            name: "vendor",
            label: "Primary Vendor",
            type: "select",
            required: true,
            data: vendorsResponse?.data?.map((vendor: any) => ({
                name: vendor.name,
                _id: vendor._id
            })) || []
        },
        {
            name: "alternateVendors",
            label: "Alternate Vendors",
            type: "multiselect",
            data: vendorsResponse?.data?.map((vendor: any) => ({
                label: vendor.name,
                value: vendor._id
            })) || [],
            validate: (value: string[], formData: ProductFormData) => {
                if (value.includes(formData.vendor)) {
                    return "Primary vendor cannot be an alternate vendor";
                }
                return undefined;
            }
        },
        {
            name: "isActive",
            label: "Status",
            type: "select",
            options: ["Active", "Inactive"],
            required: true
        }
    ];

    // Configure table columns
    const columns = [
        {
            accessorKey: "name",
            header: "Name",
        },
        {
            accessorKey: "code",
            header: "Code",
        },
        {
            accessorKey: "category",
            header: "Category",
            cell: ({ row }: any) => (
                <Badge variant="outline">
                    {row.original.category?.name || ''}
                </Badge>
            )
        },
        {
            accessorKey: "brand",
            header: "Brand",
        },
        {
            accessorKey: "model",
            header: "Model",
        },
        {
            accessorKey: "vendor",
            header: "Primary Vendor",
            cell: ({ row }: any) => (
                <Badge variant="secondary">
                    {row.original.vendor?.name || ''}
                </Badge>
            )
        },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }: any) => (
                <Badge variant={row.original.isActive ? "default" : "destructive"}>
                    {row.original.isActive ? 'Active' : 'Inactive'}
                </Badge>
            )
        }
    ];

    // Handle dialog save
    const handleSave = async ({ formData, action }: { formData: ProductFormData; action: string }) => {
        try {
            await createMaster({
                db: MONGO_MODELS.PRODUCT_MASTER,
                action: action === 'Add' ? 'create' : 'update',
                filter: formData._id ? { _id: formData._id } : undefined,
                data: {
                    ...formData,
                    isActive: formData.isActive === "Active"
                }
            }).unwrap();
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    // Configure page layout
    const pageConfig = {
        searchFields: [
            {
                key: "name",
                label: "name",
                type: "text" as const,
                placeholder: "Search by name..."
            }
        ],
        filterFields: [
            {
                key: "category",
                label: "Category",
                type: "select" as const,
                placeholder: "Filter by category",
                options: categoriesResponse?.data?.map((cat: any) => cat.name) || []
            },
            {
                key: "isActive",
                label: "Status",
                type: "select" as const,
                placeholder: "Filter by status",
                options: ["Active", "Inactive"]
            }
        ],
        dataTable: {
            columns: columns,
            data: (productsResponse?.data || []) as any[],
            onRowClick: (row: any) => {
                setDialogAction("Update");
                setSelectedItem({
                    ...row.original,
                    category: row.original.category?._id,
                    vendor: row.original.vendor?._id,
                    alternateVendors: row.original.alternateVendors?.map((v: any) => v._id),
                    isActive: row.original.isActive ? "Active" : "Inactive"
                });
                setIsDialogOpen(true);
            }
        },
        buttons: [
            {
                label: "Add New",
                action: () => {
                    setDialogAction("Add");
                    setSelectedItem({
                        name: '',
                        code: '',
                        category: '',
                        brand: '',
                        model: '',
                        unitOfMeasure: '',
                        vendor: '',
                        isActive: "Active"
                    });
                    setIsDialogOpen(true);
                },
                icon: Plus,
                className: "bg-primary text-white hover:bg-primary/90"
            }
        ]
    };

    useEffect(() => {
        if (!productsLoading) {
            setLoading(false);
        }
    }, [productsLoading]);

    return (
        <div className="h-full">
            <MasterComponent config={pageConfig} loadingState={loading} />
            
            <DynamicDialog<ProductFormData>
                isOpen={isDialogOpen}
                closeDialog={() => setIsDialogOpen(false)}
                selectedMaster="Product"
                onSave={handleSave}
                fields={formFields}
                initialData={selectedItem || {}}
                action={dialogAction}
                height="auto"
                width="full"
            />
        </div>
    );
};

export default ProductsPage;