'use client'

import React, { useEffect, useState } from "react";
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

}) => {
    const { user }: any = useUserAuthorised();
    const [employeeType, setEmployeeType] = useState<any>(null);
    const [isEmployeeTypeSelected, setIsEmployeeTypeSelected] = useState(false);
    const [isStaff, setIsStaff] = useState(false);

    const [showCandidateDialog, setShowCandidateDialog] = useState(false);

    const [formConfig, setFormConfig] = useState(initialFormConfig);
    const [createMaster, { isLoading: isCreatingMaster }] = useCreateApplicationMutation();
    // const [getApplication, { data: applicationData, isLoading, error }] = useLazyGetApplicationQuery();
    const [getCandidates, { data: candidatesData, isLoading: candidatesLoading, error }] = useLazyGetMasterQuery();

    const [sendEmail, { isLoading: isSendEMail }]: any = useSendEmailMutation();

    const [formData, setFormData] = useState<Record<string, any>>({});

    const [isDialogOpen, setDialogOpen] = useState(false);

    const [actionCandidate, setActionCandidate] = useState('Add');

    const [initialDataCandidate, setInitialDataCandidate] = useState([]);

    console.log('Form Config:', initialFormConfig);

    const [isStepInitialized, setIsStepInitialized] = useState(false);

    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [savedStepIndex, setSavedStepIndex] = useState(initialData?.completedStep || 0);

    useEffect(() => {
        if (isOpen) {
            console.log('Fetching candidates for recruitment:', initialData?._id);
            getCandidates({
                db: MONGO_MODELS.CANDIDATE_INFO,
                filter: { recruitment: initialData?._id },
                sort: { createdAt: 'asc' },
            });
            console.log('Fetching candidates for recruitment:', initialData?._id);
        }
    }, [isOpen, getCandidates]);

    // When user changes step manually, update current step and remember it
    const handleStepChange = (newIndex: number) => {
        setCurrentStepIndex(newIndex);
        setSavedStepIndex(newIndex); // Save it
    };

    //  const { data: candidatesData = [], isLoading: candidatesLoading }: any = useGetMasterQuery({
    //         db: MONGO_MODELS.CANDIDATE_INFO,
    //         sort: { createdAt: 'asc' },
    //     });
    console.log('candidatesData', candidatesData, 'candidatesLoading', candidatesLoading);
    console.log('formConfig', formConfig, 'intialFormConfig', initialFormConfig);
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

    console.log('formConfig', formConfig, 'intialFormConfig', initialFormConfig);

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
                nationality: locationData,
                visaType: visaTypes,
            };

            const updatedConfig = deepCloneWithOptionsInjection(baseConfig, optionsMap);
            setFormConfig(updatedConfig);
        };

        loadStepConfig();
    }, [currentStepIndex, initialFormConfig, users, departments, designations, employeeTypes, recruitymentTypes, locationData, visaTypes, currentIndex]);

    const loading = candidatesLoading;
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


    // if (!formConfig) return null;
    console.log('formconfig', formConfig);

    console.log('employeeTypes', employeeType);

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

                // Create the new array
                // const updatedAttachments = [...currentAttachments, newAttachment];

                // // Call the mutation
                // await updateTicket({
                //     action: 'update',
                //     data: { _id: ticketId, attachments: updatedAttachments }
                // }).unwrap();


                // toast.success("File uploaded successfully");
                // setIsUploadDialogOpen(false);
                // setSelectedFile(null);
                // Optionally: refresh attachments list here
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

    async function uploadCandidateDoc(firstName, lastName, contactNumber, documentType, file) {
        const formData = new FormData();
        formData.append("fullName", firstName + "_" + lastName);
        formData.append("contactNumber", contactNumber);
        formData.append("documentType", documentType); // e.g., "resume", "passport"
        formData.append("file", file);
        console.log('uploadCandidateDoc', firstName, lastName, contactNumber, documentType, file);
        const res = await fetch("/api/uploadCandidatesDocs", {
            method: "POST",
            body: formData,
        });
        console.log('uploadCandidateDoc response', res);
        const data = await res.json();
        console.log('uploadCandidateDoc response', data);
        if (res.ok) {
            console.log("File URL:", data.url);
            // Save `data.url` in MongoDB for this candidate
        } else {
            console.error('error data', data.error);
        }
    }


    const handleSaveCandidate = async (data: any) => {
        console.log('Form Data Candidate:', data);
        const result = await handleUpload(data?.firstName, data?.lastName, data?.contactNumber, 'resume', data?.attachResume)
        console.log('Upload Result here:', initialData);
        const { checkedBy, ...restData } = data || {};
        const formattedData = {
            db: MONGO_MODELS.CANDIDATE_INFO,
            action: actionCandidate === 'Add' ? 'create' : 'update',
            filter: { "_id": data?._id },
            data: { ...restData, attachResume: result?.url, recruitment: initialData?._id, checkedBy: undefined },
        };
        console.log('Formatted Data:', formattedData);

        // const recruitmentData = await createRecruitment(data);
        // const formattedData = {
        //     db: MONGO_MODELS.RECRUITMENT,
        //     action: action === 'Add' ? 'create' : 'update',
        //     filter: { "_id": data?._id },
        //     data: { ...recruitmentData, employeeType: employeeType },
        // };
        // console.log('Formatted Data:', formattedData);


        const response: any = await createMaster(formattedData);
        console.log('Response:', response);
        if (response.data && response.data.status === SUCCESS) {
            toast.success(`Successfully ${actionCandidate}ed candidate information!`, {
                position: "bottom-right"
            });
            setShowCandidateDialog(false);
            return;
        }

        return response;

    };

    const handleSave = async (data: any) => {
        console.log('Form Data:', data);
        return;
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
            return;
        }

        return response;

    };

    const editUser = (rowData: any) => {
        setActionCandidate('Update');
        setInitialDataCandidate(rowData);
        setShowCandidateDialog(true);

        // Your add logic for user page
    };

    const handleAddCandidate = () => {
        setActionCandidate('Add');
        setShowCandidateDialog(true);
    };

    const handleShareLink = () => {
        const currentUrl = window.location.href;
        const subject = encodeURIComponent("Check this out!");

        // Place URL at the start to improve auto-link detection
        const body = encodeURIComponent(`${currentUrl}\n\nCopy and paste the above url to add the candidate information.`);

        window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
        // if (navigator.share) {
        //     // ✅ Use native share dialog on supported devices (mobile/modern browsers)
        //     navigator.share({
        //         title: 'candidate link',
        //         text: "Check out this link!",
        //         url: currentUrl,
        //     })
        //         .catch((err) => console.error("Share failed:", err));
        // } else {
        //     // ❌ Fallback for browsers without native share API
        //     alert(`Copy this link: ${currentUrl}`);
        // }
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

    const candidateConfig = {
        // searchFields: [
        //     { key: "name", label: 'name', type: "text" as const, placeholder: 'Search by customer' },

        // ],
        filterFields: [

            // { key: "department", label: 'departmentName', type: "select" as const, data: [], placeholder: 'Search by Department', name: 'departmentName' },
            // { key: "position", label: 'positionName', type: "select" as const, data: [], placeholder: 'Search by Position', name: 'positionName' },

        ],
        dataTable: {
            columns: candidateColumns,
            data: candidatesData?.data || [],
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

                                    {formConfig?.formType === "candidate_information" ? (
                                        <div className="w-full max-w-5xl pt-2">
                                            <MasterComponent
                                                config={candidateConfig} // your pre-defined candidate table/buttons config
                                                loadingState={loading}
                                                rowClassMap={undefined}
                                                summary={false}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full max-w-5xl p-4 pr-2">
                                            <FormContainer
                                                formConfig={formConfig}
                                                onSubmit={handleSave}
                                                initialData={initialData}
                                            />
                                        </div>
                                    )}

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
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            )}


        </>

    );
};

export default HrmsDialog;
