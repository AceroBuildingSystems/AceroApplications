"use client";

import React from 'react'
import MasterComponent from '@/components/MasterComponent/MasterComponent'
import { ArrowUpDown, ChevronDown, ChevronsUpDown, MoreHorizontal } from "lucide-react"
import { Plus, Import, Download, Upload } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';
import { useGetUsersQuery } from '@/services/endpoints/usersApi';
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
    const [importing, setImporting] = useState(false);
    const { user, status, authenticated } = useUserAuthorised();
    const { data: accountData = [], isLoading: accountLoading }: any = useGetMasterQuery({
        db: MONGO_MODELS.ACCOUNT_MASTER,
        filter: { isActive: true },
        sort: { name: 'asc' },
    });

    const { data: packageData = [], isLoading: packageLoading }: any = useGetMasterQuery({
        db: MONGO_MODELS.PACKAGE_MASTER,
        filter: { isActive: true },
        sort: { name: 'asc' },
    });
    const { data: providerData = [], isLoading: providerLoading }: any = useGetMasterQuery({
        db: MONGO_MODELS.PROVIDER_TYPE_MASTER,
        filter: { isActive: true },
        sort: { name: 'asc' },
    });
    const { data: organisationData = [], isLoading: organisationLoading }: any = useGetMasterQuery({
        db: MONGO_MODELS.ORGANISATION_MASTER,
        filter: { isActive: true },
        sort: { name: 'asc' },
    });
    const { data: userData = [], isLoading: userLoading }: any = useGetMasterQuery({
        db: 'USER_MASTER',
        filter: { isActive: true },
        sort: { displayName: 'asc' },
    });

    const { data: otherMasterData = [], isLoading: otherMasterLoading }: any = useGetMasterQuery({
        db: MONGO_MODELS.OTHER_MASTER,
        filter: { isActive: true },
        sort: { name: 'asc' },
    });

    const [createMaster, { isLoading: isCreatingMaster }] = useCreateMasterMutation();

    const statusData = [{ _id: true, name: 'Active' }, { _id: false, name: 'InActive' }];

    const loading = packageLoading || providerLoading || userLoading || organisationLoading || otherMasterLoading || accountLoading;

    interface RowData {
        id: string;
        name: string;
        email: string;
        role: string;
    }


    const fields: Array<{ label: string; name: string; type: string; data?: any; readOnly?: boolean; format?: string; required?: boolean; placeholder?: string }> = [

        { label: 'Account Number', name: "name", type: "text", required: true, placeholder: 'Account Number' },
        { label: 'Provider', name: "provider", type: "select", required: true, placeholder: 'Select Provider', format: 'ObjectId', data: providerData?.data },
        { label: 'Company', name: "company", type: "select", required: true, placeholder: 'Select Company', format: 'ObjectId', data: organisationData?.data },
        { label: 'Employee', name: "employee", type: "select", required: false, placeholder: 'Select Employee', format: 'ObjectId', data: userData?.data },
        { label: 'Others', name: "others", type: "select", required: false, placeholder: 'Select Others', format: 'ObjectId', data: otherMasterData?.data },
        { label: 'Package', name: "package", type: "select", required: false, placeholder: 'Select Package', format: 'ObjectId', data: packageData?.data },

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
            db: MONGO_MODELS.ACCOUNT_MASTER,
            action: action === 'Add' ? 'create' : 'update',
            filter: { "_id": formData._id },
            data: formData,
        };

        const response: any = await createMaster(formattedData);

        if (response?.error?.data?.message?.errorResponse?.errmsg) {
            toast?.error(response?.error?.data?.message?.errorResponse?.errmsg);
        }
        else {
            formData.account = response?.data?.data?._id;
            formData.startDate = new Date();

            if (action === 'Update') {

                const formattedData1 = {
                    db: MONGO_MODELS.ACCOUNT_HISTORY,
                    action: 'update',
                    bulkUpdate: true,
                    filter: { "account": formData._id, 'endDate': null },
                    data: { 'endDate': new Date() },
                };

                const response1: any = await createMaster(formattedData1);

                delete formData._id;
                const formattedData2 = {
                    db: MONGO_MODELS.ACCOUNT_HISTORY,
                    action: 'create',
                    data: formData,

                }
                const response2: any = await createMaster(formattedData2);
            }
            else {

                const formattedData1 = {
                    db: MONGO_MODELS.ACCOUNT_HISTORY,
                    action: 'create',
                    data: formData,
                };

                const response1: any = await createMaster(formattedData1);

            }

        }

        return response;

    };


    const editUser = (rowData: RowData) => {
        setAction('Update');
        setInitialData(rowData);
        openDialog("account master");
        // Your add logic for user page
    };

    const handleAdd = () => {
        setInitialData({});
        setAction('Add');
        openDialog("account master");

    };


    const handleImport = () => {
        bulkImport({
            roleData: [], continentData: [], regionData: [], countryData: [], locationData: [], categoryData: [], vendorData: [], productData: [], warehouseData: [], customerTypeData: [], customerData: [], userData: [], teamData: [], designationData: [], departmentData: [], employeeTypeData: [], organisationData: [], action: "Add", user, createUser: createMaster, db: MONGO_MODELS.ACCOUNT_MASTER, masterName: "AccountMaster", onStart: () => setImporting(true),
            onFinish: () => setImporting(false)
        });
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

    const handleExport = (type: string, data: any) => {
        let formattedData: any[] = [];

        if (data?.length > 0) {
            formattedData = data?.map((data: any) => ({
                "Account No": data?.name,
                "Department": data?.employee?.department?.name || '',
                "Employee": data?.employee?.name || '',
                "Others": data?.others?.name || '',
                "Company": data?.company?.name || '',
                "Provider": data?.provider?.name || '',
                "Package": data?.package?.amount || '',

            }));
        } else {
            // Create a single empty row with keys only (for header export)
            formattedData = [{
                "Account No": '',
                "Department": '',
                "Employee": '',
                "Others": '',
                "Company": '',
                "Provider": '',
                "Package": '',

            }];
        }

        type === 'excel' && exportToExcel(formattedData);

    };


    const handleDelete = () => {
        console.log('UserPage Delete button clicked');
        // Your delete logic for user page
    };



    const accountColumns = [
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
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Account No</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => <div className='text-blue-500' onClick={() => editUser(row.original)}>{row.getValue("name")}</div>,
        },
        {
            accessorKey: "employee",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Employee</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => <div >{row.getValue("employee")?.displayName?.toProperCase()}</div>,
        },
        {
            accessorKey: "others",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Others</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => <div >{row.getValue("others")?.name}</div>,
        },
        {
            accessorKey: "company",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Company</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => <div >{row.getValue("company")?.name}</div>,
        },
        {
            accessorKey: "package",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Package</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => <div >{row.getValue("package")?.name}</div>,
        },
        {
            accessorKey: "provider",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Provider</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => <div >{row.getValue("provider")?.name}</div>,
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

    const accountConfig = {
        searchFields: [
            { key: "name", label: 'name', type: "text" as const, placeholder: 'Search by account' },

        ],
        filterFields: [
        ],
        dataTable: {
            columns: accountColumns,
            data: Array.isArray(accountData) ? accountData : accountData?.data,
        },
        buttons: [

            { label: importing ? 'Importing...' : 'Import', action: handleImport, icon: Download, className: 'bg-blue-600 hover:bg-blue-700 duration-300' },
            {
                label: 'Export', action: handleExport, icon: Upload, className: 'bg-green-600 hover:bg-green-700 duration-300', dropdownOptions: [
                    { label: "Export to Excel", value: "excel", action: (type: string, data: any) => handleExport(type, data) },
                    { label: "Export to PDF", value: "pdf", action: (type: string, data: any) => handleExport(type, data) },
                ]
            },
            { label: 'Add', action: handleAdd, icon: Plus, className: 'bg-sky-600 hover:bg-sky-700 duration-300' },
        ]
    };


    return (
        <>

            <MasterComponent config={accountConfig} loadingState={loading} rowClassMap={undefined} summary={false} />
            <DynamicDialog
                isOpen={isDialogOpen}
                closeDialog={closeDialog}
                selectedMaster={selectedMaster}
                onSave={saveData}
                fields={fields}
                initialData={initialData}
                action={action}
                height='auto'
                onchangeData={() => { }}
            />
        </>

    )
}

export default page