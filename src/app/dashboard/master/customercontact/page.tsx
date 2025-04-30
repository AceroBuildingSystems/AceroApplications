"use client";

import React from 'react'
import MasterComponent from '@/components/MasterComponent/MasterComponent'
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import { Plus, Import, Download, Upload } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';
import { useGetUsersQuery } from '@/services/endpoints/usersApi';
import { organisationTransformData, transformData } from '@/lib/utils';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { useCreateMasterMutation, useGetMasterQuery } from '@/services/endpoints/masterApi';
import { MONGO_MODELS, SUCCESS } from '@/shared/constants';
import { toast } from 'react-toastify';
import { RowExpanding } from '@tanstack/react-table';
import { createMasterData } from '@/server/services/masterDataServices';
import { bulkImport } from '@/shared/functions';
import useUserAuthorised from '@/hooks/useUserAuthorised';
import * as XLSX from "xlsx";

const page = () => {
  const { user, status, authenticated } = useUserAuthorised();
  const { data: customerContactData = [], isLoading: customerContactLoading }: any = useGetMasterQuery({
    db: MONGO_MODELS.CUSTOMER_CONTACT_MASTER,
    sort: { name: 'asc' },
  });
  const { data: customerData = [], isLoading: customerLoading }: any = useGetMasterQuery({
    db: MONGO_MODELS.CUSTOMER_MASTER,
    sort: { name: 'asc' },
  });


  const [createMaster, { isLoading: isCreatingMaster }]: any = useCreateMasterMutation();

  const statusData = [{ _id: true, name: 'Active' }, { _id: false, name: 'InActive' }];

  const loading = customerContactLoading || customerLoading;

  const customerNames = customerData?.data?.filter((cust: undefined) => cust !== undefined)  // Remove undefined entries
    ?.map((cust: any) => ({
      _id: cust?.name,
      name: cust?.name
    }));          // Extract only the 'name' property

  const fieldsToAdd = [
    { fieldName: 'customerName', path: ['customer', 'name'] }
  ];
  const transformedData = transformData(customerContactData?.data, fieldsToAdd);

  interface RowData {
    id: string;
    name: string;
    email: string;
    role: string;
  }


  const fields: Array<{ label: string; name: string; type: string; data?: any; readOnly?: boolean; format?: string; required?: boolean; placeholder?: string }> = [

    { label: 'Contact Name', name: "name", type: "text", required: true, placeholder: 'Contact Name' },
    { label: 'Email', name: "email", type: "text", required: true, placeholder: 'Email' },
    { label: 'Contact Number', name: "phone", type: "text", required: true, placeholder: 'Contact Number' },
    { label: 'Position', name: "position", type: "text", required: true, placeholder: 'Position' },
    { label: 'Customer Name', name: "customer", type: "select", data: customerData?.data, placeholder: 'Select Customer' },

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
  const saveData = async ({ formData, action }: { formData: any; action: string }) => {

    const formattedData = {
      db: MONGO_MODELS.CUSTOMER_CONTACT_MASTER,
      action: action === 'Add' ? 'create' : 'update',
      filter: { "_id": formData._id },
      data: formData,
    };



    const response = await createMaster(formattedData);


    if (response.data?.status === SUCCESS && action === 'Add') {
      toast.success('Customer contact added successfully');

    }
    else {
      if (response.data?.status === SUCCESS && action === 'Update') {
        toast.success('Customer contact updated successfully');
      }
    }

    if (response?.error?.data?.message?.message) {
      toast.error(`Error encountered: ${response?.error?.data?.message?.message}`);
    }

  };


  const editUser = (rowData: RowData) => {
    setAction('Update');
    setInitialData(rowData);
    openDialog("customer contact");
    // Your add logic for user page
  };

  const handleAdd = () => {
    setInitialData({});
    setAction('Add');
    openDialog("customer contact");

  };

  const handleImport = () => {
    bulkImport({ roleData: [], continentData: [], regionData: [], countryData: [], locationData: [], categoryData: [], vendorData: [], productData: [], warehouseData: [], customerTypeData: [], customerData:customerData, userData:[], teamData:[],designationData: [], departmentData: [], employeeTypeData:[], organisationData:[], action: "Add", user, createUser: createMaster, db: MONGO_MODELS.CUSTOMER_CONTACT_MASTER, masterName: "CustomerContact" });
  };

  const exportToExcel = (data: any[]) => {
    const formattedData = data?.map(data => ({
      "Name": data?.name,
      "Email": data?.email,
      "Phone": data?.phone,
      "Position": data?.position,
      "Customer Name": data?.customer?.name,
    }));
    // Convert JSON data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    // Write the workbook and trigger a download
    XLSX.writeFile(workbook, 'exported_data.xlsx');
  };


  const handleExport = (type: string) => {
    type === 'excel' && exportToExcel(customerContactData?.data);

  };

  const handleDelete = () => {
    console.log('UserPage Delete button clicked');
    // Your delete logic for user page
  };

  const customerContactColumns = [
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
          <span>Customer Contact</span> {/* Label */}
          <ArrowUpDown size={15} /> {/* Sorting Icon */}
        </button>
      ),
      cell: ({ row }: { row: any }) => <div className='text-blue-500' onClick={() => editUser(row.original)}>{row.getValue("name")}</div>,
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
          <span>Contact</span> {/* Label */}
          <ArrowUpDown size={15} /> {/* Sorting Icon */}
        </button>
      ),
      cell: ({ row }: { row: any }) => <div >{row.getValue("phone")}</div>,
    },
    {
      accessorKey: "position",
      header: ({ column }: { column: any }) => (
        <button
          className="flex items-center space-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

        >
          <span>Position</span> {/* Label */}
          <ArrowUpDown size={15} /> {/* Sorting Icon */}
        </button>
      ),
      cell: ({ row }: { row: any }) => <div >{row.getValue("position")}</div>,
    },
    {
      accessorKey: "customer",
      header: ({ column }: { column: any }) => (
        <button
          className="flex items-center space-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

        >
          <span>Customer Name</span> {/* Label */}
          <ArrowUpDown size={15} /> {/* Sorting Icon */}
        </button>
      ),
      cell: ({ row }: { row: any }) => <div >{row.getValue("customer")?.name}</div>,
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

  const customerContactConfig = {
    searchFields: [
      { key: "name", label: 'name', type: "text" as const, placeholder: 'Search by customer contact' },

    ],
    filterFields: [
      { key: "customer", label: 'customerName', type: "select" as const, data: customerNames, placeholder: 'Search by customer', name: 'customerName' },

    ],
    dataTable: {
      columns: customerContactColumns,
      data: transformedData,
    },
    buttons: [
      { label: 'Import', action: handleImport, icon: Import, className: 'bg-blue-600 hover:bg-blue-700 duration-300' },
      {
        label: 'Export', action: handleExport, icon: Download, className: 'bg-green-600 hover:bg-green-700 duration-300', dropdownOptions: [
          { label: "Export to Excel", value: "excel", action: (type: string) => handleExport(type) },
          { label: "Export to PDF", value: "pdf", action: (type: string) => handleExport(type) },
        ]
      },
      { label: 'Add', action: handleAdd, icon: Plus, className: 'bg-sky-600 hover:bg-sky-700 duration-300' },
    ]
  };


  return (
    <>

      <MasterComponent config={customerContactConfig} loadingState={loading} rowClassMap={undefined} summary={false} />
      <DynamicDialog
        isOpen={isDialogOpen}
        closeDialog={closeDialog}
        selectedMaster={selectedMaster}
        onSave={saveData}
        fields={fields}
        initialData={initialData}
        action={action}
        height='auto'
        onchangeData={()=>{}}
      />
    </>

  )
}

export default page