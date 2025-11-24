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
    const router = useRouter()
    const [sendEmail, { isLoading: isSendEMail }]: any = useSendEmailMutation();
    const [workflowType, setWorkflowType]: any = useState('recruitment');
    const [workflowConfig, setWorkflowConfig]: any = useState(null);
    const [formConfig, setFormConfig] = useState<HRMSFormConfig | null>(null);
    const [importing, setImporting] = useState(false);

    const [searchTerm, setSearchTerm] = useState('')
    const { user, status, authenticated } = useUserAuthorised();

    const { data: customerData = [], isLoading: customerLoading }: any = useGetMasterQuery({
        db: MONGO_MODELS.CUSTOMER_MASTER,
        sort: { name: 'asc' },
    });

    const { data: locationData = [], isLoading: locationLoading } = useGetMasterQuery({
        db: MONGO_MODELS.LOCATION_MASTER,
        filter: { isActive: true, isCompanyLocation: 'yes' },
        sort: { name: 'asc' },
    });

    const { data: countryData = [], isLoading: countryLoading } = useGetMasterQuery({
        db: MONGO_MODELS.COUNTRY_MASTER,
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
    console.log('designations', designationData?.data);
    const depNames = departmentsData?.data
        ?.filter((dep: undefined) => dep !== undefined)  // Remove undefined entries
        ?.map((dep: { _id: any; name: any }) => ({ _id: dep.name, name: dep.name }));

    const positionNames = designationData?.data
        ?.filter((dep: undefined) => dep !== undefined)  // Remove undefined entries
        ?.map((dep: { _id: any; name: any }) => ({ _id: dep.name, name: dep.name }));


    const recruitymentTypes = [{ _id: 'internal', name: 'Internal' }, { _id: 'external', name: 'External' }, { _id: 'foreign', name: 'Foreign' }];

    console.log('Recruitment Data:', recruitmentData);


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

    const loading = customerLoading || customerTypeLoading || departmentLoading || userLoading || designationLoading || countryLoading || employeeTypeLoading || locationLoading || recruitmentLoading;

    interface RowData {
        id: string;
        name: string;
        email: string;
        role: string;
    }


    const fields: Array<{ label: string; name: string; type: string; data?: any; readOnly?: boolean; format?: string; required?: boolean; placeholder?: string }> = [


        { label: 'Checker', name: "checker", type: "select", data: usersData?.data, placeholder: 'Select Checker' },

    ]

    const [isApprovalFLowDialogOpen, setApprovalFLowDialogOpen] = useState(false);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [isDialogOpenChecker, setDialogOpenChecker] = useState(false);
    const [isDialogOpenPdfGenerator, setDialogOpenPdfGenerator] = useState(false);
    const [isDialogOpenInterviewer, setDialogOpenInterviewer] = useState(false);
    const [selectedMaster, setSelectedMaster] = useState(""); // This will track the master type (department, role, etc.)
    const [initialData, setInitialData]: any = useState({});

    const [action, setAction] = useState('Add');
    const [currentIndex, setCurrentIndex] = useState(0);

    const [interviewers, setInterviewers] = React.useState<string[]>([]);

    const updateInterviewers = (newInterviewers: string[]) => {
        setInterviewers(newInterviewers);
        console.log('interv', interviewers)
        // If you are using react-hook-form, you might also want to update the form field value here
        // e.g. setValue('interviewers', newInterviewers);
    };

    // Open the dialog and set selected master type
    const openDialog = (masterType: React.SetStateAction<string>) => {
        setSelectedMaster(masterType);

        setDialogOpen(true);

    };

    const openDialogChecker = (masterType: React.SetStateAction<string>) => {
        setSelectedMaster(masterType);

        setDialogOpenChecker(true);
    };

    const openDialogInterviewer = (masterType: React.SetStateAction<string>) => {
        setSelectedMaster(masterType);

        setDialogOpenInterviewer(true);
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

    const closeDialogChecker = async () => {
        setDialogOpenChecker(false);
        setSelectedMaster("");
        setInitialData({});

    };

    const closeDialogPdfGenerator = async () => {
        setDialogOpenPdfGenerator(false);
        setSelectedMaster("");
        setInitialData({});

    };

    // Save function to send data to an API or database
    const saveData = async ({ formData, action }: { formData: any, action: string }) => {


        const formattedData = {
            db: MONGO_MODELS.RECRUITMENT,
            action: 'update',
            filter: { "_id": formData._id },
            data: formData,
        };

        console.log('Formatted Data1:', formattedData);

        const response = await createMaster(formattedData);


        let emailData = {};
        if (response?.data && response?.data?.status === SUCCESS) {
            if (selectedMaster === 'Checker') {
                console.log('response', response)

                const requestData = { 'requestedBy': response.data.data?.requestedBy?.displayName, 'requestedDate': response.data.data?.createdAt, 'requestedPosition': '' };
                emailData = { recipient: response.data.data?.checker?.email, subject: 'To Check Candidates Detail', templateData: requestData, fileName: "hrmsTemplates/checkerInterviewer", senderName: user?.displayName?.toProperCase(), approveUrl: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/dashboard/newhrms/candidates`, rejectUrl: ``, recipientName: response.data.data?.checker?.displayName?.toProperCase(), position: response.data.data?.requiredPosition?.name };

                await sendEmail(emailData);
            }
            if (selectedMaster === 'Interviewer') {
                const oldInterviewers = recruitmentData?.data?.filter(data => data._id === formData._id)?.[0]?.interviewers?.map(i => i._id) || [];

                // Extract new interviewer IDs from updated data
                const updatedInterviewers = response?.data?.data?.interviewers?.map(i => i._id) || [];

                // Find newly added interviewers
                const newInterviewers = updatedInterviewers.filter(id => !oldInterviewers.includes(id));

                const newInterviewerObjects = response?.data?.data?.interviewers?.filter(i => newInterviewers.includes(i._id)) || [];

                // Extract emails of new interviewers
                const newInterviewerEmails = newInterviewerObjects.map(i => i.email).join(',');
                console.log('response', response?.data?.data?.interviewers, recruitmentData?.data?.filter(data => data._id === formData._id), oldInterviewers, newInterviewers, newInterviewerEmails)
                if (newInterviewerEmails.length > 0) {
                    const requestData = { 'requestedBy': response.data.data?.requestedBy?.displayName, 'requestedDate': response.data.data?.createdAt, 'requestedPosition': '' };
                    emailData = { recipient: newInterviewerEmails, subject: 'To Interview candidates', templateData: requestData, fileName: "hrmsTemplates/checkerInterviewer", senderName: user?.displayName?.toProperCase(), approveUrl: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/dashboard/newhrms/interview_assessment`, rejectUrl: ``, recipientName: `Team`, position: response.data.data?.requiredPosition?.name };

                    await sendEmail(emailData);
                }

            }

        }

        setDialogOpenInterviewer(false);
        setSelectedMaster("");
        setInitialData({});
        if (selectedMaster === 'Interviewer') {
            toast.success('Interviewer assigned successfully.')
        }
        return response;

    };


    const editUser = (rowData: RowData) => {
        setAction('Update');


        setInitialData({ ...rowData, requestedDepartment: rowData?.department });
        openDialog("recruitment");
        // Your add logic for user page
    };

    const editChecker = (rowData: RowData) => {
        setAction('Add');
        setInitialData(rowData);
        openDialogChecker("Checker");
        // Your add logic for user page
    };

    const editInterviewer = (rowData: RowData) => {
        setAction('Add');
        setInitialData(rowData);
        const interviewerIds = rowData?.interviewers?.map((i: any) => i._id) || [];
        setInterviewers(interviewerIds);

        openDialogInterviewer("Interviewer");
        // Your add logic for user page
    };

    const openPdfGenerator = (rowData: RowData) => {
        setAction('Add');
        setInitialData(rowData);

        setDialogOpenPdfGenerator(true)
        // Your add logic for user page
    };

    console.log('interv', interviewers)
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
                    <div className='text-blue-500' onClick={() => openApprovalFLowDialog(row.original)}>
                        {first?.toProperCase()}
                        {second && <span> ({second?.toProperCase()})</span>}
                    </div>
                );
            },
        },

        {
            accessorKey: "checker",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Checker</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => {
                const value = row.getValue("checker")?.displayName || "Assign";


                return (
                    <div className='text-blue-500' onClick={() => editChecker(row.original)}>
                        {value?.toProperCase()}

                    </div>
                );
            },
        },

        {
            accessorKey: "interviewers",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Interviewer</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => {
                const interviewers = row.getValue("interviewers") || [];

                if (!Array.isArray(interviewers) || interviewers.length === 0) {
                    return <div className='text-blue-500' onClick={() => editInterviewer(row.original)}>Assign</div>;
                }

                return (
                    <div className='text-blue-500' onClick={() => editInterviewer(row.original)}>
                        {interviewers.map((intv: any, idx: number) => (
                            <div key={idx}>
                                {intv.displayName?.toProperCase() || "Unknown"}
                            </div>
                        ))}
                    </div>
                );
            },
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
            { label: 'Recruitment', action: handleAdd, icon: Plus, className: 'bg-sky-600 hover:bg-sky-700 duration-300' },
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
                countryData={countryData?.data || []}
            />
            <DynamicDialog
                isOpen={isDialogOpenChecker}
                closeDialog={closeDialogChecker}
                selectedMaster={selectedMaster}
                onSave={saveData}
                fields={fields}
                initialData={initialData}
                action={action}
                height='auto'
                onchangeData={() => { }}
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
                title={`Approval Workflow for Manpower Requisistion`}
                name='recruitment'
            />)}



            <Dialog open={isDialogOpenInterviewer} onOpenChange={setDialogOpenInterviewer}>
                <DialogContent
                    className="bg-white max-w-full pointer-events-auto mx-2 max-h-[75vh] w-[65%] h-[80vh] flex flex-col"
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <DialogTitle className="sticky top-0 bg-white border-b border-gray-200 py-2 mx-2">
                        Add Interviewers
                    </DialogTitle>

                    {/* Search Box */}
                    <div className="px-2 mb-1">

                        <Input
                            type="text"
                            placeholder="Search interviewer..."

                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        >

                        </Input>

                    </div>

                    <Label className="px-2">Select Interviewer</Label>

                    {/* Scrollable List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-4 mx-2">
                        {usersData?.data
                            ?.filter((user: any) => {
                                const name = user.displayName || `${user.firstName} ${user.lastName}`;
                                return name.toLowerCase().includes(searchTerm.toLowerCase());
                            })
                            .map((user: any, idx: number) => {
                                const name = user.displayName || `${user.firstName} ${user.lastName}`;
                                const isChecked = interviewers?.includes(user._id);

                                return (
                                    <div key={user._id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`interviewer-${idx}-${user._id}`}
                                            checked={isChecked}
                                            onCheckedChange={(checked) => {
                                                const updated = checked
                                                    ? [...(interviewers || []), user._id]
                                                    : interviewers.filter((id) => id !== user._id);
                                                updateInterviewers(updated);
                                            }}
                                        />
                                        <Label
                                            htmlFor={`interviewer-${idx}-${user._id}`}
                                            className="text-sm cursor-pointer"
                                        >
                                            {name}
                                        </Label>
                                    </div>
                                );
                            })}
                    </div>
                    <div className='flex justify-end items-end px-2'>
                        <Button
                            className="px-4"
                            onClick={() => saveData({ formData: { ...initialData, interviewers }, action: 'Add' })}
                        >
                            Save
                        </Button>

                    </div>

                </DialogContent>
            </Dialog>


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