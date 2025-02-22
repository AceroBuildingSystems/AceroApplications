"use client"

import React, { useEffect, useState } from 'react';
import MasterComponent from '@/components/MasterComponent/MasterComponent';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetMasterQuery, useCreateMasterMutation } from '@/services/endpoints/masterApi';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';

interface StorageSection {
    name: string;
    code: string;
    capacity: number;
    unit: string;
    description?: string;
}

interface WarehouseFormData {
    name: string;
    code: string;
    location: string;
    contactPerson: string;
    contactNumber: string;
    storageSections: StorageSection[];
    totalCapacity: number;
    capacityUnit: string;
    operatingHours?: string;
    isActive: string;
}

const WarehousesPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<"Add" | "Update">("Add");
    const [selectedItem, setSelectedItem] = useState<WarehouseFormData | null>(null);

    // API hooks
    const { data: warehousesResponse, isLoading: warehousesLoading } = useGetMasterQuery({
        db: "Warehouse",
        filter: { isActive: true }
    });

    const { data: locationsResponse } = useGetMasterQuery({
        db: "Location",
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
            placeholder: "Enter warehouse name"
        },
        {
            name: "code",
            label: "Code",
            type: "text",
            required: true,
            placeholder: "Enter warehouse code"
        },
        {
            name: "location",
            label: "Location",
            type: "select",
            required: true,
            options: locationsResponse?.data?.map((loc: any) => ({
                label: loc.name,
                value: loc._id
            })) || []
        },
        {
            name: "contactPerson",
            label: "Contact Person",
            type: "text",
            required: true,
            placeholder: "Enter contact person name"
        },
        {
            name: "contactNumber",
            label: "Contact Number",
            type: "text",
            required: true,
            placeholder: "Enter contact number"
        },
        {
            name: "storageSections",
            label: "Storage Sections",
            type: "custom",
            CustomComponent: ({ value = [], onChange }: any) => (
                <div className="space-y-2">
                    {value.map((section: StorageSection, index: number) => (
                        <div key={index} className="p-2 border rounded space-y-2">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={section.name}
                                    onChange={(e) => {
                                        const newSections = [...value];
                                        newSections[index] = { ...section, name: e.target.value };
                                        onChange(newSections);
                                    }}
                                    className="flex-1 px-2 py-1 border rounded"
                                    placeholder="Section name"
                                />
                                <input
                                    type="text"
                                    value={section.code}
                                    onChange={(e) => {
                                        const newSections = [...value];
                                        newSections[index] = { ...section, code: e.target.value };
                                        onChange(newSections);
                                    }}
                                    className="w-24 px-2 py-1 border rounded"
                                    placeholder="Code"
                                />
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={section.capacity}
                                    onChange={(e) => {
                                        const newSections = [...value];
                                        newSections[index] = { ...section, capacity: Number(e.target.value) };
                                        onChange(newSections);
                                    }}
                                    className="w-24 px-2 py-1 border rounded"
                                    placeholder="Capacity"
                                />
                                <input
                                    type="text"
                                    value={section.unit}
                                    onChange={(e) => {
                                        const newSections = [...value];
                                        newSections[index] = { ...section, unit: e.target.value };
                                        onChange(newSections);
                                    }}
                                    className="w-24 px-2 py-1 border rounded"
                                    placeholder="Unit"
                                />
                                <button
                                    onClick={() => {
                                        const newSections = value.filter((_: any, i: number) => i !== index);
                                        onChange(newSections);
                                    }}
                                    className="px-2 py-1 text-red-500 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </div>
                            <input
                                type="text"
                                value={section.description || ''}
                                onChange={(e) => {
                                    const newSections = [...value];
                                    newSections[index] = { ...section, description: e.target.value };
                                    onChange(newSections);
                                }}
                                className="w-full px-2 py-1 border rounded"
                                placeholder="Description"
                            />
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => {
                            onChange([
                                ...value,
                                {
                                    name: '',
                                    code: '',
                                    capacity: 0,
                                    unit: '',
                                    description: ''
                                }
                            ]);
                        }}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Add Section
                    </button>
                </div>
            )
        },
        {
            name: "totalCapacity",
            label: "Total Capacity",
            type: "number",
            required: true,
            placeholder: "Enter total capacity"
        },
        {
            name: "capacityUnit",
            label: "Capacity Unit",
            type: "text",
            required: true,
            placeholder: "Enter capacity unit"
        },
        {
            name: "operatingHours",
            label: "Operating Hours",
            type: "text",
            placeholder: "Enter operating hours"
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
            accessorKey: "location",
            header: "Location",
            cell: ({ row }: any) => row.original.location?.name || ''
        },
        {
            accessorKey: "contactPerson",
            header: "Contact Person",
        },
        {
            accessorKey: "contactNumber",
            header: "Contact Number",
        },
        {
            accessorKey: "totalCapacity",
            header: "Total Capacity",
            cell: ({ row }: any) => `${row.original.totalCapacity} ${row.original.capacityUnit}`
        },
        {
            accessorKey: "storageSections",
            header: "Storage Sections",
            cell: ({ row }: any) => row.original.storageSections?.length || 0
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
    const handleSave = async ({ formData, action }: { formData: WarehouseFormData; action: string }) => {
        try {
            await createMaster({
                db: "Warehouse",
                action: action.toLowerCase(),
                data: {
                    ...formData,
                    isActive: formData.isActive === "Active"
                }
            }).unwrap();
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Error saving warehouse:', error);
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
                key: "location",
                label: "Location",
                type: "select" as const,
                placeholder: "Filter by location",
                options: locationsResponse?.data?.map((loc: any) => loc.name) || []
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
            data: (warehousesResponse?.data || []) as any[]
        },
        buttons: [
            {
                label: "Add New",
                action: () => {
                    setDialogAction("Add");
                    setSelectedItem({
                        name: '',
                        code: '',
                        location: '',
                        contactPerson: '',
                        contactNumber: '',
                        storageSections: [],
                        totalCapacity: 0,
                        capacityUnit: '',
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
        if (!warehousesLoading) {
            setLoading(false);
        }
    }, [warehousesLoading]);

    return (
        <div className="h-full">
            <MasterComponent config={pageConfig} loadingState={loading} />
            
            <DynamicDialog
                isOpen={isDialogOpen}
                closeDialog={() => setIsDialogOpen(false)}
                selectedMaster="Warehouse"
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

export default WarehousesPage;