"use client"

import React, { useEffect, useState } from 'react';
import MasterComponent from '@/components/MasterComponent/MasterComponent';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetMasterQuery, useCreateMasterMutation } from '@/services/endpoints/masterApi';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';

interface ProductFormData {
    name: string;
    code: string;
    category: string;
    brand: string;
    model: string;
    specifications: Record<string, string | number | boolean>;
    description?: string;
    unitOfMeasure: string;
    minimumStockLevel?: number;
    maximumStockLevel?: number;
    reorderPoint?: number;
    unitCost?: number;
    vendor: string;
    alternateVendors?: string[];
    warranty?: {
        duration: number;
        unit: string;
        description?: string;
    };
    isActive: string;
}

const ProductsPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<"Add" | "Update">("Add");
    const [selectedItem, setSelectedItem] = useState<ProductFormData | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);

    // API hooks
    const { data: productsResponse, isLoading: productsLoading } = useGetMasterQuery({
        db: "Product",
        filter: { isActive: true }
    });

    const { data: categoriesResponse } = useGetMasterQuery({
        db: "ProductCategory",
        filter: { isActive: true }
    });

    const { data: vendorsResponse } = useGetMasterQuery({
        db: "Vendor",
        filter: { isActive: true }
    });

    const [createMaster] = useCreateMasterMutation();

    // Form fields configuration
    const formFields = [
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
            options: categoriesResponse?.data?.map((cat: any) => ({
                label: cat.name,
                value: cat._id
            })) || [],
            onChange: (value: string) => {
                const category = categoriesResponse?.data?.find((cat: any) => cat._id === value);
                setSelectedCategory(category);
            }
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
            name: "specifications",
            label: "Specifications",
            type: "custom",
            CustomComponent: ({ value, onChange }: any) => {
                if (!selectedCategory) return <div>Please select a category first</div>;
                
                return (
                    <div className="space-y-2">
                        {Object.entries(selectedCategory.specsRequired || {}).map(([key, type]) => (
                            <div key={key} className="flex gap-2 items-center">
                                <label className="w-1/3">{key}:</label>
                                {type === "boolean" ? (
                                    <select
                                        value={value?.[key] || "false"}
                                        onChange={(e) => {
                                            onChange({
                                                ...value,
                                                [key]: e.target.value === "true"
                                            });
                                        }}
                                        className="flex-1 px-2 py-1 border rounded"
                                    >
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                    </select>
                                ) : (
                                    <input
                                        type={type === "number" ? "number" : "text"}
                                        value={value?.[key] || ""}
                                        onChange={(e) => {
                                            onChange({
                                                ...value,
                                                [key]: type === "number" ? Number(e.target.value) : e.target.value
                                            });
                                        }}
                                        className="flex-1 px-2 py-1 border rounded"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                );
            }
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
            options: vendorsResponse?.data?.map((vendor: any) => ({
                label: vendor.name,
                value: vendor._id
            })) || []
        },
        {
            name: "alternateVendors",
            label: "Alternate Vendors",
            type: "multiselect",
            options: vendorsResponse?.data?.map((vendor: any) => ({
                label: vendor.name,
                value: vendor._id
            })) || []
        },
        {
            name: "warranty",
            label: "Warranty",
            type: "custom",
            CustomComponent: ({ value, onChange }: any) => (
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={value?.duration || ""}
                            onChange={(e) => onChange({
                                ...value,
                                duration: Number(e.target.value)
                            })}
                            className="w-24 px-2 py-1 border rounded"
                            placeholder="Duration"
                        />
                        <select
                            value={value?.unit || "months"}
                            onChange={(e) => onChange({
                                ...value,
                                unit: e.target.value
                            })}
                            className="px-2 py-1 border rounded"
                        >
                            <option value="months">Months</option>
                            <option value="years">Years</option>
                        </select>
                    </div>
                    <textarea
                        value={value?.description || ""}
                        onChange={(e) => onChange({
                            ...value,
                            description: e.target.value
                        })}
                        className="w-full px-2 py-1 border rounded"
                        placeholder="Warranty description"
                    />
                </div>
            )
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
            accessorKey: "specifications",
            header: "Specifications",
            cell: ({ row }: any) => {
                const specs = row.original.specifications;
                return (
                    <div className="max-w-[300px] overflow-hidden text-ellipsis">
                        {Object.entries(specs || {}).map(([key, value]) => (
                            `${key}: ${value}`
                        )).join(", ")}
                    </div>
                );
            }
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
                db: "Product",
                action: action.toLowerCase(),
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
            data: (productsResponse?.data || []) as any[]
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
                        specifications: {},
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
            
            <DynamicDialog
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