'use client'

import React, { useEffect, useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogFooter,
    DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import mongoose, { set } from "mongoose";
import { Combobox } from "../ui/ComboBoxWrapper";
import { DatePicker } from "../ui/date-picker";
import useUserAuthorised from "@/hooks/useUserAuthorised";
import { Save, Check, X, ChevronsUpDown, Plus, Forward } from 'lucide-react';

import {
    Trash2Icon, SendHorizontal
} from "lucide-react";
import MultipleSelector, { Option } from "../ui/multiple-selector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MONGO_MODELS, SUCCESS } from "@/shared/constants";
import { useCreateApplicationMutation, useLazyGetApplicationQuery } from "@/services/endpoints/applicationApi";
import { toast } from "react-toastify";
import { useSendEmailMutation } from "@/services/endpoints/emailApi";
import moment from "moment";
import WorkflowNavigation from "./NewWorkflowNavigation";
import FormContainer from "./FormContainer";
import { deepCloneWithOptionsInjection, getFormConfig, injectOptionsIntoFormConfig } from "@/configs/hrms-forms";
import { approvalFlows } from "@/configs/approvalFlow.config";
import { ApprovalInfo } from "@/types/hrms/recruitment.types";
import MasterComponent from "../MasterComponent/MasterComponent";
import { Checkbox } from "../ui/checkbox";
import { Recruitment } from "@/models";
import { useGetMasterQuery, useLazyGetMasterQuery } from "@/services/endpoints/masterApi";
import { count } from "console";
import { position } from "html2canvas/dist/types/css/property-descriptors/position";

interface HrmsDialogProps {
    isOpen: boolean;
    closeDialog: () => void;
    formConfig: any;
    workflowType?: string; // Optional, default to 'recruitment'
    initialFormConfig?: any; // Optional, for default form config
    departments?: Option[]; // Optional, for department options
    users?: Option[]; // Optional, for user options
    designations?: Option[]; // Optional, for designation options
    employeeTypes?: Option[]; // Optional, for employee type options
    action?: string; // Optional, for action type (Add/Update)
    locationData?: Option[]; // Optional, for location options
    recruitymentTypes: any; // Optional, for recruitment types
    initialData?: any; // Optional, for initial data when updating
    visaTypes?: Option[]; // Optional, for visa types
    currentIndex?: number; // Optional, for step navigation index
    countryData?: Option[]; // Optional, for country data
}

const HrmsDialog: React.FC<HrmsDialogProps> = ({
    isOpen,
    closeDialog,
    workflowType,
    initialFormConfig, // Default to 'recruitment' if not provided
    departments,
    users,
    designations,
    employeeTypes,
    action,
    locationData,
    recruitymentTypes,
    initialData = null, // Optional initial data for update
    visaTypes,
    currentIndex = 0, // Optional current index for step navigation
    countryData

}) => {
    const { user }: any = useUserAuthorised();
    const [employeeType, setEmployeeType] = useState<any>(null);
    const [isEmployeeTypeSelected, setIsEmployeeTypeSelected] = useState(false);
    const [isStaff, setIsStaff] = useState(false);

    const [showCandidateDialog, setShowCandidateDialog] = useState(false);

    const [showInterviewDialog, setShowInterviewDialog] = useState(false);

    const [showOfferDialog, setShowOfferDialog] = useState(false);

    const [formConfig, setFormConfig] = useState(initialFormConfig);
    const [createMaster, { isLoading: isCreatingMaster }] = useCreateApplicationMutation();
    const [getCandidates, { data: candidatesData, isLoading: candidatesLoading }] = useLazyGetMasterQuery();

    const [getInterviews, { data: interviewData, isLoading: interviewsLoading }] = useLazyGetMasterQuery();

    const [getOfferACceptance, { data: offerAcceptanceData, isLoading: offerAcceptanceLoading }] = useLazyGetMasterQuery();

    const [sendEmail, { isLoading: isSendEMail }]: any = useSendEmailMutation();

    const [formData, setFormData] = useState<Record<string, any>>({});

    const [actionCandidate, setActionCandidate] = useState('Add');

    const [actionInterview, setActionInterview] = useState('Update');

    const [actionOffer, setActionOffer] = useState('Add');

    const [initialDataCandidate, setInitialDataCandidate] = useState([]);

    console.log('Form Config:', initialFormConfig);
    // const [formattedInterviewData, setFormattedInterviewData] = useState<any[]>([]);
    const [isStepInitialized, setIsStepInitialized] = useState(false);

    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [savedStepIndex, setSavedStepIndex] = useState(initialData?.completedStep || 0);
    const [localInterviews, setLocalInterviews]: any = useState([]);
    const [localOfferData, setLocalOfferData] = useState([]);
    const [candidateOffer, setCandidateOffer] = useState([]);

    useEffect(() => {
        if (isOpen) {
            console.log('Fetching candidates for recruitment:', initialData?._id);
            getCandidates({
                db: MONGO_MODELS.CANDIDATE_INFO,
                filter: { recruitment: initialData?._id },
                sort: { createdAt: 'desc' },
            });
            console.log('Fetching candidates for recruitment:', initialData?._id);
        }
    }, [isOpen, getCandidates]);


    useEffect(() => {
        if (isOpen) {
            setLocalInterviews([]); // Clear old data
            setCandidateOffer([]);
            getInterviews({
                db: MONGO_MODELS.INTERVIEW,
                filter: { recruitmentId: initialData?._id },
                sort: { createdAt: 'desc' }
            }).unwrap().then((res) => {
                const interviews = res.data || [];
                setLocalInterviews(interviews);

                const shortlistedCandidates = interviews
                    .filter((c: any) => c.status === 'shortlisted')
                    .map((c: any) => ({
                        _id: c?.candidateId?._id,
                        name: `${c?.candidateId?.firstName?.toProperCase() || ''} ${c?.candidateId?.lastName?.toProperCase() || ''}`.trim()
                    }));

                setCandidateOffer(shortlistedCandidates);
            });
        }
    }, [isOpen, initialData?._id, getInterviews]);

    console.log('candidate for offer:', candidateOffer)
    useEffect(() => {
        if (isOpen) {
            setLocalOfferData([]); // Clear old data
            getOfferACceptance({
                db: MONGO_MODELS.OFFER_ACCEPTANCE,
                filter: { recruitmentId: initialData?._id },
                sort: { createdAt: 'desc' }
            }).unwrap().then((res) => {
                setLocalOfferData(res.data || []);
            });
        }
    }, [isOpen, initialData?._id, getOfferACceptance]);


    console.log('offer data', localOfferData)
    const handleStepChange = (newIndex: number) => {
        setCurrentStepIndex(newIndex);
        setSavedStepIndex(newIndex); // Save it
    };

    useEffect(() => {
        if (!isStepInitialized && initialData?.completedStep != null) {
            setCurrentStepIndex(initialData?.completedStep);
            setIsStepInitialized(true);
        }
        else {
            setCurrentStepIndex(initialData?.completedStep || 0); // Reset to 0 if not initialized
            setIsStepInitialized(true);
        }
    }, [initialData, isStepInitialized, action]);

    useEffect(() => {
        if (!employeeType) return;

        // Find selected employee
        const employeeTypeName: any = employeeTypes?.find(emp => emp._id === employeeType)?.name;


        if (employeeTypeName?.toLowerCase() === 'staff') {
            setIsStaff(true);
        } else {
            setIsStaff(false);
        }

    }, [employeeType, employeeTypes]);


    useEffect(() => {

        if (initialData?.employeeType?.name?.toLowerCase() === 'staff') {
            setIsStaff(true);
            setEmployeeType(initialData?.employeeType?._id); // Optionally set this
            setFormData((prev) => ({
                ...prev,
                employeeType: initialData?.employeeType?._id,
            }));
        }
    }, [initialData]);


    const offerStatus = [{ name: 'Issued', _id: 'issued' },
    { name: 'Accepted', _id: 'accepted' },
    { name: 'Rejected', _id: 'rejected' }];

    useEffect(() => {
        if (!initialFormConfig || !initialFormConfig.steps) return;
        console.log('currentStepIndex', currentStepIndex, 'initialFormConfig', initialFormConfig);
        const step = initialFormConfig.steps[currentStepIndex];

        const loadStepConfig = async () => {
            const baseConfig = getFormConfig(step.formType);
            if (!baseConfig) return;

            const optionsMap = {
                department: departments,
                requestedBy: users,
                requiredPosition: designations,
                workLocation: locationData,
                recruitmentType: recruitymentTypes,
                prevEmployee: users,
                nationality: countryData,
                visaType: visaTypes,
                checkedBy: users,
                interviewer: users,
                roundStatus: roundStatus,
                status: status,
                offerStatus: offerStatus,
                candidateId: candidateOffer

            };

            const updatedConfig = deepCloneWithOptionsInjection(baseConfig, optionsMap);
            setFormConfig(updatedConfig);
        };

        loadStepConfig();
    }, [currentStepIndex, initialFormConfig, users, departments, designations, employeeTypes, recruitymentTypes, locationData, visaTypes, currentIndex, candidateOffer]);


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

    const loading = candidatesLoading || interviewsLoading || offerAcceptanceLoading;
    async function getApproverIdByRole(role: string, department?: string, departmentId?: string) {
        // Simple example: search by role
        console.log('users', users)
        console.log('getApproverIdByRole', role, department, departmentId);
        if (role === 'Manager') {
            const approver = users?.find(user =>
                user.department?.name === department &&
                user.employeeType?.name === role
            );
            return approver ? approver?._id : null;
        }
        else {
            if (role === 'DepartmentHead') {
                const departmentManager = users?.find(user =>
                    user.department?._id === departmentId &&
                    user.employeeType?.name === "Manager"
                );

                const departmentHead = departmentManager?.reportingTo;
                return departmentHead ? departmentHead?._id : null;
            }
            else {
                const approver = users?.find(user =>
                    user.designation?.name?.toUpperCase() === 'CEO'
                );
                return approver ? approver?._id : null;
            }
        }

    }

    async function createRecruitment(data) {
        const recruitmentFlow = approvalFlows.recruitment;
        console.log('recruitmentFlow', recruitmentFlow);
        const approvalFlowArray: ApprovalInfo[] = [];

        // Loop through flow and prepare approvers
        for (const step of recruitmentFlow) {
            const approverId = await getApproverIdByRole(
                step?.role,
                step?.department,
                data?.department // pass department for dept head step
            );

            approvalFlowArray.push({
                step: step.step,
                key: step.key,
                approverId,
                date: null,
                status: step.status,
                remarks: "",
            });
        }

        // Return the original data + approvalFlow array to save in DB
        return {
            ...data,
            approvalFlow: approvalFlowArray,
        };
    }

    const handleUpload = async (firstName, lastName, contactNumber, documentType, file) => {
        if (!file) return;

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

        // 1️⃣ Upload resume
        const uploadResult = await handleUpload(
            data?.firstName,
            data?.lastName,
            data?.contactNumber,
            'resume',
            data?.attachResume
        );

        // Prepare candidate save payload
        const { checkedBy, ...restData } = data || {};
        const candidatePayload = {
            db: MONGO_MODELS.CANDIDATE_INFO,
            action: actionCandidate === 'Add' ? 'create' : 'update',
            filter: { "_id": data?._id },
            data: {
                ...restData,
                attachResume: uploadResult?.url,
                recruitment: initialData?._id,
                checkedBy: undefined
            },
        };

        // 2️⃣ Save candidate
        const candidateResponse: any = await createMaster(candidatePayload);
        console.log('Candidate Save Response:', candidateResponse);

        // 3️⃣ Update recruitment step if needed
        if (initialData?.completedStep === 1) {
            const recruitmentPayload = {
                db: MONGO_MODELS.RECRUITMENT,
                action: 'update',
                filter: { "_id": initialData?._id },
                data: { completedStep: 2 },
            };
            console.log('Recruitment Update Data:', recruitmentPayload);

            const recruitmentResponse: any = await createMaster(recruitmentPayload);
            console.log('Recruitment Update Response:', recruitmentResponse);

            initialData['completedStep'] = 2;
        }

        // 4️⃣ Create initial interview record if candidate was just added
        if (actionCandidate === 'Add' && candidateResponse?.data && candidateResponse?.data.status === SUCCESS) {
            const interviewPayload = {
                db: MONGO_MODELS.INTERVIEW,
                action: 'create',
                data: {
                    candidateId: candidateResponse?.data?.data?._id,
                    recruitmentId: initialData?._id,
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
            getCandidates({
                db: MONGO_MODELS.CANDIDATE_INFO,
                filter: { recruitment: initialData?._id },
                sort: { createdAt: 'desc' },
            });
            getInterviews({
                db: MONGO_MODELS.INTERVIEW,
                filter: { recruitmentId: initialData?._id },
                sort: { createdAt: 'desc' }
            }).unwrap().then((res) => {
                setLocalInterviews(res.data || []);
            });
            return;
        }

        return candidateResponse;


    };

    const handleSaveOffer = async (data: any) => {
        console.log('Form Data Offer:', data);
        if (data?.offerStatus === 'accepted' && !data?.offerLetterUrl) {
            toast.error('Please attach the signed offer letter.');
            return;
        }

         const uploadResult = await handleUpload(
            data?.firstName,
            data?.lastName,
            data?.contactNumber,
            'offer letter',
            data?.offerLetterUrl
        );

        const interviewAssesmentId = localInterviews?.find((m: any) => m?.candidateId?._id === data?.candidateId)?._id;
        const offerPayLoad = {
            db: MONGO_MODELS.OFFER_ACCEPTANCE,
            action: actionOffer === 'Add' ? 'create' : 'update',
            filter: { "_id": data?._id },
            data: { ...data, interviewAssesmentId: interviewAssesmentId, recruitmentId: initialData?._id, offerLetterUrl: uploadResult?.url, },
        };

        console.log('Offer Data;', offerPayLoad, localInterviews);

        const offerResponse: any = await createMaster(offerPayLoad);

        if (data?.offerStatus === 'accepted') {
            const recruitmentPayload = {
                db: MONGO_MODELS.RECRUITMENT,
                action: 'update',
                filter: { "_id": initialData?._id },
                data: { completedStep: 4 },
            };
            console.log('Recruitment Update Data:', recruitmentPayload);

            const recruitmentResponse: any = await createMaster(recruitmentPayload);
            console.log('Recruitment Update Response:', recruitmentResponse);

            initialData['completedStep'] = 4;
        }
        if (offerResponse?.data && offerResponse?.data.status === SUCCESS) {
            toast.success(`Successfully ${actionOffer === 'Add' ? 'adde' : 'update'}d offer acceptance!`, {
                position: "bottom-right"
            });


            getOfferACceptance({
                db: MONGO_MODELS.OFFER_ACCEPTANCE,
                filter: { recruitmentId: initialData?._id },
                sort: { createdAt: 'desc' }
            }).unwrap().then((res) => {
                setLocalOfferData(res.data || []);
            });

            setShowOfferDialog(false);

            return;
        }

        return offerResponse;

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
                filter: { "_id": initialData?._id },
                data: { completedStep: 3 },
            };
            console.log('Recruitment Update Data:', recruitmentPayload);

            const recruitmentResponse: any = await createMaster(recruitmentPayload);
            console.log('Recruitment Update Response:', recruitmentResponse);

            initialData['completedStep'] = 3;
        }
        if (interviewResponse?.data && interviewResponse?.data.status === SUCCESS) {
            toast.success(`Successfully ${actionInterview}d interview assessment!`, {
                position: "bottom-right"
            });


            getInterviews({
                db: MONGO_MODELS.INTERVIEW,
                filter: { recruitmentId: initialData?._id },
                sort: { createdAt: 'desc' }
            }).unwrap().then((res) => {
                setLocalInterviews(res.data || []);
            });

            setShowInterviewDialog(false);

            return;
        }

        return interviewResponse;

    };

    const handleSave = async (data: any) => {
        console.log('Form Data:', data);

        const recruitmentData = await createRecruitment(data);
        const formattedData = {
            db: MONGO_MODELS.RECRUITMENT,
            action: action === 'Add' ? 'create' : 'update',
            filter: { "_id": data?._id },
            data: { ...recruitmentData, employeeType: employeeType },
        };
        console.log('Formatted Data:', formattedData);


        const response: any = await createMaster(formattedData);
        console.log('Response:', response);

        if (response.data && response.data.status === SUCCESS) {
            toast.success(`Successfully ${action}ed recruitment request!`, {
                position: "bottom-right"
            });
            closeDialog();

        }

    };

    // Utility to convert the file URL into a File object
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

    const editOffer = (rowData: any) => {
        console.log('Editing offer:', rowData);

         if (rowData?.offerLetterUrl) {
            const loadFile = async () => {
                try {
                    // Extract filename and extension
                    const url = rowData.offerLetterUrl;
                    const filename = url.split('/').pop();
                    const ext = filename.split('.').pop()?.toLowerCase() || '';
                    const mimeType = ext === 'pdf' ? 'application/pdf' : `application/${ext}`;

                    const file = await urlToFile(url, filename, mimeType);

                    // Store file in your form state (e.g., react-hook-form, Formik, or normal state)
                    // setFormData(prev => ({ ...prev, resume: file }));
                    setInitialDataCandidate({ ...rowData, offerLetterUrl: file, resumeUrl: url, candidateId: rowData?.interviewAssesmentId?.candidateId?._id, department: initialData?.department?.name || '',
            position: initialData?.requiredPosition?.name });
                    // If you want to preview, also create an object URL
                    // setResumePreview(URL.createObjectURL(file));
                } catch (err) {
                    console.error("Error loading file:", err);
                }
            };
            loadFile();
        }

        // setInitialDataCandidate({
        //     ...rowData, candidateId: rowData?.interviewAssesmentId?.candidateId?._id, department: initialData?.department?.name || '',
        //     position: initialData?.requiredPosition?.name
        // });
        setActionOffer('Update');

        setShowOfferDialog(true);

        // Your add logic for user page
    };

    const handleAddCandidate = () => {
        setActionCandidate('Add');
        setInitialDataCandidate([]);
        setShowCandidateDialog(true);
    };

    const handleAddOffer = () => {
        setActionOffer('Add');
        setInitialDataCandidate({
            department: initialData?.department?.name || '',
            position: initialData?.requiredPosition?.name
        });
        setShowOfferDialog(true);
    };

    const handleShareLink = () => {
        const currentUrl = `http://localhost:3000/candidates?processId=${initialData?._id}`;
        const subject = encodeURIComponent("URL to submit candidate details");

        // Place URL at the start to improve auto-link detection
        const body = encodeURIComponent(`${currentUrl}\n\nCopy and paste the above url to add the candidate information.`);

        window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");

    }

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

    const formattedCandidateData = candidatesData?.data.map((candidate: any) => ({
        ...candidate,
        fullName: `${candidate.firstName} ${candidate.lastName} ${candidate.contactNumber}`,

    }));

    const candidateConfig = {
        searchFields: [
            { key: "name", label: 'fullName', type: "text" as const, placeholder: 'Search by candidate' },

        ],
        filterFields: [

            // { key: "department", label: 'departmentName', type: "select" as const, data: [], placeholder: 'Search by Department', name: 'departmentName' },
            // { key: "position", label: 'positionName', type: "select" as const, data: [], placeholder: 'Search by Position', name: 'positionName' },

        ],
        dataTable: {
            columns: candidateColumns,
            data: formattedCandidateData || [],
        },
        buttons: [
            // { label: importing ? 'Importing...' : 'Import', action: handleImport, icon: Download, className: 'bg-blue-600 hover:bg-blue-700 duration-300' },
            // {
            //     label: 'Export', action: handleExport, icon: Upload, className: 'bg-green-600 hover:bg-green-700 duration-300', dropdownOptions: [
            //         { label: "Export to Excel", value: "excel", action: (type: string, data: any) => handleExport(type, data) },
            //         { label: "Export to PDF", value: "pdf", action: (type: string, data: any) => handleExport(type, data) },
            //     ]
            // },
            { label: 'Share Link', action: handleShareLink, icon: Forward, className: 'bg-green-600 hover:bg-green-700 duration-300' },
            { label: 'Candidate', action: handleAddCandidate, icon: Plus, className: 'bg-sky-600 hover:bg-sky-700 duration-300' },
        ]
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
        return localInterviews.map((candidate: any) => ({
            ...candidate,
            firstName: candidate?.candidateId?.firstName || '',
            lastName: candidate?.candidateId?.lastName || '',
            contactNumber: candidate?.candidateId?.contactNumber || '',
            email: candidate?.candidateId?.email || '',
            fullName: `${candidate?.candidateId?.firstName} ${candidate?.candidateId?.lastName} ${candidate?.candidateId?.contactNumber}`,
            candidateName: `${candidate?.candidateId?.firstName} ${candidate?.candidateId?.lastName}`
        }));
    }, [localInterviews]);

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


    const offerColumns = [
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
            cell: ({ row }: { row: any }) => <div className='text-blue-500' onClick={() => editOffer(row.original)}>{row.getValue("firstName")}</div>,
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
            cell: ({ row }: { row: any }) => <div className='text-blue-500' onClick={() => editOffer(row.original)}>{row.getValue("lastName")}</div>,
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
            accessorKey: "offerIssueDate",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Offer Issue date</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => {

                return (
                    <div>
                        {moment(row.original.offerIssueDate).format("DD-MMM-YYYY")}
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

                return (
                    <div>
                        {row.original.offerStatus?.toProperCase()}
                    </div>
                );
            },
        },





    ];

    const formattedOfferData = useMemo(() => {

        return localOfferData.map((candidate: any) => ({
            ...candidate,
            firstName: candidate?.interviewAssesmentId?.candidateId?.firstName || '',
            lastName: candidate?.interviewAssesmentId?.candidateId?.lastName || '',
            contactNumber: candidate?.interviewAssesmentId?.candidateId?.contactNumber || '',
            email: candidate?.interviewAssesmentId?.candidateId?.email || '',
            candidateName: `${candidate?.interviewAssesmentId?.candidateId?.firstName} ${candidate?.interviewAssesmentId?.candidateId?.lastName}`,
            department: initialData?.department?.name
        }));
    }, [localOfferData]);

    const offerConfig = {
        searchFields: [
            // { key: "name", label: 'fullName', type: "text" as const, placeholder: 'Candidate for interview' },

        ],
        filterFields: [

            // { key: "department", label: 'departmentName', type: "select" as const, data: [], placeholder: 'Search by Department', name: 'departmentName' },
            // { key: "position", label: 'positionName', type: "select" as const, data: [], placeholder: 'Search by Position', name: 'positionName' },

        ],
        dataTable: {
            columns: offerColumns,
            data: formattedOfferData || [],
        },
        buttons: [
            { label: 'Offer Letter', action: handleAddOffer, icon: Plus, className: 'bg-sky-600 hover:bg-sky-700 duration-300' },
        ]
    };


    console.log('offer data', formattedOfferData)

    return (
        <>

            <Dialog open={isOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        // Reset everything when dialog closes

                        closeDialog();
                        setEmployeeType(null);
                        setIsStaff(false);

                        // setCurrentStepIndex(savedStepIndex);
                    }
                }}>
                <DialogContent
                    className="bg-white max-w-full pointer-events-auto mx-2 max-h-[95vh] w-[75%] h-[95%]"
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <DialogTitle className="pl-1 hidden">Test</DialogTitle>
                    {loading &&
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
                        </div>
                    }

                    <div className="h-full flex flex-col min-h-0 pt-4">

                        {!isStaff && (
                            <div className="w-[200px] mb-4">
                                <Label className="mb-1 block">Select Employee Type</Label>
                                <Combobox
                                    value={employeeType}
                                    field={{
                                        name: 'employeeType',
                                        label: 'Employee Type',
                                        data: employeeTypes, // this should come from props or fetched API (with _id and name)
                                        key: 'employeeType',
                                    }}
                                    formData={formData}
                                    handleChange={(value: any) => {
                                        setEmployeeType(value); // value = _id of selected employee type
                                        setIsEmployeeTypeSelected(true);
                                        setFormData((prev) => ({
                                            ...prev,
                                            employeeType: value,
                                        }));

                                        // Optionally: update form config if needed
                                    }}
                                    placeholder="Choose employee type"
                                />
                            </div>
                        )}

                        {isStaff && !loading && formConfig && (
                            <>
                                {/* Fixed WorkflowNavigation inside dialog */}
                                <div className="fixed top-10 left-0 right-0 z-40 flex justify-center bg-white">
                                    <div className="w-full max-w-5xl pt-1 px-3">
                                        <WorkflowNavigation
                                            formConfig={{
                                                workflowType: workflowType,
                                                steps: initialFormConfig.steps, // your steps array from workflow data
                                                currentStepIndex: initialData?.completedStep || 0,
                                                onStepChange: handleStepChange,
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Scrollable Form container below header */}
                                <div className="pt-[220px] flex-1 overflow-y-auto flex justify-center">
                                    {(() => {
                                        switch (formConfig?.formType) {
                                            case "candidate_information":
                                                return (
                                                    <div className="w-full max-w-5xl pt-2">
                                                        <MasterComponent
                                                            config={candidateConfig}
                                                            loadingState={loading}
                                                            rowClassMap={undefined}
                                                            summary={false}
                                                        />
                                                    </div>
                                                );

                                            case "interview_assesment":
                                                return (
                                                    <div className="w-full max-w-5xl pt-2">

                                                        <MasterComponent
                                                            config={interviewConfig}
                                                            loadingState={loading}
                                                            rowClassMap={undefined}
                                                            summary={false}
                                                        />

                                                    </div>
                                                );

                                            case "offer_acceptance":
                                                return (
                                                    <div className="w-full max-w-5xl pt-2">

                                                        <MasterComponent
                                                            config={offerConfig}
                                                            loadingState={loading}
                                                            rowClassMap={undefined}
                                                            summary={false}
                                                        />

                                                    </div>
                                                );

                                            default:
                                                return (
                                                    <div className="w-full max-w-5xl p-4 pr-2">
                                                        <FormContainer
                                                            formConfig={formConfig}
                                                            onSubmit={handleSave}
                                                            initialData={initialData}
                                                            action={action}
                                                        />
                                                    </div>
                                                );
                                        }
                                    })()}
                                </div>

                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {showCandidateDialog && (
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
            )}


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

            <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
                <DialogContent
                    className="bg-white max-w-full pointer-events-auto mx-2 max-h-[95vh] w-[75%] h-[95vh] flex flex-col"
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <DialogTitle className="sticky top-0 bg-white border-b border-gray-200 py-2 mx-2">
                        Offer Letter Issuance and Acceptance
                    </DialogTitle>

                    {/* Scrollable form container */}
                    <div className="overflow-y-auto flex-1 px-2">
                        <FormContainer
                            formConfig={formConfig}
                            onSubmit={handleSaveOffer}
                            initialData={initialDataCandidate}
                            action={actionOffer}
                        />
                    </div>
                </DialogContent>
            </Dialog>



        </>

    );
};

export default HrmsDialog;
