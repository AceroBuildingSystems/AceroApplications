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
import { deepCloneWithOptionsInjection, getFormConfig } from "@/configs/hrms-forms";
import { approvalFlows } from "@/configs/approvalFlow.config";
import { ApprovalInfo } from "@/types/hrms/recruitment.types";
import MasterComponent from "../MasterComponent/MasterComponent";
import { Checkbox } from "../ui/checkbox";
import { ConsentInfo, Recruitment, VisaType } from "@/models";
import { useCreateMasterMutation, useGetMasterQuery, useLazyGetMasterQuery } from "@/services/endpoints/masterApi";
import { count } from "console";
import { position } from "html2canvas/dist/types/css/property-descriptors/position";
import { date } from "zod";

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
    rolesData?: Option[]; // Optional, for role data
    organisationData?: Option[]; // Optional, for organisation data
    currentIndex?: number; // Optional, for step navigation index
    countryData?: Option[]; // Optional, for country data
    userData?: any;
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
    rolesData,
    organisationData,
    currentIndex = 0, // Optional current index for step navigation
    countryData,
    userData

}) => {
    const { user }: any = useUserAuthorised();
    const [employeeType, setEmployeeType] = useState<any>(null);
    const [isEmployeeTypeSelected, setIsEmployeeTypeSelected] = useState(false);
    const [isStaff, setIsStaff] = useState(false);

    const [showCandidateDialog, setShowCandidateDialog] = useState(false);

    const [showInterviewDialog, setShowInterviewDialog] = useState(false);

    const [showOfferDialog, setShowOfferDialog] = useState(false);

    const [formConfig, setFormConfig] = useState(initialFormConfig);
    const [createMaster, { isLoading: isCreatingMaster }] = useCreateMasterMutation();


    const [sendEmail, { isLoading: isSendEMail }]: any = useSendEmailMutation();

    const [formData, setFormData] = useState<Record<string, any>>({});

    const [actionCandidate, setActionCandidate] = useState('Add');

    const [actionInterview, setActionInterview] = useState('Update');

    const [actionOffer, setActionOffer] = useState('Add');

    const [actionItAccess, setActionItAccess] = useState('Add');

    const [actionEmployeeInfo, setActionEmployeeInfo] = useState('Add');

    const [actionBeneficiary, setActionBeneficiary] = useState('Add');

    const [actionConsentInfo, setActionConsentInfo] = useState('Add');

    const [actionNdaInfo, setActionNdaInfo] = useState('Add');

    const [actionOrientationInfo, setActionOrientationInfo] = useState('Add');

    const [actionVisaInfo, setActionVisaInfo] = useState('Add');

    const [initialDataCandidate, setInitialDataCandidate] = useState([]);

    console.log('initial data:', initialFormConfig, initialData, rolesData);
    // const [formattedInterviewData, setFormattedInterviewData] = useState<any[]>([]);
    const [isStepInitialized, setIsStepInitialized] = useState(false);

    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [savedStepIndex, setSavedStepIndex] = useState(initialData?.completedStep || 0);
    const [localInterviews, setLocalInterviews]: any = useState([]);
    const [localOfferData, setLocalOfferData] = useState([]);
    const [candidateOffer, setCandidateOffer] = useState([]);


    const handleStepChange = (newIndex: number) => {
        setCurrentStepIndex(newIndex);
        setSavedStepIndex(newIndex); // Save it
    };



    useEffect(() => {
        if (initialData && initialData?.itAccess?._id) {
            setActionItAccess('Update');
        } else {
            setActionItAccess('Add');
        }
        if (initialData && initialData?.employeeInfo?._id) {
            setActionEmployeeInfo('Update');
        } else {
            setActionEmployeeInfo('Add');
        }

        if (initialData && initialData?.employeeInfo?.beneficiaryInfo?._id) {

            setActionBeneficiary('Update');
        } else {
            setActionBeneficiary('Add');
        }

        if (initialData && initialData?.employeeInfo?.consentInfo?._id) {
            setActionConsentInfo('Update');
        } else {
            setActionConsentInfo('Add');
        }
        if (initialData && initialData?.employeeInfo?.ndaInfo?._id) {
            setActionNdaInfo('Update');
        } else {
            setActionNdaInfo('Add');
        }

        if (initialData && initialData?.employeeInfo?.orientationInfo?._id) {
            setActionOrientationInfo('Update');
        } else {
            setActionOrientationInfo('Add');
        }
        if (initialData && initialData?.employeeInfo?.visaInfo?._id) {
            setActionVisaInfo('Update');
        } else {
            setActionVisaInfo('Add');
        }

    }, [initialData]);

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

    console.log('initialdata', initialData);

    const offerStatus = [{ name: 'Issued', _id: 'issued' },
    { name: 'Accepted', _id: 'accepted' },
    { name: 'Rejected', _id: 'rejected' }];

    useEffect(() => {
        if (!initialFormConfig || !initialFormConfig.steps) return;
        console.log('currentStepIndex', currentStepIndex, 'initialFormConfig', initialFormConfig);
        const step = initialFormConfig.steps[currentStepIndex];

        const loadStepConfig = async () => {
            const baseConfig = getFormConfig(step?.formType);
            if (!baseConfig) return;

            const optionsMap = {
                department: departments,
                designation: designations,
                workLocation: locationData,
                nationality: countryData,
                status: status,
                employee: users,
                reportingTo: userData,
                category: employeeTypes,
                "employeeInfo.familyDetails.fatherNationality._id": countryData,
                "employeeInfo.familyDetails.motherNationality._id": countryData,
                "employeeInfo.familyDetails.spouseNationality._id": countryData,
                "employeeInfo.familyDetails.child1Nationality._id": countryData,
                "employeeInfo.familyDetails.child2Nationality._id": countryData,
                "employeeInfo.familyDetails.child3Nationality._id": countryData,
                "employeeInfo.visaInfo.visaType._id": visaTypes,

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

    const loading = false;
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
            data?.offerLetterUrl,
            'employees'
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
                data: { completedStep: 4, status: 'completed' },
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


            // getOfferACceptance({
            //     db: MONGO_MODELS.OFFER_ACCEPTANCE,
            //     filter: { recruitmentId: initialData?._id },
            //     sort: { createdAt: 'desc' }
            // }).unwrap().then((res) => {
            //     setLocalOfferData(res.data || []);
            // });

            setShowOfferDialog(false);

            return;
        }

        return offerResponse;

    };



    const handleSave = async (data: any) => {

        try {
            console.log('Form Data 1 2 3:', data);

            const formattedData = {
                db: MONGO_MODELS.EMPLOYEE_JOINING,
                action: action === 'Add' ? 'create' : 'update',
                filter: { "_id": data?._id },
                data: { ...data, offerAcceptance: data?.employee },
            };

            const response: any = await createMaster(formattedData);

            console.log('Response:', response);

            if (response.data?.data && response.data.status === SUCCESS) {
                toast.success(`Successfully ${action === 'Update' ? 'Updat' : action}ed employee joining!`, {
                    position: "bottom-right"
                });
                if (action === 'Add') {
                    const formattedDataOffer = {
                        db: MONGO_MODELS.OFFER_ACCEPTANCE,
                        action: 'update',
                        filter: { "_id": data?.employee },
                        data: { onboardingStatus: 'active' },
                    };

                    const response: any = await createMaster(formattedDataOffer);

                }
                let emailData = {};
                if (response.data?.data?.completedStep === 1) {

                    const requestData = { 'Employee Name': `${response.data.data?.offerAcceptance?.interviewAssesmentId?.candidateId?.firstName?.toProperCase()} ${response.data.data?.offerAcceptance?.interviewAssesmentId?.candidateId?.lastName?.toProperCase()}`, 'designation': response.data.data?.offerAcceptance?.interviewAssesmentId?.candidateId?.recruitment?.requiredPosition?.name, 'Reporting Date': moment(response.data.data?.dateOfReporting).format("DD-MM-yyyy"), 'Reporting To': response.data.data?.reportingTo?.displayName?.toProperCase() };
                    emailData = { recipient: 'iqbal.ansari@acero.ae', subject: 'Assets & It Access Request', templateData: requestData, fileName: "hrmsTemplates/assetsItAccess", senderName: user?.displayName?.toProperCase(), approveUrl: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/dashboard/newhrms/workflows/onboarding?_id=${response?.data?.data?._id}`, rejectUrl: ``, recipientName: response.data.data?.reportingTo?.displayName?.toProperCase() };

                    await sendEmail(emailData);
                }

                // closeDialog();

            }
            else {
                toast.error(response?.data.message || "Something Went Wrong!");
                return;
            }

        } catch (error) {
            console.error("Error saving data:", error);
            toast.error(`Error ${action === 'Add' ? 'creating' : 'updating'} employee joining.`);
        }




    };
    console.log('Response:', initialData);
    const handleSaveItAccess = async (data: any) => {


        try {
            console.log('Form Data 1 2 3 4:', data, actionItAccess);

            const itManagerData = userData?.find(
                (data) => data?.department?.name === 'IT' && data?.employeeType?.name === 'Manager'
            );

            const formattedData = {
                db: MONGO_MODELS.IT_ASSETS_ACCESS,
                action: actionItAccess === 'Add' ? 'create' : 'update',
                filter: { "_id": data.itAccess?._id },
                data: { ...data.itAccess, employeeJoiningId: initialData?._id },
            };
            console.log('Formatted Data:', formattedData);

            const response: any = await createMaster(formattedData);

            console.log('Response:', response, initialData);

            if (initialData?.completedStep === 1 && response.data?.data && response.data.status === SUCCESS) {


                const joiningPayload = {
                    db: MONGO_MODELS.EMPLOYEE_JOINING,
                    action: 'update',
                    filter: { "_id": initialData?._id },
                    data: { completedStep: 2 },
                };

                const joiningResponse: any = await createMaster(joiningPayload);

                initialData['completedStep'] = 2;


            }

            if (response.data?.data && response.data.status === SUCCESS) {
                toast.success(`Successfully ${action === 'Update' ? 'Updat' : action}ed it assets and access request!`, {
                    position: "bottom-right"
                });
                // closeDialog();

            }
            else {
                toast.error(response?.data.message || "Something Went Wrong!");
                return;
            }

            let emailData = {};
            if (initialData?.completedStep < 3) {

                const requestData = { 'Employee Name': `${initialData?.fullName?.toProperCase()}`, 'designation': initialData?.designationName, 'Reporting Date': moment(initialData?.dateOfReporting).format("DD-MM-yyyy"), 'Reporting To': initialData?.reportingToName?.toProperCase() };
                emailData = { recipient: 'iqbal.ansari@acero.ae', subject: 'Review Assets & It Access Request', templateData: requestData, fileName: "hrmsTemplates/assetsItAccess", senderName: user?.displayName?.toProperCase(), approveUrl: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/dashboard/newhrms/workflows/onboarding?_id=${initialData?._id}`, rejectUrl: ``, recipientName: itManagerData?.displayName?.toProperCase() };

                await sendEmail(emailData);
            }



        } catch (error) {
            console.error("Error saving data:", error);
            toast.error(`Error ${action === 'Add' ? 'creating' : 'updating'} it assets and access request.`);
        }




    };

    function sanitizeObjectIdFields(obj: any, keys: string[]) {
        const updated = { ...obj };

        keys.forEach(key => {
            const field = updated[key]; // e.g., updated["fatherNationality"]
            if (field && typeof field === "object" && "_id" in field) {
                if (!field._id || field._id === "") {
                    updated[key] = undefined; // remove whole object if _id empty
                } else {
                    updated[key] = field._id; // keep only the _id value
                }
            }
        });

        return updated;
    }


    const handleSaveEmployeeInfo = async (data: any) => {

        try {

            const employeeInfo = {
                ...data.employeeInfo,

                // sanitize familyDetails nested fields
                familyDetails: sanitizeObjectIdFields(
                    { ...data.employeeInfo.familyDetails },
                    ["fatherNationality", "motherNationality", "spouseNationality", "child1Nationality", "child2Nationality", "child3Nationality"]
                ),
            };

            console.log('Form Data 1 2 3 4:', employeeInfo, initialData, actionEmployeeInfo);

            // let uploadResultEducationCertificate = null;
            // let uploadResultPassport = null;
            // let uploadResultVisitVisa = null;
            // let uploadResultVisaCancellation = null;

            // if (data?.employeeInfo?.uploadDocuments?.attachEducationCertificates?.length) {
            //     // Create an array of promises, one per file
            //     const uploadPromises = data.employeeInfo.uploadDocuments.attachEducationCertificates.map(
            //         (file) =>
            //             handleUpload(
            //                 data.firstName,
            //                 data.lastName,
            //                 data?.employeeInfo?.empId,
            //                 `${file.name.split('.')[0]}`,
            //                 file,
            //                 'employees'
            //             )
            //     );

            //     // Wait for all uploads to finish concurrently
            //     try {
            //         const uploadResult = await Promise.all(uploadPromises);
            //         uploadResultEducationCertificate = uploadResult?.map(file => file.url);
            //         console.log('All files uploaded successfully:', uploadResultEducationCertificate);
            //     } catch (err) {
            //         console.error('One or more uploads failed:', err);
            //     }
            // }


            // 1️⃣ Upload resume

            // data?.employeeInfo?.passport?.attachPassport && (uploadResultPassport = await handleUpload(
            //     data?.firstName,
            //     data?.lastName,
            //     initialData?.employeeInfo?.empId,
            //     `passport`,
            //     data?.employeeInfo?.passport?.attachPassport,
            //     'employees'
            // ));

            // data?.employeeInfo?.uploadDocuments?.attachVisitVisa && (uploadResultVisitVisa = await handleUpload(
            //     data?.firstName,
            //     data?.lastName,
            //     initialData?.employeeInfo?.empId,
            //     `visit visa`,
            //     data?.employeeInfo?.uploadDocuments?.attachVisitVisa,
            //     'employees'
            // ));

            // data?.employeeInfo?.uploadDocuments?.attachVisaCancellation && (uploadResultVisaCancellation = await handleUpload(
            //     data?.firstName,
            //     data?.lastName,
            //     initialData?.employeeInfo?.empId,
            //     `visit cancellation`,
            //     data?.employeeInfo?.uploadDocuments?.attachVisaCancellation,
            //     'employees'
            // ));
            const {
                beneficiaryInfo,
                consentInfo,
                ndaInfo,
                orientationInfo,
                visaInfo,
                ...restEmployeeInfo
            } = employeeInfo || {};

            const initialEmpId = initialData?.employeeInfo?.empId;
            const currentEmpId = employeeInfo?.empId;

            const isEmpIdChanged =
                currentEmpId &&
                initialEmpId &&
                currentEmpId.trim() !== initialEmpId.trim();

            if (actionEmployeeInfo === 'update' && !isEmpIdChanged) {
                delete restEmployeeInfo.empId;
            }


            const formattedData = {
                db: MONGO_MODELS.EMPLOYEE_INFO,
                action: actionEmployeeInfo === 'Add' ? 'create' : 'update',
                filter: { "_id": data.employeeInfo?._id },
                data: {
                    ...restEmployeeInfo,
                    itAssetsAccessId: initialData?.itAccess?._id,
                    // Only include linked info if they exist
                    ...(employeeInfo?.beneficiaryInfo?._id && { beneficiaryInfo: employeeInfo.beneficiaryInfo._id }),
                    ...(employeeInfo?.consentInfo?._id && { consentInfo: employeeInfo.consentInfo._id }),
                    ...(employeeInfo?.ndaInfo?._id && { ndaInfo: employeeInfo.ndaInfo._id }),
                    ...(employeeInfo?.orientationInfo?._id && { orientationInfo: employeeInfo.orientationInfo._id }),
                    ...(employeeInfo?.visaInfo?._id && { visaInfo: employeeInfo.visaInfo._id }),
                },
            };
          
            const response: any = await createMaster(formattedData);


            if (actionEmployeeInfo === 'Add') {
                const roleId = rolesData?.find((role: any) => role?.name === 'User')?._id;
                const visaId = visaTypes?.find((visa: any) => visa?.name === 'Employee Visa')?._id;

                const organisationId = organisationData?.find((org: any) => org?.location?._id === initialData?.workLocation)?._id;

                const userPayload = {
                    db: MONGO_MODELS.USER_MASTER,
                    action: 'create',
                    data: {
                        empId: response?.data?.data?.empId,
                        firstName: initialData?.firstName,
                        lastName: initialData?.lastName,
                        fullName: `${initialData.firstName} ${initialData.lastName}`,
                        displayName: response?.data?.data?.displayName,
                        email: initialData?.itAccess?.email || undefined,
                        isActive: true,

                        // org structure
                        employeeType: initialData.category,
                        department: initialData.department,
                        designation: initialData.designation,
                        reportingTo: initialData.reportingTo,
                        role: roleId,
                        visaType: visaId,
                        organisation: organisationId,
                        activeLocation: initialData?.workLocation,
                        reportingLocation: initialData?.workLocation,
                        availability: 'Available',
                        gender: initialData?.gender?.toProperCase(),
                        maritalStatus: initialData?.maritalStatus?.toProperCase(),
                        dateOfBirth: initialData?.dateOfBirth,
                        nationality: initialData?.nationality,
                        joiningDate: response?.data?.data.dateOfJoining,
                        passportNumber: initialData?.itAccess?.employeeJoiningId?.offerAcceptance?.passportInfo?.passportNo,
                        passportIssueDate: initialData?.itAccess?.employeeJoiningId?.offerAcceptance?.passportInfo?.issueDate,
                        passportExpiryDate: initialData?.itAccess?.employeeJoiningId?.offerAcceptance?.passportInfo?.expiryDate,

                        addedBy: response?.data?.data?.addedBy,
                    }
                };

                await createMaster(userPayload);


            }


            if (initialData?.completedStep === 2 && response.data?.data && response.data.status === SUCCESS) {
                const joiningPayload = {
                    db: MONGO_MODELS.EMPLOYEE_JOINING,
                    action: 'update',
                    filter: { "_id": initialData?._id },
                    data: { completedStep: 3 },
                };
                console.log('Joining Update Data:', joiningPayload);

                const joiningResponse: any = await createMaster(joiningPayload);
                console.log('joining Update Response:', joiningResponse);

                initialData['completedStep'] = 3;
            }
            setActionEmployeeInfo('Update');

            if (response.data?.data && response.data.status === SUCCESS) {
                toast.success(`Successfully ${action === 'Update' ? 'Updat' : action}ed employee joining information!`, {
                    position: "bottom-right"
                });
                // closeDialog();

            }
            else {
                toast.error(response?.data.message || "Something Went Wrong!");
                return;
            }

        } catch (error) {
            console.error("Error saving data:", error);
            toast.error(`Error ${action === 'Add' ? 'creating' : 'updating'} employee joining information.`);
        }


    };
    console.log({ actionBeneficiary });
    const handleSaveBeneficiaryInfo = async (data: any) => {

        try {

            console.log('Form Data 1 2 3 4:', data);
            let uploadResultBeneficiary = null;
            // 1️⃣ Upload resume

            data?.employeeInfo?.beneficiaryInfo.declaration.attachBeneficiaryDeclaration && (uploadResultBeneficiary = await handleUpload(
                data?.firstName,
                data?.lastName,
                initialData?.employeeInfo?.empId,
                `beneficiary ${new Date(data?.employeeInfo?.beneficiaryInfo.declaration.declarationDate).getFullYear()}`,
                data?.employeeInfo?.beneficiaryInfo.declaration.attachBeneficiaryDeclaration,
                'employees'
            ));
            const formattedData = {
                db: MONGO_MODELS.BENEFICIARY_INFO,
                action: actionBeneficiary === 'Add' ? 'create' : 'update',
                filter: { "_id": data?.employeeInfo?.beneficiaryInfo?._id },
                data: {
                    ...data?.employeeInfo?.beneficiaryInfo, declaration: {
                        ...data?.employeeInfo?.beneficiaryInfo?.declaration,
                        declarationFormUrl: uploadResultBeneficiary?.url,
                    },
                },
            };
            console.log('Formatted Data:', formattedData, actionBeneficiary);

            const response: any = await createMaster(formattedData);

            console.log({ response });

            if (initialData?.completedStep === 3 && response.data?.data && response.data.status === SUCCESS) {

                const employeePayload = {
                    db: MONGO_MODELS.EMPLOYEE_INFO,
                    action: 'update',
                    filter: { "_id": initialData?.employeeInfo?._id },
                    data: { beneficiaryInfo: response?.data?.data?._id },
                };
                console.log('employee Update Data:', employeePayload);

                const employeeResponse: any = await createMaster(employeePayload);

                const joiningPayload = {
                    db: MONGO_MODELS.EMPLOYEE_JOINING,
                    action: 'update',
                    filter: { "_id": initialData?._id },
                    data: { completedStep: 4 },
                };
                console.log('Joining Update Data:', joiningPayload);

                const joiningResponse: any = await createMaster(joiningPayload);
                console.log('joining Update Response:', joiningResponse);

                initialData['completedStep'] = 4;
            }
            setActionBeneficiary('Update');

            if (response.data?.data && response.data.status === SUCCESS) {
                toast.success(`Successfully ${action === 'Update' ? 'Updat' : action}ed employee joining information!`, {
                    position: "bottom-right"
                });
                // closeDialog();

            }
            else {
                toast.error(response?.data.message || "Something Went Wrong!");
                return;
            }

        } catch (error) {
            console.error("Error saving data:", error);
            toast.error(`Error ${action === 'Add' ? 'creating' : 'updating'} employee joining information.`);
        }




    };

    const handleSaveConsentInfo = async (data: any) => {

        try {

            console.log('Form Data 1 2 3 4:', data);
            let uploadResultConsent = null;
            // 1️⃣ Upload resume

            data?.employeeInfo?.consentInfo?.declaration.attachDeclaration && (uploadResultConsent = await handleUpload(
                data?.firstName,
                data?.lastName,
                initialData?.employeeInfo?.empId,
                `consent ${new Date(data?.employeeInfo?.consentInfo?.declaration.declarationDate).getFullYear()}`,
                data?.employeeInfo?.consentInfo?.declaration.attachDeclaration,
                'employees'
            ));

            const formattedData = {
                db: MONGO_MODELS.CONSENT_INFO,
                action: actionConsentInfo === 'Add' ? 'create' : 'update',
                filter: { "_id": data?.employeeInfo?.consentInfo?._id },
                data: {
                    ...data?.employeeInfo?.consentInfo, declaration: {
                        ...data?.employeeInfo?.consentInfo?.declaration,
                        declarationFormUrl: uploadResultConsent?.url,
                    },
                },
            };
            console.log('Formatted Data:', formattedData);

            const response: any = await createMaster(formattedData);

            console.log('Response:', response);

            if (initialData?.completedStep === 4 && response.data?.data && response.data.status === SUCCESS) {

                const employeePayload = {
                    db: MONGO_MODELS.EMPLOYEE_INFO,
                    action: 'update',
                    filter: { "_id": initialData?.employeeInfo?._id },
                    data: { consentInfo: response?.data?.data?._id },
                };
                console.log('employee Update Data:', employeePayload);

                const employeeResponse: any = await createMaster(employeePayload);

                const joiningPayload = {
                    db: MONGO_MODELS.EMPLOYEE_JOINING,
                    action: 'update',
                    filter: { "_id": initialData?._id },
                    data: { completedStep: 5 },
                };
                console.log('Joining Update Data:', joiningPayload);

                const joiningResponse: any = await createMaster(joiningPayload);
                console.log('joining Update Response:', joiningResponse);

                initialData['completedStep'] = 5;
            }
            setActionConsentInfo('Update');

            if (response.data?.data && response.data.status === SUCCESS) {
                toast.success(`Successfully ${action === 'Update' ? 'Updat' : action}ed employee joining information!`, {
                    position: "bottom-right"
                });
                // closeDialog();

            }
            else {
                toast.error(response?.data.message || "Something Went Wrong!");
                return;
            }

        } catch (error) {
            console.error("Error saving data:", error);
            toast.error(`Error ${action === 'Add' ? 'creating' : 'updating'} employee joining information.`);
        }




    };

    const handleSaveNdaInfo = async (data: any) => {

        try {

            console.log('Form Data 1 2 3 4:', data);
            let uploadResultNda = null;
            // 1️⃣ Upload resume

            data?.employeeInfo?.ndaInfo?.attachNda && (uploadResultNda = await handleUpload(
                data?.firstName,
                data?.lastName,
                initialData?.employeeInfo?.empId,
                `nda ${new Date(data?.employeeInfo?.ndaInfo?.aggrementDate).getFullYear()}`,
                data?.employeeInfo?.ndaInfo?.attachNda,
                'employees'
            ));


            const formattedData = {
                db: MONGO_MODELS.NDA_INFO,
                action: actionNdaInfo === 'Add' ? 'create' : 'update',
                filter: { "_id": data?.employeeInfo?.ndaInfo?._id },
                data: { ...data?.employeeInfo?.ndaInfo, ndaFormUrl: uploadResultNda?.url },
            };
            console.log('Formatted Data:', formattedData);

            const response: any = await createMaster(formattedData);

            console.log('Response:', response);

            if (initialData?.completedStep === 5 && response.data?.data && response.data.status === SUCCESS) {

                const employeePayload = {
                    db: MONGO_MODELS.EMPLOYEE_INFO,
                    action: 'update',
                    filter: { "_id": initialData?.employeeInfo?._id },
                    data: { ndaInfo: response?.data?.data?._id },
                };
                console.log('employee Update Data:', employeePayload);

                const employeeResponse: any = await createMaster(employeePayload);

                const joiningPayload = {
                    db: MONGO_MODELS.EMPLOYEE_JOINING,
                    action: 'update',
                    filter: { "_id": initialData?._id },
                    data: { completedStep: 6 },
                };
                console.log('Joining Update Data:', joiningPayload);

                const joiningResponse: any = await createMaster(joiningPayload);
                console.log('joining Update Response:', joiningResponse);

                initialData['completedStep'] = 6;
            }
            setActionNdaInfo('Update');

            if (response.data?.data && response.data.status === SUCCESS) {
                toast.success(`Successfully ${action === 'Update' ? 'Updat' : action}ed employee joining information!`, {
                    position: "bottom-right"
                });
                // closeDialog();

            }
            else {
                toast.error(response?.data.message || "Something Went Wrong!");
                return;
            }

            let emailData = {};
            if (initialData?.completedStep > 7) {

                const requestData = { 'Employee Name': `${initialData?.fullName?.toProperCase()}`, 'designation': initialData?.designationName, 'department': initialData?.departmentName, 'Joining Date': moment(initialData?.dateOfReporting).format("DD-MM-yyyy"), 'Reporting To': initialData?.reportingToName?.toProperCase() };
                emailData = { recipient: 'iqbal.ansari@acero.ae', subject: 'Review Onboarding Process', templateData: requestData, fileName: "hrmsTemplates/onboardingReview", senderName: 'Acero Application', approveUrl: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/dashboard/newhrms/workflows/onboarding?_id=${initialData?._id}`, rejectUrl: ``, recipientName: 'Users' };

                await sendEmail(emailData);
            }

        } catch (error) {
            console.error("Error saving data:", error);
            toast.error(`Error ${action === 'Add' ? 'creating' : 'updating'} employee joining information.`);
        }


    };

    const handleSaveOrientationInfo = async (data: any) => {

        try {

            console.log('Form Data 1 2 3 4:', data);

            // 1️⃣ Upload resume

            const formattedData = {
                db: MONGO_MODELS.ORIENTATION_INFO,
                action: actionOrientationInfo === 'Add' ? 'create' : 'update',
                filter: { "_id": data?.employeeInfo?.orientationInfo?._id },
                data: { ...data?.employeeInfo?.orientationInfo },
            };
            console.log('Formatted Data:', formattedData);

            const response: any = await createMaster(formattedData);

            console.log('Response:', response);

            if (initialData?.completedStep === 6 && response.data?.data && response.data.status === SUCCESS) {

                const employeePayload = {
                    db: MONGO_MODELS.EMPLOYEE_INFO,
                    action: 'update',
                    filter: { "_id": initialData?.employeeInfo?._id },
                    data: { orientationInfo: response?.data?.data?._id },
                };
                console.log('employee Update Data:', employeePayload);

                const employeeResponse: any = await createMaster(employeePayload);

                const joiningPayload = {
                    db: MONGO_MODELS.EMPLOYEE_JOINING,
                    action: 'update',
                    filter: { "_id": initialData?._id },
                    data: { completedStep: 7 },
                };
                console.log('Joining Update Data:', joiningPayload);

                const joiningResponse: any = await createMaster(joiningPayload);
                console.log('joining Update Response:', joiningResponse);

                initialData['completedStep'] = 7;
            }
            setActionOrientationInfo('Update');

            if (response.data?.data && response.data.status === SUCCESS) {
                toast.success(`Successfully ${action === 'Update' ? 'Updat' : action}ed employee joining information!`, {
                    position: "bottom-right"
                });
                // closeDialog();

            }
            else {
                toast.error(response?.data.message || "Something Went Wrong!");
                return;
            }

        } catch (error) {
            console.error("Error saving data:", error);
            toast.error(`Error ${action === 'Add' ? 'creating' : 'updating'} employee joining information.`);
        }




    };

    const handleSaveVisaInfo = async (data: any) => {

        try {

            console.log('Form Data 1 2 3 4:', data);
            let uploadResultVisa = null;
            let uploadResultEmiratesId = null;
            let uploadResultLaborCard = null;
            let uploadResultIloe = null;

            // 1️⃣ Upload resume

            data?.employeeInfo?.visaInfo?.attachVisa && (uploadResultVisa = await handleUpload(
                data?.firstName,
                data?.lastName,
                initialData?.employeeInfo?.empId,
                `visa ${new Date(data?.employeeInfo?.visaInfo?.visaIssueDate).getFullYear()}`,
                data?.employeeInfo?.visaInfo?.attachVisa,
                'employees'
            ));

            data?.employeeInfo?.visaInfo?.attachEmiratesId && (uploadResultEmiratesId = await handleUpload(
                data?.firstName,
                data?.lastName,
                initialData?.employeeInfo?.empId,
                `emirates id ${new Date(data?.employeeInfo?.visaInfo?.emiratesIdIssueDate).getFullYear()}`,
                data?.employeeInfo?.visaInfo?.attachEmiratesId,
                'employees'
            ));

            data?.employeeInfo?.visaInfo?.attachLaborCard && (uploadResultLaborCard = await handleUpload(
                data?.firstName,
                data?.lastName,
                initialData?.employeeInfo?.empId,
                `labor card ${new Date(data?.employeeInfo?.visaInfo?.visaIssueDate).getFullYear()}`,
                data?.employeeInfo?.visaInfo?.attachLaborCard,
                'employees'
            ));

            data?.employeeInfo?.visaInfo?.attachIloe && (uploadResultIloe = await handleUpload(
                data?.firstName,
                data?.lastName,
                initialData?.employeeInfo?.empId,
                `iloe ${new Date(data?.employeeInfo?.visaInfo?.iloeExpiryDate).getFullYear()}`,
                data?.employeeInfo?.visaInfo?.attachIloe,
                'employees'
            ));

            const formattedData = {
                db: MONGO_MODELS.VISA_INFO,
                action: actionVisaInfo === 'Add' ? 'create' : 'update',
                filter: { "_id": data?.employeeInfo?.visaInfo?._id },
                data: { ...data?.employeeInfo?.visaInfo, visaType: data?.employeeInfo?.visaInfo?.visaType?._id, visaUrl: uploadResultVisa?.url, emiratesIdUrl: uploadResultEmiratesId?.url, laborCardUrl: uploadResultLaborCard?.url, iloeUrl: uploadResultIloe?.url },
            };
            console.log('Formatted Data:', formattedData);

            const response: any = await createMaster(formattedData);

            console.log('Response:', response);

            if (initialData?.completedStep === 7 && response.data?.data && response.data.status === SUCCESS) {

                const employeePayload = {
                    db: MONGO_MODELS.EMPLOYEE_INFO,
                    action: 'update',
                    filter: { "_id": initialData?.employeeInfo?._id },
                    data: { visaInfo: response?.data?.data?._id },
                };
                console.log('employee Update Data:', employeePayload);

                const employeeResponse: any = await createMaster(employeePayload);

                const joiningPayload = {
                    db: MONGO_MODELS.EMPLOYEE_JOINING,
                    action: 'update',
                    filter: { "_id": initialData?._id },
                    data: { completedStep: 8 },
                };
                console.log('Joining Update Data:', joiningPayload);

                const joiningResponse: any = await createMaster(joiningPayload);
                console.log('joining Update Response:', joiningResponse);

                initialData['completedStep'] = 8;
            }
            setActionVisaInfo('Update');

            if (response.data?.data && response.data.status === SUCCESS) {
                toast.success(`Successfully ${action === 'Update' ? 'Updat' : action}ed employee joining information!`, {
                    position: "bottom-right"
                });
                // closeDialog();

            }
            else {
                toast.error(response?.data.message || "Something Went Wrong!");
                return;
            }

        } catch (error) {
            console.error("Error saving data:", error);
            toast.error(`Error ${action === 'Add' ? 'creating' : 'updating'} employee joining information.`);
        }




    };


    console.log('myformconfig', formConfig);

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

                        {/* {(!isStaff && !loading) && (
                            <div className="w-[200px] mb-4">
                                <Label className="mb-1 block">Select Employee Type</Label>
                                <Combobox
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
                        )} */}

                        {!loading && formConfig && (
                            <>
                                {/* Fixed WorkflowNavigation inside dialog */}
                                <div className="fixed top-10 left-0 right-0 z-20 flex justify-center bg-white pb-2">
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
                                <div className="pt-[210px] flex-1 overflow-y-auto flex justify-center">
                                    {(() => {
                                        switch (formConfig?.formType) {

                                            case "assets_it_access":
                                                return (
                                                    <div className="w-full max-w-5xl p-4 pr-4">

                                                        <FormContainer
                                                            formConfig={formConfig}
                                                            onSubmit={handleSaveItAccess}
                                                            initialData={initialData}
                                                            action={actionItAccess}
                                                            users={users}
                                                        />

                                                    </div>
                                                );

                                            case "employee_information":
                                                return (
                                                    <div className="w-full max-w-5xl p-4 pr-4">

                                                        <FormContainer
                                                            formConfig={formConfig}
                                                            onSubmit={handleSaveEmployeeInfo}
                                                            initialData={initialData}
                                                            action={actionEmployeeInfo}
                                                            users={users}
                                                        />

                                                    </div>
                                                );

                                            case "beneficiary_declaration":
                                                return (
                                                    <div className="w-full max-w-5xl p-4 pr-4">

                                                        <FormContainer
                                                            formConfig={formConfig}
                                                            onSubmit={handleSaveBeneficiaryInfo}
                                                            initialData={initialData}
                                                            action={actionBeneficiary}
                                                            users={users}
                                                        />

                                                    </div>
                                                );

                                            case "accommodation_transport_consent":
                                                return (
                                                    <div className="w-full max-w-5xl p-4 pr-4">

                                                        <FormContainer
                                                            formConfig={formConfig}
                                                            onSubmit={handleSaveConsentInfo}
                                                            initialData={initialData}
                                                            action={actionConsentInfo}
                                                            users={users}
                                                        />

                                                    </div>
                                                );

                                            case "non_disclosure_agreement":
                                                return (
                                                    <div className="w-full max-w-5xl p-4 pr-4">

                                                        <FormContainer
                                                            formConfig={formConfig}
                                                            onSubmit={handleSaveNdaInfo}
                                                            initialData={initialData}
                                                            action={actionNdaInfo}
                                                            users={users}
                                                        />

                                                    </div>
                                                );

                                            case "employee_orientation":
                                                return (
                                                    <div className="w-full max-w-5xl p-4 pr-4">

                                                        <FormContainer
                                                            formConfig={formConfig}
                                                            onSubmit={handleSaveOrientationInfo}
                                                            initialData={initialData}
                                                            action={actionOrientationInfo}
                                                            users={users}
                                                        />

                                                    </div>
                                                );

                                            case "visa_process":
                                                return (
                                                    <div className="w-full max-w-5xl p-4 pr-4">

                                                        <FormContainer
                                                            formConfig={formConfig}
                                                            onSubmit={handleSaveVisaInfo}
                                                            initialData={initialData}
                                                            action={actionVisaInfo}
                                                            users={users}
                                                        />

                                                    </div>
                                                );



                                            default:
                                                return (
                                                    <div className="w-full max-w-5xl p-4 pr-4">
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



        </>

    );
};

export default HrmsDialog;
