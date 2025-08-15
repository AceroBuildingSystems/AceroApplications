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
    const [showInterviewDialog, setShowInterviewDialog] = useState(false);

    const [actionInterview, setActionInterview] = useState('Update');
    const [searchTerm, setSearchTerm] = useState('')
    const { user }: any = useUserAuthorised();
    const [initialDataCandidate, setInitialDataCandidate] = useState([]);

    const { data: designationData = [], isLoading: designationLoading } = useGetMasterQuery({
        db: MONGO_MODELS.DESIGNATION_MASTER,
        sort: { name: 'asc' },
    });

    const { data: departmentsData = [], isLoading: departmentLoading } = useGetMasterQuery({
        db: MONGO_MODELS.DEPARTMENT_MASTER,
        sort: { name: 'asc' },
    });
    const { data: interviewData = [], isLoading: interviewLoading } = useGetMasterQuery({
        db: MONGO_MODELS.INTERVIEW,
        filter: { recruitmentId: recruitmentId, isActive: true },
        sort: { createdAt: 'desc' },
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

    const users = usersData?.data || [];
    
        const userOptions = useMemo(() =>
            users.map((user: any) => ({
                ...user, // keep all original fields
                name: user?.displayName ? user.displayName : `${user.firstName}`,
            })),
            [users]
        );


    if (!recruitmentId) {
        toast.error(`Recruitment need to be selected to get the candidates info.`)
    }

    useEffect(() => {

        const loadStepConfig = async () => {
            const baseConfig = getFormConfig('interview_assesment');
            if (!baseConfig) return;

            const optionsMap = {
                interviewer: userOptions,
                roundStatus: roundStatus,
                status: status
            };
            console.log('baseconfig', baseConfig);
            const updatedConfig = deepCloneWithOptionsInjection(baseConfig, optionsMap);
            setFormConfig(updatedConfig);
        };

        loadStepConfig();
    }, [countryLoading, userLoading]);


    const loading = departmentLoading || userLoading || designationLoading || interviewLoading || countryLoading || isCreatingMaster;

    interface RowData {
        id: string;
        name: string;
        email: string;
        role: string;
    }

 const roundStatus = [
        { name: 'Shortlisted', _id: 'shortlisted' },
        { name: 'Rejected', _id: 'rejected' },
        { name: 'N/A', _id: 'na' }
    ];

    const status = [
        { name: 'Recruited', _id: 'recruited' },
        { name: 'Shortlisted', _id: 'shortlisted' },
        { name: 'Held', _id: 'held' },
        { name: 'Rejected', _id: 'rejected' },
        { name: 'N/A', _id: 'na' }
    ];

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

     function normalizeCandidateData(data: any) {
        if (!data) return {};

        return {
            ...data,
            firstName: data.firstName ?? '',
            lastName: data.lastName ?? '',
            candidateName: data.candidateName ?? '',
            contactNumber: data.contactNumber ?? '',
            email: data.email ?? '',
            remarks: data.remarks ?? '',
            resumeUrl: data.resumeUrl ?? '',
            status: data.status ?? '',
            rounds: Array.isArray(data.rounds) ? data.rounds.map((round: any) => ({
                ...round,
                // normalize round fields if needed
                date: round.date ?? '',
                interviewer: round.interviewer ?? '',
                score: round.score ?? '',
            })) : [],
            assessmentParameters: Array.isArray(data.assessmentParameters)
                ? data.assessmentParameters.map((item: any) => ({
                    ...item,
                    parameterName: item.parameterName ?? '',
                    score: item.score ?? '',
                }))
                : [],
            attachResume: data.attachResume ?? null,
            recruitmentId: data.recruitmentId ?? {},
            candidateId: data.candidateId ?? {},
            createdAt: data.createdAt ?? '',
            updatedAt: data.updatedAt ?? '',
            updatedBy: data.updatedBy ?? '',
            isActive: data.isActive ?? false,
        };
    }


    const editInterview = (rowData: any) => {
        console.log('Editing interview:', rowData);
        if (rowData?.candidateId?.attachResume) {
            const loadFile = async () => {
                try {
                    // Extract filename and extension
                    const url = rowData?.candidateId.attachResume;
                    const filename = url.split('/').pop();
                    const ext = filename.split('.').pop()?.toLowerCase() || '';
                    const mimeType = ext === 'pdf' ? 'application/pdf' : `application/${ext}`;

                    const file = await urlToFile(url, filename, mimeType);

                    // Store file in your form state (e.g., react-hook-form, Formik, or normal state)
                    // setFormData(prev => ({ ...prev, resume: file }));
                    const normalizedData = await normalizeCandidateData(rowData);
                    setInitialDataCandidate({ ...normalizedData, attachResume: file, resumeUrl: url });
                    // If you want to preview, also create an object URL
                    // setResumePreview(URL.createObjectURL(file));
                } catch (err) {
                    console.error("Error loading file:", err);
                }
            };
            loadFile();
        }

        // setInitialDataCandidate(rowData);
        setActionInterview('Update');

        setShowInterviewDialog(true);

        // Your add logic for user page
    };

   

    const handleSaveInterview = async (data: any) => {
        console.log('Form Data Candidate:', data);

        const { candidateId, recruitment, rounds = [], ...updateData } = data;


        if (rounds.length > 0) {
            const lastRound = rounds[rounds.length - 1];
            if (lastRound?.interviewer) {
                // Add empty round for next one
                rounds.push({
                    roundNumber: rounds.length + 1,
                    interviewer: null,
                    date: undefined,
                    remarks: '',
                    roundStatus: 'na' // keep as per your structure
                });
            }
        }

        const normalizedRounds = rounds.map((round: any) => ({
            roundNumber: round.roundNumber,
            interviewer: round.interviewer || null,  // empty string → null
            roundStatus: round.roundStatus || null,
            remarks: round.remarks || null,
            date: round.date || null,
            score: round.score || null,
        }));
        // Put updated rounds back
        updateData.rounds = normalizedRounds;

        console.log('updated round data', updateData);
        const interviewPayload = {
            db: MONGO_MODELS.INTERVIEW,
            action: actionInterview === 'Add' ? 'create' : 'update',
            filter: { "_id": data?._id },
            data: updateData,
        };

        console.log('interview Data;', interviewPayload);
        const interviewResponse: any = await createMaster(interviewPayload);

        if (updateData?.status === 'shortlisted') {
            const recruitmentPayload = {
                db: MONGO_MODELS.RECRUITMENT,
                action: 'update',
                filter: { "_id": recruitmentId },
                data: { completedStep: 3 },
            };
            console.log('Recruitment Update Data:', recruitmentPayload);

            const recruitmentResponse: any = await createMaster(recruitmentPayload);
            console.log('Recruitment Update Response:', recruitmentResponse);

        }
        if (interviewResponse?.data && interviewResponse?.data.status === SUCCESS) {
            toast.success(`Successfully ${actionInterview}d interview assessment!`, {
                position: "bottom-right"
            });


            setShowInterviewDialog(false);

            return;
        }

        return interviewResponse;

    };

    const interviewColumns = [
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
            cell: ({ row }: { row: any }) => <div className='text-blue-500' onClick={() => editInterview(row.original)}>{row.getValue("firstName")}</div>,
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
            cell: ({ row }: { row: any }) => <div className='text-blue-500' onClick={() => editInterview(row.original)}>{row.getValue("lastName")}</div>,
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
            accessorKey: "rounds",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Rounds Completed</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => {
                const interview = row.original;
                const rounds = interview?.rounds || [];

                if (rounds.length <= 1) return <div>NA</div>;

                // Sort rounds to get the last round
                const sortedRounds = [...rounds].sort((a: any, b: any) => a.roundNumber - b.roundNumber);

                // Get second last round
                const secondLastRound = sortedRounds.length >= 2
                    ? sortedRounds[sortedRounds.length - 2]
                    : null;

                return (
                    <div>
                        Round {secondLastRound.roundNumber} - {secondLastRound.roundStatus.toProperCase() || 'NA'}
                    </div>
                );
            },
        },

        {
            accessorKey: "status",
            header: ({ column }: { column: any }) => {

                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
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
            cell: ({ row }: { row: any }) => {
                const interview = row.original;
                const status = interview?.status;

                if (status === 'na') return <div>NA</div>;


                return (
                    <div>
                        {status?.toProperCase()}
                    </div>
                );
            },
        },





    ];

    const formattedInterviewData = useMemo(() => {
        return interviewData?.data?.map((candidate: any) => ({
            ...candidate,
            firstName: candidate?.candidateId?.firstName || '',
            lastName: candidate?.candidateId?.lastName || '',
            contactNumber: candidate?.candidateId?.contactNumber || '',
            email: candidate?.candidateId?.email || '',
            fullName: `${candidate?.candidateId?.firstName} ${candidate?.candidateId?.lastName} ${candidate?.candidateId?.contactNumber}`,
            candidateName: `${candidate?.candidateId?.firstName} ${candidate?.candidateId?.lastName}`
        }));
    }, [interviewData?.data]);

    console.log('formattedData:', formattedInterviewData)


    const interviewConfig = {
        searchFields: [
            { key: "name", label: 'fullName', type: "text" as const, placeholder: 'Candidate for interview' },

        ],
        filterFields: [

            // { key: "department", label: 'departmentName', type: "select" as const, data: [], placeholder: 'Search by Department', name: 'departmentName' },
            // { key: "position", label: 'positionName', type: "select" as const, data: [], placeholder: 'Search by Position', name: 'positionName' },

        ],
        dataTable: {
            columns: interviewColumns,
            data: formattedInterviewData || [],
        },
        buttons: [

        ]
    };



    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <>

            <MasterComponent config={interviewConfig} loadingState={loading} rowClassMap={undefined} summary={false} />
            <Dialog open={showInterviewDialog} onOpenChange={setShowInterviewDialog}>
                <DialogContent
                    className="bg-white max-w-full pointer-events-auto mx-2 max-h-[95vh] w-[75%] h-[95vh] flex flex-col"
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <DialogTitle className="sticky top-0 bg-white border-b border-gray-200 py-2 mx-2">
                        Interview And Assessment
                    </DialogTitle>

                    {/* Scrollable form container */}
                    <div className="overflow-y-auto flex-1 px-2">
                        <FormContainer
                            formConfig={formConfig}
                            onSubmit={handleSaveInterview}
                            initialData={initialDataCandidate}
                            action={actionInterview}
                        />
                    </div>
                </DialogContent>
            </Dialog>

        </>

    )
}

export default page