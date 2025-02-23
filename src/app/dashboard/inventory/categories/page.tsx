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

interface CategoryFormData {
    _id?: string;
    name: string;
    code: string;
    description?: string;
    specsRequired: Record<string, "string" | "number" | "boolean">;
    isActive: string;
}

const SpecificationsComponent = ({ accessData, handleChange }: { accessData: Record<string, "string" | "number" | "boolean">; handleChange: (e: { target: { value: any } }, fieldName: string) => void }) => {
    const [specs, setSpecs] = useState<Record<string, "string" | "number" | "boolean">>(accessData || {});
    const [newSpecName, setNewSpecName] = useState('');
    const [newSpecType, setNewSpecType] = useState<"string" | "number" | "boolean">("string");

    useEffect(() => {
        setSpecs(accessData || {});
    }, [accessData]);

    const updateSpecs = (newSpecs: Record<string, "string" | "number" | "boolean">) => {
        setSpecs(newSpecs);
        handleChange({ target: { value: newSpecs } }, "specsRequired");
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                {Object.entries(specs).map(([key, type], index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <span className="flex-1">{key}</span>
                        <span className="text-gray-500">{String(type)}</span>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                const newSpecs = { ...specs };
                                delete newSpecs[key];
                                updateSpecs(newSpecs);
                            }}
                        >
                            Remove
                        </Button>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <Input
                    type="text"
                    value={newSpecName}
                    onChange={(e) => setNewSpecName(e.target.value)}
                    placeholder="Specification name"
                    className="flex-1"
                />
                <select
                    value={newSpecType}
                    onChange={(e) => setNewSpecType(e.target.value as "string" | "number" | "boolean")}
                    className="px-2 py-1 border rounded"
                >
                    <option value="string">Text</option>
                    <option value="number">Number</option>
                    <option value="boolean">Yes/No</option>
                </select>
                <Button
                    type="button"
                    onClick={() => {
                        if (newSpecName.trim()) {
                            updateSpecs({
                                ...specs,
                                [newSpecName]: newSpecType
                            });
                            setNewSpecName('');
                            setNewSpecType("string");
                        }
                    }}
                    disabled={!newSpecName.trim()}
                >
                    Add Specification
                </Button>
            </div>
        </div>
    );
};

const ProductCategoriesPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<"Add" | "Update">("Add");
    const [selectedItem, setSelectedItem] = useState<CategoryFormData | null>(null);

    // API hooks
    const { data: categoriesResponse, isLoading } = useGetMasterQuery({
        db: MONGO_MODELS.PRODUCT_CATEGORY_MASTER,
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
            CustomComponent: SpecificationsComponent
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
                const specs = row.original.specsRequired as Record<string, string>;
                if (!specs) return null;
                return (
                    <div className="max-w-[300px] overflow-hidden text-ellipsis">
                        {Object.entries(specs).map(([key, type]) => 
                            `${key}: ${String(type)}`
                        ).join(", ")}
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
                db: MONGO_MODELS.PRODUCT_CATEGORY_MASTER,
                action: action === 'Add' ? 'create' : 'update',
                filter: formData._id ? { _id: formData._id } : undefined,
                data: {
                    ...formData,
                    isActive: formData.isActive === "Active"
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
            data: (categoriesResponse?.data || []) as any[],
            onRowClick: (row: any) => {
                setDialogAction("Update");
                setSelectedItem({
                    ...row.original,
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
                        description: '',
                        specsRequired: {},
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
        if (!isLoading) {
            setLoading(false);
        }
    }, [isLoading]);

    return (
        <div className="h-full">
            <MasterComponent config={pageConfig} loadingState={loading} />
            
            <DynamicDialog<CategoryFormData>
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