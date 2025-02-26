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
import { validate } from '@/shared/functions';

interface ProductFormData {
    _id?: string;
    name: string;
    category: string;
    brand: string;
    model: string;
    description?: string;
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
        populate: ['category']
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
    const statusData = [
        { _id: true, name: "True" },
        { _id: false, name: "False" },
      ];
    // Form fields configuration with validation
    const formFields = [
        {
            name: "name",
            label: "Name",
            type: "text",
            required: true,
            placeholder: "Enter product name",
            validate: validate.text
        },
   
        {
            name: "category",
            label: "Category",
            type: "select",
            placeholder: "Select category",
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
            validate: validate.textSmall
        },
        {
            name: "model",
            label: "Model",
            type: "text",
            required: true,
            placeholder: "Enter model number",
            validate: validate.textSmall
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Enter product description",
            validate: validate.desription
        },
        {
            name: "isActive",
            label: "Status",
            type: "select",
            placeholder: "Enter the status ",
            data: statusData,
            required: true
        }
    ];

    const editProducts = (data: any) => {
        setSelectedItem(data)
        setDialogAction("Update");
        setIsDialogOpen(true);
    }

    // Configure table columns
    const columns = [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }: any) => (
                <div className='text-red-700' onClick={() => editProducts(row.original)}>
                    {row.original.name}
                </div>
            )
        },
        {
            accessorKey: "description",
            header: "Description",
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
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }: any) => (
                <div className={`px-2 py-1 rounded-full text-center ${row.original.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {row.original.isActive ? 'Active' : 'Inactive'}
                </div>
            )
        }
    ];

    // Handle dialog save
    const handleSave = async ({ formData, action }: { formData: ProductFormData; action: string }) => {
        try {
           const response = await createMaster({
                db: MONGO_MODELS.PRODUCT_MASTER,
                action: action === 'Add' ? 'create' : 'update',
                filter: formData._id ? { _id: formData._id } : undefined,
                data: {
                    ...formData,
                    isActive: formData.isActive ?? true
                }
            }).unwrap();

            return response;
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
        <div className="h-full w-full">
            <MasterComponent config={pageConfig} loadingState={loading} />
            
            <DynamicDialog<ProductFormData>
                isOpen={isDialogOpen}
                closeDialog={() => {
                    setSelectedItem(null)
                    setIsDialogOpen(false)
                }}
                selectedMaster="Product"
                onSave={handleSave}
                fields={formFields}
                initialData={selectedItem || {}}
                action={dialogAction}
                height="auto"
            />
        </div>
    );
};

export default ProductsPage;