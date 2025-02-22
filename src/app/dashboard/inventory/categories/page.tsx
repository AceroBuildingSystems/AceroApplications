"use client";

import React, { useState } from 'react';
import MasterComponent from '@/components/MasterComponent/MasterComponent';
import { useCreateMasterMutation, useGetMasterQuery } from '@/services/endpoints/masterApi';
import { Plus, ArrowUpDown, Settings2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { MONGO_MODELS, SUCCESS } from '@/shared/constants';
import { toast } from 'react-toastify';
import useUserAuthorised from '@/hooks/useUserAuthorised';
import { useRouter } from 'next/navigation';

export default function CategoriesPage() {
    const { user } = useUserAuthorised();
    const router = useRouter();

    const { data: response, isLoading: categoriesLoading } = useGetMasterQuery({
        db: MONGO_MODELS.PRODUCT_CATEGORY_MASTER,
        sort: { name: -1 },
    });

    const { data: parentCategoriesResponse } = useGetMasterQuery({
        db: MONGO_MODELS.PRODUCT_CATEGORY_MASTER,
        sort: { name: -1 },
    });

    const categories = response?.data || [];
    const parentCategories = parentCategoriesResponse?.data || [];

    const [createMaster] = useCreateMasterMutation();
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [selectedMaster, setSelectedMaster] = useState("");
    const [initialData, setInitialData] = useState({});
    const [action, setAction] = useState('Add');

    const fields = [
        {
            label: 'Code',
            name: "code",
            type: "text",
            required: true,
            placeholder: 'Category Code'
        },
        {
            label: 'Name',
            name: "name",
            type: "text",
            required: true,
            placeholder: 'Category Name'
        },
        {
            label: 'Parent Category',
            name: "parent",
            type: "select",
            data: parentCategories,
            placeholder: 'Select Parent Category (Optional)'
        },
        {
            label: 'Description',
            name: "description",
            type: "textarea",
            placeholder: 'Category Description'
        },
        {
            label: 'Status',
            name: "isActive",
            type: "select",
            required: true,
            data: [
                { _id: true, name: 'Active' },
                { _id: false, name: 'Inactive' }
            ],
            placeholder: 'Select Status'
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
            db: MONGO_MODELS.PRODUCT_CATEGORY_MASTER,
            action: action === 'Add' ? 'create' : 'update',
            filter: { "_id": formData._id },
            data: {
                ...formData,
                specificationTemplate: formData.specificationTemplate || {
                    version: 1,
                    fields: []
                }
            },
        };

        const response = await createMaster(formattedData);

        if ('data' in response && response.data?.status === SUCCESS) {
            toast.success(`Category ${action === 'Add' ? 'added' : 'updated'} successfully`);
            closeDialog();
            
            // Redirect to specification management if needed
            if (action === 'Add') {
                router.push(`/dashboard/inventory/categories/${response.data._id}/specifications`);
            }
        }

        if ('error' in response && response.error && 'data' in response.error) {
            const errorData = response.error.data as { message?: { message?: string } };
            if (errorData?.message?.message) {
                toast.error(`Error encountered: ${errorData.message.message}`);
            }
        }
    };

    const editCategory = (rowData: any) => {
        setAction('Update');
        setInitialData(rowData);
        openDialog("category");
    };

    const handleAdd = () => {
        setInitialData({});
        setAction('Add');
        openDialog("category");
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
                <div className='text-blue-500' onClick={() => editCategory(row.original)}>
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
                <div className='text-blue-500' onClick={() => editCategory(row.original)}>
                    {row.getValue("name")}
                </div>
            ),
        },
        {
            accessorKey: "parent.name",
            header: "Parent Category",
        },
        {
            accessorKey: "specificationTemplate.version",
            header: "Template Version",
        },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }: { row: any }) => (
                <div className={`px-2 py-1 rounded-full text-xs inline-block
                    ${row.getValue("isActive") ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {row.getValue("isActive") ? 'Active' : 'Inactive'}
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
                        onClick={() => router.push(`/dashboard/inventory/categories/${row.original._id}/specifications`)}
                        title="Manage Specifications"
                    >
                        <Settings2 size={16} />
                    </button>
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
            data: categories,
        },
        buttons: [
            { label: 'Add Category', action: handleAdd, icon: Plus, className: 'bg-primary' }
        ]
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Product Categories</h2>
                    <p className="text-muted-foreground">
                        Manage product categories and their specification templates
                    </p>
                </div>
            </div>

            <MasterComponent config={config} loadingState={categoriesLoading} />

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