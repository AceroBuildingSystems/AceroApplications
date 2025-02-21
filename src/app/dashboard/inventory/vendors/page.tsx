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
import { VendorDocument } from '@/types';
import { ObjectId } from 'mongoose';

// Type that matches PageConfig's Record requirement
type VendorRecord = Record<string, string | number | object | Date | ObjectId>;

const page = () => {
    const { user } = useUserAuthorised();
    const { data: response, isLoading: vendorsLoading } = useGetMasterQuery({
        db: MONGO_MODELS.VENDOR_MASTER,
        sort: { name: -1 },
    });

    // Transform response data to match required Record type
    const vendors = React.useMemo(() => {
        const responseData = response as { data: VendorDocument[] } | VendorDocument[] | undefined;
        const rawData = Array.isArray(responseData) ? responseData : responseData?.data || [];
        return rawData.map((vendor) => ({
            _id: vendor._id,
            code: vendor.code,
            name: vendor.name,
            email: vendor?.contact?.email || "",
            phone: vendor?.contact?.phone || "",
            contactPerson: vendor?.contact?.address?.line1 || "",
            isActive: vendor.status === 'ACTIVE' ? 'Active' : 'Inactive',
        })) as VendorRecord[];
    }, [response]);

    const [createMaster] = useCreateMasterMutation();

    const statusData = [{ _id: true, name: 'Active' }, { _id: false, name: 'InActive' }];

    const [isDialogOpen, setDialogOpen] = useState(false);
    const [selectedMaster, setSelectedMaster] = useState("");
    const [initialData, setInitialData] = useState<Partial<VendorDocument>>({});
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
            label: 'Email',
            name: "contact.email",
            type: "email",
            required: true,
            placeholder: 'Email Address'
        },
        {
            label: 'Phone',
            name: "contact.phone",
            type: "text",
            required: true,
            placeholder: 'Phone Number'
        },
        {
            label: 'Address',
            name: "contact.address.line1",
            type: "textarea",
            required: true,
            placeholder: 'Primary Address'
        },
        {
            label: 'Status',
            name: "status",
            type: "select",
            data: [
                { _id: 'ACTIVE', name: 'Active' },
                { _id: 'INACTIVE', name: 'Inactive' }
            ],
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
            data: {
                ...formData,
                type: 'MANUFACTURER', // Default type
                contact: {
                    email: formData['contact.email'],
                    phone: formData['contact.phone'],
                    address: {
                        line1: formData['contact.address.line1'],
                    }
                }
            },
        };

        const response = await createMaster(formattedData);

        if ('data' in response && response.data?.status === SUCCESS) {
            toast.success(`Vendor ${action === 'Add' ? 'added' : 'updated'} successfully`);
            closeDialog();
        }

        if ('error' in response && response.error && 'data' in response.error) {
            const errorData = response.error.data as { message?: { message?: string } };
            if (errorData?.message?.message) {
                toast.error(`Error encountered: ${errorData.message.message}`);
            }
        }
    };

    const editVendor = (rowData: VendorRecord) => {
        setAction('Update');
        setInitialData({
            _id: rowData._id,
            code: rowData.code as string,
            name: rowData.name as string,
            contact: {
                email: rowData.email as string,
                phone: rowData.phone as string,
                address: {
                    line1: rowData.contactPerson as string,
                }
            },
            status: rowData.isActive === 'Active' ? 'ACTIVE' : 'INACTIVE'
        });
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
            accessorKey: "email",
            header: "Email",
        },
        {
            accessorKey: "phone",
            header: "Phone",
        },
        {
            accessorKey: "contactPerson",
            header: "Address",
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
                    {row.getValue("isActive")}
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
            data: vendors,
        },
        buttons: [
            { label: 'Add Vendor', action: handleAdd, icon: Plus, className: 'bg-primary' },
            { label: 'Import', action: handleImport, icon: Import },
            { label: 'Export', action: handleExport, icon: Download },
        ]
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Vendor Management</h2>
            </div>

            <MasterComponent config={config} loadingState={vendorsLoading} />

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
};

export default page;