"use client";

import React, { useMemo } from 'react'
import NextLink from 'next/link';
import MasterComponent from '@/components/MasterComponent/MasterComponent'
import { ArrowUpDown, ChevronDown, ChevronsUpDown, Link, Loader, Loader2, Loader2Icon, MoreHorizontal } from "lucide-react"
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
import { useRouter, useSearchParams } from 'next/navigation';
import HrmsDialog from '@/components/hrms/HrmsComponent';
import { HRMSFormConfig } from '@/types/hrms';
import { deepCloneWithOptionsInjection, getFormConfig } from '@/configs/hrms-forms';
import { HRMS_WORKFLOW_TEMPLATES } from '@/types/workflow';
import moment from 'moment';
import { create } from 'lodash';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/inputSearch';
import { Button } from '@/components/ui/button';
import { Recruitment } from '@/models';
import FormContainer from '@/components/hrms/FormContainer';

const page = () => {
    const router = useRouter()
    const [createMaster, { isLoading: isCreatingMaster }] = useCreateMasterMutation();
    const searchParams = useSearchParams();
    const recruitmentId = searchParams.get("processId");
    const [workflowType, setWorkflowType]: any = useState('recruitment');
    const [workflowConfig, setWorkflowConfig]: any = useState(null);
    const [formConfig, setFormConfig] = useState<HRMSFormConfig | null>(null);
    const [importing, setImporting] = useState(false);
    const [showCandidateDialog, setShowCandidateDialog] = useState(false);

    const [actionCandidate, setActionCandidate] = useState('Add');
    const [searchTerm, setSearchTerm] = useState('')
    const { user, status, authenticated } = useUserAuthorised();
    const [initialDataCandidate, setInitialDataCandidate] = useState([]);
    const { data: designationData = [], isLoading: designationLoading } = useGetMasterQuery({
        db: MONGO_MODELS.DESIGNATION_MASTER,
        sort: { name: 'asc' },
    });

    const { data: departmentsData = [], isLoading: departmentLoading } = useGetMasterQuery({
        db: MONGO_MODELS.DEPARTMENT_MASTER,
        sort: { name: 'asc' },
    });
    const { data: candidatesData = [], isLoading: candidatesLoading } = useGetMasterQuery({
        db: MONGO_MODELS.CANDIDATE_INFO,
        filter: { recruitment: recruitmentId, isActive: true },
        sort: { status: 'desc', createdAt: 'desc' },
    });
    const { data: recruitmentData = [], isLoading: recruitmentLoading }: any = useGetMasterQuery({
        db: MONGO_MODELS.CANDIDATE_INFO,
        filter: { '_id': recruitmentId, isActive: true }

    });
    const { data: countryData = [], isLoading: countryLoading }: any = useGetMasterQuery({
        db: MONGO_MODELS.COUNTRY_MASTER,
        filter: { isActive: true }

    });
    const { data: usersData = [], isLoading: userLoading }: any = useGetMasterQuery({
        db: 'USER_MASTER',
        filter: { isActive: true },
        sort: { empId: 'asc' },
    });

    if (!recruitmentId) {
        toast.error(`Recruitment need to be selected to get the candidates info.`)
    }

    useEffect(() => {

        const loadStepConfig = async () => {
            const baseConfig = getFormConfig('candidate_information');
            if (!baseConfig) return;

            const optionsMap = {
                nationality: countryData?.data,
                visaType: visaTypes,
                checkedBy: usersData?.data,
            };
            console.log('baseconfig', baseConfig);
            const updatedConfig = deepCloneWithOptionsInjection(baseConfig, optionsMap);
            setFormConfig(updatedConfig);
        };

        loadStepConfig();
    }, [countryLoading, userLoading]);


    const loading = departmentLoading || userLoading || designationLoading || candidatesLoading || countryLoading || isCreatingMaster || recruitmentLoading;

    interface RowData {
        id: string;
        name: string;
        email: string;
        role: string;
    }



    const closeDialogChecker = async () => {


    };

    // const editCandidate = (rowData: RowData) => {
    //     console.log('here')
    //     const path = `candidates?processId=${rowData?._id}`;
    //     console.log("Navigating to:", path);
    //     //   router.push(path);

    // };
    async function urlToFile(url, filename, mimeType) {
        const res = await fetch(url);
        const blob = await res.blob();
        return new File([blob], filename, { type: mimeType });
    }

    const editUser = (rowData: any) => {
        console.log('Editing user:', rowData);
        if (rowData?.attachResume) {
            const loadFile = async () => {
                try {
                    // Extract filename and extension
                    const url = rowData.attachResume;
                    const filename = url.split('/').pop();
                    const ext = filename.split('.').pop()?.toLowerCase() || '';
                    const mimeType = ext === 'pdf' ? 'application/pdf' : `application/${ext}`;

                    const file = await urlToFile(url, filename, mimeType);

                    // Store file in your form state (e.g., react-hook-form, Formik, or normal state)
                    // setFormData(prev => ({ ...prev, resume: file }));
                    setInitialDataCandidate({ ...rowData, attachResume: file, resumeUrl: url });
                    // If you want to preview, also create an object URL
                    // setResumePreview(URL.createObjectURL(file));
                } catch (err) {
                    console.error("Error loading file:", err);
                }
            };
            loadFile();
        }


        setActionCandidate('Update');

        setShowCandidateDialog(true);

        // Your add logic for user page
    };

    const handleAdd = () => {

        setActionCandidate('Add');
        setInitialDataCandidate([]);
        setShowCandidateDialog(true);
    };

    const handleUpload = async (firstName, lastName, contactNumber, documentType, file) => {
        if (!file) return;
        console.log('upoading file:', file.name);
        // setIsUploading(true);
        // setUploadProgress(0);

        // Prepare API endpoint with ticketId and userId
        const endpoint = `/api/uploadCadidatesDocs?fullname=${firstName + `_` + lastName + `_` + contactNumber}&documentType=${documentType}`;

        // Prepare headers
        const headers: HeadersInit = {
            "Content-Type": file.type || "application/octet-stream",
            "Content-Disposition": `attachment; filename="${file.name}"`
        };

        // Optional: Track upload progress (for UI only)
        const reader = file.stream().getReader();
        let uploaded = 0;
        const total = file.size;
        let chunks: Uint8Array[] = [];

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
                chunks.push(value);
                uploaded += value.length;
                // setUploadProgress(Math.min(100, Math.round((uploaded / total) * 100)));
            }
        }
        const fileBuffer = new Blob(chunks);

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers,
                body: fileBuffer
            });

            const result = await res.json();
            console.log('Upload result:', result);
            if (res.ok && result.status === "success") {
                return result.data; // Return the file URL or any other data you need


            } else {
                toast.error(result.message || "Upload failed");
            }
        } catch (err: any) {
            toast.error("Upload failed: " + err.message);
        } finally {
            // setIsUploading(false);
            // setUploadProgress(0);
        }
    };

     const fixedParameters = [
        "Education Qualification",
        "Technical Proficiency/ Job Knowledge",
        "Work Experience",
        "Communication skills",
        "Interpersonal Skills",
        "Intellect/Future Potential",
        "Stable work history",
        "Self Confidence/ Self Esteem",
        "Proactive/Initiative towards learning",
        "Team Orientation"
    ];
    const handleSaveCandidate = async (data: any) => {
        console.log('Form Data Candidate:', data);
        // const result = await handleUpload(data?.firstName, data?.lastName, data?.contactNumber, 'resume', data?.attachResume)

        // const { checkedBy, ...restData } = data || {};
        // const formattedData = {
        //     db: MONGO_MODELS.CANDIDATE_INFO,
        //     action: actionCandidate === 'Add' ? 'create' : 'update',
        //     filter: { "_id": data?._id },
        //     data: { ...restData, attachResume: result?.url, recruitment: recruitmentId, checkedBy: user?._id },
        // };
        // console.log('Formatted Data:', formattedData);

        // const response: any = await createMaster(formattedData);
        // console.log('Response:', response);

        // if (recruitmentData?.data?.completedStep === 1) {

        //     const formattedData = {
        //         db: MONGO_MODELS.RECRUITMENT,
        //         action: 'update',
        //         filter: { "_id": recruitmentId },
        //         data: { completedStep: 2 },
        //     };
        //     console.log('Formatted Data:', formattedData);

        //     const response: any = await createMaster(formattedData);

        // }
        // if (response.data && response.data.status === SUCCESS) {
        //     toast.success(`Successfully ${actionCandidate}ed candidate information!`, {
        //         position: "bottom-right"
        //     });
        //     setShowCandidateDialog(false);

        //     return;
        // }

        // return response;


        const uploadResult = await handleUpload(
            data?.firstName,
            data?.lastName,
            data?.contactNumber,
            'resume',
            data?.attachResume
        );

        // Prepare candidate save payload
        // const { checkedBy, ...restData } = data || {};
        const candidatePayload = {
            db: MONGO_MODELS.CANDIDATE_INFO,
            action: actionCandidate === 'Add' ? 'create' : 'update',
            filter: { "_id": data?._id },
            data: { ...data, attachResume: uploadResult?.url, recruitment: recruitmentId, checkedBy: user?._id },
        };

        // 2️⃣ Save candidate
        const candidateResponse: any = await createMaster(candidatePayload);
        console.log('Candidate Save Response:', candidateResponse);

        // 3️⃣ Update recruitment step if needed
       if (recruitmentData?.data?.completedStep === 1) {
            const recruitmentPayload = {
                db: MONGO_MODELS.RECRUITMENT,
                action: 'update',
                filter: { "_id": recruitmentId },
                data: { completedStep: 2 },
            };
            console.log('Recruitment Update Data:', recruitmentPayload);

            const recruitmentResponse: any = await createMaster(recruitmentPayload);
            console.log('Recruitment Update Response:', recruitmentResponse);

        }

        // 4️⃣ Create initial interview record if candidate was just added
        if (actionCandidate === 'Add' && candidateResponse?.data && candidateResponse?.data.status === SUCCESS) {
            const interviewPayload = {
                db: MONGO_MODELS.INTERVIEW,
                action: 'create',
                data: {
                    candidateId: candidateResponse?.data?.data?._id,
                    recruitmentId: recruitmentId,
                    rounds: [
                        {
                            roundNumber: 1, // First round by default
                            interviewer: null, // Or a default ObjectId if you want
                            date: undefined,
                            roundStatus: 'na',
                            remarks: ''
                        }
                    ], // no rounds yet
                    assessmentParameters: fixedParameters.map(param => ({
                        parameterName: param,
                        score: '' // empty initially
                    })),
                    status: "na",
                    remarks: ""
                },
            };

            const interviewResponse: any = await createMaster(interviewPayload);

        }

        // 5️⃣ Final success toast & refresh list
        if (candidateResponse?.data && candidateResponse?.data.status === SUCCESS) {
            toast.success(`Successfully ${actionCandidate}ed candidate information!`, {
                position: "bottom-right"
            });
            setShowCandidateDialog(false);
           
            return;
        }

        return candidateResponse;

    };


    const candidateColumns = [
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
            accessorKey: "firstName",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2 w-[100px]"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>First Name</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => <div className='text-blue-500' onClick={() => editUser(row.original)}>{row.getValue("firstName")}</div>,
        },
        {
            accessorKey: "lastName",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2 w-[100px]"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Last Name</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => <div className='text-blue-500' onClick={() => editUser(row.original)}>{row.getValue("lastName")}</div>,
        },
        {
            accessorKey: "contactNumber",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Contact Number</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => <div >{row.original.contactNumber}</div>,
        },
        {
            accessorKey: "email",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
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
            cell: ({ row }: { row: any }) => <div >{row.original.email}</div>,
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
                        <span>Added On</span>
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





    ];

    const formattedCandidateData = candidatesData?.data?.map((candidate: any) => ({
        ...candidate,
        fullName: `${candidate.firstName} ${candidate.lastName} ${candidate.contactNumber}`
    }));

    const candidateConfig = {
        searchFields: [
            { key: "name", label: 'fullName', type: "text" as const, placeholder: 'Search candidate..' },

        ],
        filterFields: [

            // { key: "department", label: 'departmentName', type: "select" as const, data: depNames, placeholder: 'Search by Department', name: 'departmentName' },
            // { key: "position", label: 'positionName', type: "select" as const, data: positionNames, placeholder: 'Search by Position', name: 'positionName' },

        ],
        dataTable: {
            columns: candidateColumns,
            data: formattedCandidateData,
        },
        buttons: [

            { label: 'Candidate', action: handleAdd, icon: Plus, className: 'bg-sky-600 hover:bg-sky-700 duration-300' },
        ]
    };

    const visaTypes = [
        { _id: 'visit', name: 'Visit Visa' },
        { _id: 'employment', name: 'Employment Visa' },
        { _id: 'residence', name: 'Residence Visa' },
        { _id: 'others', name: 'Others' }]


    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <>

            <MasterComponent config={candidateConfig} loadingState={loading} rowClassMap={undefined} summary={false} />
            <Dialog open={showCandidateDialog} onOpenChange={setShowCandidateDialog}>
                <DialogContent
                    className="bg-white max-w-full pointer-events-auto mx-2 max-h-[95vh] w-[75%] h-[95vh] flex flex-col"
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <DialogTitle className="sticky top-0 bg-white border-b border-gray-200 py-2 mx-2">
                        {actionCandidate === 'Add' ? 'Add Candidate' : 'Edit Candidate'}
                    </DialogTitle>

                    {/* Scrollable form container */}
                    <div className="overflow-y-auto flex-1 px-2">
                        <FormContainer
                            formConfig={formConfig}
                            onSubmit={handleSaveCandidate}
                            initialData={initialDataCandidate}
                            action={actionCandidate}
                        />
                    </div>
                </DialogContent>
            </Dialog>

        </>

    )
}

export default page