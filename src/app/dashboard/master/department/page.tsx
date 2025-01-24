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
import { SUCCESS } from '@/shared/constants';
import { toast } from 'react-toastify';
import { RowExpanding } from '@tanstack/react-table';
import { error } from 'console';
import { createMasterData } from '@/server/services/masterDataServices';
import { bulkImport } from '@/shared/functions';
import useUserAuthorised from '@/hooks/useUserAuthorised';


const page = () => {
const { user, status, authenticated } = useUserAuthorised();
  const { data: departmentData = [], isLoading: departmentLoading } = useGetMasterQuery({
    db: 'DEPARTMENT_MASTER',
    sort: { name: -1 },
  });

  const [createMaster, { isLoading: isCreatingMaster }] = useCreateMasterMutation();

  const statusData = [{ _id: true, name: 'Active' }, { _id: false, name: 'InActive' }];

  const loading = departmentLoading;


  interface RowData {
    id: string;
    name: string;
    email: string;
    role: string;
  }


  const fields: Array<{ label: string; name: string; type: string; data?: any; readOnly?: boolean; format?: string; required?: boolean; placeholder?: string }> = [
    { label: 'Department Id', name: "depId", type: "text", required: true, placeholder: 'Department Id' },
    { label: 'Department Name', name: "name", type: "text", required: true, placeholder: 'Department Name' },
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
      db: 'DEPARTMENT_MASTER',
      action: action === 'Add' ? 'create' : 'update',
      filter: { "_id": formData._id },
      data: formData,
    };



    const response = await createMaster(formattedData);


    if (response.data?.status === SUCCESS && action === 'Add') {
      toast.success('Department added successfully');

    }
    else {
      if (response.data?.status === SUCCESS && action === 'Update') {
        toast.success('Department updated successfully');
      }
    }

    if (response?.error?.data?.message?.message) {
      toast.error(`Error encountered: ${response?.error?.data?.message?.message}`);
    }

  };


  const editUser = (rowData: RowData) => {
    setAction('Update');
    setInitialData(rowData);
    openDialog("department");
    // Your add logic for user page
  };

  const handleAdd = () => {
    setInitialData({});
    setAction('Add');
    openDialog("department");

  };

  const handleImport = () => {
    bulkImport({ roleData: [], action: "Add", user, createUser: createMaster, db: "DEPARTMENT_MASTER", masterName: "Department" });
  };

  const handleExport = () => {
    console.log('UserPage Update button clicked');
    // Your update logic for user page
  };

  const handleDelete = () => {
    console.log('UserPage Delete button clicked');
    // Your delete logic for user page
  };



  const departmentColumns = [
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
      accessorKey: "depId",
      header: ({ column }: { column: any }) => (
        <button
          className="flex items-center space-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

        >
          <span>Department Id</span> {/* Label */}
          <ArrowUpDown size={15} /> {/* Sorting Icon */}
        </button>
      ),
      cell: ({ row }: { row: any }) => <div className='text-blue-500' onClick={() => editUser(row.original)}>{row.getValue("depId")}</div>,
    },
    {
      accessorKey: "name",
      header: ({ column }: { column: any }) => (
        <button
          className="flex items-center space-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

        >
          <span>Department</span> {/* Label */}
          <ArrowUpDown size={15} /> {/* Sorting Icon */}
        </button>
      ),
      cell: ({ row }: { row: any }) => <div>{row.getValue("name")}</div>,
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

  const departmentConfig = {
    searchFields: [
      { key: "name", label: 'name', type: "text" as const, placeholder: 'Search by department' },

    ],
    filterFields: [
    ],
    dataTable: {
      columns: departmentColumns,
      data: departmentData?.data,
    },
    buttons: [

      { label: 'Import', action: handleImport, icon: Import, className: 'bg-blue-600 hover:bg-blue-700 duration-300' },
      { label: 'Export', action: handleExport, icon: Download, className: 'bg-green-600 hover:bg-green-700 duration-300' },
      { label: 'Add', action: handleAdd, icon: Plus, className: 'bg-sky-600 hover:bg-sky-700 duration-300' },
    ]
  };


  return (
    <>

      <MasterComponent config={departmentConfig} loadingState={loading} />
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