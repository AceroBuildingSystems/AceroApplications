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
    sort: { empId:'asc' },
  });
  const { data: departmentData = [], isLoading: departmentLoading }: any = useGetMasterQuery({
    db: 'DEPARTMENT_MASTER',
    filter: { isActive: true },
    sort: { createdAt: -1 },
  });
  const { data: designationData = [], isLoading: designationLoading }: any = useGetMasterQuery({
    db: 'DESIGNATION_MASTER',
  });
  const { data: roleData = [], isLoading: roleLoading }: any = useGetMasterQuery({ db: "ROLE_MASTER" });
  const { data: employeeTypeData = [], isLoading: employeeTypeLoading }: any = useGetMasterQuery({ db: 'EMPLOYEE_TYPE_MASTER' });
  const { data: organisationData = [], isLoading: organisationLoading }: any = useGetMasterQuery({ db: "ORGANISATION_MASTER" });
  const [createUser, { isLoading: isCreatingUser }]: any = useUserOperationsMutation();

  const statusData = [{ _id: true, name: 'Active' }, { _id: false, name: 'InActive' }];

  const loading = userLoading || departmentLoading || designationLoading || roleLoading || employeeTypeLoading || organisationLoading || isCreatingUser;

  const fieldsToAdd = [
    { fieldName: 'departmentName', path: ['department', 'name'] },
    { fieldName: 'locationName', path: ['organisation', 'name'] }
  ];
  const transformedData = transformData(userData?.data, fieldsToAdd);
console.log(transformedData);
  const orgTransformedData = organisationTransformData(organisationData?.data);

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
    { label: 'Employee ID', name: "empId", type: "text", required: true, placeholder: 'Employee ID' },
    { label: 'First Name', name: "firstName", type: "text", required: true, placeholder: 'First Name' },
    { label: 'Last Name', name: "lastName", type: "text", placeholder: 'Last Name' },
    { label: 'Full Name', name: "fullName", type: "text", readOnly: true, placeholder: 'Full Name' },
    { label: 'Short Name', name: "shortName", type: "text", required: true, placeholder: 'Short Name' },
    { label: 'Designation', name: "designation", type: "select", data: designationData?.data, format: 'ObjectId', required: true, placeholder: 'Select Designation' },
    { label: 'Department', name: "department", type: "select", data: departmentData?.data, format: 'ObjectId', required: true, placeholder: 'Select Department' },
    { label: 'Email', name: "email", type: "text", required: true, placeholder: 'Email' },
    { label: 'Reporting To', name: "reportingTo", type: "select", data: userData?.data, required: true, placeholder: 'Select Reporting To' },
    { label: 'Role', name: "role", type: "select", data: roleData?.data, format: 'ObjectId', required: true, placeholder: 'Select Role' },
    { label: 'Location', name: "organisation", type: "select", data: orgTransformedData, format: 'ObjectId', required: true, placeholder: 'Select Location' },
    { label: 'Extension', name: "extension", type: "text", placeholder: 'Extension' },
    { label: 'Mobile', name: "mobile", type: "text", placeholder: 'Mobile' },
    { label: 'Status', name: "isActive", type: "select", data: statusData, placeholder: 'Select Status' },
    { label: 'Employee Type', name: "employeeType", type: "select", data: employeeTypeData?.data, format: 'ObjectId', required: true, placeholder: 'Select Employee Type' },
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
    bulkImport({ roleData, continentData: [], regionData: [], countryData: [], locationData: [], categoryData: [], vendorData: [], productData: [], warehouseData: [], customerTypeData: [], customerData:[], userData:[], teamData:[], action: "Add", user, createUser, db: 'USER_DB', masterName: "User" });
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

  const handleExport = (type: string) => {
    type === 'excel' && exportToExcel(userData?.data);

  };

  const handleDelete = () => {
    console.log('UserPage Delete button clicked');
    // Your delete logic for user page
  };

  const userColumns = [
    
    {
      accessorKey: "shortName",
      header: ({ column }: { column: any }) => (
        <button
          className="flex items-center space-x-2 pl-3"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

        >
          <span>Employee Name</span> {/* Label */}
          <ArrowUpDown size={15} /> {/* Sorting Icon */}
        </button>
      ),
      cell: ({ row }: { row: any }) => {
        const firstName = row.getValue("shortName");
        const designation = row.original?.designation?.name || ""; // Adjust based on your actual data structure
      
        return (
          <div className="pl-3">
            <div className="">{firstName}</div>
            <div className="text-sm text-gray-500">{designation}</div>
          </div>
        );
      },
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
      accessorKey: "organisation",
      header: ({ column }: { column: any }) => (
        <button
          className="flex items-center space-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

        >
          <span>Location</span> {/* Label */}
          <ArrowUpDown size={15} /> {/* Sorting Icon */}
        </button>
      ),
      cell: ({ row }: { row: any }) => <div>{row.getValue("organisation")?.name}</div>,
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
      cell: ({ row }: { row: any }) => {
        const email = row.getValue("email");
        return (
          <a
            href={`mailto:${email}`}
            className="text-blue-600 hover:text-blue-800 "
          >
            {email}
          </a>
        );
      },
    },
    {
      accessorKey: "extension",
      header: ({ column }: { column: any }) => (
        <button
          className="flex items-center space-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Extension</span> {/* Label */}
          <ArrowUpDown size={15} /> {/* Sorting Icon */}
        </button>
      ),
      cell: ({ row }: { row: any }) => {
        const extension = row.getValue("extension");
        return (
          <a
            href={`tel:${extension}`}
            className="text-blue-600 hover:text-blue-800 no-underline"
          >
            {extension}
          </a>
        );
      },
    },
    {
      accessorKey: "mobile",
      header: ({ column }: { column: any }) => (
        <button
          className="flex items-center space-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Mobile</span> {/* Label */}
          <ArrowUpDown size={15} /> {/* Sorting Icon */}
        </button>
      ),
      cell: ({ row }: { row: any }) => {
        const extension = row.getValue("mobile");
        return (
          <a
            href={`tel:${extension}`}
            className="text-blue-600 hover:text-blue-800 no-underline"
          >
            {extension}
          </a>
        );
      },
    },
  ];

  const userConfig = {
    searchFields: [
      { key: "name", label: 'fullName', type: "text" as const, placeholder: 'Search by Name' },
     
    ],
    filterFields: [
     
      { key: "department", label: 'departmentName', type: "select" as const, data: depNames, placeholder: 'Search by Department', name:'departmentName' },
      { key: "organisation", label: 'locationName', type: "select" as const, data: orgNames, placeholder: 'Search by Location', name:'locationName' },

    ],
    dataTable: {
      columns: userColumns,
      data: transformedData,
    },
    buttons: [

    ]
  };


  return (
    <>

      <MasterComponent config={userConfig} loadingState={loading} rowClassMap={undefined} summary={false} />
      
    </>

  )
}

export default page