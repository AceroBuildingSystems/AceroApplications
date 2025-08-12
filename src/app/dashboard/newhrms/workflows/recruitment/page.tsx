"use client";

import React, { useMemo } from 'react'
import MasterComponent from '@/components/MasterComponent/MasterComponent'
import { ArrowUpDown, ChevronDown, ChevronsUpDown, Loader, Loader2, Loader2Icon, MoreHorizontal } from "lucide-react"
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
import { useRouter } from 'next/navigation';
import HrmsDialog from '@/components/hrms/HrmsComponent';
import { HRMSFormConfig } from '@/types/hrms';
import { getFormConfig } from '@/configs/hrms-forms';
import { HRMS_WORKFLOW_TEMPLATES } from '@/types/workflow';
import moment from 'moment';
import { create } from 'lodash';

const page = () => {
    const router = useRouter()
    const [workflowType, setWorkflowType]: any = useState('recruitment');
    const [workflowConfig, setWorkflowConfig]: any = useState(null);
    const [formConfig, setFormConfig] = useState<HRMSFormConfig | null>(null);
    const [importing, setImporting] = useState(false);
    const { user, status, authenticated } = useUserAuthorised();

    const { data: customerData = [], isLoading: customerLoading }: any = useGetMasterQuery({
        db: MONGO_MODELS.CUSTOMER_MASTER,
        sort: { name: 'asc' },
    });

    const { data: locationData = [], isLoading: locationLoading } = useGetMasterQuery({
        db: MONGO_MODELS.LOCATION_MASTER,
        sort: { name: 'asc' },
    });

    const { data: employeeTypeData = [], isLoading: employeeTypeLoading } = useGetMasterQuery({
        db: MONGO_MODELS.EMPLOYEE_TYPE_MASTER,
        sort: { name: 'asc' },
    });

    const { data: designationData = [], isLoading: designationLoading } = useGetMasterQuery({
        db: MONGO_MODELS.DESIGNATION_MASTER,
        sort: { name: 'asc' },
    });

    const { data: departmentsData = [], isLoading: departmentLoading } = useGetMasterQuery({
        db: MONGO_MODELS.DEPARTMENT_MASTER,
        sort: { name: 'asc' },
    });
    const { data: recruitmentData = [], isLoading: recruitmentLoading, refetch } = useGetMasterQuery({
        db: MONGO_MODELS.RECRUITMENT,
        sort: { status: 'desc', createdAt: 'desc' },
    });
    const { data: usersData = [], isLoading: userLoading }: any = useGetMasterQuery({
        db: 'USER_MASTER',
        filter: { isActive: true },
        sort: { empId: 'asc' },
    });

    const departments = departmentsData?.data || [];
    const users = usersData?.data || [];

    const userOptions = useMemo(() =>
        users.map((user: any) => ({
            ...user, // keep all original fields
            name: user?.displayName ? user.displayName : `${user.firstName}`,
        })),
        [users]
    );

    const depNames = departmentsData?.data
    ?.filter((dep: undefined) => dep !== undefined)  // Remove undefined entries
    ?.map((dep: { _id: any; name: any }) => ({ _id: dep.name, name: dep.name }));

    const positionNames = designationData?.data
    ?.filter((dep: undefined) => dep !== undefined)  // Remove undefined entries
    ?.map((dep: { _id: any; name: any }) => ({ _id: dep.name, name: dep.name }));


    const recruitymentTypes = [{ _id: 'internal', name: 'Internal' }, { _id: 'external', name: 'External' }, { _id: 'foreign', name: 'Foreign' }];

    console.log('Recruitment Data:', recruitmentData);
    // useEffect(() => {
    //     const config = getFormConfig('manpower_requisition');
    //     console.log('Form Config:', config);
    //     setFormConfig(config || null);
    // }, []); // ✅ only runs once on mount

    useEffect(() => {
        // Simulate fetching or selecting workflow config
        if (workflowType) {
            const config = HRMS_WORKFLOW_TEMPLATES[workflowType.toUpperCase()];
            setWorkflowConfig(config);
        }
    }, [workflowType]);

    const { data: customerTypeData = [], isLoading: customerTypeLoading }: any = useGetMasterQuery({
        db: MONGO_MODELS.CUSTOMER_TYPE_MASTER,
        sort: { name: 'asc' },
    });
    const [createMaster, { isLoading: isCreatingMaster }]: any = useCreateMasterMutation();

    const statusData = [{ _id: true, name: 'Active' }, { _id: false, name: 'InActive' }];

    const fieldsToAdd = [
        { fieldName: 'departmentName', path: ['department', 'name'] },
        { fieldName: 'positionName', path: ['requiredPosition', 'name'] }
      ];
    
      const transformedData = transformData(recruitmentData?.data, fieldsToAdd);

    const loading = customerLoading || customerTypeLoading || departmentLoading || userLoading || designationLoading || employeeTypeLoading || locationLoading || recruitmentLoading;

    interface RowData {
        id: string;
        name: string;
        email: string;
        role: string;
    }


    const fields: Array<{ label: string; name: string; type: string; data?: any; readOnly?: boolean; format?: string; required?: boolean; placeholder?: string }> = [

        { label: 'Customer Name', name: "name", type: "text", required: true, placeholder: 'Customer Name' },
        { label: 'Website', name: "website", type: "text", placeholder: 'Website' },
        { label: 'Email', name: "email", type: "email", placeholder: 'Email' },
        { label: 'Phone', name: "phone", type: "text", placeholder: 'Phone' },
        { label: 'Address', name: "address", type: "text", placeholder: 'Address' },
        { label: 'Customer Type', name: "customerType", type: "select", data: customerTypeData?.data, placeholder: 'Select Customer Type' },
        { label: 'Status', name: "isActive", type: "select", data: statusData, placeholder: 'Select Status' },

    ]


    const [isDialogOpen, setDialogOpen] = useState(false);
    const [selectedMaster, setSelectedMaster] = useState(""); // This will track the master type (department, role, etc.)
    const [initialData, setInitialData] = useState({});
    const [action, setAction] = useState('Add');
    const [currentIndex, setCurrentIndex] = useState(0);

    // Open the dialog and set selected master type
    const openDialog = (masterType: React.SetStateAction<string>) => {
        setSelectedMaster(masterType);

        setDialogOpen(true);
    };

    // Close dialog
    const closeDialog = async () => {
        setDialogOpen(false);
        setSelectedMaster("");
        setInitialData({});
        await refetch();
    };



    // Save function to send data to an API or database
    const saveData = async ({ formData, action }: { formData: any, action: string }) => {

        const formattedData = {
            db: MONGO_MODELS.CUSTOMER_MASTER,
            action: action === 'Add' ? 'create' : 'update',
            filter: { "_id": formData._id },
            data: formData,
        };



        const response = await createMaster(formattedData);


        if (response.data?.status === SUCCESS && action === 'Add') {
            toast.success('Customer added successfully');

        }
        else {
            if (response.data?.status === SUCCESS && action === 'Update') {
                toast.success('Customer updated successfully');
            }
        }

        if (response?.error?.data?.message?.message) {
            toast.error(`Error encountered: ${response?.error?.data?.message?.message}`);
        }

    };


    const editUser = (rowData: RowData) => {
        setAction('Update');
        setInitialData(rowData);
        openDialog("recruitment");
        // Your add logic for user page
    };

    const handleAdd = () => {
        setInitialData({});
         setCurrentIndex(0);
        setAction('Add');
        openDialog("recruitment");
       
        
    };


    const handleImport = () => {
        bulkImport({
            roleData: [], continentData: [], regionData: [], countryData: [], locationData: [], categoryData: [], vendorData: [], productData: [], warehouseData: [], customerTypeData, customerData: [], userData: [], teamData: [], designationData: [], departmentData: [], employeeTypeData: [], organisationData: [], action: "Add", user, createUser: createMaster, db: MONGO_MODELS.CUSTOMER_MASTER, masterName: "Customer", onStart: () => setImporting(true),
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



    const recruitmentColumns = [
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
            accessorKey: "requiredPosition",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2 w-[100px]"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Position</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => <div className='text-blue-500' onClick={() => editUser(row.original)}>{row.getValue("requiredPosition")?.name}</div>,
        },
        {
            accessorKey: "department",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2 w-[100px]"
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
            cell: ({ row }: { row: any }) => <div >{row.getValue("department")?.name}</div>,
        },
        {
            accessorKey: "requestDate",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Request Date</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => <div >{moment(row.original.requestDate).format("DD-MMM-YYYY")}</div>,
        },
        {
            accessorKey: "requestedBy",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Requested By</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => <div >{row.getValue("requestedBy")?.displayName}</div>,
        },

        {
            accessorKey: "approvalStatus",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Approval Status</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => {
                const value = row.getValue("approvalStatus") || "";
                const [first, second] = String(value).split("_");

                return (
                    <div>
                        {first?.toProperCase()}
                        {second && <span> ({second?.toProperCase()})</span>}
                    </div>
                );
            },
        },



    ];

    const customerConfig = {
        // searchFields: [
        //     { key: "name", label: 'name', type: "text" as const, placeholder: 'Search by customer' },

        // ],
        filterFields: [

            { key: "department", label: 'departmentName', type: "select" as const, data: depNames, placeholder: 'Search by Department', name: 'departmentName' },
            { key: "position", label: 'positionName', type: "select" as const, data: positionNames, placeholder: 'Search by Position', name: 'positionName' },

        ],
        dataTable: {
            columns: recruitmentColumns,
            data: transformedData,
        },
        buttons: [
            // { label: importing ? 'Importing...' : 'Import', action: handleImport, icon: Download, className: 'bg-blue-600 hover:bg-blue-700 duration-300' },
            // {
            //     label: 'Export', action: handleExport, icon: Upload, className: 'bg-green-600 hover:bg-green-700 duration-300', dropdownOptions: [
            //         { label: "Export to Excel", value: "excel", action: (type: string, data: any) => handleExport(type, data) },
            //         { label: "Export to PDF", value: "pdf", action: (type: string, data: any) => handleExport(type, data) },
            //     ]
            // },
            { label: 'New Process', action: handleAdd, icon: Plus, className: 'bg-sky-600 hover:bg-sky-700 duration-300' },
        ]
    };
    
      const visaTypes = [
            { _id: 'visit', name: 'Visit Visa' },
            { _id: 'employment', name: 'Employment Visa' },
            { _id: 'residence', name: 'Residence Visa' },
            { _id: 'others', name: 'Others' }]

    const rowClassMap = (row: any) => {
        if (row?.isTotalRow) return "bg-yellow-100 font-bold";
        if (row?.status) return {
            draft: "bg-white",
            quoterequested: "bg-yellow-100",
            completed: 'bg-green-200',
            submitted: 'bg-orange-200',
            rejected: 'bg-red-200',
            approved: 'bg-green-200'
        }[row.status] || "";
        return "";
    };

    console.log('Workflow Config:', workflowConfig, formConfig);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }
    // if (loading) return 
    // <div className="flex justify-center items-center h-screen">
    //     <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-50"></div>
    // </div>;



    return (
        <>

            <MasterComponent config={customerConfig} loadingState={loading} rowClassMap={rowClassMap} summary={false} />
            <HrmsDialog isOpen={isDialogOpen}
                closeDialog={closeDialog}
                formConfig={formConfig}
                workflowType={workflowConfig?.workflowType}
                initialFormConfig={workflowConfig}
                departments={departments}
                users={userOptions}
                designations={designationData?.data || []}
                employeeTypes={employeeTypeData?.data || []}
                action={action}
                locationData={locationData?.data || []}
                recruitymentTypes={recruitymentTypes}
                initialData={initialData}
                visaTypes={visaTypes}
                onSave={saveData}
                currentIndex={currentIndex}
            />
            {/* <DynamicDialog
                isOpen={isDialogOpen}
                closeDialog={closeDialog}
                selectedMaster={selectedMaster}
                onSave={saveData}
                fields={fields}
                initialData={initialData}
                action={action}
                height='auto'
                onchangeData={() => { }}

            /> */}
        </>

    )
}

export default page