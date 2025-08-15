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
            const baseConfig = getFormConfig('candidate_information_new');
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
            data: { ...data, attachResume: uploadResult?.url, recruitment: recruitmentId, checkedBy:undefined },
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

    const visaTypes = [
        { _id: 'visit', name: 'Visit Visa' },
        { _id: 'employment', name: 'Employment Visa' },
        { _id: 'residence', name: 'Residence Visa' },
        { _id: 'others', name: 'Others' }]


    console.log('formconfig', formConfig)
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <>


            <div className="bg-white w-full h-screen flex flex-col pb-4">
                <div className="max-w-5xl mx-auto px-2 flex flex-col h-full">
                    <div className="font-bold text-xl py-1 pt-5 border-b border-gray-300 mb-3">
                        Enter Candidate Details
                    </div>

                    {/* Scrollable container */}
                    <div className="flex-1 overflow-y-auto pr-2">
                        <FormContainer
                            formConfig={formConfig}
                            onSubmit={handleSaveCandidate}
                            initialData={initialDataCandidate}
                            action={actionCandidate}
                        />
                    </div>
                </div>
            </div>


        </>

    )
}

export default page