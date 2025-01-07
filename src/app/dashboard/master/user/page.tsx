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
import {SUCCESS} from '@/shared/constants';
import { toast } from 'react-toastify';
import { RowExpanding } from '@tanstack/react-table';


const page = () => {
  const { data: userData = [], isLoading: userLoading } = useGetUsersQuery();
  const { data: departmentData = [], isLoading: departmentLoading } = useGetMasterQuery("DEPARTMENT_MASTER" as any);
  const { data: designationData = [], isLoading: designationLoading } = useGetMasterQuery("DESIGNATION_MASTER" as any);
  const { data: roleData = [], isLoading: roleLoading } = useGetMasterQuery("ROLE_MASTER" as any);
  const { data: employeeTypeData = [], isLoading: employeeTypeLoading } = useGetMasterQuery("EMPLOYEE_TYPE_MASTER" as any);
  const { data: organisationData = [], isLoading: organisationLoading } = useGetMasterQuery("ORGANISATION_MASTER" as any);
  const [createUser,{isLoading:isCreatingUser}] = useCreateUserMutation();

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
  { label: 'Location', name: "organisation", type: "select",data: orgTransformedData, format: 'ObjectId' },
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
const saveData = async (userData) => {
  const formattedData = {
    action: 'create',
    data: userData,
  };

  
  const response = await createUser(formattedData);
  if (response.data?.status === SUCCESS) {
    toast.success('User saved successfully');
   
  }
  // Call your API to save data to the database based on the master type
  // const response = await fetch(`/api/user`, {
  //   method: "POST",
  //   body: JSON.stringify(formData),
  //   headers: {
  //     "Content-Type": "application/json"
  //   }
  // });

  // if (response.ok) {
  //   console.log(`${masterType} saved successfully!`);
  // } else {
  //   console.error("Error saving data");
  // }
};


const editUser = (rowData: RowData) => {
 
  setInitialData(rowData);
  openDialog("employee");
  // Your add logic for user page
};

const handleAdd = () => {
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

// const userData = [
//   { id: "1", name: "Alice", email: "alice@example.com", role: "Admin" },
//   { id: "2", name: "Bob", email: "bob@example.com", role: "User" },
//   { id: "3", name: "Ken", email: "ken@example.com", role: "User" },
//   { id: "4", name: "Ked", email: "ked@example.com", role: "User" },
// ];

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

    />
  </>

)
}

export default page