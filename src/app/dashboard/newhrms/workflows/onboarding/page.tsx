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
import { useRouter, useSearchParams } from 'next/navigation';
import HrmsDialog from '@/components/hrms/HrmsOnboardingComponent';
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
import DialogReviewOnboarding from '@/components/hrms/OnboardingReview';

const page = () => {
    const router = useRouter()
    const searchParams = useSearchParams();

    const id = searchParams.get('_id');

    const [workflowType, setWorkflowType]: any = useState('onboarding');
    const [workflowConfig, setWorkflowConfig]: any = useState(null);
    const [formConfig, setFormConfig] = useState<HRMSFormConfig | null>(null);
    const [importing, setImporting] = useState(false);

    const [searchTerm, setSearchTerm] = useState('')
    const { user, status, authenticated } = useUserAuthorised();

    const filter = id ? { _id: id } : {};

    const { data: usersData = [], isLoading: usersLoading }: any = useGetMasterQuery({
        db: MONGO_MODELS.OFFER_ACCEPTANCE,
        filter: { offerStatus: 'accepted' },
        sort: { name: 'asc' },
    });

    const { data: userData = [], isLoading: userLoading }: any = useGetMasterQuery({
        db: MONGO_MODELS.USER_MASTER,
        filter: { isActive: true },
        sort: { name: 'asc' },
    });

    const { data: locationData = [], isLoading: locationLoading } = useGetMasterQuery({
        db: MONGO_MODELS.LOCATION_MASTER,
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
    const { data: onboradingData = [], isLoading: onboradingLoading, refetch } = useGetMasterQuery({
        db: MONGO_MODELS.EMPLOYEE_JOINING,
        filter,
        sort: { createdAt: 'desc' },
    });

    const { data: itAssetsAccessData = [], isLoading: itAssetsAccessLoading } = useGetMasterQuery({
        db: MONGO_MODELS.IT_ASSETS_ACCESS,
        sort: { createdAt: 'desc' },
    });

    const { data: employeeInfoData = [], isLoading: employeeInfoLoading } = useGetMasterQuery({
        db: MONGO_MODELS.EMPLOYEE_INFO,
        sort: { createdAt: 'desc' },
    });

    const { data: visaTypeData = [], isLoading: visaTypeLoading } = useGetMasterQuery({
        db: MONGO_MODELS.VISA_TYPE_MASTER,
        sort: { name: 'asc' },
    });

     const { data: rolesData = [], isLoading: userRoleLoading } = useGetMasterQuery({
        db: MONGO_MODELS.ROLE_MASTER,
        sort: { name: 'asc' },
    });

    const { data: organisationData = [], isLoading: organisationLoading } = useGetMasterQuery({
        db: MONGO_MODELS.ORGANISATION_MASTER,
        sort: { name: 'asc' },
    });

    const departments = departmentsData?.data || [];
    const users = usersData?.data || [];

    const userOptions = useMemo(() =>
        users.map((user: any) => ({
            ...user, // keep all original fields
            name: `${user?.interviewAssesmentId?.candidateId?.firstName} ${user?.interviewAssesmentId?.candidateId?.lastName}`,

        })),
        [users]
    );

    const userList = userData?.data || [];

    const userOption = useMemo(() =>
        userList.map((user: any) => ({
            ...user, // keep all original fields
            name: user?.displayName ? user.displayName : `${user.firstName}`,

        })),
        [userList]
    );


    const depNames = departmentsData?.data
        ?.filter((dep: undefined) => dep !== undefined)  // Remove undefined entries
        ?.map((dep: { _id: any; name: any }) => ({ _id: dep.name, name: dep.name }));

    const positionNames = designationData?.data
        ?.filter((dep: undefined) => dep !== undefined)  // Remove undefined entries
        ?.map((dep: { _id: any; name: any }) => ({ _id: dep.name, name: dep.name }));


    const recruitymentTypes = [{ _id: 'internal', name: 'Internal' }, { _id: 'external', name: 'External' }, { _id: 'foreign', name: 'Foreign' }];

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

    const transformedData = onboradingData?.data?.map(item => ({
        // keep existing fields
        ...item,

        // add extracted fields
        employee: item.offerAcceptance?._id || "",
        fullName: `${item.offerAcceptance?.interviewAssesmentId?.candidateId?.firstName || ""} ${item.offerAcceptance?.interviewAssesmentId?.candidateId?.lastName || ""}`.trim(),
        firstName: item.offerAcceptance?.interviewAssesmentId?.candidateId?.firstName || "",
        lastName: item.offerAcceptance?.interviewAssesmentId?.candidateId?.lastName || "",
        designation: item.offerAcceptance?.interviewAssesmentId?.candidateId?.recruitment?.requiredPosition?._id || "",
        department: item.offerAcceptance?.interviewAssesmentId?.candidateId?.recruitment?.department?._id || "",
        designationName: item.offerAcceptance?.interviewAssesmentId?.candidateId?.recruitment?.requiredPosition?.name || "",
        departmentName: item.offerAcceptance?.interviewAssesmentId?.candidateId?.recruitment?.department?.name || "",
        reportingTo: item?.reportingTo?._id,
        reportingToName: item?.reportingTo?.displayName,

    }));

    console.log('designations', onboradingData?.data);

    const loading = visaTypeLoading || organisationLoading || userRoleLoading || employeeInfoLoading || itAssetsAccessLoading || customerTypeLoading || departmentLoading || userLoading || usersLoading || designationLoading || countryLoading || employeeTypeLoading || locationLoading || onboradingLoading;

    interface RowData {
        id: string;
        name: string;
        email: string;
        role: string;
    }

    const fields: Array<{ label: string; name: string; type: string; data?: any; readOnly?: boolean; format?: string; required?: boolean; placeholder?: string }> = [


        { label: 'Checker', name: "checker", type: "select", data: usersData?.data, placeholder: 'Select Checker' },

    ]

    const [isDialogOpen, setDialogOpen] = useState(false);
    const [isDialogOpenChecker, setDialogOpenChecker] = useState(false);
    const [isDialogOpenPdfGenerator, setDialogOpenPdfGenerator] = useState(false);
    const [isDialogOpenInterviewer, setDialogOpenInterviewer] = useState(false);
    const [isDialogOpenReview, setDialogOpenReview] = useState(false);
    const [selectedMaster, setSelectedMaster] = useState(""); // This will track the master type (department, role, etc.)
    const [initialData, setInitialData] = useState({});
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

    const closeDialogReview = async () => {
        setDialogOpenReview(false);
        setSelectedMaster("");
        setInitialData({});

    };

    const closeDialogPdfGenerator = async () => {
        setDialogOpenPdfGenerator(false);
        setSelectedMaster("");
        setInitialData({});

    };


    async function urlToFile(url, filename, mimeType) {
        const res = await fetch(url);
        const blob = await res.blob();
        return new File([blob], filename, { type: mimeType });
    }

    // Save function to send data to an API or database
    const saveData = async ({ formData, action }: { formData: any, action: string }) => {

        const formattedData = {
            db: MONGO_MODELS.RECRUITMENT,
            action: 'update',
            filter: { "_id": formData._id },
            data: formData,
        };

        console.log('Formatted Data:', formattedData);

        const response = await createMaster(formattedData);

        setDialogOpenInterviewer(false);
        setSelectedMaster("");
        setInitialData({});
        if (selectedMaster === 'Interviewer') {
            toast.success('Interviewer assigned successfully.')
        }
        return response;

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


    const editUser = async (rowData: RowData) => {
        // console.log('employeeInfo', employeeInfoData, itAssetsAccessData, rowData);
        setAction('Update');
        const employeeInfo =
            employeeInfoData?.data?.find(
                (ei: any) =>
                    ei?.itAssetsAccessId?._id ===
                    itAssetsAccessData?.data?.find(
                        (it: any) => it?.employeeJoiningId?._id === rowData?._id
                    )?._id
            ) || "";



        // 🔹 3. Handle Visa Copy (from employeeInfo.visaInfo.visaUrl)
        let attachVisaFile: any = "";
        let attachEmiratesIdFile: any = "";
        let attachLaborCardFile: any = "";
        let attachIloeFile: any = "";
        let attachNdaFile: any = "";
        let attachConsentFile: any = "";
        let attachBeneficiaryFile: any = "";
        let educationCertificatesFile: any = "";
        let passportFile: any = "";
        let visitVisaFile: any = "";
        let visaCancellationFile: any = "";

        const visaUrl = employeeInfo?.visaInfo?.visaUrl;
        const emiratesIdUrl = employeeInfo?.visaInfo?.emiratesIdUrl;
        const laborCardUrl = employeeInfo?.visaInfo?.laborCardUrl;
        const iloeUrl = employeeInfo?.visaInfo?.iloeUrl;
        const ndaFormUrl = employeeInfo?.ndaInfo?.ndaFormUrl;
        const declarationFormUrl = employeeInfo?.consentInfo?.declaration?.declarationFormUrl;
        const declarationFormBeneficiaryUrl = employeeInfo?.beneficiaryInfo?.declaration?.declarationFormUrl;
        const eductionCertificatesUrl = employeeInfo?.uploadDocuments?.educationCertificatesUrl;
        const passportUrl = employeeInfo?.passport?.passportUrl;
        const visitVisaUrl = employeeInfo?.uploadDocuments?.visitVisaUrl;
        const cancellationVisaUrl = employeeInfo?.uploadDocuments?.cancellationVisaUrl;

        if (visaUrl) {
            const filename = visaUrl.split("/").pop() || "visa";
            const ext = filename.split(".").pop()?.toLowerCase() || "";
            const mimeType = ext === "pdf" ? "application/pdf" : `application/${ext}`;
            attachVisaFile = await urlToFile(visaUrl, filename, mimeType);
        }
        if (emiratesIdUrl) {
            const filename = emiratesIdUrl.split("/").pop() || "visa";
            const ext = filename.split(".").pop()?.toLowerCase() || "";
            const mimeType = ext === "pdf" ? "application/pdf" : `application/${ext}`;
            attachEmiratesIdFile = await urlToFile(emiratesIdUrl, filename, mimeType);
        }
        if (laborCardUrl) {
            const filename = laborCardUrl.split("/").pop() || "visa";
            const ext = filename.split(".").pop()?.toLowerCase() || "";
            const mimeType = ext === "pdf" ? "application/pdf" : `application/${ext}`;
            attachLaborCardFile = await urlToFile(laborCardUrl, filename, mimeType);
        }
        if (iloeUrl) {
            const filename = iloeUrl.split("/").pop() || "visa";
            const ext = filename.split(".").pop()?.toLowerCase() || "";
            const mimeType = ext === "pdf" ? "application/pdf" : `application/${ext}`;
            attachIloeFile = await urlToFile(iloeUrl, filename, mimeType);
        }

        if (ndaFormUrl) {
            const filename = ndaFormUrl.split("/").pop() || "visa";
            const ext = filename.split(".").pop()?.toLowerCase() || "";
            const mimeType = ext === "pdf" ? "application/pdf" : `application/${ext}`;
            attachNdaFile = await urlToFile(ndaFormUrl, filename, mimeType);
        }

        if (declarationFormUrl) {
            const filename = declarationFormUrl.split("/").pop() || "visa";
            const ext = filename.split(".").pop()?.toLowerCase() || "";
            const mimeType = ext === "pdf" ? "application/pdf" : `application/${ext}`;
            attachConsentFile = await urlToFile(declarationFormUrl, filename, mimeType);
        }

        if (declarationFormBeneficiaryUrl) {
            const filename = declarationFormBeneficiaryUrl.split("/").pop() || "visa";
            const ext = filename.split(".").pop()?.toLowerCase() || "";
            const mimeType = ext === "pdf" ? "application/pdf" : `application/${ext}`;
            attachBeneficiaryFile = await urlToFile(declarationFormBeneficiaryUrl, filename, mimeType);
        }

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


        // 🔹 4. Set initial data
        setInitialData({
            ...rowData,
            nationality:
                rowData?.offerAcceptance?.interviewAssesmentId?.candidateId?.nationality
                    ?._id,
            workLocation:
                rowData?.offerAcceptance?.interviewAssesmentId?.candidateId?.recruitment
                    ?.workLocation?._id,
            category:
                rowData?.offerAcceptance?.interviewAssesmentId?.candidateId?.recruitment
                    ?.employeeType?._id,
            dateOfBirth:
                rowData?.offerAcceptance?.interviewAssesmentId?.candidateId?.dateOfBirth,
            gender:
                rowData?.offerAcceptance?.interviewAssesmentId?.candidateId?.gender,
            maritalStatus:
                rowData?.offerAcceptance?.interviewAssesmentId?.candidateId?.maritalStatus,
            itAccess:
                itAssetsAccessData?.data?.find(
                    (it: any) => it.employeeJoiningId?._id === rowData?._id
                ) || "",
            employeeInfo: {
                ...employeeInfo,
                visaInfo: {
                    ...employeeInfo?.visaInfo,
                    visaUrl: visaUrl,       // keep original url
                    attachVisa: attachVisaFile, // 👈 add file object for form
                    attachEmiratesId: attachEmiratesIdFile,
                    attachLaborCard: attachLaborCardFile,
                    attachIloe: attachIloeFile,
                },
                ndaInfo: {
                    ...employeeInfo?.ndaInfo,
                    attachNda: attachNdaFile,
                },
                consentInfo: {
                    ...employeeInfo?.consentInfo,
                    declaration: { ...employeeInfo?.consentInfo?.declaration, attachDeclaration: attachConsentFile },
                },
                beneficiaryInfo: {
                    ...employeeInfo?.beneficiaryInfo,
                    declaration: { ...employeeInfo?.beneficiaryInfo?.declaration, attachBeneficiaryDeclaration: attachBeneficiaryFile },
                },
                uploadDocuments: {
                    ...employeeInfo?.uploadDocuments,
                    attachEducationCertificates: educationCertificatesFile,
                    attachVisitVisa: visitVisaFile,
                    attachVisaCancellation: visaCancellationFile
                },
                passport: {
                    ...employeeInfo?.passport,
                    attachPassport: passportFile
                }
            },

        });
        openDialog("onboarding");
        // Your add logic for user page
    };

    const editChecker = (rowData: RowData) => {
        setAction('Add');
        setInitialData(rowData);
        setSelectedMaster('Review Details');
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

    const editReview = (rowData: RowData) => {

        setInitialData({
            ...rowData, nationality: rowData?.offerAcceptance?.interviewAssesmentId?.candidateId?.nationality?._id,
            nationalityName: rowData?.offerAcceptance?.interviewAssesmentId?.candidateId?.nationality?.name,
            workLocation: rowData?.offerAcceptance?.interviewAssesmentId?.candidateId?.recruitment?.workLocation?._id,
            workLocationName: rowData?.offerAcceptance?.interviewAssesmentId?.candidateId?.recruitment?.workLocation?.name,
            category: rowData?.offerAcceptance?.interviewAssesmentId?.candidateId?.recruitment?.employeeType?._id,
            categoryName: rowData?.offerAcceptance?.interviewAssesmentId?.candidateId?.recruitment?.employeeType?.name,
            dateOfBirth: rowData?.offerAcceptance?.interviewAssesmentId?.candidateId?.dateOfBirth,
            gender: rowData?.offerAcceptance?.interviewAssesmentId?.candidateId?.gender,
            maritalStatus: rowData?.offerAcceptance?.interviewAssesmentId?.candidateId?.maritalStatus, itAccess: itAssetsAccessData?.data?.find((it: any) => it.employeeJoiningId?._id === rowData?._id) || "",
            employeeInfo: employeeInfoData?.data?.find((ei: any) => ei.itAssetsAccessId?._id === (itAssetsAccessData?.data?.find((it: any) => it.employeeJoiningId?._id === rowData?._id)?._id)) || ""
        });
        console.log('Recruitment Data:', initialData);
        setDialogOpenReview(true);
        // Your add logic for user page
    };

    const openPdfGenerator = (rowData: RowData) => {
        setAction('Add');
        setInitialData({
            ...rowData, nationality: rowData?.offerAcceptance?.interviewAssesmentId?.candidateId?.nationality?._id,
            nationalityName: rowData?.offerAcceptance?.interviewAssesmentId?.candidateId?.nationality?.name,
            workLocation: rowData?.offerAcceptance?.interviewAssesmentId?.candidateId?.recruitment?.workLocation?._id,
            workLocationName: rowData?.offerAcceptance?.interviewAssesmentId?.candidateId?.recruitment?.workLocation?.name,
            category: rowData?.offerAcceptance?.interviewAssesmentId?.candidateId?.recruitment?.employeeType?._id,
            categoryName: rowData?.offerAcceptance?.interviewAssesmentId?.candidateId?.recruitment?.employeeType?.name,
            dateOfBirth: rowData?.offerAcceptance?.interviewAssesmentId?.candidateId?.dateOfBirth,
            gender: rowData?.offerAcceptance?.interviewAssesmentId?.candidateId?.gender,
            maritalStatus: rowData?.offerAcceptance?.interviewAssesmentId?.candidateId?.maritalStatus, itAccess: itAssetsAccessData?.data?.find((it: any) => it.employeeJoiningId?._id === rowData?._id) || "",
            employeeInfo: employeeInfoData?.data?.find((ei: any) => ei.itAssetsAccessId?._id === (itAssetsAccessData?.data?.find((it: any) => it.employeeJoiningId?._id === rowData?._id)?._id)) || ""
        });

        setDialogOpenPdfGenerator(true)
        // Your add logic for user page
    };

    console.log('interv', interviewers)
    const handleAdd = () => {
        setInitialData({});
        setCurrentIndex(0);
        setAction('Add');
        openDialog("onboarding");


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
            accessorKey: "fullName",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2 w-[100px]"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Full Name</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => <div className='text-blue-500' onClick={() => editUser(row.original)}>{row.getValue("fullName")}</div>,
        },
        {
            accessorKey: "designationName",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2 w-[100px]"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Designation</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => <div >{row.getValue("designationName")}</div>,
        },
        {
            accessorKey: "departmentName",
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
            cell: ({ row }: { row: any }) => <div >{row.getValue("departmentName")}</div>,
        },
        {
            accessorKey: "reportingToName",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Reporting To</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => <div >{row.getValue("reportingToName")}</div>,
        },

        {
            accessorKey: "dateOfReporting",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Reporting Date</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => <div >{moment(row.original.dateOfReporting).format("DD-MMM-YYYY")}</div>,
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
            cell: ({ row }: { row: any }) => <div >{row.getValue("status")?.toProperCase()}</div>,
        },

        {
            accessorKey: "review",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Review</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: { row: any }) => {
                const { completedStep } = row.original;

                if (completedStep < 6) {
                    return null; // hide cell content
                }

                return (
                    <div
                        className="text-white cursor-pointer bg-green-600 px-3 py-1 shadow-md rounded-md w-max hover:bg-green-500 duration-200"
                        onClick={() => editReview(row.original)}
                    >
                        Review & Sign
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
        searchFields: [
            // { key: "name", label: 'name', type: "text" as const, placeholder: 'Search by customer' },

        ],
        filterFields: [

            // { key: "department", label: 'departmentName', type: "select" as const, data: depNames, placeholder: 'Search by Department', name: 'departmentName' },
            // { key: "position", label: 'positionName', type: "select" as const, data: positionNames, placeholder: 'Search by Position', name: 'positionName' },

        ],
        dataTable: {
            columns: recruitmentColumns,
            data: transformedData,
        },
        buttons: [

            { label: 'Onboarding', action: handleAdd, icon: Plus, className: 'bg-sky-600 hover:bg-sky-700 duration-300' },
        ]
    };

    const visaTypes = [
        { _id: 'visit', name: 'Visit Visa' },
        { _id: 'employment', name: 'Employment Visa' },
        { _id: 'residence', name: 'Residence Visa' },
        { _id: 'others', name: 'Others' }]



    console.log('Workflow Config:', workflowConfig, formConfig);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }


    console.log('workflow config', workflowConfig, visaTypeData?.data)

    return (
        <>

            <MasterComponent config={customerConfig} loadingState={loading} rowClassMap={undefined} summary={false} />
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
                visaTypes={visaTypeData?.data || []}
                rolesData={rolesData?.data || []}
                organisationData={organisationData?.data || []}
                onSave={saveData}
                currentIndex={currentIndex}
                countryData={countryData?.data || []}
                userData={userOption}
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
            />

            <DialogReviewOnboarding
                isOpen={isDialogOpenReview}
                closeDialog={closeDialogReview}
                selectedMaster={selectedMaster}
                onSave={saveData}
                initialData={initialData}
                action={action}
                height='auto'
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