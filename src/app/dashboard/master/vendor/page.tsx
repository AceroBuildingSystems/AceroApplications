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

interface VendorData {
    _id: string;
    code: string;
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
    taxId?: string;
    paymentTerms?: string;
    rating?: number;
    isActive: boolean;
    [key: string]: string | boolean | object | number | undefined; // Index signature for Record compatibility
}

interface ApiResponse {
    data?: VendorData[];
    status?: string;
    message?: string;
}

const page = () => {
    const { user, status, authenticated } = useUserAuthorised();
    const { data: response, isLoading: vendorsLoading } = useGetMasterQuery({
        db: MONGO_MODELS.VENDOR_MASTER,
        sort: { name: -1 },
    });

    // Handle both array and object response formats with proper type checking
    const vendors = React.useMemo(() => {
        if (!response) return [];
        if (Array.isArray(response)) return response as VendorData[];
        const typedResponse = response as ApiResponse;
        return typedResponse.data || [];
    }, [response]);

    const [createMaster, { isLoading: isCreatingMaster }] = useCreateMasterMutation();

    const statusData = [{ _id: true, name: 'Active' }, { _id: false, name: 'InActive' }];
    const ratingData = [
        { _id: 5, name: '5 - Excellent' },
        { _id: 4, name: '4 - Very Good' },
        { _id: 3, name: '3 - Good' },
        { _id: 2, name: '2 - Fair' },
        { _id: 1, name: '1 - Poor' }
    ];

    const [isDialogOpen, setDialogOpen] = useState(false);
    const [selectedMaster, setSelectedMaster] = useState("");
    const [initialData, setInitialData] = useState<Partial<VendorData>>({});
    const [action, setAction] = useState('Add');

    const fields = [
        { 
            label: 'Code', 
            name: "code", 
            type: "text", 
            required: true, 
            placeholder: 'Vendor Code' 
        },
        { 
            label: 'Name', 
            name: "name", 
            type: "text", 
            required: true, 
            placeholder: 'Vendor Name' 
        },
        { 
            label: 'Contact Person', 
            name: "contactPerson", 
            type: "text", 
            placeholder: 'Contact Person Name' 
        },
        { 
            label: 'Email', 
            name: "email", 
            type: "email", 
            placeholder: 'Email Address' 
        },
        { 
            label: 'Phone', 
            name: "phone", 
            type: "text", 
            placeholder: 'Phone Number' 
        },
        { 
            label: 'Address', 
            name: "address", 
            type: "textarea", 
            placeholder: 'Vendor Address' 
        },
        { 
            label: 'Tax ID', 
            name: "taxId", 
            type: "text", 
            placeholder: 'Tax ID/VAT Number' 
        },
        { 
            label: 'Payment Terms', 
            name: "paymentTerms", 
            type: "text", 
            placeholder: 'Payment Terms' 
        },
        { 
            label: 'Rating', 
            name: "rating", 
            type: "select", 
            data: ratingData, 
            placeholder: 'Select Rating' 
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
            db: MONGO_MODELS.VENDOR_MASTER,
            action: action === 'Add' ? 'create' : 'update',
            filter: { "_id": formData._id },
            data: formData,
        };

        const response = await createMaster(formattedData);

        if ('data' in response && response.data?.status === SUCCESS) {
            toast.success(`Vendor ${action === 'Add' ? 'added' : 'updated'} successfully`);
        }

        if ('error' in response && response.error && 'data' in response.error) {
            const errorData = response.error.data as { message?: { message?: string } };
            if (errorData?.message?.message) {
                toast.error(`Error encountered: ${errorData.message.message}`);
            }
        }
    };

    const editVendor = (rowData: VendorData) => {
        setAction('Update');
        setInitialData(rowData);
        openDialog("vendor");
    };

    const handleAdd = () => {
        setInitialData({});
        setAction('Add');
        openDialog("vendor");
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
            db: MONGO_MODELS.VENDOR_MASTER, 
            masterName: "Vendor" 
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
                <div className='text-blue-500' onClick={() => editVendor(row.original)}>
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
                <div className='text-blue-500' onClick={() => editVendor(row.original)}>
                    {row.getValue("name")}
                </div>
            ),
        },
        {
            accessorKey: "contactPerson",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span>Contact Person</span>
                    <ArrowUpDown size={15} />
                </button>
            ),
            cell: ({ row }: { row: any }) => (
                <div>
                    {row.getValue("contactPerson")}
                </div>
            ),
        },
        {
            accessorKey: "email",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span>Email</span>
                    <ArrowUpDown size={15} />
                </button>
            ),
            cell: ({ row }: { row: any }) => (
                <div>
                    {row.getValue("email")}
                </div>
            ),
        },
        {
            accessorKey: "phone",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span>Phone</span>
                    <ArrowUpDown size={15} />
                </button>
            ),
            cell: ({ row }: { row: any }) => (
                <div>
                    {row.getValue("phone")}
                </div>
            ),
        },
        {
            accessorKey: "rating",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span>Rating</span>
                    <ArrowUpDown size={15} />
                </button>
            ),
            cell: ({ row }: { row: any }) => (
                <div>
                    {ratingData.find(r => r._id === row.getValue("rating"))?.name}
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
            { 
                key: "email", 
                label: 'email', 
                type: "text" as const, 
                placeholder: 'Search by email' 
            },
        ],
        filterFields: [
            {
                key: "isActive",
                label: "Status",
                type: "select" as const,
                placeholder: "Filter by status",
                options: ["Active", "Inactive"]
            },
            {
                key: "rating",
                label: "Rating",
                type: "select" as const,
                placeholder: "Filter by rating",
                options: ["5", "4", "3", "2", "1"]
            }
        ],
        dataTable: {
            columns: columns,
            data: vendors as Record<string, string | number | object | Date | ObjectId>[],
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
            <MasterComponent config={config} loadingState={vendorsLoading} />
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