"use client";

import React, { useMemo } from 'react'
import MasterComponent from '@/components/MasterComponent/MasterComponent'
import { ArrowUpDown, ChevronDown, ChevronsUpDown, FileTextIcon, Loader, Loader2, Loader2Icon, MoreHorizontal } from "lucide-react"
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
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/inputSearch';
import { Button } from '@/components/ui/button';
import HrmsPdfGenerator from '@/components/hrms/HrmsPdfGenerator';
import { useSendEmailMutation } from '@/services/endpoints/emailApi';
import ApprovalFlowDialog from '@/components/ApprovalFlowDialog';


const page = () => {

    const [sendEmail, { isLoading: isSendEMail }]: any = useSendEmailMutation();
    const [workflowType, setWorkflowType]: any = useState('offboarding');
    const [workflowConfig, setWorkflowConfig]: any = useState(null);
    const [formConfig, setFormConfig] = useState<HRMSFormConfig | null>(null);

    const { user, status, authenticated } = useUserAuthorised();

    const { data: offboardingData = [], isLoading: offboardingLoading, refetch } = useGetMasterQuery({
        db: MONGO_MODELS.OFFBOARDING,
        sort: { status: 'desc', createdAt: 'desc' },
    });
    const { data: usersData = [], isLoading: userLoading }: any = useGetMasterQuery({
        db: 'USER_MASTER',
        filter: { isActive: true },
        sort: { empId: 'asc' },
    });

    const users = usersData?.data || [];

    const userOptions = useMemo(() =>
        users.map((user: any) => ({
            ...user, // keep all original fields
            name: user?.displayName ? user.displayName : `${user.firstName}`,

        })),
        [users]
    );




    useEffect(() => {
        // Simulate fetching or selecting workflow config
        if (workflowType) {
            const config = HRMS_WORKFLOW_TEMPLATES[workflowType.toUpperCase()];
            setWorkflowConfig(config);
        }
    }, [workflowType]);

    const [createMaster, { isLoading: isCreatingMaster }]: any = useCreateMasterMutation();

    const fieldsToAdd = [
        { fieldName: 'departmentName', path: ['department', 'name'] },
        { fieldName: 'positionName', path: ['requiredPosition', 'name'] }
    ];

    // const transformedData = transformData(recruitmentData?.data, fieldsToAdd);

    const loading = userLoading || offboardingLoading;


    console.log('Offboarding Data:', offboardingData?.data);


    interface RowData {
        id: string;
        name: string;
        email: string;
        role: string;
    }


    const [isApprovalFLowDialogOpen, setApprovalFLowDialogOpen] = useState(false);
    const [isDialogOpen, setDialogOpen] = useState(false);

    const [isDialogOpenPdfGenerator, setDialogOpenPdfGenerator] = useState(false);

    const [selectedMaster, setSelectedMaster] = useState(""); // This will track the master type (department, role, etc.)
    const [initialData, setInitialData]: any = useState({});

    const [action, setAction] = useState('Add');
    const [currentIndex, setCurrentIndex] = useState(0);



    // Open the dialog and set selected master type
    const openDialog = (masterType: React.SetStateAction<string>) => {
        setSelectedMaster(masterType);
        // setInitialData({ requestedDepartment: user?.department?._id || "", });
        setDialogOpen(true);

    };

    const closeApprovalFLowDialog = async () => {
        setApprovalFLowDialogOpen(false);
        setSelectedMaster("");
        setInitialData({});

    };

    const openApprovalFLowDialog = (rowData: RowData) => {
        setApprovalFLowDialogOpen(true);
        setSelectedMaster("Approval Flow");
        setInitialData(rowData);

    };

    // Close dialog
    const closeDialog = async () => {
        setDialogOpen(false);
        setSelectedMaster("");
        setInitialData({});
        await refetch();
    };

    const closeDialogPdfGenerator = async () => {
        setDialogOpenPdfGenerator(false);
        setSelectedMaster("");
        setInitialData({});

    };

    // Save function to send data to an API or database


    const editUser = (rowData: RowData) => {
        console.log('rowdata', rowData)
        setAction('Update');
        setInitialData({ ...rowData, employee: rowData.employee?._id || rowData.employee });
        openDialog("appraisal");
        // Your add logic for user page
    };

    const openPdfGenerator = (rowData: RowData) => {
        setAction('Add');
        setInitialData(rowData);

        setDialogOpenPdfGenerator(true)
        // Your add logic for user page
    };


    const handleAdd = () => {
        setInitialData({ requestedDepartment: user?.department?._id || "", requestedBy: user?._id || "" });
        setCurrentIndex(0);
        setAction('Add');
        openDialog("businessTrip");


    };


    const offboardingColumns = [
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
            cell: ({ row }: { row: any }) => <div className='text-blue-500' onClick={() => editUser(row.original)}>{row.getValue("employee")?.displayName?.toProperCase()}</div>,
        },
        {
            accessorKey: "requestedDepartment",
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
            cell: ({ row }: { row: any }) => <div >{row.getValue("employee")?.department?.name}</div>,
        },
        {
            accessorKey: "doj",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Date Of Joining</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => {
                const employeeInfo = row.original.employee || [];
                const employeeData = users?.find((u: any) => u._id === employeeInfo?._id);
                return <div className="">{moment(employeeData?.joiningDate).format("DD-MMM-yyyy")}</div>;
            },
        },
        {
            accessorKey: "releavingDate",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Last Working Date</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => <div >{moment(row.original.releavingDate).format("DD-MMM-YYYY")}</div>,
        },

        {
            accessorKey: "createdAt",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Offboarding Request Date</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => <div >{moment(row.original.createdAt).format("DD-MMM-YYYY")}</div>,
        },



        {
            accessorKey: "pdf",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span></span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => <div onClick={() => openPdfGenerator(row.original)}><Button className='text-xs'>
                <FileTextIcon className="h-3 w-3" />
                PDF
            </Button></div>,
        },


    ];

    const customerConfig = {
        // searchFields: [
        //     { key: "name", label: 'name', type: "text" as const, placeholder: 'Search by customer' },

        // ],
        filterFields: [

            // { key: "department", label: 'departmentName', type: "select" as const, data: depNames, placeholder: 'Search by Department', name: 'departmentName' },
            // { key: "position", label: 'positionName', type: "select" as const, data: positionNames, placeholder: 'Search by Position', name: 'positionName' },

        ],
        dataTable: {
            columns: offboardingColumns,
            data: offboardingData?.data,
        },
        buttons: [
            // { label: importing ? 'Importing...' : 'Import', action: handleImport, icon: Download, className: 'bg-blue-600 hover:bg-blue-700 duration-300' },
            // {
            //     label: 'Export', action: handleExport, icon: Upload, className: 'bg-green-600 hover:bg-green-700 duration-300', dropdownOptions: [
            //         { label: "Export to Excel", value: "excel", action: (type: string, data: any) => handleExport(type, data) },
            //         { label: "Export to PDF", value: "pdf", action: (type: string, data: any) => handleExport(type, data) },
            //     ]
            // },
            { label: 'Offboarding', action: handleAdd, icon: Plus, className: 'bg-sky-600 hover:bg-sky-700 duration-300' },
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


    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    console.log('formConfig', workflowConfig)
    return (
        <>

            <MasterComponent config={customerConfig} loadingState={loading} rowClassMap={rowClassMap} summary={false} />
            <HrmsDialog isOpen={isDialogOpen}
                closeDialog={closeDialog}
                formConfig={formConfig}
                workflowType={workflowConfig?.workflowType}
                initialFormConfig={workflowConfig}
                departments={[]}
                users={userOptions}
                designations={[]}
                employeeTypes={[]}
                action={action}
                locationData={[]}
                recruitymentTypes={[]}
                initialData={initialData}
                visaTypes={[]}
                onSave={() => { }}
                currentIndex={currentIndex}
                countryData={[]}
                currencyData={[]}
            />

            <HrmsPdfGenerator
                isOpen={isDialogOpenPdfGenerator}
                closeDialog={closeDialogPdfGenerator}
                workflowData={workflowConfig}
                manpowerData={initialData}
                candidateData={users}
                interviewData={[]}
                offerData={[]}
                height='auto'
                width="80%"
            />

            {initialData && (<ApprovalFlowDialog
                isOpen={isApprovalFLowDialogOpen}
                closeDialog={closeApprovalFLowDialog}
                approvalFlow={initialData?.approvalFlow}
                title={`Approval Workflow for Business Trip Request`}
                name='offboarding'
            />)}



        </>

    )
}

export default page