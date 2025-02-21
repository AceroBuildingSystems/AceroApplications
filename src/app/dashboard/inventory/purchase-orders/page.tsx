"use client";

import React, { useState } from 'react';
import MasterComponent from '@/components/MasterComponent/MasterComponent';
import { useCreateMasterMutation, useGetMasterQuery } from '@/services/endpoints/masterApi';
import { Plus, Import, Download, ArrowUpDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { MONGO_MODELS, SUCCESS } from '@/shared/constants';
import { toast } from 'react-toastify';
import useUserAuthorised from '@/hooks/useUserAuthorised';

const page = () => {
    const { user } = useUserAuthorised();
    const { data: response, isLoading: ordersLoading } = useGetMasterQuery({
        db: MONGO_MODELS.PURCHASE_ORDER_MASTER,
        sort: { createdAt: -1 },
    });

    const { data: vendorsResponse } = useGetMasterQuery({
        db: MONGO_MODELS.VENDOR_MASTER,
        sort: { name: -1 }
    });

    const { data: productsResponse } = useGetMasterQuery({
        db: MONGO_MODELS.PRODUCT_MASTER,
        sort: { name: -1 }
    });

    const orders = response?.data || [];
    const vendors = vendorsResponse?.data || [];
    const products = productsResponse?.data || [];

    const [createMaster] = useCreateMasterMutation();

    const statusData = [
        { _id: 'DRAFT', name: 'Draft' },
        { _id: 'PENDING', name: 'Pending' },
        { _id: 'APPROVED', name: 'Approved' },
        { _id: 'RECEIVED', name: 'Received' },
        { _id: 'CANCELLED', name: 'Cancelled' }
    ];

    const [isDialogOpen, setDialogOpen] = useState(false);
    const [selectedMaster, setSelectedMaster] = useState("");
    const [initialData, setInitialData] = useState({});
    const [action, setAction] = useState('Add');

    const fields = [
        {
            label: 'PO Number',
            name: "poNumber",
            type: "text",
            required: true,
            placeholder: 'Auto-generated'
        },
        {
            label: 'Vendor',
            name: "vendor",
            type: "select",
            required: true,
            data: vendors,
            placeholder: 'Select Vendor'
        },
        {
            label: 'Order Date',
            name: "orderDate",
            type: "date",
            required: true
        },
        {
            label: 'Expected Delivery',
            name: "expectedDelivery",
            type: "date",
            required: true
        },
        {
            label: 'Status',
            name: "status",
            type: "select",
            data: statusData,
            placeholder: 'Select Status'
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
            db: MONGO_MODELS.PURCHASE_ORDER_MASTER,
            action: action === 'Add' ? 'create' : 'update',
            filter: { "_id": formData._id },
            data: {
                ...formData,
                status: formData.status || 'DRAFT',
                items: [], // Will be managed in a separate dialog
                totalAmount: 0,
                createdBy: user?._id
            },
        };

        const response = await createMaster(formattedData);

        if ('data' in response && response.data?.status === SUCCESS) {
            toast.success(`Purchase Order ${action === 'Add' ? 'created' : 'updated'} successfully`);
            closeDialog();
        }

        if ('error' in response && response.error && 'data' in response.error) {
            const errorData = response.error.data as { message?: { message?: string } };
            if (errorData?.message?.message) {
                toast.error(`Error encountered: ${errorData.message.message}`);
            }
        }
    };

    const editOrder = (rowData: any) => {
        setAction('Update');
        setInitialData(rowData);
        openDialog("purchaseOrder");
    };

    const handleAdd = () => {
        setInitialData({});
        setAction('Add');
        openDialog("purchaseOrder");
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
            accessorKey: "poNumber",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span>PO Number</span>
                    <ArrowUpDown size={15} />
                </button>
            ),
            cell: ({ row }: { row: any }) => (
                <div className='text-blue-500' onClick={() => editOrder(row.original)}>
                    {row.getValue("poNumber")}
                </div>
            ),
        },
        {
            accessorKey: "vendor.name",
            header: "Vendor",
        },
        {
            accessorKey: "orderDate",
            header: "Order Date",
            cell: ({ row }: { row: any }) => {
                const date = row.getValue("orderDate");
                return date ? new Date(date).toLocaleDateString() : '-';
            },
        },
        {
            accessorKey: "expectedDelivery",
            header: "Expected Delivery",
            cell: ({ row }: { row: any }) => {
                const date = row.getValue("expectedDelivery");
                return date ? new Date(date).toLocaleDateString() : '-';
            },
        },
        {
            accessorKey: "totalAmount",
            header: "Total Amount",
            cell: ({ row }: { row: any }) => {
                const amount = row.getValue("totalAmount");
                return amount ? `$${amount.toFixed(2)}` : '-';
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }: { row: any }) => (
                <div className={`px-2 py-1 rounded-full text-xs inline-block
                    ${row.getValue("status") === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                      row.getValue("status") === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      row.getValue("status") === 'RECEIVED' ? 'bg-blue-100 text-blue-800' :
                      row.getValue("status") === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'}`}>
                    {row.getValue("status")}
                </div>
            ),
        },
    ];

    const config = {
        searchFields: [
            {
                key: "poNumber",
                label: 'poNumber',
                type: "text" as const,
                placeholder: 'Search by PO number'
            }
        ],
        filterFields: [
            {
                key: "status",
                label: "Status",
                type: "select" as const,
                placeholder: "Filter by status",
                options: statusData.map(s => s.name)
            }
        ],
        dataTable: {
            columns: columns,
            data: orders,
        },
        buttons: [
            { label: 'Create PO', action: handleAdd, icon: Plus, className: 'bg-primary' }
        ]
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Purchase Orders</h2>
            </div>

            <MasterComponent config={config} loadingState={ordersLoading} />

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