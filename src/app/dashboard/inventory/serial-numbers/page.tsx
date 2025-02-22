"use client";

import React, { useState } from 'react';
import MasterComponent from '@/components/MasterComponent/MasterComponent';
import { useCreateMasterMutation, useGetMasterQuery } from '@/services/endpoints/masterApi';
import { Plus, ArrowUpDown, User2, Building2, Tool } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { MONGO_MODELS, SUCCESS } from '@/shared/constants';
import { toast } from 'react-toastify';
import useUserAuthorised from '@/hooks/useUserAuthorised';

export default function SerialNumbersPage() {
    const { user } = useUserAuthorised();

    const { data: response, isLoading: serialNumbersLoading } = useGetMasterQuery({
        db: MONGO_MODELS.SERIAL_NUMBER_MASTER,
        sort: { serialNumber: -1 },
    });

    const { data: modelsResponse } = useGetMasterQuery({
        db: MONGO_MODELS.MODEL_MASTER,
        sort: { modelNumber: -1 },
    });

    const { data: usersResponse } = useGetMasterQuery({
        db: MONGO_MODELS.USER_MASTER,
        sort: { name: -1 },
    });

    const { data: departmentsResponse } = useGetMasterQuery({
        db: MONGO_MODELS.DEPARTMENT_MASTER,
        sort: { name: -1 },
    });

    const { data: warehousesResponse } = useGetMasterQuery({
        db: MONGO_MODELS.WAREHOUSE_MASTER,
        sort: { name: -1 },
    });

    const serialNumbers = response?.data || [];
    const models = modelsResponse?.data || [];
    const users = usersResponse?.data || [];
    const departments = departmentsResponse?.data || [];
    const warehouses = warehousesResponse?.data || [];

    const [createMaster] = useCreateMasterMutation();
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [selectedMaster, setSelectedMaster] = useState("");
    const [initialData, setInitialData] = useState({});
    const [action, setAction] = useState('Add');

    const fields = [
        {
            label: 'Serial Number',
            name: "serialNumber",
            type: "text",
            required: true,
            placeholder: 'Serial Number'
        },
        {
            label: 'Model',
            name: "modelMaster",
            type: "select",
            required: true,
            data: models,
            placeholder: 'Select Model'
        },
        {
            label: 'Status',
            name: "status",
            type: "select",
            required: true,
            data: [
                { _id: 'AVAILABLE', name: 'Available' },
                { _id: 'ASSIGNED', name: 'Assigned' },
                { _id: 'IN_MAINTENANCE', name: 'In Maintenance' },
                { _id: 'DAMAGED', name: 'Damaged' },
                { _id: 'RETIRED', name: 'Retired' }
            ],
            placeholder: 'Select Status'
        },
        {
            label: 'Warehouse',
            name: "location.warehouse",
            type: "select",
            data: warehouses,
            placeholder: 'Select Warehouse'
        },
        {
            label: 'Location Details',
            name: "location.specificLocation",
            type: "text",
            placeholder: 'Specific Location (e.g., Rack A-123)'
        },
        {
            label: 'Purchase Date',
            name: "purchaseInfo.purchaseDate",
            type: "date",
            required: true
        },
        {
            label: 'Warranty Expiry',
            name: "purchaseInfo.warrantyExpiry",
            type: "date"
        },
        {
            label: 'Notes',
            name: "notes",
            type: "textarea",
            placeholder: 'Additional Notes'
        }
    ];

    const openDialog = (masterType: string) => {
        setSelectedMaster(masterType);
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setSelectedMaster("");
    };

    const saveData = async ({ formData, action }: { formData: any; action: string }) => {
        const formattedData = {
            db: MONGO_MODELS.SERIAL_NUMBER_MASTER,
            action: action === 'Add' ? 'create' : 'update',
            filter: { "_id": formData._id },
            data: formData,
        };

        const response = await createMaster(formattedData);

        if ('data' in response && response.data?.status === SUCCESS) {
            toast.success(`Serial Number ${action === 'Add' ? 'added' : 'updated'} successfully`);
            closeDialog();
        }

        if ('error' in response && response.error && 'data' in response.error) {
            const errorData = response.error.data as { message?: { message?: string } };
            if (errorData?.message?.message) {
                toast.error(`Error encountered: ${errorData.message.message}`);
            }
        }
    };

    const editSerialNumber = (rowData: any) => {
        setAction('Update');
        setInitialData(rowData);
        openDialog("serialNumber");
    };

    const handleAdd = () => {
        setInitialData({});
        setAction('Add');
        openDialog("serialNumber");
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
            cell: ({ row }: { row: any }) => (
                <div className='text-blue-500' onClick={() => editSerialNumber(row.original)}>
                    {row.getValue("serialNumber")}
                </div>
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
            header: "Assignment",
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
            accessorKey: "location",
            header: "Location",
            cell: ({ row }: { row: any }) => {
                const location = row.original.location;
                if (!location?.warehouse) return '-';
                return (
                    <div>
                        {location.warehouse.name}
                        {location.specificLocation && (
                            <span className="text-gray-500 text-sm"> ({location.specificLocation})</span>
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
                key: "modelMaster",
                label: "Model",
                type: "select" as const,
                placeholder: "Filter by model",
                options: models.map(m => m.modelNumber)
            },
            {
                key: "status",
                label: "Status",
                type: "select" as const,
                placeholder: "Filter by status",
                options: ["AVAILABLE", "ASSIGNED", "IN_MAINTENANCE", "DAMAGED", "RETIRED"]
            },
            {
                key: "location.warehouse",
                label: "Warehouse",
                type: "select" as const,
                placeholder: "Filter by warehouse",
                options: warehouses.map(w => w.name)
            }
        ],
        dataTable: {
            columns: columns,
            data: serialNumbers,
        },
        buttons: [
            { label: 'Add Serial Number', action: handleAdd, icon: Plus, className: 'bg-primary' }
        ]
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Serial Numbers</h2>
                    <p className="text-muted-foreground">
                        Manage individual units and their assignments
                    </p>
                </div>
            </div>

            <MasterComponent config={config} loadingState={serialNumbersLoading} />

            <DynamicDialog
                isOpen={isDialogOpen}
                closeDialog={closeDialog}
                selectedMaster={selectedMaster}
                onSave={saveData}
                fields={fields}
                initialData={initialData}
                action={action}
                height="auto"
                width="600px"
            />
        </div>
    );
}