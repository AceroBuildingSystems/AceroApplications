"use client";

import React from 'react'
import MasterComponent from '@/components/MasterComponent/MasterComponent'
import DashboardLoader from '@/components/ui/DashboardLoader'
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import { DataTable } from '@/components/TableComponent/TableComponent'
import { Plus, Import, Download, Upload } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';
import { useUserOperationsMutation, useGetUsersQuery } from '@/services/endpoints/usersApi';
import { organisationTransformData, transformData } from '@/lib/utils';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { useGetMasterQuery } from '@/services/endpoints/masterApi';
import { SUCCESS } from '@/shared/constants';
import { toast } from 'react-toastify';
import { RowExpanding } from '@tanstack/react-table';
import * as XLSX from "xlsx";
import useUserAuthorised from '@/hooks/useUserAuthorised';
import { bulkImport } from '@/shared/functions';
import jsPDF from 'jspdf';
import 'jspdf-autotable';



const page = () => {

  const { user, status, authenticated } = useUserAuthorised();
  const { data: userData = [], isLoading: userLoading }: any = useGetMasterQuery({
    db: 'USER_MASTER',
    filter: { isActive: true },
    sort: { empId: 'asc' },
  });

  const { data: departmentData = [], isLoading: departmentLoading }: any = useGetMasterQuery({
    db: 'DEPARTMENT_MASTER',
    filter: { isActive: true },
    sort: { createdAt: -1 },
  });
  const { data: designationData = [], isLoading: designationLoading }: any = useGetMasterQuery({
    db: 'DESIGNATION_MASTER',
  });
  const { data: roleData = [], isLoading: roleLoading }: any = useGetMasterQuery({
      db: 'ROLE_MASTER',
      sort: { name: 'asc' },
      filter: { isActive: true },
    });
  // const { data: roleData = [], isLoading: roleLoading }: any = useGetMasterQuery({ db: "ROLE_MASTER", filter: { isActive: true }, sort: { name: 'asc' } });
  const { data: employeeTypeData = [], isLoading: employeeTypeLoading }: any = useGetMasterQuery({ db: 'EMPLOYEE_TYPE_MASTER' });
  const { data: organisationData = [], isLoading: organisationLoading }: any = useGetMasterQuery({ db: "ORGANISATION_MASTER" });
  const [createUser, { isLoading: isCreatingUser }]: any = useUserOperationsMutation();

  const statusData = [{ _id: true, name: 'Active' }, { _id: false, name: 'InActive' }];

  const loading = userLoading || departmentLoading || designationLoading || roleLoading || employeeTypeLoading || organisationLoading || isCreatingUser;

  const fieldsToAdd = [
    { fieldName: 'roleName', path: ['role', 'name'] },
    { fieldName: 'departmentName', path: ['department', 'name'] },
    { fieldName: 'locationName', path: ['organisation', 'name'] }
  ];

  const transformedData = transformData(userData?.data, fieldsToAdd);

  const orgTransformedData = organisationTransformData(organisationData?.data);

  const roleNames = roleData?.data
    ?.filter((role: undefined) => role !== undefined)  // Remove undefined entries
    ?.map((role: { _id: any; name: any }) => ({ _id: role.name, name: role.name }));
  // Extract only the 'name' property
  const depNames = departmentData?.data
    ?.filter((dep: undefined) => dep !== undefined)  // Remove undefined entries
    ?.map((dep: { _id: any; name: any }) => ({ _id: dep.name, name: dep.name }));


  const orgNames = organisationData?.data
    ?.filter((org: undefined) => org !== undefined)  // Remove undefined entries
    ?.map((org: { _id: any; name: any }) => ({ _id: org.name, name: org.name }));

  interface RowData {
    id: string;
    name: string;
    email: string;
    role: string;
  }

  const fields: Array<{ label: string; name: string; type: string; data?: any; readOnly?: boolean; format?: string; required?: boolean; placeholder?: string }> = [
    { label: 'Employee ID', name: "empId", type: "number", required: true, placeholder: 'Employee ID' },
    { label: 'First Name', name: "firstName", type: "text", required: true, placeholder: 'First Name' },
    { label: 'Last Name', name: "lastName", type: "text", placeholder: 'Last Name' },
    { label: 'Full Name', name: "fullName", type: "text", readOnly: true, placeholder: 'Full Name' },
    { label: 'Display Name', name: "displayName", type: "text", required: true, placeholder: 'Display Name' },
    { label: 'Department', name: "department", type: "select", data: departmentData?.data, format: 'ObjectId', required: true, placeholder: 'Select Department' },

    { label: 'Designation', name: "designation", type: "select", data: designationData?.data, format: 'ObjectId', required: true, placeholder: 'Select Designation' },
    { label: 'Reporting To', name: "reportingTo", type: "select", data: userData?.data, required: true, placeholder: 'Select Reporting To' },
    { label: 'Email', name: "email", type: "email", required: true, placeholder: 'Email' },
    { label: 'Employee Type', name: "employeeType", type: "select", data: employeeTypeData?.data, format: 'ObjectId', required: true, placeholder: 'Select Employee Type' },
   
     { label: 'Reporting Location', name: "organisation", type: "select", data: orgTransformedData, format: 'ObjectId', required: true, placeholder: 'Select Location' },
    { label: 'Active Location', name: "activeLocation", type: "select", data: orgTransformedData, format: 'ObjectId', required: true, placeholder: 'Select Location' },
    { label: 'Role', name: "role", type: "select", data: roleData?.data, format: 'ObjectId', required: true, placeholder: 'Select Role' },
   
    { label: 'Status', name: "isActive", type: "select", data: statusData, placeholder: 'Select Status' },
 
    { label: 'Extension', name: "extension", type: "number", placeholder: 'Extension' },
    { label: 'Mobile', name: "mobile", type: "text", placeholder: 'Mobile' },
       { label: 'Joining Date', name: "joiningDate", type: "date", format: 'Date', placeholder: 'Pick Joining Date' },
    { label: 'Leaving Date', name: "relievingDate", type: "date", format: 'Date', placeholder: 'Pick Leaving Date' },
  ]


  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState(""); // This will track the master type (department, role, etc.)
  const [initialData, setInitialData] = useState({});
  const [action, setAction] = useState('Add');

  // Open the dialog and set selected master type
  const openDialog = (masterType: React.SetStateAction<string>) => {
    setSelectedMaster(masterType);
    setDialogOpen(true);
  };

  // Close dialog
  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedMaster("");
  };

  // Save function to send data to an API or database
  const saveData = async ({ formData, action }: { formData: any; action: string }) => {
    const formattedData = {
      action: action === 'Add' ? 'create' : 'update',
      filter: { "_id": formData._id },
      data: formData,
    };
    const response = await createUser(formattedData);


    if (response.data?.status === SUCCESS && action === 'Add') {
      toast.success('User added successfully');

    }
    else {
      if (response.data?.status === SUCCESS && action === 'Update') {
        toast.success('User updated successfully');
      }
    }

    if (response?.error?.data?.message?.message) {
      toast.error(`Error encountered: ${response?.error?.data?.message?.message}`);
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
    bulkImport({ roleData, continentData: [], regionData: [], countryData: [], locationData: organisationData, categoryData: [], vendorData: [], productData: [], warehouseData: [], customerTypeData: [], customerData: [], userData: userData, teamData: [],designationData:designationData, departmentData:departmentData, employeeTypeData, action: "Add", user, createUser, db: 'USER_DB', masterName: "User" });
  };

  const exportToExcel = (data: any[]) => {
    // Convert JSON data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    // Write the workbook and trigger a download
    XLSX.writeFile(workbook, 'exported_data.xlsx');
  };

  const exportToPDF = (data: any[]) => {
    const doc = new jsPDF();
    doc.text('Exported Data', 14, 10);

    const tableColumns = Object.keys(data[0] || {});
    const tableRows = data.map((item) => tableColumns.map((key) => item[key]));

    doc.save('exported_data.pdf');
  };

  const handleExport = (type: string, data: any) => {
    if (type === 'excel') {
      exportToExcel(data);
    } else if (type === 'pdf') {
      exportToPDF(data);
    }
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
      accessorKey: "displayName",
      header: ({ column }: { column: any }) => (
        <button
          className="flex items-center space-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

        >
          <span>Display Name</span> {/* Label */}
          <ArrowUpDown size={15} /> {/* Sorting Icon */}
        </button>
      ),
      cell: ({ row }: { row: any }) => <div className='text-blue-500' onClick={() => editUser(row.original)}>{row.getValue("displayName")}</div>,
    },
    {
      accessorKey: "department",
      header: ({ column }: { column: any }) => (
        <button
          className="flex items-center space-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

        >
          <span>Department</span> {/* Label */}
          <ArrowUpDown size={15} /> {/* Sorting Icon */}
        </button>
      ),
      cell: ({ row }: { row: any }) => <div>{row.getValue("department")?.name}</div>,
    },

    {
      accessorKey: "designation",
      header: ({ column }: { column: any }) => (
        <button
          className="flex items-center space-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

        >
          <span>Designation</span> {/* Label */}
          <ArrowUpDown size={15} /> {/* Sorting Icon */}
        </button>
      ),
      cell: ({ row }: { row: any }) => <div>{row.getValue("designation")?.name}</div>,
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

  ];

  const userConfig = {
    searchFields: [
      { key: "name", label: 'fullName', type: "text" as const, placeholder: 'Search by name' },

    ],
    filterFields: [

      { key: "department", label: 'departmentName', type: "select" as const, data: depNames, placeholder: 'Search by Department', name: 'departmentName' },
      { key: "organisation", label: 'locationName', type: "select" as const, data: orgNames, placeholder: 'Search by Location', name: 'locationName' },
    ],
    dataTable: {
      columns: userColumns,
      data: transformedData,
    },
    buttons: [

      { label: 'Import', action: handleImport, icon: Import, className: 'bg-blue-600 hover:bg-blue-700 duration-300' },
      {
        label: 'Export', action: handleExport, icon: Download, className: 'bg-green-600 hover:bg-green-700 duration-300', dropdownOptions: [
          { label: "Export to Excel", value: "excel", action: (type: string, data: any) => handleExport(type, data) },
          { label: "Export to PDF", value: "pdf", action: (type: string, data: any) => handleExport(type, data) },
        ]
      },
      { label: 'Add', action: handleAdd, icon: Plus, className: 'bg-sky-600 hover:bg-sky-700 duration-300' },
    ]
  };


  return (
    <>

      <MasterComponent config={userConfig} loadingState={loading} rowClassMap={undefined} summary={false} />
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