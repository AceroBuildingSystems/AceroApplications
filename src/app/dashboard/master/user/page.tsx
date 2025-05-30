"use client";

import React from 'react'
import MasterComponent from '@/components/MasterComponent/MasterComponent'
import DashboardLoader from '@/components/ui/DashboardLoader'
import { ArrowUpDown, ChevronDown, ChevronsUpDown, MoreHorizontal } from "lucide-react"
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
import moment from 'moment';


const page = () => {
  const [importing, setImporting] = useState(false);
  const [designationDataNew, setDesignationdata] = useState([]);
  const { user, status, authenticated } = useUserAuthorised();
  const { data: userData = [], isLoading: userLoading }: any = useGetMasterQuery({
    db: 'USER_MASTER',

    sort: { empId: 'asc' },
  });

  const { data: departmentData = [], isLoading: departmentLoading }: any = useGetMasterQuery({
    db: 'DEPARTMENT_MASTER',
    filter: { isActive: true },
    sort: { name: 'asc' },
  });
  const { data: visTypeData = [], isLoading: visaTypeLoading }: any = useGetMasterQuery({
    db: 'VISA_TYPE_MASTER',
    filter: { isActive: true },
    sort: { name: 'asc' },
  });
  const { data: nationalityData = [], isLoading: nationalityLoading }: any = useGetMasterQuery({
    db: 'COUNTRY_MASTER',
    filter: { isActive: true },
    sort: { name: 'asc' },
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
  const { data: employeeTypeData = [], isLoading: employeeTypeLoading }: any = useGetMasterQuery({
    db: 'EMPLOYEE_TYPE_MASTER', filter: { isActive: true },
    sort: { empId: 'asc' },
  });
  const { data: locationData = [], isLoading: locationLoading }: any = useGetMasterQuery({
    db: "LOCATION_MASTER", filter: { isActive: true },
    sort: { name: 'asc' }
  });
  const { data: organisationData = [], isLoading: organisationLoading }: any = useGetMasterQuery({
    db: "ORGANISATION_MASTER", filter: { isActive: true },
    sort: { name: 'asc' }
  });

  const [createUser, { isLoading: isCreatingUser }]: any = useUserOperationsMutation();

  const statusData = [{ _id: true, name: 'Active' }, { _id: false, name: 'InActive' }];

  const genderData = [{ _id: 'Male', name: 'Male' }, { _id: 'Female', name: 'Female' }];

  const maritalStatusData = [{ _id: 'Single', name: 'Single' }, { _id: 'Married', name: 'Married' }, { _id: 'Divorced', name: 'Divorced' }];

  const loading = userLoading || departmentLoading || designationLoading || nationalityLoading || visaTypeLoading || roleLoading || employeeTypeLoading || organisationLoading || isCreatingUser || locationLoading;

  const fieldsToAdd = [
    { fieldName: 'roleName', path: ['role', 'name'] },
    { fieldName: 'departmentName', path: ['department', 'name'] },
    { fieldName: 'organisationName', path: ['organisation', 'name'] }
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

  const reportingToData = userData?.data
    ?.filter((user: any) =>
      user &&
      user.employeeType?.name &&
      ['Manager', 'Management'].includes(user.employeeType.name)
    )
    ?.map((user: { _id: any; displayName: any }) => ({
      _id: user._id,
      name: user.displayName
    }));


  interface RowData {
    id: string;
    name: string;
    email: string;
    role: string;
  }

  const onchangeData = async ({ id, fieldName }: { id: string; fieldName: string; }) => {

    switch (fieldName) {
      case "department":
        const designation = await designationData?.data?.filter((deignation: { department: { _id: any; }; }) => deignation?.department?._id === id);

        setDesignationdata(designation);
        break;

      default:
        break;
    }

  }


  const fields: Array<{ label: string; name: string; type: string; data?: any; readOnly?: boolean; format?: string; required?: boolean; placeholder?: string }> = [
    { label: 'Employee ID', name: "empId", type: "number", required: true, placeholder: 'Employee ID' },
    { label: 'Email', name: "email", type: "email", required: false, placeholder: 'Email' },

    { label: 'First Name', name: "firstName", type: "text", required: true, placeholder: 'First Name' },
    { label: 'Last Name', name: "lastName", type: "text", placeholder: 'Last Name' },
    { label: 'Full Name', name: "fullName", type: "text", readOnly: true, placeholder: 'Full Name' },
    { label: 'Display Name', name: "displayName", type: "text", required: true, placeholder: 'Display Name' },
    { label: 'Department', name: "department", type: "select", data: departmentData?.data, format: 'ObjectId', required: true, placeholder: 'Select Department' },

    { label: 'Designation', name: "designation", type: "select", data: designationDataNew?.length > 0 ? designationDataNew : designationData?.data, format: 'ObjectId', required: true, placeholder: 'Select Designation' },
    { label: 'Reporting To', name: "reportingTo", type: "select", data: reportingToData, required: true, placeholder: 'Select Reporting To' },
    { label: 'Employee Type', name: "employeeType", type: "select", data: employeeTypeData?.data, format: 'ObjectId', required: true, placeholder: 'Select Employee Type' },
    { label: 'Reporting Location', name: "reportingLocation", type: "select", data: locationData?.data, format: 'ObjectId', required: true, placeholder: 'Select Location' },
    { label: 'Active Location', name: "activeLocation", type: "select", data: locationData?.data, format: 'ObjectId', required: true, placeholder: 'Select Location' },
    { label: 'Organisation', name: "organisation", type: "select", data: orgTransformedData, format: 'ObjectId', required: true, placeholder: 'Select Organisation' },

    { label: 'Role', name: "role", type: "select", data: roleData?.data, format: 'ObjectId', required: true, placeholder: 'Select Role' },

    { label: 'Extension', name: "extension", type: "number", placeholder: 'Extension' },
    { label: 'Company Number', name: "mobile", type: "text", placeholder: 'Mobile' },
    { label: 'Personal Number', name: "personalNumber", type: "text", placeholder: 'Personal Number' },
    { label: 'Status', name: "isActive", type: "select", data: statusData, placeholder: 'Select Status' },
    { label: 'Joining Date', name: "joiningDate", type: "date", format: 'Date', placeholder: 'Select Joining Date' },
    { label: 'Leaving Date', name: "relievingDate", type: "date", format: 'Date', placeholder: 'Select Leaving Date' },
    { label: 'Nationality', name: "nationality", type: "select", data: nationalityData?.data, format: 'ObjectId', required: false, placeholder: 'Select Nationality' },
    { label: 'Gender', name: "gender", type: "select", data: genderData, format: 'ObjectId', required: false, placeholder: 'Select Gender' },
    { label: 'Marital Status', name: "maritalStatus", type: "select", data: maritalStatusData, format: 'ObjectId', required: false, placeholder: 'Select Marital Status' },
    { label: 'Date Of Birth', name: "dateOfBirth", type: "date", format: 'Date', placeholder: 'Select Birth Date' },
    { label: 'Visa File No', name: "visaFileNo", type: "text", placeholder: 'Visa File No' },
    { label: 'Visa Issue Date', name: "visaIssueDate", type: "date", format: 'Date', placeholder: 'Select Visa Issue Date' },
    { label: 'Visa Expiry Date', name: "visaExpiryDate", type: "date", format: 'Date', placeholder: 'Select Visa Expiry Date' },
    { label: 'Passport Number', name: "passportNumber", type: "text", placeholder: 'Passport Number' },
    { label: 'Passport Issue Date', name: "passportIssueDate", type: "date", format: 'Date', placeholder: 'Select Passport Issue Date' },
    { label: 'Passport Expiry Date', name: "passportExpiryDate", type: "date", format: 'Date', placeholder: 'Select Passport Expiry Date' },
    { label: 'Emirates ID', name: "emiratesId", type: "text", placeholder: 'Emirates ID' },
    { label: 'Emirates ID Issue Date', name: "emiratesIdIssueDate", type: "date", format: 'Date', placeholder: 'Select Emirates ID Issue Date' },
    { label: 'Emirates ID Expiry Date', name: "emiratesIdExpiryDate", type: "date", format: 'Date', placeholder: 'Select Emirates ID Expiry Date' },
    { label: 'Work Permit', name: "workPermit", type: "text", placeholder: 'Work Permit' },
    { label: 'Labour Card Expiry Date', name: "labourCardExpiryDate", type: "date", format: 'Date', placeholder: 'Select Labour Card Expiry Date' },
    { label: 'Person Code', name: "personCode", type: "text", placeholder: 'Person Code' },
    { label: 'Visa Type', name: "visatype", type: "select", data: visTypeData?.data, format: 'ObjectId', required: true, placeholder: 'Select Visa Type' },
    { label: 'Medical Insurance', name: "medicalInsurance", type: "text", placeholder: 'Medical Insurance' },
    { label: 'ILOE Expiry Date', name: "iloeExpiryDate", type: "date", format: 'Date', placeholder: 'Select ILOE Expiry Date' },
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


    return response;
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
    bulkImport({
      roleData, continentData: [], regionData: [], countryData: [], locationData: locationData, categoryData: [], vendorData: [], productData: [], warehouseData: [], customerTypeData: [], customerData: [], userData: userData, teamData: [], designationData: designationData, departmentData: departmentData, employeeTypeData, organisationData, action: "Add", user, createUser, db: 'USER_DB', masterName: "User", onStart: () => setImporting(true),
      onFinish: () => setImporting(false)
    });
  };

  const handleExport = (type: string, data: any) => {
    let formattedData: any[] = [];

    if (data?.length > 0) {
      formattedData = data?.map((data: any) => ({
        'Employee ID': data?.empId,
        'First Name': data?.firstName,
        'Last Name': data?.lastName,
        'Full Name': data?.fullName,
        'Display Name': data?.displayName,
        'Email': data?.email,
        'Department': data?.department?.name,
        'Designation': data?.designation?.name,
        'Reporting To': transformedData.find((user: any) => user.reportingTo === data?.reportingTo)?.displayName,
        'Employee Type': data?.employeeType?.name,

        'Role': data?.role?.name,
        'Organisation': data?.organisation?.name,
        'Reporting Location': data?.reportingLocation?.name,
        'Active Location': data?.activeLocation?.name,
        'Extension': data?.extension,
        'Mobile': data?.mobile,
        'Joining Date': moment(data?.joiningDate).format('DD/MM/YYYY'),
        'Personal Number': data?.personalNumber,

      }));
    } else {
      // Create a single empty row with keys only (for header export)
      formattedData = [{
        'Employee ID': '',
        'First Name': '',
        'Last Name': '',
        'Full Name': '',
        'Display Name': '',
        'Email': '',
        'Department': '',
        'Designation': '',
        'Reporting To': '',
        'Employee Type': '',

        'Role': '',
        'Organisation': '',
        'Reporting Location': '',
        'Active Location': '',
        'Extension': '',
        'Mobile': '',
        'Joining Date': '',
        'Personal Number': ''
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
      accessorKey: "fullName",
      header: ({ column }: { column: any }) => {
        const isSorted = column.getIsSorted();

        return (
          <button
            className="group  flex items-center space-x-2 "
            onClick={() => column.toggleSorting(isSorted === "asc")}
          >
            <span>Employee Name</span>
            <ChevronsUpDown
              size={15}
              className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
            />
          </button>
        );
      },
      cell: ({ row }: { row: any }) => <div className='text-blue-500' onClick={() => editUser(row.original)}>{row.getValue("fullName")}</div>,
    },
    {
      accessorKey: "department",
      header: ({ column }: { column: any }) => {
        const isSorted = column.getIsSorted();

        return (
          <button
            className="group  flex items-center space-x-2"
            onClick={() => column.toggleSorting(isSorted === "asc")}
          >
            <span>Department</span>
            <ChevronsUpDown
              size={15}
              className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
            />
          </button>
        );
      },
      cell: ({ row }: { row: any }) => <div>{row.getValue("department")?.name}</div>,
    },

    {
      accessorKey: "designation",
      header: ({ column }: { column: any }) => {
        const isSorted = column.getIsSorted();

        return (
          <button
            className="group  flex items-center space-x-2 w-[100px]"
            onClick={() => column.toggleSorting(isSorted === "asc")}
          >
            <span>Designation</span>
            <ChevronsUpDown
              size={15}
              className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
            />
          </button>
        );
      },
      cell: ({ row }: { row: any }) => <div>{row.getValue("designation")?.name}</div>,
    },
    {
      accessorKey: "email",
      header: ({ column }: { column: any }) => {
        const isSorted = column.getIsSorted();

        return (
          <button
            className="group  flex items-center space-x-2 w-[100px]"
            onClick={() => column.toggleSorting(isSorted === "asc")}
          >
            <span>Email</span>
            <ChevronsUpDown
              size={15}
              className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
            />
          </button>
        );
      },
      cell: ({ row }: { row: any }) => <div>{row.getValue("email")}</div>,
    },
    {
      accessorKey: "isActive",
      header: ({ column }: { column: any }) => {
        const isSorted = column.getIsSorted();

        return (
          <button
            className="group  flex items-center space-x-2 w-[100px]"
            onClick={() => column.toggleSorting(isSorted === "asc")}
          >
            <span>Status</span>
            <ChevronsUpDown
              size={15}
              className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
            />
          </button>
        );
      },
      cell: ({ row }: { row: any }) => <div>{statusData.find(status => status._id === row.getValue("isActive"))?.name}</div>,
    },

  ];

  const userConfig = {
    searchFields: [
      { key: "name", label: 'fullName', type: "text" as const, placeholder: 'Search by name' },

    ],
    filterFields: [

      { key: "department", label: 'departmentName', type: "select" as const, data: depNames, placeholder: 'Search by Department', name: 'departmentName' },
      { key: "organisation", label: 'organisationName', type: "select" as const, data: orgNames, placeholder: 'Search by Organisation', name: 'organisationName' },
    ],
    dataTable: {
      columns: userColumns,
      data: transformedData,
    },
    buttons: [

      { label: importing ? 'Importing...' : 'Import', action: handleImport, icon: Download, className: 'bg-blue-600 hover:bg-blue-700 duration-300' },
      {
        label: 'Export', action: handleExport, icon: Upload, className: 'bg-green-600 hover:bg-green-700 duration-300', dropdownOptions: [
          { label: "Export to Excel", value: "excel", action: (type: string, data: any) => handleExport(type, data) },

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
        onchangeData={onchangeData}
      />
    </>

  )
}

export default page