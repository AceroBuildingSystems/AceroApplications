"use client"

import React, { useEffect, useState } from 'react';
import MasterComponent from '@/components/MasterComponent/MasterComponent';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetMasterQuery, useCreateMasterMutation, MasterApiResponse } from '@/services/endpoints/masterApi';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';

interface CategoryFormData {
    name: string;
    code: string;
    description?: string;
    specsRequired: Record<string, "string" | "number" | "boolean">;
    isActive: boolean | string; // Can be string when coming from form
}

const ProductCategoriesPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<"Add" | "Update">("Add");
    const [selectedItem, setSelectedItem] = useState<CategoryFormData | null>(null);

    // API hooks
    const { data: categoriesResponse, isLoading } = useGetMasterQuery({
        db: "ProductCategory",
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
            placeholder: "Enter category name"
        },
        {
            name: "code",
            label: "Code",
            type: "text",
            required: true,
            placeholder: "Enter category code"
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Enter category description"
        },
        {
            name: "specsRequired",
            label: "Required Specifications",
            type: "custom",
            CustomComponent: ({ value, onChange }: any) => (
                <div className="space-y-2">
                    {Object.entries(value || {}).map(([key, type], index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="text"
                                value={key}
                                onChange={(e) => {
                                    const newSpecs = { ...value };
                                    delete newSpecs[key];
                                    newSpecs[e.target.value] = type;
                                    onChange(newSpecs);
                                }}
                                className="flex-1 px-2 py-1 border rounded"
                                placeholder="Specification name"
                            />
                            <select
                                value={type as string}
                                onChange={(e) => {
                                    const newSpecs = { ...value };
                                    newSpecs[key] = e.target.value as "string" | "number" | "boolean";
                                    onChange(newSpecs);
                                }}
                                className="px-2 py-1 border rounded"
                            >
                                <option value="string">Text</option>
                                <option value="number">Number</option>
                                <option value="boolean">Yes/No</option>
                            </select>
                            <button
                                onClick={() => {
                                    const newSpecs = { ...value };
                                    delete newSpecs[key];
                                    onChange(newSpecs);
                                }}
                                className="px-2 py-1 text-red-500 hover:text-red-700"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => {
                            const newSpecs = { ...value };
                            newSpecs[`spec${Object.keys(value || {}).length + 1}`] = "string";
                            onChange(newSpecs);
                        }}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Add Specification
                    </button>
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
            accessorKey: "description",
            header: "Description",
        },
        {
            accessorKey: "specsRequired",
            header: "Required Specifications",
            cell: ({ row }: any) => {
                const specs = row.original.specsRequired;
                return (
                    <div className="max-w-[300px] overflow-hidden text-ellipsis">
                        {Object.entries(specs || {}).map(([key, type]) => (
                            `${key}: ${type}`
                        )).join(", ")}
                    </div>
                );
            }
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
    const handleSave = async ({ formData, action }: { formData: CategoryFormData; action: string }) => {
        try {
            await createMaster({
                db: "ProductCategory",
                action: action.toLowerCase(),
                data: {
                    ...formData,
                    isActive: formData.isActive === "Active" // Convert string to boolean
                }
            }).unwrap();
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Error saving category:', error);
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
                key: "isActive",
                label: "Status",
                type: "select" as const,
                placeholder: "Filter by status",
                options: ["Active", "Inactive"]
            }
        ],
        dataTable: {
            columns: columns,
            data: (categoriesResponse?.data || []) as any[]
        },
        buttons: [
            {
                label: "Add New",
                action: () => {
                    setDialogAction("Add");
                    setSelectedItem({
                        name: '',
                        code: '',
                        description: '',
                        specsRequired: {},
                        isActive: "Active" // Set initial value as string
                    });
                    setIsDialogOpen(true);
                },
                icon: Plus,
                className: "bg-primary text-white hover:bg-primary/90"
            }
        ]
    };

    useEffect(() => {
        if (!isLoading) {
            setLoading(false);
        }
    }, [isLoading]);

    return (
        <div className="h-full">
            <MasterComponent config={pageConfig} loadingState={loading} />
            
            <DynamicDialog
                isOpen={isDialogOpen}
                closeDialog={() => setIsDialogOpen(false)}
                selectedMaster="Product Category"
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

export default ProductCategoriesPage;