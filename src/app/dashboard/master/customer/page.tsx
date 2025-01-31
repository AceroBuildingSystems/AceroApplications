"use client";

import React from 'react'
import MasterComponent from '@/components/MasterComponent/MasterComponent'
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import { Plus, Import, Download, Upload } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';
import { useCreateUserMutation, useGetUsersQuery } from '@/services/endpoints/usersApi';
import { organisationTransformData, userTransformData } from '@/lib/utils';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { useCreateMasterMutation, useGetMasterQuery } from '@/services/endpoints/masterApi';
import { MONGO_MODELS, SUCCESS } from '@/shared/constants';
import { toast } from 'react-toastify';
import { RowExpanding } from '@tanstack/react-table';
import { error } from 'console';
import { createMasterData } from '@/server/services/masterDataServices';
import { bulkImport } from '@/shared/functions';
import useUserAuthorised from '@/hooks/useUserAuthorised';


const page = () => {
    const { user, status, authenticated } = useUserAuthorised();
    const { data: customerData = [], isLoading: customerLoading } = useGetMasterQuery({
        db: MONGO_MODELS.CUSTOMER_MASTER,
        sort: { name: 'asc' },
    });

    const { data: customerTypeData = [], isLoading: customerTypeLoading } = useGetMasterQuery({
        db: MONGO_MODELS.CUSTOMER_TYPE_MASTER,
        sort: { name: 'asc' },
      });
    const [createMaster, { isLoading: isCreatingMaster }] = useCreateMasterMutation();

    const statusData = [{ _id: true, name: 'Active' }, { _id: false, name: 'InActive' }];

    const loading = customerLoading || customerTypeLoading;

    interface RowData {
        id: string;
        name: string;
        email: string;
        role: string;
    }


    const fields: Array<{ label: string; name: string; type: string; data?: any; readOnly?: boolean; format?: string; required?: boolean; placeholder?: string }> = [

        { label: 'Customer Name', name: "name", type: "text", required: true, placeholder: 'Customer Name' },
        { label: 'Website', name: "website", type: "text", placeholder: 'Website' },
        { label: 'Email', name: "email", type: "email", placeholder: 'Email' },
        { label: 'Phone', name: "phone", type: "text", placeholder: 'Phone' },
        { label: 'Address', name: "address", type: "text", placeholder: 'Address' },
        { label: 'Customer Type', name: "customerType", type: "select", data: customerTypeData?.data, placeholder: 'Select Customer Type' },
        { label: 'Status', name: "isActive", type: "select", data: statusData, placeholder: 'Select Status' },

    ]


    const [isDialogOpen, setDialogOpen] = useState(false);
    const [selectedMaster, setSelectedMaster] = useState(""); // This will track the master type (department, role, etc.)
    const [initialData, setInitialData] = useState({});
    const [action, setAction] = useState('Add');

    // Open the dialog and set selected master type
    const openDialog = (masterType) => {
        setSelectedMaster(masterType);

        setDialogOpen(true);
    };

    // Close dialog
    const closeDialog = () => {
        setDialogOpen(false);
        setSelectedMaster("");
    };

    // Save function to send data to an API or database
    const saveData = async ({ formData, action }) => {

        const formattedData = {
            db: MONGO_MODELS.CUSTOMER_MASTER,
            action: action === 'Add' ? 'create' : 'update',
            filter: { "_id": formData._id },
            data: formData,
        };



        const response = await createMaster(formattedData);


        if (response.data?.status === SUCCESS && action === 'Add') {
            toast.success('Customer added successfully');

        }
        else {
            if (response.data?.status === SUCCESS && action === 'Update') {
                toast.success('Customer updated successfully');
            }
        }

        if (response?.error?.data?.message?.message) {
            toast.error(`Error encountered: ${response?.error?.data?.message?.message}`);
        }

    };


    const editUser = (rowData: RowData) => {
        setAction('Update');
        setInitialData(rowData);
        openDialog("customer");
        // Your add logic for user page
    };

    const handleAdd = () => {
        setInitialData({});
        setAction('Add');
        openDialog("customer");

    };

    const handleImport = () => {
        bulkImport({ roleData: [], action: "Add", user, createUser: createMaster, db: MONGO_MODELS.CUSTOMER_MASTER, masterName: "Customer" });
    };

    const handleExport = () => {
        console.log('UserPage Update button clicked');
        // Your update logic for user page
    };

    const handleDelete = () => {
        console.log('UserPage Delete button clicked');
        // Your delete logic for user page
    };



    const customerColumns = [
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
            accessorKey: "name",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

                >
                    <span>Customer Name</span> {/* Label */}
                    <ArrowUpDown size={15} /> {/* Sorting Icon */}
                </button>
            ),
            cell: ({ row }: { row: any }) => <div className='text-blue-500' onClick={() => editUser(row.original)}>{row.getValue("name")}</div>,
        },
        {
            accessorKey: "website",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

                >
                    <span>Website</span> {/* Label */}
                    <ArrowUpDown size={15} /> {/* Sorting Icon */}
                </button>
            ),
            cell: ({ row }: { row: any }) => <div >{row.getValue("website")}</div>,
        },
        {
            accessorKey: "email",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

                >
                    <span>Email</span> {/* Label */}
                    <ArrowUpDown size={15} /> {/* Sorting Icon */}
                </button>
            ),
            cell: ({ row }: { row: any }) => <div >{row.getValue("email")}</div>,
        },
        {
            accessorKey: "phone",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

                >
                    <span>Phone</span> {/* Label */}
                    <ArrowUpDown size={15} /> {/* Sorting Icon */}
                </button>
            ),
            cell: ({ row }: { row: any }) => <div >{row.getValue("phone")}</div>,
        },
        {
            accessorKey: "address",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

                >
                    <span>Address</span> {/* Label */}
                    <ArrowUpDown size={15} /> {/* Sorting Icon */}
                </button>
            ),
            cell: ({ row }: { row: any }) => <div >{row.getValue("address")}</div>,
        },
         {
                accessorKey: "customerType",
                header: ({ column }: { column: any }) => (
                  <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          
                  >
                    <span>Customer Type</span> {/* Label */}
                    <ArrowUpDown size={15} /> {/* Sorting Icon */}
                  </button>
                ),
                cell: ({ row }: { row: any }) => <div >{row.getValue("customerType")?.name}</div>,
              },
        {
             accessorKey: "isActive",
             header: ({ column }: { column: any }) => (
               <button
                 className="flex items-center space-x-2"
                 onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
       
               >
                 <span>Status</span> {/* Label */}
                 <ArrowUpDown size={15} /> {/* Sorting Icon */}
               </button>
             ),
             cell: ({ row }: { row: any }) => <div>{statusData.find(status => status._id === row.getValue("isActive"))?.name}</div>,
           },

    ];

    const customerConfig = {
        searchFields: [
            { key: "name", label: 'name', type: "text" as const, placeholder: 'Search by customer' },

        ],
        filterFields: [
        ],
        dataTable: {
            columns: customerColumns,
            data: customerData?.data,
        },
        buttons: [

            { label: 'Import', action: handleImport, icon: Import, className: 'bg-blue-600 hover:bg-blue-700 duration-300' },
            { label: 'Export', action: handleExport, icon: Download, className: 'bg-green-600 hover:bg-green-700 duration-300' },
            { label: 'Add', action: handleAdd, icon: Plus, className: 'bg-sky-600 hover:bg-sky-700 duration-300' },
        ]
    };


    return (
        <>

            <MasterComponent config={customerConfig} loadingState={loading} />
            <DynamicDialog
                isOpen={isDialogOpen}
                closeDialog={closeDialog}
                selectedMaster={selectedMaster}
                onSave={saveData}
                fields={fields}
                initialData={initialData}
                action={action}
                height='auto'
            />
        </>

    )
}

export default page