"use client"

import React, { useEffect, useState } from 'react';
import MasterComponent from '@/components/MasterComponent/MasterComponent';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetMasterQuery, useCreateMasterMutation } from '@/services/endpoints/masterApi';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { MONGO_MODELS } from '@/shared/constants';

interface WarehouseFormData {
    _id?: string;
    name: string;
    code: string;
    location: string;
    contactPerson: string;
    contactNumber: string;
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
        db: MONGO_MODELS.WAREHOUSE_MASTER,
        filter: { isActive: true }
    });

    const { data: locationsResponse } = useGetMasterQuery({
        db: MONGO_MODELS.LOCATION_MASTER,
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
            data: locationsResponse?.data?.map((loc: any) => ({
                name: loc.name,
                _id: loc._id
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
                db: MONGO_MODELS.WAREHOUSE_MASTER,
                action: action === 'Add' ? 'create' : 'update',
                filter: formData._id ? { _id: formData._id } : undefined,
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
            data: (warehousesResponse?.data || []) as any[],
            onRowClick: (row: any) => {
                setDialogAction("Update");
                setSelectedItem({
                    ...row.original,
                    location: row.original.location?._id,
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
                        location: '',
                        contactPerson: '',
                        contactNumber: '',
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
            
            <DynamicDialog<WarehouseFormData>
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