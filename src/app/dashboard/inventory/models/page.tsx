"use client";

import React, { useState } from 'react';
import MasterComponent from '@/components/MasterComponent/MasterComponent';
import { useCreateMasterMutation, useGetMasterQuery } from '@/services/endpoints/masterApi';
import { Plus, ArrowUpDown, Boxes } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { MONGO_MODELS, SUCCESS } from '@/shared/constants';
import { toast } from 'react-toastify';
import useUserAuthorised from '@/hooks/useUserAuthorised';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

export default function ModelsPage() {
    const { user } = useUserAuthorised();
    const router = useRouter();

    const { data: response, isLoading: modelsLoading } = useGetMasterQuery({
        db: MONGO_MODELS.MODEL_MASTER,
        sort: { modelNumber: -1 },
    });

    const { data: categoriesResponse } = useGetMasterQuery({
        db: MONGO_MODELS.PRODUCT_CATEGORY_MASTER,
        sort: { name: -1 },
    });

    const { data: vendorsResponse } = useGetMasterQuery({
        db: MONGO_MODELS.VENDOR_MASTER,
        sort: { name: -1 },
    });

    const { data: currenciesResponse } = useGetMasterQuery({
        db: MONGO_MODELS.CURRENCY_MASTER,
        sort: { code: -1 },
    });

    const models = response?.data || [];
    const categories = categoriesResponse?.data || [];
    const vendors = vendorsResponse?.data || [];
    const currencies = currenciesResponse?.data || [];

    const [createMaster] = useCreateMasterMutation();
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [selectedMaster, setSelectedMaster] = useState("");
    const [initialData, setInitialData] = useState({});
    const [action, setAction] = useState('Add');

    const fields = [
        // Basic Details
        {
            label: 'Model Number',
            name: "modelNumber",
            type: "text",
            required: true,
            placeholder: 'Model Number (e.g., M32)'
        },
        {
            label: 'Name',
            name: "name",
            type: "text",
            required: true,
            placeholder: 'Model Name (e.g., ThinkPad X1)'
        },
        {
            label: 'Category',
            name: "category",
            type: "select",
            required: true,
            data: categories,
            placeholder: 'Select Category'
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
            label: 'Description',
            name: "description",
            type: "textarea",
            placeholder: 'Model Description'
        },
        {
            label: 'Status',
            name: "status",
            type: "select",
            required: true,
            data: [
                { _id: 'ACTIVE', name: 'Active' },
                { _id: 'INACTIVE', name: 'Inactive' },
                { _id: 'DISCONTINUED', name: 'Discontinued' }
            ],
            placeholder: 'Select Status'
        },
        // Separator
        {
            type: "custom",
            CustomComponent: () => (
                <div className="col-span-2">
                    <Separator className="my-4" />
                    <h3 className="text-lg font-semibold mb-2">Cost Information</h3>
                </div>
            )
        },
        // Cost Information
        {
            label: 'Purchase Price',
            name: "cost.purchasePrice",
            type: "number",
            required: true,
            placeholder: 'Purchase Price'
        },
        {
            label: 'Currency',
            name: "cost.currency",
            type: "select",
            required: true,
            data: currencies,
            placeholder: 'Select Currency'
        },
        // Separator
        {
            type: "custom",
            CustomComponent: () => (
                <div className="col-span-2">
                    <Separator className="my-4" />
                    <h3 className="text-lg font-semibold mb-2">Depreciation Settings</h3>
                </div>
            )
        },
        // Depreciation Settings
        {
            label: 'Depreciation Method',
            name: "depreciation.method",
            type: "select",
            required: true,
            data: [
                { _id: 'STRAIGHT_LINE', name: 'Straight Line' },
                { _id: 'DECLINING_BALANCE', name: 'Declining Balance' },
                { _id: 'NONE', name: 'None' }
            ],
            placeholder: 'Select Method'
        },
        {
            label: 'Annual Rate (%)',
            name: "depreciation.rate",
            type: "number",
            placeholder: 'Annual Depreciation Rate',
            dependsOn: {
                field: "depreciation.method",
                value: ["STRAIGHT_LINE", "DECLINING_BALANCE"]
            }
        },
        {
            label: 'Salvage Value',
            name: "depreciation.salvageValue",
            type: "number",
            placeholder: 'Salvage Value',
            dependsOn: {
                field: "depreciation.method",
                value: ["STRAIGHT_LINE", "DECLINING_BALANCE"]
            }
        },
        {
            label: 'Useful Life (months)',
            name: "depreciation.usefulLife",
            type: "number",
            placeholder: 'Useful Life in Months',
            dependsOn: {
                field: "depreciation.method",
                value: ["STRAIGHT_LINE", "DECLINING_BALANCE"]
            }
        },
        // Separator
        {
            type: "custom",
            CustomComponent: () => (
                <div className="col-span-2">
                    <Separator className="my-4" />
                    <h3 className="text-lg font-semibold mb-2">Maintenance Schedule</h3>
                </div>
            )
        },
        // Maintenance Schedule
        {
            label: 'Maintenance Frequency (days)',
            name: "maintenance.schedule.frequency",
            type: "number",
            placeholder: 'Maintenance Frequency in Days'
        },
        {
            label: 'Maintenance Description',
            name: "maintenance.schedule.description",
            type: "textarea",
            placeholder: 'Maintenance Schedule Details'
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
            db: MONGO_MODELS.MODEL_MASTER,
            action: action === 'Add' ? 'create' : 'update',
            filter: { "_id": formData._id },
            data: {
                ...formData,
                specifications: {
                    templateVersion: 1,
                    values: {} // Will be managed in a separate dialog
                }
            },
        };

        const response = await createMaster(formattedData);

        if ('data' in response && response.data?.status === SUCCESS) {
            toast.success(`Model ${action === 'Add' ? 'added' : 'updated'} successfully`);
            closeDialog();
        }

        if ('error' in response && response.error && 'data' in response.error) {
            const errorData = response.error.data as { message?: { message?: string } };
            if (errorData?.message?.message) {
                toast.error(`Error encountered: ${errorData.message.message}`);
            }
        }
    };

    const editModel = (rowData: any) => {
        setAction('Update');
        setInitialData(rowData);
        openDialog("model");
    };

    const handleAdd = () => {
        setInitialData({});
        setAction('Add');
        openDialog("model");
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
            accessorKey: "modelNumber",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span>Model Number</span>
                    <ArrowUpDown size={15} />
                </button>
            ),
            cell: ({ row }: { row: any }) => (
                <div className='text-blue-500' onClick={() => editModel(row.original)}>
                    {row.getValue("modelNumber")}
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
                <div className='text-blue-500' onClick={() => editModel(row.original)}>
                    {row.getValue("name")}
                </div>
            ),
        },
        {
            accessorKey: "category.name",
            header: "Category",
        },
        {
            accessorKey: "vendor.name",
            header: "Vendor",
        },
        {
            accessorKey: "cost",
            header: "Cost",
            cell: ({ row }: { row: any }) => {
                const cost = row.original.cost;
                if (!cost?.purchasePrice) return '-';
                return `${cost.currency.code} ${cost.purchasePrice.toFixed(2)}`;
            }
        },
        {
            accessorKey: "depreciation.method",
            header: "Depreciation",
            cell: ({ row }: { row: any }) => {
                const method = row.getValue("depreciation.method");
                return method === 'STRAIGHT_LINE' ? 'Straight Line' :
                       method === 'DECLINING_BALANCE' ? 'Declining Balance' :
                       'None';
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }: { row: any }) => (
                <div className={`px-2 py-1 rounded-full text-xs inline-block
                    ${row.getValue("status") === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                      row.getValue("status") === 'INACTIVE' ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                    {row.getValue("status")}
                </div>
            ),
        },
    ];

    const config = {
        searchFields: [
            {
                key: "modelNumber",
                label: 'modelNumber',
                type: "text" as const,
                placeholder: 'Search by model number'
            },
            {
                key: "name",
                label: 'name',
                type: "text" as const,
                placeholder: 'Search by name'
            }
        ],
        filterFields: [
            {
                key: "category",
                label: "Category",
                type: "select" as const,
                placeholder: "Filter by category",
                options: categories.map(c => c.name)
            },
            {
                key: "vendor",
                label: "Vendor",
                type: "select" as const,
                placeholder: "Filter by vendor",
                options: vendors.map(v => v.name)
            },
            {
                key: "status",
                label: "Status",
                type: "select" as const,
                placeholder: "Filter by status",
                options: ["ACTIVE", "INACTIVE", "DISCONTINUED"]
            }
        ],
        dataTable: {
            columns: columns,
            data: models,
        },
        buttons: [
            { label: 'Add Model', action: handleAdd, icon: Plus, className: 'bg-primary' },
            { 
                label: 'Manage Serial Numbers', 
                action: () => router.push('/dashboard/inventory/serial-numbers'),
                icon: Boxes,
                className: 'bg-secondary'
            }
        ]
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Product Models</h2>
                    <p className="text-muted-foreground">
                        Manage product models and their specifications
                    </p>
                </div>
            </div>

            <MasterComponent config={config} loadingState={modelsLoading} />

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