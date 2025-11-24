import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import autoTable from 'jspdf-autotable';
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useLazyGetMasterQuery } from "@/services/endpoints/masterApi";
import moment from "moment";
import { MONGO_MODELS } from "@/shared/constants";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { FileTextIcon } from "lucide-react";
import { renderBeneficiaryTemplate, renderBusinessTripTemplate, renderCandidateTemplate, renderConsentTemplate, renderEmployeeInfoTemplate, renderEmployeeJoiningTemplate, renderInterviewTemplate, renderItAccessTemplate, renderManpowerTemplate, renderNdaTemplate, renderOffboardingTemplate, renderOrientationTemplate } from "@/shared/functions";
import { toast } from "react-toastify";

type HrmsPdfGeneratorProps = {
    workflowData: any;
    manpowerData?: any;
    candidateData?: any[];
    interviewData?: any[];
    offerData?: any[];
    isOpen: boolean;
    closeDialog: () => void;
    height?: string;
    width?: string;
};

export default function HrmsPdfGenerator({
    workflowData,
    manpowerData,
    candidateData = [],
    interviewData = [],
    offerData = [],
    isOpen,
    closeDialog,
    height,
    width
}: HrmsPdfGeneratorProps) {

    const [getCandidates, { data: candidatesData, isLoading: candidatesLoading }] = useLazyGetMasterQuery();

    const [getInterviews, { data: interviewsData, isLoading: interviewsLoading }] = useLazyGetMasterQuery();

    const [candidateInfoId, setCandidateInfoId] = useState<string | null>(null);
    const [interviewCandidateId, setInterviewCandidateId] = useState<string | null>(null);

    const loading = candidatesLoading || interviewsLoading;

    useEffect(() => {
        if (isOpen) {
            console.log('Fetching candidates for recruitment:', manpowerData?._id);
            getCandidates({
                db: MONGO_MODELS.CANDIDATE_INFO,
                filter: { recruitment: manpowerData?._id },
                sort: { createdAt: 'desc' },
            });
            console.log('Fetching candidates for recruitment:', manpowerData?._id);
        }
    }, [isOpen, getCandidates]);

    useEffect(() => {
        if (isOpen) {
            console.log('Fetching candidates for recruitment:', manpowerData?._id);
            getInterviews({
                db: MONGO_MODELS.INTERVIEW,
                filter: { recruitmentId: manpowerData?._id },
                sort: { createdAt: 'desc' },
            });
            console.log('Fetching candidates for recruitment:', manpowerData?._id);
        }
    }, [isOpen, getInterviews]);



    const handleGeneratePDF = (type: string) => {
        const doc = new jsPDF("p", "mm", "a4");
        let title = "";
        let tableData: any[] = [];
        console.log('formType', type, candidatesData, candidateInfoId, manpowerData);
        switch (type) {
            case "manpower_requisition":
                title = "Manpower Requisition";

                renderManpowerTemplate(doc, manpowerData);
                break;

            case "candidate_information":
                title = "Candidate Information";
                const selectedCandidate = candidatesData?.data?.find(
                    (candidate: any) => candidate?._id == candidateInfoId
                );

                renderCandidateTemplate(doc, selectedCandidate);
                break;

            case "interview_assesment":
                title = "Interview Assessment";
                title = "Candidate Information";
                const selectedInterview = interviewsData?.data?.find(
                    (candidate: any) => candidate?._id == interviewCandidateId
                );

                renderInterviewTemplate(doc, selectedInterview);
                break;

            case "offer_acceptance":
                title = "Offer Acceptance";
                tableData = Object.entries(offerData).map(([key, value]) => [key, String(value)]);
                break;

            case "new_employee_joining":
                title = "New Employee Joining Form";
                if (manpowerData) {
                    renderEmployeeJoiningTemplate(doc, manpowerData);
                }
                else {
                    toast.error("Please fill the employee joining form first.")
                }

                break;

            case "assets_it_access":
                title = "Assets & IT - Access Form";
                if (manpowerData?.itAccess) {
                    renderItAccessTemplate(doc, manpowerData);
                }
                else {
                    toast.error("Please fill the assets & it access form first.")
                }

                break;

            case "employee_information":
                title = "Employee Information";
                if (manpowerData?.employeeInfo) {
                    renderEmployeeInfoTemplate(doc, manpowerData);
                }
                else {
                    toast.error("Please fill the employee information form first.")
                }

                break;

            case "beneficiary_declaration":
                title = "Beneficiary Declaration Form";
                if (manpowerData.employeeInfo?.beneficiaryInfo) {
                    renderBeneficiaryTemplate(doc, manpowerData);
                }
                else {
                    toast.error("Please fill the beneficiary declaration form first.")
                }

                break;

            case "accommodation_transport_consent":
                title = "Accommodation Transportation Form";
                if (manpowerData.employeeInfo?.consentInfo) {
                    renderConsentTemplate(doc, manpowerData);
                }
                else {
                    toast.error("Please fill the beneficiary declaration form first.")
                }

                break;

            case "non_disclosure_agreement":
                title = "Non Disclosure Form";

                if (manpowerData.employeeInfo?.ndaInfo) {
                    renderNdaTemplate(doc, manpowerData);
                }
                else {
                    toast.error("Please fill the non disclosure form first.")
                }

                break;

            case "employee_orientation":
                title = "Employee Orientation Form";
                if (manpowerData.employeeInfo?.orientationInfo) {
                    renderOrientationTemplate(doc, manpowerData);
                }
                else {
                    toast.error("Please fill the employee orientation form first.")
                }

                break;

            case "offboarding":
                title = "Business Trip Request Form";
                if (manpowerData.employee) {
                    renderOffboardingTemplate(doc, manpowerData);
                }
                else {
                    toast.error("Please fill the offboarding form first.")
                }

                break;

            case "business_trip_request":
                title = "Business Trip Request Form";
                if (manpowerData.travellerType) {
                    renderBusinessTripTemplate(doc, manpowerData);
                }
                else {
                    toast.error("Please fill the business trip form first.")
                }

                break;

            default:
                title = "Unknown Form";
                tableData = [];
        }

        // doc.setFontSize(16);
        // doc.text(title, 14, 15);
        // console.log('table data', tableData);
        // autoTable(doc, {
        //     startY: 20,
        //     head: [["Field", "Value"]],
        //     body: tableData, // must be an array of arrays
        // });

        // doc.output("dataurlnewwindow");
    };


    return (

        <Dialog open={isOpen} onOpenChange={closeDialog}>
            <DialogContent
                className={`bg-white max-w-full max-h-[90%] pointer-events-auto mx-2  ${height === 'auto' ? 'h-auto' : 'h-[75%]'} ${width === 'full' ? 'w-[95%] h-[90%]' : 'sm:max-w-md lg:max-w-3xl'}`}
                onInteractOutside={(e) => e.preventDefault()}>
                <DialogTitle>
                    <VisuallyHidden>Candidate Information</VisuallyHidden>
                </DialogTitle>
                {/* <div className="bg-white h-full max-h-[450px] overflow-y-auto p-2 rounded-md">

                </div>
 */}

                {loading &&
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
                    </div>
                }

                {!loading && <div className="bg-white h-full max-h-[450px] overflow-y-auto p-2 rounded-md ">

                    <h2 className="text-xl font-bold mb-10">PDF Form Generation ({workflowData?.workflowName})</h2>
                    {/* <p className="text-gray-600 mb-4"></p> */}

                    {workflowData?.steps
                        .filter((step: any) => step.formType !== "offer_acceptance") // exclude offer acceptance
                        .map((step: any) => {
                            const isCandidateStep = step.formType === "candidate_information";
                            const isInterviewStep = step.formType === "interview_assesment";

                            return (
                                <div key={step.id} className="mb-3">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-base">{step.stepName}</Label>

                                        {(isCandidateStep || isInterviewStep) && (
                                            <div className="mr-8">
                                                {/* <label className="block mb-1 font-semibold text-gray-700">Select Candidate:</label> */}
                                                <select
                                                    value={isCandidateStep ? candidateInfoId || "" : interviewCandidateId || ""}
                                                    onChange={(e) => {
                                                        if (isCandidateStep) setCandidateInfoId(e.target.value);
                                                        else setInterviewCandidateId(e.target.value);
                                                    }}
                                                    className="w-full border border-gray-300 rounded px-2 py-1"
                                                >
                                                    <option value="">-- Select Candidate --</option>
                                                    {isCandidateStep ? candidatesData?.data?.map((candidate: any) => (
                                                        <option key={candidate._id} value={candidate._id}>
                                                            {candidate.firstName} {candidate.lastName}
                                                        </option>
                                                    )) : interviewsData?.data?.map((candidate: any) => (
                                                        <option key={candidate._id} value={candidate._id}>
                                                            {candidate.candidateId?.firstName} {candidate.candidateId?.lastName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                        <Button
                                            onClick={() => {
                                                if (isCandidateStep) handleGeneratePDF(step.formType);
                                                else if (isInterviewStep) handleGeneratePDF(step.formType);
                                                else handleGeneratePDF(step.formType); // for manpower
                                            }}
                                            disabled={(isCandidateStep && !candidateInfoId) || (isInterviewStep && !interviewCandidateId)}
                                            className="px-3 bg-green-700 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 transition-300"
                                        >
                                            <FileTextIcon className="h-3 w-3" />
                                            Generate PDF
                                        </Button>
                                    </div>


                                </div>
                            );
                        })}


                    <div className="mt-12 text-right">
                        <Button
                            onClick={closeDialog}
                            className="px-3"
                        >
                            Close
                        </Button>
                    </div>

                </div>}

            </DialogContent>
        </Dialog>
        // <>
        //     <button
        //         onClick={() => setOpen(true)}
        //         className="px-4 py-2 bg-blue-600 text-white rounded"
        //     >
        //         Open Workflow
        //     </button>




        // </>
    );
}
