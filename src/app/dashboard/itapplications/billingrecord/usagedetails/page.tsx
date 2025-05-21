"use client";

import React from 'react'
import MasterComponent from '@/components/MasterComponent/MasterComponent'
import { ArrowUpDown, ChevronDown, ChevronsUpDown, MoreHorizontal } from "lucide-react"
import { Plus, Import, Download, Upload } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';
import { useGetUsersQuery } from '@/services/endpoints/usersApi';
import DynamicDialog from '@/components/ModalComponent/ModelComponentBilling';
import { useCreateMasterMutation, useGetMasterQuery } from '@/services/endpoints/masterApi';
import { MONGO_MODELS, SUCCESS } from '@/shared/constants';
import { toast } from 'react-toastify';
import { RowExpanding } from '@tanstack/react-table';
import { createMasterData } from '@/server/services/masterDataServices';
import { bulkImport } from '@/shared/functions';
import useUserAuthorised from '@/hooks/useUserAuthorised';
import * as XLSX from "xlsx";
import moment from 'moment';

const page = () => {
    const [importing, setImporting] = useState(false);
    const { user, status, authenticated } = useUserAuthorised();

    const { data: usageData = [], isLoading: usageLoading } = useGetMasterQuery({
        db: MONGO_MODELS.USAGE_DETAIL,
        sort: { account: 'asc' },
    });
    console.log(usageData);
    const { data: accountData = [], isLoading: accountLoading }: any = useGetMasterQuery({
        db: MONGO_MODELS.ACCOUNT_MASTER,
        filter: { isActive: true },
        sort: { name: 'asc' },
    });

    const { data: deductionData = [], isLoading: deductionLoading }: any = useGetMasterQuery({
        db: MONGO_MODELS.DEDUCTION_TYPE_MASTER,
        filter: { isActive: true },
        sort: { name: 'asc' },
    });

    const [createMaster, { isLoading: isCreatingMaster }] = useCreateMasterMutation();

    const statusData = [{ _id: true, name: 'Active' }, { _id: false, name: 'InActive' }];

    const loading = usageLoading || accountLoading;

    interface RowData {
        id: string;
        name: string;
        email: string;
        role: string;
    }
    const accountNames = accountData?.data
        ?.filter((acc: undefined) => acc !== undefined)  // Remove undefined entries
        ?.map((acc: { _id: any; name: any }) => ({ _id: acc.name, name: acc.name }));


    const fields: Array<{ label: string; name: string; type: string; data?: any; readOnly?: boolean; format?: string; required?: boolean; placeholder?: string }> = [

        { label: 'Account Number', name: "account", type: "select", required: true, placeholder: 'Select Account', format: 'ObjectId', data: accountData?.data },
        { label: 'Billing Start Date', name: "billingPeriodStart", type: "date", format: 'Date', placeholder: 'Select Bill Start Date' },
        { label: 'Gross Bill Amount', name: "grossBillAmount", type: "number", required: true, placeholder: 'Gross Bill Amount' },
        { label: 'One Time Charge', name: "oneTimeCharge", type: "number", required: true, placeholder: 'One Time Charge' },
        { label: 'Vat', name: "vat", type: "number", required: true, readOnly: true, placeholder: 'Vat' },
        { label: 'Net Bill Amount', name: "netBillAmount", type: "number", required: false, readOnly: true, placeholder: 'Net Bill Amount' },
        { label: 'Outstanding Amount', name: "outstandingAmount", type: "number", required: false, placeholder: 'Net Bill Amount' },
        { label: 'Total Amount Due', name: "totalAmountDue", type: "number", required: true, readOnly: true, placeholder: 'Net Bill Amount' },
        { label: 'Total Deduction', name: "totalDeduction", type: "number", required: true, readOnly: true, placeholder: 'Net Bill Amount' },
        { label: 'Waived Amount', name: "waivedAmount", type: "number", required: false, placeholder: 'Net Bill Amount' },
        { label: 'Final Deduction Amount', name: "finalDeduction", type: "number", required: false, readOnly: true, placeholder: 'Net Bill Amount' },
        { label: 'Remarks', name: "remarks", type: "text", required: false, placeholder: 'Net Bill Amount' },
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
            db: MONGO_MODELS.USAGE_DETAIL,
            action: action === 'Add' ? 'create' : 'update',
            filter: { "_id": formData._id },
            data: formData,
        };



        const response: any = await createMaster(formattedData);

        return response;

    };


    const editUser = (rowData: RowData) => {
        setAction('Update');
        setInitialData(rowData);
        openDialog("usage detail");
        // Your add logic for user page
    };

    const handleAdd = () => {
        setInitialData({});
        setAction('Add');
        openDialog("usage detail");

    };


    const handleImport = () => {
        bulkImport({
            roleData: [], continentData: [], regionData: [], countryData: [], locationData: [], categoryData: [], vendorData: [], productData: [], warehouseData: [], customerTypeData: [], customerData: [], userData: [], teamData: [], designationData: [], departmentData: [], employeeTypeData: [], organisationData: [], action: "Add", user, createUser: createMaster, db: MONGO_MODELS.USAGE_DETAIL, masterName: "UsageDetail", onStart: () => setImporting(true),
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
                "Currency": data?.name,

            }));
        } else {
            // Create a single empty row with keys only (for header export)
            formattedData = [{
                "Currency": '',


            }];
        }

        type === 'excel' && exportToExcel(formattedData);

    };


    const handleDelete = () => {
        console.log('UserPage Delete button clicked');
        // Your delete logic for user page
    };



    const usageColumns = [
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
            accessorKey: "account",
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
            cell: ({ row }: { row: any }) => <div className='text-blue-500' onClick={() => editUser(row.original)}>{row.getValue("account")?.name}</div>,
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
            cell: ({ row }: { row: any }) => <div >{row.getValue("account")?.employee?.displayName?.toProperCase()}</div>,
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
            cell: ({ row }: { row: any }) => <div >{row.getValue("account")?.others?.name}</div>,
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
            cell: ({ row }: { row: any }) => <div >{row.getValue("account")?.company?.name}</div>,
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
            cell: ({ row }: { row: any }) => <div >{row.getValue("account")?.package?.amount}</div>,
        },
        {
            accessorKey: "billingPeriodStart",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Bill Month</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => <div >{moment(row.getValue("billingPeriodStart")).format("MMMM")}</div>,
        },
        {
            accessorKey: "grossBillAmount",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Gross Bill Amount</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => <div >{row.getValue("grossBillAmount")}</div>,
        },
        {
            accessorKey: "oneTimeCharge",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>One Time Charges</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => <div >{row.getValue("oneTimeCharge")}</div>,
        },
        {
            accessorKey: "vat",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Vat</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => <div >{row.getValue("vat")}</div>,
        },
        {
            accessorKey: "netBillAmount",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Net Bill Amount</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => <div >{row.getValue("netBillAmount")}</div>,
        },
    ];

    const usageConfig = {
        searchFields: [
            // { key: "name", label: 'name', type: "text" as const, placeholder: 'Search by account' },

        ],
        filterFields: [
            { key: "account", label: 'accountNumber', type: "select" as const, data: accountNames, placeholder: 'Search by Account', name: 'acountNumber' },
        ],
        dataTable: {
            columns: usageColumns,
            data: Array.isArray(usageData) ? usageData : usageData?.data,
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

            <MasterComponent config={usageConfig} loadingState={loading} rowClassMap={undefined} summary={false} />
            <DynamicDialog
                isOpen={isDialogOpen}
                closeDialog={closeDialog}
                selectedMaster={selectedMaster}
                onSave={saveData}
                fields={fields}
                initialData={initialData}
                deductionData={deductionData}
                accountData = {accountData}
                action={action}
                height='auto'
                onchangeData={() => { }}
            />
        </>

    )
}

export default page