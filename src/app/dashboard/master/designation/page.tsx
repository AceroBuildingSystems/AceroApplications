"use client";

import React from 'react'
import Layout from '../../layout'
import MasterComponent from '@/components/MasterComponent/MasterComponent'
import DashboardLoader from '@/components/ui/DashboardLoader'
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import { DataTable } from '@/components/TableComponent/TableComponent'
import { Plus, Import, Download, Upload } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';
import { transformData } from '@/lib/utils';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { useCreateMasterMutation, useGetMasterQuery } from '@/services/endpoints/masterApi';
import { SUCCESS } from '@/shared/constants';
import { toast } from 'react-toastify';
import { RowExpanding } from '@tanstack/react-table';
import { createMasterData } from '@/server/services/masterDataServices';
import { bulkImport } from '@/shared/functions';
import useUserAuthorised from '@/hooks/useUserAuthorised';
import * as XLSX from "xlsx";

const page = () => {
  const { user, status, authenticated } = useUserAuthorised();
  const { data: designationData = [], isLoading: designationLoading }: any = useGetMasterQuery({
    db: 'DESIGNATION_MASTER',
    sort: { name: 'asc' },
  });

  const { data: departmentData = [], isLoading: departmentLoading }: any = useGetMasterQuery({
    db: 'DEPARTMENT_MASTER',
    sort: { name: 'asc' },
  });

  const [createMaster, { isLoading: isCreatingMaster }]: any = useCreateMasterMutation();

  const statusData = [{ _id: true, name: 'Active' }, { _id: false, name: 'InActive' }];

  const loading = designationLoading || isCreatingMaster || departmentLoading;

  const fieldsToAdd = [
    { fieldName: 'roleName', path: ['role', 'name'] },
    { fieldName: 'departmentName', path: ['department', 'name'] },
    { fieldName: 'organisationName', path: ['organisation', 'name'] }
  ];

  const transformedData = transformData(designationData?.data, fieldsToAdd);

  const depNames = departmentData?.data
    ?.filter((dep: undefined) => dep !== undefined)  // Remove undefined entries
    ?.map((dep: { _id: any; name: any }) => ({ _id: dep.name, name: dep.name }));


  interface RowData {
    id: string;
    name: string;
    email: string;
    role: string;
  }


  const fields: Array<{ label: string; name: string; type: string; data?: any; readOnly?: boolean; format?: string; required?: boolean; placeholder?: string }> = [

    { label: 'Designation', name: "name", type: "text", required: true, placeholder: 'Designation' },
    { label: 'Department', name: "department", type: "select", required: true, placeholder: 'Select Region', format: 'ObjectId', data: departmentData?.data },
    { label: 'Status', name: "isActive", type: "select", data: statusData, placeholder: 'Select Status' },

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
  const saveData = async ({ formData, action }: { formData: any, action: string }) => {

    const formattedData = {
      db: 'DESIGNATION_MASTER',
      action: action === 'Add' ? 'create' : 'update',
      filter: { "_id": formData._id },
      data: formData,
    };

    const response = await createMaster(formattedData);


    if (response.data?.status === SUCCESS && action === 'Add') {
      toast.success('Designation added successfully');

    }
    else {
      if (response.data?.status === SUCCESS && action === 'Update') {
        toast.success('Designation updated successfully');
      }
    }

    if (response?.error?.data?.message?.message) {
      toast.error(`Error encountered: ${response?.error?.data?.message?.message}`);
    }

  };


  const editUser = (rowData: RowData) => {
    setAction('Update');
    setInitialData(rowData);
    openDialog("designation");

  };

  const handleAdd = () => {
    setInitialData({});
    setAction('Add');
    openDialog("designation");

  };

  const handleImport = () => {
    bulkImport({ roleData: [], continentData: [], regionData: [], countryData: [], locationData: [], categoryData: [], vendorData: [], productData: [], warehouseData: [], customerTypeData: [], customerData: [], userData: [], teamData: [], designationData: designationData, departmentData: departmentData, employeeTypeData: [], organisationData: [], action: "Add", user, createUser: createMaster, db: "DESIGNATION_MASTER", masterName: "Designation" });
  };
  const handleExport = (type: string, data: any) => {
    let formattedData: any[] = [];

    if (data?.length > 0) {
      formattedData = data?.map((data: any) => ({
        'Designation': data?.name,
        'Department': data?.department?.name,

      }));
    } else {
      // Create a single empty row with keys only (for header export)
      formattedData = [{
        'Designation': '',
        'Department': '',
      }];
    }

    type === 'excel' && exportToExcel(formattedData);

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



  const handleDelete = () => {
    console.log('UserPage Delete button clicked');

  };



  const designationColumns = [
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
          <span>Designation</span> {/* Label */}
          <ArrowUpDown size={15} /> {/* Sorting Icon */}
        </button>
      ),
      cell: ({ row }: { row: any }) => <div className='text-blue-500' onClick={() => editUser(row.original)}>{row.getValue("name")}</div>,
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
      cell: ({ row }: { row: any }) => <div className='text-blue-500' onClick={() => editUser(row.original)}>{row.getValue("department")?.name}</div>,
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

  const designationConfig = {
    searchFields: [
      { key: "name", label: 'name', type: "text" as const, placeholder: 'Search by designation' },

    ],
    filterFields: [
      { key: "department", label: 'departmentName', type: "select" as const, data: depNames, placeholder: 'Search by Department', name: 'departmentName' },
      // { key: "role", label: 'roleName', type: "select" as const, options: roleNames },

    ],
    dataTable: {
      columns: designationColumns,
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

  const onchangeData = async ({ id, fieldName }: { id: string; fieldName: string; }) => {
    console.log("Data changed:", id);
  }
  return (
    <>

      <MasterComponent config={designationConfig} loadingState={loading} rowClassMap={undefined} summary={false} />
      <DynamicDialog
        isOpen={isDialogOpen}
        closeDialog={closeDialog}
        selectedMaster={selectedMaster}
        onSave={saveData}
        fields={fields}
        initialData={initialData}
        action={action}
        height='auto'
        onchangeData={onchangeData}
      />
    </>

  )
}

export default page