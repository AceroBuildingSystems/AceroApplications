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
import jsPDF from "jspdf";
import { renderBusinessTripPdf } from "@/shared/functions";
import { UsersList } from "../UsersList";

interface smartDeskDialogProps {
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

const SmartDeskDialog: React.FC<smartDeskDialogProps> = ({
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


    const { user }: any = useUserAuthorised();

    const [showCandidateDialog, setShowCandidateDialog] = useState(false);

    const [filteredInterviewers, setFilteredInterviewers]: any = useState([]);

    const [showInterviewDialog, setShowInterviewDialog] = useState(false);

    const [showOfferDialog, setShowOfferDialog] = useState(false);

    const [formConfig, setFormConfig] = useState(initialFormConfig);
    const [createMaster, { isLoading: isCreatingMaster }] = useCreateApplicationMutation();


    const [getTasks, { data: taskData, isLoading: taskLoading }] = useLazyGetMasterQuery();

    const [sendEmail, { isLoading: isSendEMail }]: any = useSendEmailMutation();

    const [formData, setFormData] = useState<Record<string, any>>({});

    const [actionCandidate, setActionCandidate] = useState('Add');

    const [actionInterview, setActionInterview] = useState('Update');

    const [actionOffer, setActionOffer] = useState('Add');

    const [initialDataCandidate, setInitialDataCandidate]: any = useState([]);

    console.log('Form Config:', initialData);
    // const [formattedInterviewData, setFormattedInterviewData] = useState<any[]>([]);
    const [isStepInitialized, setIsStepInitialized] = useState(false);

    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [savedStepIndex, setSavedStepIndex] = useState(initialData?.completedStep || 0);
    const [localInterviews, setLocalInterviews]: any = useState([]);
    const [localOfferData, setLocalOfferData] = useState([]);
    const [candidateOffer, setCandidateOffer] = useState([]);


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



    useEffect(() => {
        if (!initialFormConfig || !initialFormConfig.steps) return;
        console.log('currentStepIndex', currentStepIndex, 'initialFormConfig', initialFormConfig);
        const step = initialFormConfig.steps[currentStepIndex];

        const loadStepConfig = async () => {
            const baseConfig = getFormConfig(step?.formType);
            if (!baseConfig) return;

            const optionsMap = {
                'recurring.intervalType': recurringInterval,
                assignees: users?.filter(data => data?.department?._id === user?.department?._id) || [],

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
    }, [currentStepIndex, initialFormConfig, users, departments, designations, employeeTypes, recruitymentTypes, locationData, visaTypes, currentIndex, candidateOffer]);


    const roundStatus = [
        { name: 'Shortlisted', _id: 'shortlisted' },
        { name: 'Rejected', _id: 'rejected' },
        { name: 'N/A', _id: 'na' }
    ];

    const recurringInterval = [
        { name: 'Daily', _id: 'daily' },
        { name: 'Weekly', _id: 'weekly' },
        { name: 'Monthly', _id: 'monthly' },
        { name: 'Custom', _id: 'custom' }
    ];

    const status = [
        { name: 'Recruited', _id: 'recruited' },
        { name: 'Shortlisted', _id: 'shortlisted' },
        { name: 'Held', _id: 'held' },
        { name: 'Rejected', _id: 'rejected' },
        { name: 'N/A', _id: 'na' }
    ];

    // const loading = taskLoading;

    const handleUpload = async (firstName: string, lastName: string, contactNumber: string, documentType: string, file: any, folderName: string) => {
        if (!file) return;
        const fullName = lastName === '' ? firstName : firstName + ' ' + lastName + `_` + contactNumber;
        // Prepare API endpoint with ticketId and userId

        const uniqueName = `${file?.name?.split('.')[0]}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const endpoint = `/api/uploadCadidatesDocs?fullname=${fullName}&documentType=${uniqueName}&folderName=${folderName}`;
        // Prepare headers
        const headers: HeadersInit = {
            "Content-Type": file?.type || "application/octet-stream",
            "Content-Disposition": `attachment; filename="${file?.name}"`
        };

        // Optional: Track upload progress (for UI only)
        const reader = file?.stream()?.getReader();
        let uploaded = 0;
        const total = file?.size;
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

    async function getApproverIdByRole(role: string, department?: string, departmentId?: string) {
        // search by role

        if (role === 'Manager') {
            if (department) {
                const approver = users?.find((user: any) =>
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
                    const departmentManager = users?.find((user: any) =>
                        user.department?._id === departmentId &&
                        user.employeeType?.name === "Manager"
                    );

                    const departmentHead: any = departmentManager?.reportingTo;

                    return departmentHead ? departmentHead?._id : null;
                }
                else {
                    const departmentManager = users?.find(u =>
                        u?._id === user?._id
                    );

                    const departmentHead: any = departmentManager?.reportingTo;

                    return departmentHead ? departmentHead?._id : null;
                }

            }
            else {
                const approver = users?.find((user: any) =>
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

        let uploadResultAttachment = null;

        console.log('Form Data Business Trip:', data);
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2); // e.g. "25"
        const month = String(date.getMonth() + 1).padStart(2, '0'); // e.g. "10"
        const prefix = `TSK-${year}`; // Example: TSK-2510

        // ✅ Step 2: Fetch existing tasks for this month to determine sequence
        const res: any = await getTasks({
            db: MONGO_MODELS.TASK,
            filter: { taskId: { $regex: `^${prefix}` } },
            sort: { createdAt: 'asc' }
        }).unwrap();

        const taskCount = res?.data?.length || 0;
        const nextSeq = String(taskCount + 1).padStart(5, '0'); // 0001, 0002...
        const generatedTaskId = `${prefix}-${nextSeq}`;

        console.log('Generated Task ID:', generatedTaskId);

        let formattedData = {};
        if (data?.attachments?.length) {
            // Create an array of promises, one per file
            const uploadPromises = data?.attachments.map(
                (file) => {
                    const ext = file?.name?.split('.').pop();
                    // Generate unique name: originalName_timestamp_random.ext
                    const uniqueName = `${file?.name?.split('.')[0]}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

                    return handleUpload(
                        data?.taskId ? data?.taskId : generatedTaskId,
                        '',
                        '',
                        file?.name, // use unique file name here
                        file,
                        'tasks'
                    );
                }
            );

            // Wait for all uploads to finish concurrently
            try {
                const uploadResult = await Promise.all(uploadPromises);
                uploadResultAttachment = uploadResult.map((file) => ({
                    fileName: file?.fileName,
                    filePath: file?.url,
                    uploadedAt: new Date(),
                    uploadedBy: user?._id,
                }));
                console.log('All files uploaded successfully:', uploadResultAttachment, uploadResult);
            } catch (err) {
                console.error('One or more uploads failed:', err);
            }
        }

        action === 'Add' ? formattedData = {
            db: MONGO_MODELS.TASK,
            action: action === 'Add' ? 'create' : 'update',
            filter: { "_id": data?._id },
            data: { ...data, taskId: data?.taskId ? data?.taskId : generatedTaskId, mode: `${data.assignees.length > 1 ? 'shared' : 'individual'}`, department: user?.department?._id, attachments: uploadResultAttachment || [], addedBy: user?._id, updatedBy: user?._id },
        } : formattedData = {
            db: MONGO_MODELS.TASK,
            action: action === 'Add' ? 'create' : 'update',
            filter: { "_id": data?._id },
            data: { ...data, taskId: data?.taskId ? data?.taskId : generatedTaskId, mode: `${data.assignees.length > 1 ? 'shared' : 'individual'}`, department: user?.department?._id, attachments: uploadResultAttachment || [], updatedBy: user?._id },
        };

        console.log('Formatted Task Data to Save:', formattedData);
        const response: any = await createMaster(formattedData);
        let emailData = {};
        console.log('Response after saving task:', response);
        if (response.data && response.data.status === SUCCESS) {
            toast.success(`Successfully ${action === 'Add' ? 'added' : 'updated'} a task!`, {
                position: "bottom-right"
            });
            closeDialog();

        }

        if (response?.data?.data) {
            const task = response.data.data;
            const assignees = task.assignees || [];
            const recipientEmails = assignees
                .map(a => a.email)
                .filter(Boolean); // remove any null/undefined

            // ✅ Create concatenated assignee names (Iqbal/Junaid)
            const assigneeNames = assignees
                .map(a => `${a.firstName?.toProperCase?.() || a.firstName}`)
                .join(" / ");
            // const doc = new jsPDF();
            // const pdfBase64 = renderBusinessTripPdf(doc, response?.data?.data);
            const requestData = {
                Subject: task.subject,
                Description: task.description || "-",
                StartDate: task.startDateTime
                    ? moment(task.startDateTime).format("DD-MMM-yyyy hh:mm A")
                    : "-",
                EndDate: task.endDateTime
                    ? moment(task.endDateTime).format("DD-MMM-yyyy hh:mm A")
                    : "-",
                Priority: task.priority?.toProperCase?.() || task.priority,
            };
            emailData = { recipient: recipientEmails.join(","), subject: `New Task Assigned: ${task.subject}`, templateData: requestData, fileName: "smartDeskTemplates/taskTemplate", senderName: user?.displayName?.toProperCase(), approveUrl: ``, rejectUrl: ``, viewUrl: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/dashboard/supportDesk/task/view?taskId=${task._id}`, assignee: assigneeNames || "", };

            await sendEmail(emailData);
        }

        // if (data?.attachments?.length) {
        //     // Create an array of promises, one per file
        //     const uploadPromises = data?.uploadDocuments.attachEducationCertificates.map(
        //         (file: any) =>
        //             handleUpload(
        //                 data.firstName,
        //                 data.lastName,
        //                 data?.contactNumber,
        //                 `${file.name.split('.')[0]}`,
        //                 file,
        //                 'tasks'
        //             )
        //     );

        //     // Wait for all uploads to finish concurrently
        //     try {
        //         const uploadResult = await Promise.all(uploadPromises);
        //         uploadResultAttachment = uploadResult?.map(file => file.url);
        //         console.log('All files uploaded successfully:', uploadResultAttachment);
        //     } catch (err) {
        //         console.error('One or more uploads failed:', err);
        //     }
        // }



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




    return (
        <>

            <Dialog open={isOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        // Reset everything when dialog closes

                        closeDialog();

                    }
                }}>
                <DialogContent
                    className="bg-white max-w-full pointer-events-auto mx-2 max-h-[95vh] w-[75%] h-[95%]"
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <DialogTitle className="pl-1 hidden">Test</DialogTitle>


                    <div className="h-full flex flex-col min-h-0">


                        {(formConfig) && (
                            <>


                                {/* Scrollable Form container below header */}
                                <div className={`${workflowType !== 'business_travel' && workflowType !== 'performance_appraisal' && workflowType !== 'offboarding' ? '' : ''} flex-1 overflow-y-auto flex justify-center`}>
                                    {(() => {
                                        switch (formConfig?.formType) {
                                            case "task":
                                                return (
                                                    <div className="w-full max-w-5xl pr-2">
                                                        <FormContainer
                                                            formConfig={formConfig}
                                                            onSubmit={handleSave}
                                                            initialData={initialData}
                                                            action={action}
                                                            users={users}
                                                        />
                                                    </div>
                                                );



                                            default:
                                                return (
                                                    <div className="w-full max-w-5xl pr-2">
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

export default SmartDeskDialog;
