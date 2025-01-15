"use client";

import React from 'react'
import Layout from '../layout'
import MasterComponent from '@/components/MasterComponent/MasterComponent'
import DashboardLoader from '@/components/ui/DashboardLoader'
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import { DataTable } from '@/components/TableComponent/TableComponent'
import { Plus, Import, Download, Upload } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';
import { useCreateUserMutation, useGetUsersQuery } from '@/services/endpoints/usersApi';
import { organisationTransformData, userTransformData } from '@/lib/utils';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { useGetMasterQuery } from '@/services/endpoints/masterApi';
import { SUCCESS } from '@/shared/constants';
import { toast } from 'react-toastify';
import { RowExpanding } from '@tanstack/react-table';


const page = () => {
  const { data: userData = [], isLoading: userLoading } = useGetUsersQuery();
  const { data: departmentData = [], isLoading: departmentLoading } = useGetMasterQuery({
    db: 'DEPARTMENT_MASTER',
    filter: { isActive: true },
    sort: { createdAt: -1 },
  });
   const { data: designationData = [], isLoading: designationLoading } = useGetMasterQuery({
      db: 'DESIGNATION_MASTER',
    });
    const { data: roleData = [], isLoading: roleLoading } = useGetMasterQuery( {db:"ROLE_MASTER" });
    const { data: employeeTypeData = [], isLoading: employeeTypeLoading } = useGetMasterQuery({db: 'EMPLOYEE_TYPE_MASTER'});
    const { data: organisationData = [], isLoading: organisationLoading } = useGetMasterQuery({db:"ORGANISATION_MASTER"} );
  const [createUser, { isLoading: isCreatingUser }] = useCreateUserMutation();

  const statusData = [{ _id: true, name: 'Active' }, { _id: false, name: 'InActive' }];

  const loading = userLoading || departmentLoading || designationLoading || roleLoading || employeeTypeLoading || organisationLoading;

  const transformedData = userTransformData(userData);

  const orgTransformedData = organisationTransformData(organisationData);

  const distinctRoles = userData.reduce((acc: any[], user: { role: { name: any; }; }) => {
    // Check if the role is already in the accumulator
    if (!acc.some(role => role?.name === user?.role?.name)) {
      acc.push(user.role); // Add the role if it's not already added
    }
    return acc;
  }, []);

  const roleNames = distinctRoles
    .filter(role => role !== undefined)  // Remove undefined entries
    .map(role => role.name);             // Extract only the 'name' property


  interface RowData {
    id: string;
    name: string;
    email: string;
    role: string;
  }


  const fields: Array<{ label: string; name: string; type: string; data?: any; readOnly?: boolean; format?: string }> = [
    { label: 'Employee ID', name: "empId", type: "text", },
    { label: 'First Name', name: "firstName", type: "text", },
    { label: 'Last Name', name: "lastName", type: "text", },
    { label: 'Full Name', name: "fullName", type: "text", readOnly: true },
    { label: 'Short Name', name: "shortName", type: "text" },
    { label: 'Designation', name: "designation", type: "select", data: designationData, format: 'ObjectId' },
    { label: 'Department', name: "department", type: "select", data: departmentData, format: 'ObjectId' },
    { label: 'Email', name: "email", type: "text" },
    { label: 'Reporting To', name: "reportingTo", type: "select", data: userData },
    { label: 'Role', name: "role", type: "select", data: roleData, format: 'ObjectId' },
    { label: 'Location', name: "organisation", type: "select", data: orgTransformedData, format: 'ObjectId' },
    { label: 'Extension', name: "extension", type: "text" },
    { label: 'Mobile', name: "mobile", type: "text" },
    { label: 'Status', name: "isActive", type: "select", data: statusData },
    { label: 'Employee Type', name: "employeeType", type: "select", data: employeeTypeData, format: 'ObjectId' },
    { label: 'Joining Date', name: "joiningDate", type: "date", format: 'Date' },
    { label: 'Leaving Date', name: "relievingDate", type: "date", format: 'Date' },
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
  const saveData = async ({formData, action}) => {
   
    const formattedData = {
      action: action === 'Add' ? 'create' : 'update',
      filter : {"_id": formData._id},
      data: formData,
    };



    const response = await createUser(formattedData);

    console.log(response?.error?.data?.errorResponse.errmsg);
    if (response.data?.status === SUCCESS && action === 'Add') {
      toast.success('User saved successfully');

    }
    else{
      if (response.data?.status === SUCCESS && action === 'Update') {
        toast.success('User updated successfully');
      }
    }

    if(response?.error?.data?.errorResponse.errmsg){
      toast.error(`Error encountered: ${response?.error?.data?.errorResponse.errmsg}`);
    }
   
  };


  const editUser = (rowData: RowData) => {
    setAction('Update');
    setInitialData(rowData);
    openDialog("employee");
    // Your add logic for user page
  };

  const handleAdd = () => {
    setInitialData({});
    setAction('Add');
    openDialog("employee");

  };

  const handleImport = () => {
    console.log('UserPage Import button clicked');
    // Your import logic for user page
  };

  const handleExport = () => {
    console.log('UserPage Update button clicked');
    // Your update logic for user page
  };

  const handleDelete = () => {
    console.log('UserPage Delete button clicked');
    // Your delete logic for user page
  };

 

  const userColumns = [
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
      accessorKey: "firstName",
      header: ({ column }: { column: any }) => (
        <button
          className="flex items-center space-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

        >
          <span>Name</span> {/* Label */}
          <ArrowUpDown size={15} /> {/* Sorting Icon */}
        </button>
      ),
      cell: ({ row }: { row: any }) => <div className='text-blue-500' onClick={() => editUser(row.original)}>{row.getValue("firstName")}</div>,
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
      cell: ({ row }: { row: any }) => <div>{row.getValue("email")}</div>,
    },
    {
      accessorKey: "lastName",
      header: ({ column }: { column: any }) => (
        <button
          className="flex items-center space-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

        >
          <span>Last Name</span> {/* Label */}
          <ArrowUpDown size={15} /> {/* Sorting Icon */}
        </button>
      ),
      cell: ({ row }: { row: any }) => <div>{row.getValue("lastName")}</div>,
    },


  ];

  const userConfig = {
    searchFields: [
      { key: "name", label: 'fullName', type: "text" as const, placeholder: 'Search by name' },
      { key: "email", label: 'email', type: "email" as const, placeholder: 'Search by email' },
    ],
    filterFields: [
      { key: "role", label: 'roleName', type: "select" as const, options: roleNames },

    ],
    dataTable: {
      columns: userColumns,
      userData: transformedData,
    },
    buttons: [

      { label: 'Import', action: handleImport, icon: Import, className: 'bg-blue-600 hover:bg-blue-700 duration-300' },
      { label: 'Export', action: handleExport, icon: Download, className: 'bg-green-600 hover:bg-green-700 duration-300' },
      { label: 'Add', action: handleAdd, icon: Plus, className: 'bg-sky-600 hover:bg-sky-700 duration-300' },
    ]
  };


  return (
    <>

      <MasterComponent config={userConfig} loadingState={loading} />
      <DynamicDialog
        isOpen={isDialogOpen}
        closeDialog={closeDialog}
        selectedMaster={selectedMaster}
        onSave={saveData}
        fields={fields}
        initialData={initialData}
        action={action}
      />
    </>

  )
}

export default page