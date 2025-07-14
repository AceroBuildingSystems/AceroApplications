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
import { transformData } from '@/lib/utils';

const page = () => {
    const [importing, setImporting] = useState(false);
    const { user, status, authenticated } = useUserAuthorised();

    const { data: employeeData = [], isLoading: employeeLoading }: any = useGetMasterQuery({
        db: MONGO_MODELS.USER_MASTER,
        sort: { name: 'asc' },
    });

    const { data: assetData, isLoading: assetsLoading, refetch } = useGetMasterQuery({
        db: MONGO_MODELS.ASSET_MASTER,
        filter: { isActive: true },
        populate: [
            { path: 'product' },
            { path: 'warehouse' },
            { path: 'inventory' },
            { path: 'inventory.vendor', select: 'name' },
            { path: 'currentAssignment.assignedTo', select: 'firstName lastName name' },
            { path: 'currentAssignment.location', select: 'name' },
            { path: 'assignmentHistory.assignedTo', select: 'firstName lastName name' },
            { path: 'assignmentHistory.location', select: 'name' }
        ]
    });


    const { data: usageData = [], isLoading: usageLoading }: any = useGetMasterQuery({
        db: MONGO_MODELS.USAGE_DETAIL,
        sort: { account: 'asc' },


    });


    const { data: accountData = [], isLoading: accountLoading }: any = useGetMasterQuery({
        db: MONGO_MODELS.ACCOUNT_MASTER,
        filter: { isActive: true },
        
    });


    const serialNumbers = accountData?.data?.map((item: any) => ({
        name: item?.name?.serialNumber,
        _id: item._id,
        package: item?.package,
    }));




    const { data: departmentData = [], isLoading: departmentLoading }: any = useGetMasterQuery({
        db: MONGO_MODELS.DEPARTMENT_MASTER,
        sort: { name: 'asc' },
    });

    const { data: companyData = [], isLoading: companyLoading }: any = useGetMasterQuery({
        db: MONGO_MODELS.ORGANISATION_MASTER,
        sort: { name: 'asc' },
    });

    const { data: deductionData = [], isLoading: deductionLoading }: any = useGetMasterQuery({
        db: MONGO_MODELS.DEDUCTION_TYPE_MASTER,
        filter: { isActive: true },
        sort: { name: 'asc' },
    });

   const fieldsToAdd = [
    { fieldName: 'accountNumber1', path: ['account', 'name'] },
    { fieldName: 'currentAssignment', path: ['account', 'name', 'currentAssignment'] },
    { fieldName: 'assignedTo', path: ['account', 'name', 'currentAssignment', 'assignedTo'] },
    { fieldName: 'company', path: ['account', 'name', 'currentAssignment', 'organisation'] },
    { fieldName: 'accountNumber', path: ['account', 'name', 'serialNumber'] },
    { fieldName: 'department', path: ['account', 'name', 'currentAssignment', 'assignedTo', 'employmentDetails', 'department'] },
    { fieldName: 'company', path: ['account', 'name', 'currentAssignment', 'assignedTo', 'employmentDetails', 'organisation'] },
    { fieldName: 'departmentName', path: ['account', 'name', 'currentAssignment', 'assignedTo', 'employmentDetails', 'department', 'name'] },
    { fieldName: 'companyName', path: ['account', 'name', 'currentAssignment', 'assignedTo', 'employmentDetails', 'organisation', 'name'] },
    { fieldName: 'employeeName', path: ['account', 'name', 'currentAssignment', 'assignedTo', '_id'] },
];

const transformedData = transformData(usageData?.data, fieldsToAdd);

    const [createMaster, { isLoading: isCreatingMaster }] = useCreateMasterMutation();

    const statusData = [{ _id: true, name: 'Active' }, { _id: false, name: 'InActive' }];

    const loading = usageLoading || accountLoading || employeeLoading || companyLoading || deductionLoading;

    interface RowData {
        id: string;
        name: string;
        email: string;
        role: string;
    }
    const accountNames = accountData?.data
        ?.filter((acc: undefined) => acc !== undefined)  // Remove undefined entries
        ?.map((acc: { _id: any; name: any; serialNumber:any }) => ({ _id: acc.name.serialNumber, name: acc.name.serialNumber }));

    const employeeNames = employeeData?.data
        ?.filter((emp: undefined) => emp !== undefined)  // Remove undefined entries
        ?.map((emp: { _id: any; displayName: any }) => ({ _id: emp?._id, name: emp?.displayName }));

    const departmentNames = departmentData?.data
        ?.filter((dep: undefined) => dep !== undefined)  // Remove undefined entries
        ?.map((dep: { _id: any; name: any }) => ({ _id: dep?.name, name: dep?.name }));

    const companyNames = companyData?.data
        ?.filter((comp: undefined) => comp !== undefined)  // Remove undefined entries
        ?.map((comp: { _id: any; name: any }) => ({ _id: comp?.name, name: comp?.name }));


    const fields: Array<{ label: string; name: string; type: string; data?: any; readOnly?: boolean; format?: string; required?: boolean; placeholder?: string }> = [

        { label: 'Account Number', name: "account", type: "select", required: true, placeholder: 'Select Account', format: 'ObjectId', data: serialNumbers },
        { label: 'Billing Start Date', name: "billingPeriodStart", type: "date", format: 'Date', placeholder: 'Select Bill Start Date' },
        { label: 'Gross Bill Amount', name: "grossBillAmount", type: "number", required: true, placeholder: 'Gross Bill Amount' },
        { label: 'One Time Charge', name: "oneTimeCharge", type: "number", required: false, placeholder: 'One Time Charge' },
        { label: 'Vat', name: "vat", type: "number", required: true, readOnly: false, placeholder: 'Vat' },
        { label: 'Net Bill Amount', name: "netBillAmount", type: "number", required: false, readOnly: true, placeholder: 'Net Bill Amount' },
        { label: 'Outstanding Amount', name: "outstandingAmount", type: "number", required: false, placeholder: 'Net Bill Amount' },
        { label: 'Total Amount Due', name: "totalAmountDue", type: "number", required: false, readOnly: true, placeholder: 'Net Bill Amount' },
        { label: 'Total Deduction', name: "totalDeduction", type: "number", required: false, readOnly: true, placeholder: 'Net Bill Amount' },
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

        function formatDate(dateString) {
            const d = new Date(dateString);
            return d.toLocaleDateString('en-GB'); // "dd/MM/yyyy"
        };
        const exists = usageData?.data?.some(item =>
            item.account?._id === formData?.account &&
            formatDate(item?.billingPeriodStart) === formatDate(formData?.billingPeriodStart)
        );

        if (exists && action === 'Add') {
            toast.error("Data entry for this account for the selected month is already exists.");
            return;
        }
        else {
            const formattedData = {
                db: MONGO_MODELS.USAGE_DETAIL,
                action: action === 'Add' ? 'create' : 'update',
                filter: { "_id": formData._id },
                data: formData,
            };

            const response: any = await createMaster(formattedData);

            return response;
        }


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

    console.log(transformedData, "usageData");

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
                "Account Number": data?.account?.name,
                "Employee": data?.employee?.displayName?.toProperCase(),
                "Others": data?.account?.others?.name?.toProperCase(),
                "Department": data?.employee ? data?.employee?.department?.name : data?.account?.others?.department?.name,
                "Company": data?.company?.name,
                "Package": Math.round(parseFloat(data?.account?.package?.amount) * 100) / 100,
                "Gross Bill AMount": Number(parseFloat(data?.grossBillAmount)?.toFixed(2)),
                "One Time Charge": Number(parseFloat(data?.oneTimeCharge)?.toFixed(2)),
                "Net Bill Amount": Number(parseFloat(data?.netBillAmount)?.toFixed(2)),
                "Total Amount Due": Number(parseFloat(data?.totalAmountDue)?.toFixed(2)),
                "Deduction Amount": Number(parseFloat(data?.totalDeduction)?.toFixed(2)),
                "Waived Amount": Number(parseFloat(data?.waivedAmount)?.toFixed(2)),
                "Total Deduction Amount": Number(parseFloat(data?.finalDeduction)?.toFixed(2)),

            }));
        } else {
            // Create a single empty row with keys only (for header export)
            formattedData = [{
                "Account Number": '',
                "Employee": '',
                "Others": '',
                "Department": '',
                "Company": '',
                "Package": '',
                "Gross Bill AMount": '',
                "One Time Charge": '',
                "Net Bill Amount": '',
                "Total Amount Due": '',
                "Deduction Amount": '',
                "Waived Amount": '',
                "Total Deduction Amount": '',
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
            cell: ({ row }: { row: any }) => <div className='text-blue-500' onClick={() => editUser(row.original)}>{row.getValue("account")?.name?.serialNumber}</div>,
        },

        {
            accessorKey: "account.name.currentAssignment",
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
            cell: ({ row }: { row: any }) => {
                const assignment = row.original?.account?.name?.currentAssignment;
                const empName =
                    assignment?.assignedTo?.displayName ||
                    assignment?.assignedTo?.firstName ||
                    "—";

                return <div>{empName.toProperCase?.() || empName}</div>;
            },
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
            cell: ({ row }: { row: any }) => {
                const assignment = row.original?.account?.name?.currentAssignment;
                const company =
                    assignment?.assignedTo?.employmentDetails?.organisation?.name ||
                    "—";

                return <div>{company.toProperCase?.() || company}</div>;
            },
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
            cell: ({ row }: { row: any }) => <div >{parseFloat(row.getValue("account")?.package?.amount)?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>,
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
            cell: ({ row }: { row: any }) => <div >{parseFloat(row.getValue("grossBillAmount"))?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>,
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
            cell: ({ row }: { row: any }) => <div >{parseFloat(row.getValue("oneTimeCharge"))?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>,
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
            cell: ({ row }: { row: any }) => <div >{parseFloat(row.getValue("vat"))?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>,
        },
        {
            accessorKey: "netBillAmount",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group flex items-center space-x-2"
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
            cell: ({ row }: { row: any }) => <div className="">{parseFloat(row.getValue("netBillAmount"))?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>,
        },
    ];

    const usageConfig = {
        title: 'Usage Details',
        searchFields: [
            // { key: "name", label: 'name', type: "text" as const, placeholder: 'Search by account' },
            { key: "billMonth", label: 'billingPeriodStart', type: "date" as const, data: accountNames, placeholder: 'Bill Start Date' },
        ],
        filterFields: [
            { key: "account", label: 'accountNumber', type: "select" as const, data: accountNames, placeholder: 'Search by Account', name: 'accountNumber' },
            { key: "employee", label: 'employeeName', type: "select" as const, data: employeeNames, placeholder: 'Search by Employee', name: 'employeeName' },
            { key: "department", label: 'departmentName', type: "select" as const, data: departmentNames, placeholder: 'Search by Department', name: 'departmentName' },
            { key: "company", label: 'companyName', type: "select" as const, data: companyNames, placeholder: 'Search by Company', name: 'companyName' },

        ],
        dataTable: {
            columns: usageColumns,
            data: Array.isArray(transformedData) ? transformedData : transformedData?.data,
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

            <MasterComponent config={usageConfig} loadingState={loading} rowClassMap={undefined} summary={true} />
            <DynamicDialog
                isOpen={isDialogOpen}
                closeDialog={closeDialog}
                selectedMaster={selectedMaster}
                onSave={saveData}
                fields={fields}
                initialData={initialData}
                deductionData={deductionData}
                accountData={accountData}
                action={action}
                height='auto'
                onchangeData={() => { }}
            />
        </>

    )
}

export default page