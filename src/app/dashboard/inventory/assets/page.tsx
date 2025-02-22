"use client";

import React, { useState } from 'react';
import MasterComponent from '@/components/MasterComponent/MasterComponent';
import { useCreateMasterMutation, useGetMasterQuery } from '@/services/endpoints/masterApi';
import { ArrowUpDown, User2, Building2, History, Wrench } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { MONGO_MODELS, SUCCESS } from '@/shared/constants';
import { toast } from 'react-toastify';
import useUserAuthorised from '@/hooks/useUserAuthorised';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AssetsPage() {
    const { user } = useUserAuthorised();
    const [activeTab, setActiveTab] = useState('current');

    const { data: serialNumbersResponse, isLoading: serialNumbersLoading } = useGetMasterQuery({
        db: MONGO_MODELS.SERIAL_NUMBER_MASTER,
        sort: { serialNumber: -1 },
    });

    const { data: usersResponse } = useGetMasterQuery({
        db: MONGO_MODELS.USER_MASTER,
        sort: { name: -1 },
    });

    const { data: departmentsResponse } = useGetMasterQuery({
        db: MONGO_MODELS.DEPARTMENT_MASTER,
        sort: { name: -1 },
    });

    const serialNumbers = serialNumbersResponse?.data || [];
    const users = usersResponse?.data || [];
    const departments = departmentsResponse?.data || [];

    const [createMaster] = useCreateMasterMutation();
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [selectedMaster, setSelectedMaster] = useState("");
    const [initialData, setInitialData] = useState({});
    const [action, setAction] = useState('Add');

    const assignmentFields = [
        {
            label: 'Assignment Type',
            name: "currentAssignment.type",
            type: "select",
            required: true,
            data: [
                { _id: 'USER', name: 'User' },
                { _id: 'DEPARTMENT', name: 'Department' }
            ],
            placeholder: 'Select Assignment Type'
        },
        {
            label: 'User',
            name: "currentAssignment.user",
            type: "select",
            data: users,
            placeholder: 'Select User',
            dependsOn: {
                field: "currentAssignment.type",
                value: "USER"
            }
        },
        {
            label: 'Department',
            name: "currentAssignment.department",
            type: "select",
            data: departments,
            placeholder: 'Select Department',
            dependsOn: {
                field: "currentAssignment.type",
                value: "DEPARTMENT"
            }
        },
        {
            label: 'Notes',
            name: "currentAssignment.notes",
            type: "textarea",
            placeholder: 'Assignment Notes'
        }
    ];

    const maintenanceFields = [
        {
            label: 'Type',
            name: "maintenanceRecord.type",
            type: "select",
            required: true,
            data: [
                { _id: 'SCHEDULED', name: 'Scheduled' },
                { _id: 'REPAIR', name: 'Repair' },
                { _id: 'UPGRADE', name: 'Upgrade' },
                { _id: 'OTHER', name: 'Other' }
            ],
            placeholder: 'Select Maintenance Type'
        },
        {
            label: 'Date',
            name: "maintenanceRecord.date",
            type: "date",
            required: true
        },
        {
            label: 'Description',
            name: "maintenanceRecord.description",
            type: "textarea",
            required: true,
            placeholder: 'Maintenance Details'
        },
        {
            label: 'Cost',
            name: "maintenanceRecord.cost",
            type: "number",
            placeholder: 'Maintenance Cost'
        }
    ];

    const openDialog = (masterType: string, data = {}) => {
        setSelectedMaster(masterType);
        setInitialData(data);
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setSelectedMaster("");
    };

    const handleAssignment = async ({ formData }: { formData: any }) => {
        const serialNumber = initialData as any;
        
        const formattedData = {
            db: MONGO_MODELS.SERIAL_NUMBER_MASTER,
            action: 'update',
            filter: { "_id": serialNumber._id },
            data: {
                ...serialNumber,
                currentAssignment: {
                    type: formData.currentAssignment.type,
                    user: formData.currentAssignment.user,
                    department: formData.currentAssignment.department,
                    assignedAt: new Date(),
                    assignedBy: user?._id,
                    notes: formData.currentAssignment.notes
                },
                status: 'ASSIGNED'
            },
        };

        const response = await createMaster(formattedData);

        if ('data' in response && response.data?.status === SUCCESS) {
            toast.success('Asset assigned successfully');
            closeDialog();
        }

        if ('error' in response && response.error && 'data' in response.error) {
            const errorData = response.error.data as { message?: { message?: string } };
            if (errorData?.message?.message) {
                toast.error(`Error encountered: ${errorData.message.message}`);
            }
        }
    };

    const handleMaintenance = async ({ formData }: { formData: any }) => {
        const serialNumber = initialData as any;
        
        const formattedData = {
            db: MONGO_MODELS.SERIAL_NUMBER_MASTER,
            action: 'update',
            filter: { "_id": serialNumber._id },
            data: {
                ...serialNumber,
                maintenanceHistory: [
                    ...(serialNumber.maintenanceHistory || []),
                    {
                        ...formData.maintenanceRecord,
                        performedBy: user?._id
                    }
                ],
                status: 'IN_MAINTENANCE'
            },
        };

        const response = await createMaster(formattedData);

        if ('data' in response && response.data?.status === SUCCESS) {
            toast.success('Maintenance record added successfully');
            closeDialog();
        }

        if ('error' in response && response.error && 'data' in response.error) {
            const errorData = response.error.data as { message?: { message?: string } };
            if (errorData?.message?.message) {
                toast.error(`Error encountered: ${errorData.message.message}`);
            }
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
            accessorKey: "serialNumber",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span>Serial Number</span>
                    <ArrowUpDown size={15} />
                </button>
            ),
        },
        {
            accessorKey: "modelMaster.modelNumber",
            header: "Model Number",
        },
        {
            accessorKey: "modelMaster.name",
            header: "Model Name",
        },
        {
            accessorKey: "currentAssignment",
            header: "Current Assignment",
            cell: ({ row }: { row: any }) => {
                const assignment = row.original.currentAssignment;
                if (!assignment) return '-';
                return (
                    <div className="flex items-center space-x-2">
                        {assignment.type === 'USER' ? (
                            <>
                                <User2 size={14} />
                                <span>{assignment.user?.name}</span>
                            </>
                        ) : (
                            <>
                                <Building2 size={14} />
                                <span>{assignment.department?.name}</span>
                            </>
                        )}
                    </div>
                );
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }: { row: any }) => (
                <div className={`px-2 py-1 rounded-full text-xs inline-block
                    ${row.getValue("status") === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 
                      row.getValue("status") === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                      row.getValue("status") === 'IN_MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                      row.getValue("status") === 'DAMAGED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'}`}>
                    {row.getValue("status")}
                </div>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }: { row: any }) => (
                <div className="flex space-x-2">
                    <button
                        className="p-2 hover:bg-gray-100 rounded-full"
                        onClick={() => openDialog('assign', row.original)}
                        title="Assign Asset"
                    >
                        <User2 size={16} />
                    </button>
                    <button
                        className="p-2 hover:bg-gray-100 rounded-full"
                        onClick={() => openDialog('maintenance', row.original)}
                        title="Add Maintenance Record"
                    >
                        <Wrench size={16} />
                    </button>
                    <button
                        className="p-2 hover:bg-gray-100 rounded-full"
                        onClick={() => openDialog('history', row.original)}
                        title="View History"
                    >
                        <History size={16} />
                    </button>
                </div>
            ),
        },
    ];

    const config = {
        searchFields: [
            {
                key: "serialNumber",
                label: 'serialNumber',
                type: "text" as const,
                placeholder: 'Search by serial number'
            },
            {
                key: "modelMaster.modelNumber",
                label: 'modelNumber',
                type: "text" as const,
                placeholder: 'Search by model number'
            }
        ],
        filterFields: [
            {
                key: "status",
                label: "Status",
                type: "select" as const,
                placeholder: "Filter by status",
                options: ["AVAILABLE", "ASSIGNED", "IN_MAINTENANCE", "DAMAGED", "RETIRED"]
            }
        ],
        dataTable: {
            columns: columns,
            data: serialNumbers,
        }
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Asset Management</h2>
                    <p className="text-muted-foreground">
                        Manage asset assignments, maintenance, and track history
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="current" className="flex items-center">
                        <User2 className="mr-2 h-4 w-4" />
                        Current Assets
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center">
                        <History className="mr-2 h-4 w-4" />
                        Assignment History
                    </TabsTrigger>
                    <TabsTrigger value="maintenance" className="flex items-center">
                        <Wrench className="mr-2 h-4 w-4" />
                        Maintenance Records
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="current">
                    <MasterComponent config={config} loadingState={serialNumbersLoading} />
                </TabsContent>

                <TabsContent value="history">
                    {/* Assignment History Table */}
                </TabsContent>

                <TabsContent value="maintenance">
                    {/* Maintenance Records Table */}
                </TabsContent>
            </Tabs>

            <DynamicDialog
                isOpen={isDialogOpen}
                closeDialog={closeDialog}
                selectedMaster={selectedMaster}
                onSave={selectedMaster === 'maintenance' ? handleMaintenance : handleAssignment}
                fields={selectedMaster === 'maintenance' ? maintenanceFields : assignmentFields}
                initialData={initialData}
                action={action}
                height="auto"
                width="600px"
            />
        </div>
    );
}