"use client"

import React, { useEffect, useState } from 'react';
import MasterComponent from '@/components/MasterComponent/MasterComponent';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetMasterQuery, useCreateMasterMutation } from '@/services/endpoints/masterApi';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { MONGO_MODELS } from '@/shared/constants';

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

    // Form fields configuration
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
            placeholder: "Enter product name"
        },
        {
            name: "code",
            label: "Code",
            type: "text",
            required: true,
            placeholder: "Enter product code"
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
            placeholder: "Enter brand name"
        },
        {
            name: "model",
            label: "Model",
            type: "text",
            required: true,
            placeholder: "Enter model number"
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Enter product description"
        },
        {
            name: "unitOfMeasure",
            label: "Unit of Measure",
            type: "text",
            required: true,
            placeholder: "Enter unit of measure"
        },
        {
            name: "minimumStockLevel",
            label: "Minimum Stock Level",
            type: "number",
            placeholder: "Enter minimum stock level"
        },
        {
            name: "maximumStockLevel",
            label: "Maximum Stock Level",
            type: "number",
            placeholder: "Enter maximum stock level"
        },
        {
            name: "reorderPoint",
            label: "Reorder Point",
            type: "number",
            placeholder: "Enter reorder point"
        },
        {
            name: "unitCost",
            label: "Unit Cost",
            type: "number",
            placeholder: "Enter unit cost"
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
            })) || []
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
            cell: ({ row }: any) => row.original.category?.name || ''
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
            cell: ({ row }: any) => row.original.vendor?.name || ''
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