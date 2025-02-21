"use client";

import React, { useState } from 'react';
import MasterComponent from '@/components/MasterComponent/MasterComponent';
import { useCreateMasterMutation, useGetMasterQuery } from '@/services/endpoints/masterApi';
import { Plus, Import, Download, Upload, ArrowUpDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { MONGO_MODELS, SUCCESS } from '@/shared/constants';
import { toast } from 'react-toastify';
import useUserAuthorised from '@/hooks/useUserAuthorised';
import { bulkImport } from '@/shared/functions';
import { ObjectId } from 'mongoose';

interface WarehouseData {
    _id: string;
    code: string;
    name: string;
    location?: {
        _id: string;
        name: string;
    };
    address?: string;
    capacity?: number;
    isActive: boolean;
    [key: string]: string | boolean | object | number | undefined; // Index signature for Record compatibility
}

interface ApiResponse {
    data?: WarehouseData[];
    status?: string;
    message?: string;
}

const page = () => {
    const { user, status, authenticated } = useUserAuthorised();
    const { data: response, isLoading: warehousesLoading } = useGetMasterQuery({
        db: MONGO_MODELS.WAREHOUSE_MASTER,
        sort: { name: -1 },
    });

    const { data: locationResponse } = useGetMasterQuery({
        db: MONGO_MODELS.LOCATION_MASTER,
        sort: { name: -1 },
    });

    // Handle both array and object response formats with proper type checking
    const warehouses = React.useMemo(() => {
        if (!response) return [];
        if (Array.isArray(response)) return response as WarehouseData[];
        const typedResponse = response as ApiResponse;
        return typedResponse.data || [];
    }, [response]);

    const locations = React.useMemo(() => {
        if (!locationResponse) return [];
        if (Array.isArray(locationResponse)) return locationResponse;
        const typedResponse = locationResponse as ApiResponse;
        return typedResponse.data || [];
    }, [locationResponse]);

    const [createMaster, { isLoading: isCreatingMaster }] = useCreateMasterMutation();

    const statusData = [{ _id: true, name: 'Active' }, { _id: false, name: 'InActive' }];

    const [isDialogOpen, setDialogOpen] = useState(false);
    const [selectedMaster, setSelectedMaster] = useState("");
    const [initialData, setInitialData] = useState<Partial<WarehouseData>>({});
    const [action, setAction] = useState('Add');

    const fields = [
        { 
            label: 'Code', 
            name: "code", 
            type: "text", 
            required: true, 
            placeholder: 'Warehouse Code' 
        },
        { 
            label: 'Name', 
            name: "name", 
            type: "text", 
            required: true, 
            placeholder: 'Warehouse Name' 
        },
        { 
            label: 'Location', 
            name: "location", 
            type: "select", 
            placeholder: 'Select Location', 
            format: 'ObjectId', 
            data: locations,
            required: true
        },
        { 
            label: 'Address', 
            name: "address", 
            type: "textarea", 
            placeholder: 'Warehouse Address' 
        },
        {
            label: 'Capacity',
            name: "capacity",
            type: "number",
            placeholder: 'Storage Capacity'
        },
        { 
            label: 'Status', 
            name: "isActive", 
            type: "select", 
            data: statusData, 
            placeholder: 'Select Status' 
        },
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
            db: MONGO_MODELS.WAREHOUSE_MASTER,
            action: action === 'Add' ? 'create' : 'update',
            filter: { "_id": formData._id },
            data: formData,
        };

        const response = await createMaster(formattedData);

        if ('data' in response && response.data?.status === SUCCESS) {
            toast.success(`Warehouse ${action === 'Add' ? 'added' : 'updated'} successfully`);
        }

        if ('error' in response && response.error && 'data' in response.error) {
            const errorData = response.error.data as { message?: { message?: string } };
            if (errorData?.message?.message) {
                toast.error(`Error encountered: ${errorData.message.message}`);
            }
        }
    };

    const editWarehouse = (rowData: WarehouseData) => {
        setAction('Update');
        setInitialData(rowData);
        openDialog("warehouse");
    };

    const handleAdd = () => {
        setInitialData({});
        setAction('Add');
        openDialog("warehouse");
    };

    const handleImport = () => {
        bulkImport({ 
            roleData: [], 
            continentData: [],
            regionData: [],
            countryData: [],
            action: "Add", 
            user, 
            createUser: createMaster, 
            db: MONGO_MODELS.WAREHOUSE_MASTER, 
            masterName: "Warehouse" 
        });
    };

    const handleExport = () => {
        // Handle export
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
            accessorKey: "code",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span>Code</span>
                    <ArrowUpDown size={15} />
                </button>
            ),
            cell: ({ row }: { row: any }) => (
                <div className='text-blue-500' onClick={() => editWarehouse(row.original)}>
                    {row.getValue("code")}
                </div>
            ),
        },
        {
            accessorKey: "name",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span>Name</span>
                    <ArrowUpDown size={15} />
                </button>
            ),
            cell: ({ row }: { row: any }) => (
                <div className='text-blue-500' onClick={() => editWarehouse(row.original)}>
                    {row.getValue("name")}
                </div>
            ),
        },
        {
            accessorKey: "location",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span>Location</span>
                    <ArrowUpDown size={15} />
                </button>
            ),
            cell: ({ row }: { row: any }) => (
                <div className='text-blue-500' onClick={() => editWarehouse(row.original)}>
                    {row.getValue("location")?.name}
                </div>
            ),
        },
        {
            accessorKey: "capacity",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span>Capacity</span>
                    <ArrowUpDown size={15} />
                </button>
            ),
            cell: ({ row }: { row: any }) => (
                <div>
                    {row.getValue("capacity")}
                </div>
            ),
        },
        {
            accessorKey: "isActive",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span>Status</span>
                    <ArrowUpDown size={15} />
                </button>
            ),
            cell: ({ row }: { row: any }) => (
                <div>
                    {statusData.find(status => status._id === row.getValue("isActive"))?.name}
                </div>
            ),
        },
    ];

    const config = {
        searchFields: [
            { 
                key: "name", 
                label: 'name', 
                type: "text" as const, 
                placeholder: 'Search by name' 
            },
            { 
                key: "code", 
                label: 'code', 
                type: "text" as const, 
                placeholder: 'Search by code' 
            },
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
            data: warehouses as Record<string, string | number | object | Date | ObjectId>[],
        },
        buttons: [
            { 
                label: 'Import', 
                action: handleImport, 
                icon: Import, 
                className: 'bg-blue-600 hover:bg-blue-700 duration-300' 
            },
            { 
                label: 'Export', 
                action: handleExport, 
                icon: Download, 
                className: 'bg-green-600 hover:bg-green-700 duration-300' 
            },
            { 
                label: 'Add', 
                action: handleAdd, 
                icon: Plus, 
                className: 'bg-sky-600 hover:bg-sky-700 duration-300' 
            },
        ]
    };

    return (
        <>
            <MasterComponent config={config} loadingState={warehousesLoading} />
            <DynamicDialog
                isOpen={isDialogOpen}
                closeDialog={closeDialog}
                selectedMaster={selectedMaster}
                onSave={saveData}
                fields={fields}
                initialData={initialData}
                action={action}
                height='auto'
                width='auto'
            />
        </>
    );
};

export default page;