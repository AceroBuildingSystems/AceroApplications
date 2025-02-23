"use client"

import React, { useEffect, useState } from 'react';
import MasterComponent from '@/components/MasterComponent/MasterComponent';
import { Plus, UserPlus, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetMasterQuery, useCreateMasterMutation } from '@/services/endpoints/masterApi';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { MONGO_MODELS } from '@/shared/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AssignmentFormData {
    _id: string;
    assignedTo: string;
    assignedType: 'user' | 'department';
    location?: string;
    remarks?: string;
}

const AssetManagementPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<"Assign" | "Return">("Assign");
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // API hooks
    const { data: assetsResponse, isLoading: assetsLoading } = useGetMasterQuery({
        db: MONGO_MODELS.ASSET_MASTER,
        filter: { isActive: true },
        populate: ['product', 'warehouse', 'vendor']
    });

    const { data: usersResponse } = useGetMasterQuery({
        db: MONGO_MODELS.USER_MASTER,
        filter: { isActive: true }
    });

    const { data: departmentsResponse } = useGetMasterQuery({
        db: MONGO_MODELS.DEPARTMENT_MASTER,
        filter: { isActive: true }
    });

    const [createMaster] = useCreateMasterMutation();

    // Form fields for assignment
    const assignmentFields = [
        {
            name: "_id",
            type: "hidden"
        },
        {
            name: "assignedType",
            label: "Assign To",
            type: "select",
            required: true,
            options: ["user", "department"]
        },
        {
            name: "assignedTo",
            label: "Select User/Department",
            type: "select",
            required: true,
            data: selectedItem?.assignedType === 'user' 
                ? usersResponse?.data?.map((user: any) => ({
                    name: `${user.firstName} ${user.lastName}`,
                    _id: user._id
                })) || []
                : departmentsResponse?.data?.map((dept: any) => ({
                    name: dept.name,
                    _id: dept._id
                })) || []
        },
        {
            name: "location",
            label: "Location",
            type: "text",
            placeholder: "Enter location"
        },
        {
            name: "remarks",
            label: "Remarks",
            type: "textarea",
            placeholder: "Enter any remarks"
        }
    ];

    // Configure table columns
    const columns = [
        {
            accessorKey: "serialNumber",
            header: "Serial Number",
        },
        {
            accessorKey: "product",
            header: "Product",
            cell: ({ row }: any) => `${row.original.product?.name} (${row.original.product?.code})`
        },
        {
            accessorKey: "warehouse",
            header: "Warehouse",
            cell: ({ row }: any) => row.original.warehouse?.name || ''
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }: any) => (
                <div className={`px-2 py-1 rounded-full text-center ${
                    row.original.status === 'available' ? 'bg-green-100 text-green-800' :
                    row.original.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                    row.original.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                }`}>
                    {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
                </div>
            )
        },
        {
            accessorKey: "currentAssignment",
            header: "Current Assignment",
            cell: ({ row }: any) => {
                const assignment = row.original.currentAssignment;
                if (!assignment) return '-';
                return (
                    <div>
                        <div>{assignment.assignedTo}</div>
                        <div className="text-sm text-gray-500">
                            {new Date(assignment.assignedDate).toLocaleDateString()}
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: "actions",
            header: "Actions",
            cell: ({ row }: any) => (
                <div className="flex gap-2">
                    {row.original.status === 'available' && (
                        <Button
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAssign(row.original);
                            }}
                        >
                            <UserPlus className="h-4 w-4" />
                        </Button>
                    )}
                    {row.original.status === 'assigned' && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleReturn(row.original);
                            }}
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            )
        }
    ];

    const handleAssign = (asset: any) => {
        setDialogAction("Assign");
        setSelectedItem({
            _id: asset._id,
            assignedType: 'user'
        });
        setIsDialogOpen(true);
    };

    const handleReturn = async (asset: any) => {
        try {
            await createMaster({
                db: MONGO_MODELS.ASSET_MASTER,
                action: 'update',
                filter: { _id: asset._id },
                data: {
                    status: 'available',
                    currentAssignment: null
                }
            });
        } catch (error) {
            console.error('Error returning asset:', error);
        }
    };

    // Handle dialog save
    const handleSave = async ({ formData, action }: { formData: AssignmentFormData; action: string }) => {
        try {
            await createMaster({
                db: MONGO_MODELS.ASSET_MASTER,
                action: 'update',
                filter: { _id: formData._id },
                data: {
                    status: 'assigned',
                    currentAssignment: {
                        assignedTo: formData.assignedTo,
                        assignedType: formData.assignedType,
                        assignedDate: new Date(),
                        location: formData.location,
                        remarks: formData.remarks
                    }
                }
            });
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Error assigning asset:', error);
        }
    };

    // Configure page layout
    const pageConfig = {
        searchFields: [
            {
                key: "serialNumber",
                label: "serialNumber",
                type: "text" as const,
                placeholder: "Search by serial number..."
            }
        ],
        filterFields: [
            {
                key: "product",
                label: "Product",
                type: "select" as const,
                placeholder: "Filter by product",
                options: assetsResponse?.data?.map((asset: any) => asset.product?.name) || []
            },
            {
                key: "status",
                label: "Status",
                type: "select" as const,
                placeholder: "Filter by status",
                options: ["available", "assigned", "maintenance", "retired"]
            }
        ],
        dataTable: {
            columns: columns,
            data: (assetsResponse?.data || []) as any[],
            onRowClick: (row: any) => {
                // Show assignment history or details
                console.log('Asset details:', row.original);
            }
        }
    };

    useEffect(() => {
        if (!assetsLoading) {
            setLoading(false);
        }
    }, [assetsLoading]);

    return (
        <div className="h-full">
            <MasterComponent config={pageConfig} loadingState={loading} />
            
            <DynamicDialog<AssignmentFormData>
                isOpen={isDialogOpen}
                closeDialog={() => setIsDialogOpen(false)}
                selectedMaster="Asset Assignment"
                onSave={handleSave}
                fields={assignmentFields}
                initialData={selectedItem || {}}
                action={dialogAction}
                height="auto"
                width="full"
            />
        </div>
    );
};

export default AssetManagementPage;