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
    currencyData?: Option[]; // Optional, for currency data
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
    countryData,
    currencyData

}) => {

    const uniqueCountries = [
        ...new Map(
            locationData
                ?.filter(loc => loc?.state?.country) // ensure country exists
                .map(loc => [loc?.state?.country._id, {
                    _id: loc?.state?.country?._id,
                    name: loc?.state?.country?.name
                }])
        ).values()
    ];


    const { user }: any = useUserAuthorised();
    const [employeeType, setEmployeeType] = useState<any>('');
    const [region, setRegion] = useState<any>('');
    const [isEmployeeTypeSelected, setIsEmployeeTypeSelected] = useState(false);
    const [isStaff, setIsStaff] = useState(false);
    const [isRegion, setIsRegion] = useState(false);

    const [showCandidateDialog, setShowCandidateDialog] = useState(false);

    const [filteredInterviewers, setFilteredInterviewers]: any = useState([]);

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

    const [initialDataCandidate, setInitialDataCandidate]: any = useState([]);

    console.log('Form Config:', locationData);
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


        if (employeeTypeName?.toLowerCase() === 'staff' && region !== null) {
            setIsStaff(true);
        } else {
            setIsStaff(false);
        }

    }, [employeeType, region, employeeTypes]);


    useEffect(() => {

        if (initialData?.employeeType?.name?.toLowerCase() === 'staff') {
            setIsStaff(true);
            setEmployeeType(initialData?.employeeType?._id); // Optionally set this
            setFormData((prev) => ({
                ...prev,
                employeeType: initialData?.employeeType?._id,
                regionRequisition: region
            }));
        }
    }, [initialData]);


    const offerStatus = [{ name: 'Issued', _id: 'issued' },
    { name: 'Accepted', _id: 'accepted' },
    { name: 'Rejected', _id: 'rejected' }];

    const travellerType = [{ name: 'Employee', _id: 'employee' },
    { name: 'Guest', _id: 'guest' }];

    const arrangedBy = [{ name: 'Company', _id: 'company' },
    { name: 'Guest', _id: 'guest' }, { name: 'Employee', _id: 'employee' }, { name: 'Not Required', _id: 'not_required' }];

    const qualifications = [
        { name: 'Secondary', _id: 'Secondary' },
        { name: 'Higher Secondary', _id: 'Higher Secondary' },
        { name: 'Diploma', _id: 'Diploma' },
        { name: 'Bachelor’s Degree', _id: 'Degree' },
        { name: 'Master’s Degree', _id: 'Master Degree' },
        { name: 'PhD', _id: 'PhD' },
        { name: 'Others', _id: 'others' },
    ];

    console.log('regions', locationData?.filter(loc => loc?.state?.country?._id === region), region);

    useEffect(() => {
        if (!initialFormConfig || !initialFormConfig.steps) return;
        console.log('currentStepIndex', currentStepIndex, 'initialFormConfig', initialFormConfig);
        const step = initialFormConfig.steps[currentStepIndex];

        const loadStepConfig = async () => {
            const baseConfig = getFormConfig(step?.formType);
            if (!baseConfig) return;

            const optionsMap = {
                department: departments,
                requestedDepartment: departments,
                requestedBy: users,
                requiredPosition: designations,
                workLocation: locationData?.filter(loc => loc?.state?.country?._id === region) || locationData,
                recruitmentType: recruitymentTypes,
                prevEmployee: users,
                nationality: countryData,
                visaType: visaTypes,
                checkedBy: users,
                interviewer: initialData?.interviewers || users,
                roundStatus: roundStatus,
                status: status,
                offerStatus: offerStatus,
                candidateId: candidateOffer,
                highestQualification: qualifications,
                travellerType: travellerType,
                cashAdvanceCurrency: currencyData,
                airTicketArrangedBy: arrangedBy,
                hotelArrangedBy: arrangedBy,
                reimbursedCurrency: currencyData,
                employee: users,
                "handoverDetails.familyDetails.fatherNationality._id": countryData,

            };
            const currentUserRole = user?.employeeType?.name;
            const currentUserDept = user?.department?.name;

            const updatedConfig = deepCloneWithOptionsInjection(baseConfig, optionsMap);
            const visibleSections = updatedConfig.sections.filter((section) => {
                if (!section.visibleFor) return true; // no restriction → show to everyone

                return (
                    section.visibleFor.includes(currentUserRole) ||
                    section.visibleFor.includes(currentUserDept)
                );
            });
            setFormConfig({ ...updatedConfig, sections: visibleSections });
            // const updatedConfig = deepCloneWithOptionsInjection(baseConfig, optionsMap);
            // setFormConfig(updatedConfig);
        };

        loadStepConfig();
    }, [currentStepIndex, initialFormConfig, users, departments, designations, employeeTypes, recruitymentTypes, locationData, visaTypes, currentIndex, candidateOffer, region]);


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


    const handleUpload = async (firstName, lastName, contactNumber, documentType, file, folderName) => {
        if (!file) return;

        // Prepare API endpoint with ticketId and userId
        const endpoint = `/api/uploadCadidatesDocs?fullname=${firstName + `_` + lastName + `_` + contactNumber}&documentType=${documentType}&folderName=${folderName}`;

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
            data?.attachResume,
            'candidates'
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

        let uploadResultEducationCertificate = null;
        let uploadResultPassport = null;
        let uploadResultVisitVisa = null;
        let uploadResultVisaCancellation = null;
        let uploadResultPassportSizePhoto = null;

        if (data?.uploadDocuments?.attachEducationCertificates?.length) {
            // Create an array of promises, one per file
            const uploadPromises = data?.uploadDocuments.attachEducationCertificates.map(
                (file) =>
                    handleUpload(
                        data.firstName,
                        data.lastName,
                        data?.contactNumber,
                        `${file.name.split('.')[0]}`,
                        file,
                        'candidates'
                    )
            );

            // Wait for all uploads to finish concurrently
            try {
                const uploadResult = await Promise.all(uploadPromises);
                uploadResultEducationCertificate = uploadResult?.map(file => file.url);
                console.log('All files uploaded successfully:', uploadResultEducationCertificate);
            } catch (err) {
                console.error('One or more uploads failed:', err);
            }
        }


        // 1️⃣ Upload resume

        data?.passportInfo?.attachPassport && (uploadResultPassport = await handleUpload(
            data?.firstName,
            data?.lastName,
            data?.contactNumber,
            `passport`,
            data?.passportInfo?.attachPassport,
            'candidates'
        ));

        data?.uploadDocuments?.attachVisitVisa && (uploadResultVisitVisa = await handleUpload(
            data?.firstName,
            data?.lastName,
            data?.contactNumber,
            `visit visa`,
            data?.uploadDocuments?.attachVisitVisa,
            'candidates'
        ));

        data?.uploadDocuments?.attachVisaCancellation && (uploadResultVisaCancellation = await handleUpload(
            data?.firstName,
            data?.lastName,
            data?.contactNumber,
            `visit cancellation`,
            data?.uploadDocuments?.attachVisaCancellation,
            'candidates'
        ));

        data?.uploadDocuments?.passportSizePhoto && (uploadResultPassportSizePhoto = await handleUpload(
            data?.firstName,
            data?.lastName,
            data?.contactNumber,
            `passport size photo`,
            data?.uploadDocuments?.passportSizePhoto,
            'candidates'
        ));

        const uploadResult = await handleUpload(
            data?.firstName,
            data?.lastName,
            data?.contactNumber,
            'offer letter',
            data?.offerLetterUrl,
            'candidates'
        );

        const interviewAssesmentId = localInterviews?.find((m: any) => m?.candidateId?._id === data?.candidateId)?._id;
        const offerPayLoad = {
            db: MONGO_MODELS.OFFER_ACCEPTANCE,
            action: actionOffer === 'Add' ? 'create' : 'update',
            filter: { "_id": data?._id },
            data: { ...data, interviewAssesmentId: interviewAssesmentId, recruitmentId: initialData?._id, offerLetterUrl: uploadResult?.url, passportInfo: { ...data?.passportInfo, passportUrl: uploadResultPassport?.url }, uploadDocuments: { ...data?.uploadDocuments, visitVisaUrl: uploadResultVisitVisa?.url, cancellationVisaUrl: uploadResultVisaCancellation?.url, educationCertificatesUrl: uploadResultEducationCertificate, passportSizePhotoUrl: uploadResultPassportSizePhoto?.url } },
        };

        const offerResponse: any = await createMaster(offerPayLoad);

        if (data?.offerStatus === 'accepted') {
            const recruitmentPayload = {
                db: MONGO_MODELS.RECRUITMENT,
                action: 'update',
                filter: { "_id": initialData?._id },
                data: { completedStep: 4, status: 'completed' },
            };

            const recruitmentResponse: any = await createMaster(recruitmentPayload);
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

        const { candidateId, recruitment, rounds = [], ...updateData } = data;
        let roundsData = rounds;

        if (rounds.length > 0) {
            const lastRound = rounds[rounds.length - 1];
            if (lastRound?.interviewer) {

                const missingRemarks = rounds.some((round, idx) => !round.remarks?.trim());
                console.log('remarks:', missingRemarks);
                if (missingRemarks) {
                    toast.error("Please fill the remarks.");
                    return; // ❌ stop saving
                }

                // Add empty round for next one
                rounds.push({
                    roundNumber: rounds.length + 1,
                    interviewer: null,
                    date: undefined,
                    remarks: '',
                    roundStatus: 'na' // keep as per your structure
                });
            }

            roundsData = rounds.slice(0, -1); // remove last blank

            console.log('roundsdata:', roundsData)
            const missingRemarks = roundsData.some((round, idx) => !round.remarks?.trim());
            const roundStatus = roundsData.some((round, idx) => round?.roundStatus === 'rejected') && data?.status !== 'na';
            console.log('remarks:', missingRemarks);
            if (missingRemarks) {
                toast.error("Please fill the remarks for interview rounds.");
                return; // ❌ stop saving
            }

            if (roundStatus) {
                toast.error("The candidate’s status cannot be changed as they have already been rejected in the interview rounds.");
                return; // ❌ stop saving
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
            setFilteredInterviewers([]);
            return;
        }

        return interviewResponse;

    };
    console.log('users', user);
    async function getApproverIdByRole(role: string, department?: string, departmentId?: string) {
        // Simple example: search by role

        if (role === 'Manager') {
            if (department) {
                const approver = users?.find(user =>
                    user.department?.name === department &&
                    user.employeeType?.name === role
                );
                return approver ? approver?._id : null;
            }
            else {
                console.log('user', user)
                const approver = user?.reportingTo

                return approver ? approver : null;
            }

        }
        else {
            if (role === 'DepartmentHead') {
                if (departmentId) {
                    const departmentManager = users?.find(user =>
                        user.department?._id === departmentId &&
                        user.employeeType?.name === "Manager"
                    );

                    const departmentHead = departmentManager?.reportingTo;

                    return departmentHead ? departmentHead?._id : null;
                }
                else {
                    const departmentManager = users?.find(u =>
                        u?._id === user?._id
                    );

                    const departmentHead = departmentManager?.reportingTo;

                    return departmentHead ? departmentHead?._id : null;
                }

            }
            else {
                const approver = users?.find(user =>
                    user.designation?.name?.toUpperCase() === 'CEO'
                );
                return approver ? approver?._id : null;
            }
        }

    }

    async function createRecruitment(data: any, flowType: string) {
        const recruitmentFlow = approvalFlows[flowType];

        const approvalFlowArray: ApprovalInfo[] = [];

        // Loop through flow and prepare approvers
        for (const step of recruitmentFlow) {
            const approverId = await getApproverIdByRole(
                step?.role,
                step?.department,
                data?.requestedDepartment // pass department for dept head step
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

        if (
            approvalFlowArray.length >= 4 &&
            approvalFlowArray[0].approverId === approvalFlowArray[2].approverId
        ) {
            approvalFlowArray.splice(2, 1); // remove 4th step
        }

        // Return the original data + approvalFlow array to save in DB
        if (flowType === "recruitment") {
            return {
                ...data,
                department: data?.requestedDepartment,
                approvalFlow: approvalFlowArray,
            };
        }
        else {
            return {
                ...data,
                approvalFlow: approvalFlowArray,
            };
        }

    }

    const handleSave = async (data: any) => {

        const recruitmentData = await createRecruitment(data, "recruitment");
        const formattedData = {
            db: MONGO_MODELS.RECRUITMENT,
            action: action === 'Add' ? 'create' : 'update',
            filter: { "_id": data?._id },
            data: { ...recruitmentData, employeeType: employeeType, regionRequisition: region },
        };

        const response: any = await createMaster(formattedData);
        let emailData = {};
        if (response.data && response.data.status === SUCCESS) {
            toast.success(`Successfully ${action}ed recruitment request!`, {
                position: "bottom-right"
            });
            closeDialog();

        }

        if (response?.data?.data?.currentApprovalStep === 0) {
            const approver = response.data.data.approvalFlow[0];
            console.log('approval flow', response);
            const requestData = { 'requestedBy': response.data.data?.requestedBy?.displayName, 'requestedDate': response.data.data?.createdAt ? moment(response.data.data?.createdAt).format("DD-MM-yyyy hh:mm A") : "-", 'requestedPosition': response.data.data?.requiredPosition?.name };
            emailData = { recipient: 'iqbal.ansari@acero.ae', subject: 'Manpower Requisition Request', templateData: requestData, fileName: "hrmsTemplates/manpowerRequisition", senderName: user?.displayName?.toProperCase(), approveUrl: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/utility/manpowerRequisition?status=true&_id=${response?.data?.data?._id}&step=${response?.data?.data?.currentApprovalStep}`, rejectUrl: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/utility/manpowerRequisition?status=false&_id=${response?.data?.data?._id}&step=${response?.data?.data?.currentApprovalStep}` };

            await sendEmail(emailData);
        }


    };

    const handleSaveBusinessTrip = async (data: any) => {

        console.log('Form Data Business Trip:', data);
        const recruitmentData = await createRecruitment(data, "businessTrip");

        console.log('business trip data', recruitmentData);

        const formattedData = {
            db: MONGO_MODELS.BUSINESS_TRIP,
            action: action === 'Add' ? 'create' : 'update',
            filter: { "_id": data?._id },
            data: { ...recruitmentData, requestedBy: user?._id },
        };

        console.log('Business Trip Data to Save:', formattedData);

        const response: any = await createMaster(formattedData);
        let emailData = {};
        console.log('Business Trip Response:', response);
        if (response.data && response.data.status === SUCCESS) {
            toast.success(`Successfully ${action === 'Add' ? 'added' : 'updated'} business trip request!`, {
                position: "bottom-right"
            });
            closeDialog();

        }

        if (response?.data?.data?.currentApprovalStep === 0) {
            const approver = response.data.data.approvalFlow[0];
            console.log('approval flow', response);
            const requestData = { 'requested By': response.data.data?.requestedBy?.displayName?.toProperCase(), 'requested Date': response.data.data?.createdAt ? moment(response.data.data?.createdAt).format("DD-MMM-yyyy hh:mm A") : "-", 'Department': response.data.data?.requestedDepartment?.name || user?.department?.name, 'Traveller': response.data.data?.travellerType?.toProperCase() };
            emailData = { recipient: 'iqbal.ansari@acero.ae', subject: 'Business Trip Request', templateData: requestData, fileName: "hrmsTemplates/businessTripRequest", senderName: user?.displayName?.toProperCase(), approveUrl: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/utility/businessTripRequest?status=true&_id=${response?.data?.data?._id}&step=${response?.data?.data?.currentApprovalStep}`, rejectUrl: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/utility/businessTripRequest?status=false&_id=${response?.data?.data?._id}&step=${response?.data?.data?.currentApprovalStep}` };

            await sendEmail(emailData);
        }


    };

    const parameterMeta = [
        { parameterName: "Knowledge of Job", description: "Familiar with duties and requirements of this position and knows the methods and practices to perform the job. knowledge gained through experience, education and training." },
        { parameterName: "Productivity", description: "Employee uses available working time, plans and prioritizes work, sets and accomplishes goals, and completes assignments on schedule." },
        { parameterName: "Quality of Work", description: "Employee completes the job duties successfully within the estimated time, with the output satisfying the expectations." },
        { parameterName: "Adaptability", description: "Consider the ability to learn quickly, to adapt to changes in job assignments, methods and personnel." },
        { parameterName: "Dependability", description: "Employee’s reliability in performing work assignments and carrying out instructions and the level of supervision required and willingness to take on responsibilities." },
        { parameterName: "Communication Skills", description: "Employee’s ability to communicate effectively in both oral and written expression with the internal and external customers." },
        { parameterName: "Initiative and Resourcefulness", description: "Employees ability to contribute, develop and/or carry out new ideas or methods self-starter, offer suggestions, to anticipate needs and to seek additional tasks as time permits." },
        { parameterName: "Team Orientation", description: "Ability to work effectively with superiors, peers, subordinates and customers." },
        { parameterName: "Attendance and Punctuality", description: "Employee report to work on time, staying on the job, observance of time limits for breaks and lunches and prompt notice for any absence." },
        { parameterName: "Organization Obligations", description: "Overall fits in the company culture and values and has sense of loyalty, willingness to go beyond the boundaries and commit oneself to the organization’s success." },
    ];

    const handleSaveAppraisal = async (data: any) => {


        // const recruitmentData = await createRecruitment(data, "businessTrip");

        // console.log('business trip data', recruitmentData);
        const enriched = data?.evaluationParameters?.map((param, index) => ({
            ...param,
            parameterName: parameterMeta[index]?.parameterName || "",
            description: parameterMeta[index]?.description || "",
        }));
        const formattedData = {
            db: MONGO_MODELS.PERFORMANCE_APPRAISAL,
            action: action === 'Add' ? 'create' : 'update',
            filter: { "_id": data?._id },
            data: {
                ...data, evaluationParameters: enriched,
            },
        };

        console.log('Appraisal Data to Save:', formattedData);

        const response: any = await createMaster(formattedData);
        let emailData = {};
        console.log('Appraisal Response:', response);
        if (response.data && response.data.status === SUCCESS) {
            toast.success(`Successfully ${action === 'Add' ? 'added' : 'updated'} performance appraisal request!`, {
                position: "bottom-right"
            });
            closeDialog();

        }

        // if (response?.data?.data?.currentApprovalStep === 0) {
        //     const approver = response.data.data.approvalFlow[0];
        //     console.log('approval flow', response);
        //     const requestData = { 'requested By': response.data.data?.requestedBy?.displayName?.toProperCase(), 'requested Date': response.data.data?.createdAt ? moment(response.data.data?.createdAt).format("DD-MMM-yyyy hh:mm A") : "-", 'Department': response.data.data?.requestedDepartment?.name || user?.department?.name, 'Traveller': response.data.data?.travellerType?.toProperCase() };
        //     emailData = { recipient: 'iqbal.ansari@acero.ae', subject: 'Business Trip Request', templateData: requestData, fileName: "hrmsTemplates/businessTripRequest", senderName: user?.displayName?.toProperCase(), approveUrl: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/utility/businessTripRequest?status=true&_id=${response?.data?.data?._id}&step=${response?.data?.data?.currentApprovalStep}`, rejectUrl: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/utility/businessTripRequest?status=false&_id=${response?.data?.data?._id}&step=${response?.data?.data?.currentApprovalStep}` };

        //     await sendEmail(emailData);
        // }


    };

    const handoverDefaultValue = [
        {
            department: "Employee Department",
            taskDescription: [
                "Documents and Records",
                "Job Handover",
                "Emails to be forwarded (provide Email ID)",
            ],
            handoverTo: "",
            handoverDate: "",
            status: false,
            signature: "",
        },
        {
            department: "Finance",
            taskDescription: [
                "Outstanding Amount Cleared",
                "Petty Cash Cleared",
                "Others",
            ],
            handoverTo: "",
            handoverDate: "",
            status: false,
            signature: "",
        },
        {
            department: "IT",
            taskDescription: [
                "Laptop / Desktop",
                "Mobile Phone / Sim Card",
                "User Name and Passwords",
                "Biometric Access closed on LWD",
            ],
            handoverTo: "",
            handoverDate: "",
            status: false,
            signature: "",
        },
        {
            department: "Material Control / Stores",
            taskDescription: ["Tools and Equipment’s"],
            handoverTo: "",
            handoverDate: "",
            status: false,
            signature: "",
        },
        {
            department: "Accommodation In charge",
            taskDescription: ["Accommodation Items and Locker Keys"],
            handoverTo: "",
            handoverDate: "",
            status: false,
            signature: "",
        },
        {
            department: "HR & ADMIN",
            taskDescription: [
                "Medical Insurance Card / ID Card",
                "Office Drawer / Room / Vehicle Keys",
                "Others",
            ],
            handoverTo: "",
            handoverDate: "",
            status: false,
            signature: "",
        },
        {
            department: "Other Department",
            taskDescription: [""],
            handoverTo: "",
            handoverDate: "",
            status: false,
            signature: "",
        },
    ];

    const handleSaveOffboarding = async (data: any) => {


        // const recruitmentData = await createRecruitment(data, "businessTrip");

        console.log('offborading data', data);


        const enriched = data?.handoverDetails?.map((param, index) => ({
            ...param,
            department: handoverDefaultValue[index]?.department || "",
            taskDescription: handoverDefaultValue[index]?.taskDescription || [],
            handoverTo: param?.handoverTo !== "" ? param?.handoverTo : null,
        }));
        const formattedData = {
            db: MONGO_MODELS.OFFBOARDING,
            action: action === 'Add' ? 'create' : 'update',
            filter: { "_id": data?._id },
            data: {
                ...data, handoverDetails: enriched,
            },
        };
        console.log('offborading data', formattedData);
        const response: any = await createMaster(formattedData);
        let emailData = {};
        console.log('Offboarding Response:', response);
        if (response.data && response.data.status === SUCCESS) {
            toast.success(`Successfully ${action === 'Add' ? 'added' : 'updated'} offboarding process request!`, {
                position: "bottom-right"
            });
            closeDialog();

        }

        // if (response?.data?.data?.currentApprovalStep === 0) {
        //     const approver = response.data.data.approvalFlow[0];
        //     console.log('approval flow', response);
        //     const requestData = { 'requested By': response.data.data?.requestedBy?.displayName?.toProperCase(), 'requested Date': response.data.data?.createdAt ? moment(response.data.data?.createdAt).format("DD-MMM-yyyy hh:mm A") : "-", 'Department': response.data.data?.requestedDepartment?.name || user?.department?.name, 'Traveller': response.data.data?.travellerType?.toProperCase() };
        //     emailData = { recipient: 'iqbal.ansari@acero.ae', subject: 'Business Trip Request', templateData: requestData, fileName: "hrmsTemplates/businessTripRequest", senderName: user?.displayName?.toProperCase(), approveUrl: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/utility/businessTripRequest?status=true&_id=${response?.data?.data?._id}&step=${response?.data?.data?.currentApprovalStep}`, rejectUrl: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/utility/businessTripRequest?status=false&_id=${response?.data?.data?._id}&step=${response?.data?.data?.currentApprovalStep}` };

        //     await sendEmail(emailData);
        // }


    };

    // Utility to convert the file URL into a File object
    async function urlToFile(url, filename, mimeType) {
        const res = await fetch(url);
        const blob = await res.blob();
        return new File([blob], filename, { type: mimeType });
    }


    const editUser = async (rowData: any) => {
        console.log('Editing user:', rowData);
        if (rowData?.attachResume) {

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

        }
        else {
            setInitialDataCandidate(rowData);
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


    const editInterview = async (rowData: any) => {
        console.log('Editing interview:', rowData);

        const candidateDeptId = rowData?.recruitment?.department?._id;
        const normalizedData = await normalizeCandidateData(rowData);
        // Filter users belonging to the same department
        const filteredInterviewers = users?.filter(
            (user: any) => user?.department?._id === candidateDeptId
        );
        if (rowData?.candidateId?.attachResume) {

            try {
                // Extract filename and extension
                const url = rowData?.candidateId.attachResume;
                const filename = url.split('/').pop();
                const ext = filename.split('.').pop()?.toLowerCase() || '';
                const mimeType = ext === 'pdf' ? 'application/pdf' : `application/${ext}`;

                const file = await urlToFile(url, filename, mimeType);

                // Store file in your form state (e.g., react-hook-form, Formik, or normal state)
                // setFormData(prev => ({ ...prev, resume: file }));

                setInitialDataCandidate({ ...normalizedData, attachResume: file, resumeUrl: url });
                // If you want to preview, also create an object URL
                // setResumePreview(URL.createObjectURL(file));
            } catch (err) {
                console.error("Error loading file:", err);
            }

        }

        else {
            setInitialDataCandidate(rowData);
        }
        console.log('interviewer', filteredInterviewers)
        // setFilteredInterviewers(filteredInterviewers);
        // setInitialDataCandidate(rowData);
        setActionInterview('Update');

        setShowInterviewDialog(true);

        // Your add logic for user page
    };

    async function urlsToFiles(urls: string[]): Promise<File[]> {
        const filePromises = urls.map(async (fileUrl) => {
            const filename = fileUrl.split("/").pop() || "file";
            const ext = filename.split(".").pop()?.toLowerCase() || "";
            const mimeType = ext === "pdf" ? "application/pdf" : `application/${ext}`;

            return await urlToFile(fileUrl, filename, mimeType);
        });

        return Promise.all(filePromises);
    }

    const editOffer = async (rowData: any) => {

        let educationCertificatesFile: any = "";
        let passportFile: any = "";
        let visitVisaFile: any = "";
        let visaCancellationFile: any = "";
        let passportSizePhotoFile: any = "";

        const eductionCertificatesUrl = rowData?.uploadDocuments?.educationCertificatesUrl;
        const passportUrl = rowData?.passportInfo?.passportUrl;
        const visitVisaUrl = rowData?.uploadDocuments?.visitVisaUrl;
        const cancellationVisaUrl = rowData?.uploadDocuments?.cancellationVisaUrl;
        const passortSizePhotoUrl = rowData?.uploadDocuments?.passportSizePhotoUrl;


        if (eductionCertificatesUrl) {
            educationCertificatesFile = await urlsToFiles(eductionCertificatesUrl);
        }

        if (passportUrl) {
            const filename = passportUrl.split("/").pop() || "visa";
            const ext = filename.split(".").pop()?.toLowerCase() || "";
            const mimeType = ext === "pdf" ? "application/pdf" : `application/${ext}`;
            passportFile = await urlToFile(passportUrl, filename, mimeType);
        }

        if (visitVisaUrl) {
            const filename = visitVisaUrl.split("/").pop() || "visa";
            const ext = filename.split(".").pop()?.toLowerCase() || "";
            const mimeType = ext === "pdf" ? "application/pdf" : `application/${ext}`;
            visitVisaFile = await urlToFile(visitVisaUrl, filename, mimeType);
        }

        if (cancellationVisaUrl) {
            const filename = cancellationVisaUrl.split("/").pop() || "visa";
            const ext = filename.split(".").pop()?.toLowerCase() || "";
            const mimeType = ext === "pdf" ? "application/pdf" : `application/${ext}`;
            visaCancellationFile = await urlToFile(cancellationVisaUrl, filename, mimeType);
        }

        if (passortSizePhotoUrl) {
            const filename = passortSizePhotoUrl.split("/").pop() || "visa";
            const ext = filename.split(".").pop()?.toLowerCase() || "";
            const mimeType = ext === "pdf" ? "application/pdf" : `application/${ext}`;
            passportSizePhotoFile = await urlToFile(passortSizePhotoUrl, filename, mimeType);
        }

        console.log('offerData', rowData)
        if (rowData?.offerLetterUrl) {

            try {
                // Extract filename and extension
                const url = rowData.offerLetterUrl;
                const filename = url.split('/').pop();
                const ext = filename.split('.').pop()?.toLowerCase() || '';
                const mimeType = ext === 'pdf' ? 'application/pdf' : `application/${ext}`;

                const file = await urlToFile(url, filename, mimeType);

                // Store file in your form state (e.g., react-hook-form, Formik, or normal state)
                // setFormData(prev => ({ ...prev, resume: file }));
                setInitialDataCandidate({
                    ...rowData, offerLetterUrl: file, offerUrl: url, candidateId: rowData?.interviewAssesmentId?.candidateId?._id, department: initialData?.department?.name || '',
                    position: initialData?.requiredPosition?.name, uploadDocuments: {
                        ...rowData?.uploadDocuments,
                        attachEducationCertificates: educationCertificatesFile,
                        attachVisitVisa: visitVisaFile,
                        attachVisaCancellation: visaCancellationFile,
                        passportSizePhoto: passportSizePhotoFile
                    },
                    passportInfo: {
                        ...rowData?.passportInfo,
                        attachPassport: passportFile
                    }
                });
                // If you want to preview, also create an object URL
                // setResumePreview(URL.createObjectURL(file));
            } catch (err) {
                console.error("Error loading file:", err);
            }

        }
        else {
            setInitialDataCandidate(rowData);
        }

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
            offerDepartment: initialData?.department?.name || '',
            position: initialData?.requiredPosition?.name
        });
        setShowOfferDialog(true);
    };

    const handleShareLink = async () => {
        const res = await fetch("/api/linkExpiry", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ processId: initialData?._id }),
        });

        const { url } = await res.json();

        const subject = encodeURIComponent("URL to submit candidate details");
        const body = encodeURIComponent(`${url}\n\nThis link will expire in 1 hour.`);

        window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
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

                if (rounds.length <= 1 && rounds[0]?.roundStatus !== 'rejected') return <div>NA</div>;

                // Sort rounds to get the last round
                const sortedRounds = [...rounds].sort((a: any, b: any) => a.roundNumber - b.roundNumber);

                const lastRound = sortedRounds[sortedRounds.length - 1];

                // Get second last round
                const secondLastRound = sortedRounds.length >= 2
                    ? sortedRounds[sortedRounds.length - 2]
                    : null;

                let roundToDisplay = null;

                if (lastRound.roundStatus?.toLowerCase() === 'rejected') {
                    // If last round is rejected, show last round
                    roundToDisplay = lastRound;
                } else if (sortedRounds.length >= 2) {
                    // Otherwise, show second last round
                    roundToDisplay = secondLastRound;
                } else {
                    // Only one round and not rejected
                    roundToDisplay = lastRound;
                }

                return (
                    <div>
                        Round {roundToDisplay.roundNumber} - {roundToDisplay.roundStatus.toProperCase() || 'NA'}
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
        return localInterviews.map((candidate: any) => {
            let rounds = [...(candidate.rounds || [])];

            // ✅ Check if any round is rejected
            const hasRejected = rounds.some((r: any) => r.roundStatus === "rejected");

            if (hasRejected && rounds.length > 0) {
                // Remove last round if rejected exists
                rounds = rounds.slice(0, -1);
            }

            return {
                ...candidate,
                rounds, // updated rounds
                firstName: candidate?.candidateId?.firstName || '',
                lastName: candidate?.candidateId?.lastName || '',
                contactNumber: candidate?.candidateId?.contactNumber || '',
                email: candidate?.candidateId?.email || '',
                fullName: `${candidate?.candidateId?.firstName} ${candidate?.candidateId?.lastName} ${candidate?.candidateId?.contactNumber}`,
                candidateName: `${candidate?.candidateId?.firstName} ${candidate?.candidateId?.lastName}`
            };
        });
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
            offerDepartment: initialData?.department?.name,
            candidateId: candidate?.interviewAssesmentId?.candidateId?._id,
            position: candidate?.recruitmentId?.requiredPosition?.name,

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


    console.log('offer data', formattedOfferData, formConfig)

    return (
        <>

            <Dialog open={isOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        // Reset everything when dialog closes

                        closeDialog();
                        setEmployeeType('');
                        setRegion('');
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

                        {(!isStaff && !loading && !['business_travel', 'performance_appraisal', 'offboarding'].includes(workflowType)) && (
                            <div className="flex  justify-between gap-2 mb-4 w-[400px]">
                                <div className="w-full">
                                    <Label className="mb-1 block">Select Region</Label>
                                    <Combobox
                                        className="w-full"
                                        value={''}
                                        field={{
                                            name: 'regionRequisition',
                                            label: 'Region',
                                            data: uniqueCountries, // this should come from props or fetched API (with _id and name)
                                            key: 'regionRequisition',
                                        }}
                                        formData={formData}
                                        handleChange={(value: any) => {
                                            setRegion(value); // value = _id of selected employee type
                                            // setIsEmployeeTypeSelected(true);
                                            setFormData((prev) => ({
                                                ...prev,
                                                regionRequisition: value,
                                            }));

                                            // Optionally: update form config if needed
                                        }}
                                        placeholder="Choose a region"
                                    />
                                </div>
                                <div className="w-full">
                                    <Label className="mb-1 block">Select Employee Type</Label>
                                    <Combobox
                                        className="w-full"
                                        value={''}
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



                            </div>
                        )}

                        {(!loading && formConfig && (isStaff || workflowType === 'business_travel' || workflowType === 'performance_appraisal' || workflowType === 'offboarding')) && (
                            <>
                                {/* Fixed WorkflowNavigation inside dialog */}
                                {workflowType !== 'business_travel' && workflowType !== 'performance_appraisal' && workflowType !== 'offboarding' && <div className="fixed top-10 left-0 right-0 z-20 flex justify-center bg-white pb-2">
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
                                </div>}

                                {/* Scrollable Form container below header */}
                                <div className={`${workflowType !== 'business_travel' && workflowType !== 'performance_appraisal' && workflowType !== 'offboarding' ? 'pt-[210px]' : ''} flex-1 overflow-y-auto flex justify-center`}>
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

                                            case "business_trip_request":
                                                return (
                                                    <div className="w-full max-w-5xl p-4 pr-2">
                                                        <FormContainer
                                                            formConfig={formConfig}
                                                            onSubmit={handleSaveBusinessTrip}
                                                            initialData={initialData}
                                                            action={action}
                                                            users={users}
                                                        />
                                                    </div>
                                                );

                                            case "performance_appraisal":
                                                return (
                                                    <div className="w-full max-w-5xl p-4 pr-2">
                                                        <FormContainer
                                                            formConfig={formConfig}
                                                            onSubmit={handleSaveAppraisal}
                                                            initialData={initialData}
                                                            action={action}
                                                            users={users}
                                                        />
                                                    </div>
                                                );

                                            case "offboarding":
                                                return (
                                                    <div className="w-full max-w-5xl p-4 pr-2">
                                                        <FormContainer
                                                            formConfig={formConfig}
                                                            onSubmit={handleSaveOffboarding}
                                                            initialData={initialData}
                                                            action={action}
                                                            users={users}
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
                                                            users={users}
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
                                users={users}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            )}


            <Dialog open={showInterviewDialog} onOpenChange={(open) => {
                setShowInterviewDialog(open);
                if (!open) {
                    // Dialog is closing, reset the initial data
                    setInitialDataCandidate([]);
                }
            }}>
                <DialogContent
                    className="bg-white max-w-full pointer-events-auto mx-2 max-h-[95vh] w-[75%] h-[95vh] flex flex-col"
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <DialogTitle className="sticky top-0 bg-white border-b border-gray-200 py-2 mx-2">
                        Interview And Assessment
                    </DialogTitle>

                    {/* Scrollable form container */}
                    {initialDataCandidate && Object.keys(initialDataCandidate).length > 0 && (<div className="overflow-y-auto flex-1 px-2">
                        <FormContainer
                            formConfig={formConfig}
                            onSubmit={handleSaveInterview}
                            initialData={initialDataCandidate}
                            action={actionInterview}
                            users={users}
                        />
                    </div>)}
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
                            users={users}
                        />
                    </div>
                </DialogContent>
            </Dialog>



        </>

    );
};

export default HrmsDialog;
