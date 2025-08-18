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
import { renderManpowerTemplate } from "@/shared/functions";

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
    console.log('manpowerData:', interviewsData);
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

    function renderCandidateTemplate(doc, manpowerData) {
console.log('candidatedata', manpowerData)
        const startX = 5; // instead of 10
        const startY = 5;
        const totalWidth = 196;
        const pageWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const outerMargin = startX; // outer border margin
        let currentY = startY;

        // 1️⃣ Outer border
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.1); // very thin border
        doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, pageHeight - 2 * startY);

        // 2️⃣ Main Title Section (merged with outer border)
        const titleHeight = 20;
        // doc.setFillColor(100, 149, 237); // blue
        doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, titleHeight); // Fill + Draw
        doc.setFont("times", "bolditalic");
        doc.setFontSize(16);
        // doc.setTextColor(255, 255, 255);
        doc.text(
            "CANDIDATE INFORMATION FORM",
            pageWidth / 2,
            currentY + titleHeight / 2,
            { align: "center", baseline: "middle" }
        );
        doc.setTextColor(0, 0, 0);
        currentY += titleHeight;

        const height = 8;
        doc.setFillColor(224, 240, 255);
        doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, height, "FD");
        doc.setFont("times", "italic");
        doc.setFontSize(13);
        doc.text(
            "Personal Details",
            pageWidth / 2,
            currentY + height / 2,
            { align: "center", baseline: "middle" }
        );
        // personal detail

        const personalDetailHeight = 62;
        doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, personalDetailHeight);
        doc.setFont("times", "normal");
        doc.setFontSize(13);
        let gap = 15;
        const space = 60
        const space2 = 113
        const space3 = 160
        // Vacancy Reason

        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Position Applied:                   ", outerMargin + 2, currentY + gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            manpowerData.recruitment?.requiredPosition?.name,
            outerMargin + space, // adjust x position to align with label
            currentY + gap
        );
        gap = gap + 7
        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Full Name (As Per Passport):                   ", outerMargin + 2, currentY + gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            `${manpowerData.firstName?.toProperCase()} ${manpowerData.lastName?.toProperCase()}`,
            outerMargin + space, // adjust x position to align with label
            currentY + gap
        );
        gap = gap + 7

         // Position Type
        doc.setTextColor(0, 0, 0);
        doc.text("Email Address:                       ", outerMargin + 2, currentY + gap);
        doc.setTextColor(70, 70, 70);
        doc.text(
            manpowerData.email,
            outerMargin + space,
            currentY + gap
        );
        // Position Type
        doc.setTextColor(0, 0, 0);
        doc.text("Contact Number:                       ", outerMargin + space2, currentY + gap);
        doc.setTextColor(70, 70, 70);
        doc.text(
            manpowerData.contactNumber,
            outerMargin + space3,
            currentY + gap
        );



        gap = gap + 7
        // Position Type
        doc.setTextColor(0, 0, 0);
        doc.text("Gender:                       ", outerMargin + 2, currentY + gap);
        doc.setTextColor(70, 70, 70);
        doc.text(
            manpowerData.gender?.toProperCase(),
            outerMargin + space,
            currentY + gap
        );

        // Position Type
        doc.setTextColor(0, 0, 0);
        doc.text("Nationality:                       ", outerMargin + space2, currentY + gap);
        doc.setTextColor(70, 70, 70);
        doc.text(
            manpowerData.nationality?.name?.toProperCase(),
            outerMargin + space3,
            currentY + gap
        );

        gap = gap + 7
        // Position Type
        doc.setTextColor(0, 0, 0);
        doc.text("Current Location:                       ", outerMargin + 2, currentY + gap);
        doc.setTextColor(70, 70, 70);
        doc.text(
            manpowerData.currentLocation?.toProperCase(),
            outerMargin + space,
            currentY + gap
        );

        // Position Type
        doc.setTextColor(0, 0, 0);
        doc.text("Date Of Birth:                       ", outerMargin + space2, currentY + gap);
        doc.setTextColor(70, 70, 70);
        doc.text(
            moment(manpowerData.dateOfBirth).format("DD-MMM-YYYY"),
            outerMargin + space3,
            currentY + gap
        );

        gap = gap + 7
        // Position Type
        doc.setTextColor(0, 0, 0);
        doc.text("Marital Status:                       ", outerMargin + 2, currentY + gap);
        doc.setTextColor(70, 70, 70);
        doc.text(
            manpowerData.maritalStatus?.toProperCase(),
            outerMargin + space,
            currentY + gap
        );

        // Position Type
        doc.setTextColor(0, 0, 0);
        doc.text("Driving License:                       ", outerMargin + space2, currentY + gap);
        doc.setTextColor(70, 70, 70);
        doc.text(
            manpowerData.drivingLicense?.toProperCase(),
            outerMargin + space3,
            currentY + gap
        );

        gap = gap + 7
        // Position Type
        doc.setTextColor(0, 0, 0);
        doc.text("Currently Working:                       ", outerMargin + 2, currentY + gap);
        doc.setTextColor(70, 70, 70);
        doc.text(
            manpowerData.currentlyWorking?.toProperCase(),
            outerMargin + space,
            currentY + gap
        );
        // 4️⃣ Vacancy & Position Type Section


        const vacancyheaderHeight = 8;   // shorter header row

        currentY += personalDetailHeight;
        doc.setTextColor(0, 0, 0); // black for label
        // Light blue header
        doc.setFillColor(224, 240, 255);
        doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, vacancyheaderHeight, "FD");
        doc.setFont("times", "italic");
        doc.setFontSize(13);
        doc.text(
            "Professional Details",
            pageWidth / 2,
            currentY + vacancyheaderHeight / 2,
            { align: "center", baseline: "middle" }
        );

        currentY += vacancyheaderHeight;

        const vacancyHeight = 33;
        // doc.setFillColor(224, 224, 224);
        doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, vacancyHeight);
        doc.setFont("times", "normal");
        doc.setFontSize(13);

        gap = 7;
        // Vacancy Reason
        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Total Years Of Experience:                   ", outerMargin + 2, currentY + gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            manpowerData.vacancyReason === "new_position" ? "New Position" : "Replacement",
            outerMargin + space, // adjust x position to align with label
            currentY + gap
        );


        // Position Type
        doc.setTextColor(0, 0, 0);
        doc.text("Relevant Experience:                       ", outerMargin + space2, currentY + gap);
        doc.setTextColor(70, 70, 70);
        doc.text(
            manpowerData.positionType === "budgeted" ? "Budgeted" : "Non-Budgeted",
            outerMargin + space3,
            currentY + gap
        );

        gap = gap + 7
        // No Of Vacant Positions
        doc.setTextColor(0, 0, 0);
        doc.text("Current Company:       ", outerMargin + 2, currentY + gap);
        doc.setTextColor(70, 70, 70);
        doc.text(`${manpowerData.noOfVacantPositions}`, outerMargin + space, currentY + gap);

        // Recruitment Type
        doc.setTextColor(0, 0, 0);
        doc.text("Current Work Location:               ", outerMargin + space2, currentY + gap);
        doc.setTextColor(70, 70, 70);
        doc.text(`${manpowerData.recruitmentType?.toProperCase()}`, outerMargin + space3, currentY + gap);

        gap = gap + 7
        // Recruitment Type
        doc.setTextColor(0, 0, 0);
        doc.text("Designation:               ", outerMargin + 2, currentY + gap);
        doc.setTextColor(70, 70, 70);
        doc.text(`${manpowerData.recruitmentType?.toProperCase()}`, outerMargin + space, currentY + gap);

        // Recruitment Type
        doc.setTextColor(0, 0, 0);
        doc.text("Notice Period:               ", outerMargin + space2, currentY + gap);
        doc.setTextColor(70, 70, 70);
        doc.text(`${manpowerData.recruitmentType?.toProperCase()}`, outerMargin + space3, currentY + gap);

        gap = gap + 7
        // Recruitment Type
        doc.setTextColor(0, 0, 0);
        doc.text("Current Salary:               ", outerMargin + 2, currentY + gap);
        doc.setTextColor(70, 70, 70);
        doc.text(`${manpowerData.recruitmentType?.toProperCase()}`, outerMargin + space, currentY + gap);

        // Recruitment Type
        doc.setTextColor(0, 0, 0);
        doc.text("Expected Salary:               ", outerMargin + space2, currentY + gap);
        doc.setTextColor(70, 70, 70);
        doc.text(`${manpowerData.recruitmentType?.toProperCase()}`, outerMargin + space3, currentY + gap);

        // Previous Employee Details
        // Previous Employee Details

        currentY += vacancyHeight;

        const visaHeaderHeight = 8;   // shorter header row
        doc.setTextColor(0, 0, 0); // black for label
        // Light blue header
        doc.setFillColor(224, 240, 255);
        doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, visaHeaderHeight, "FD");
        doc.setFont("times", "italic");
        doc.setFontSize(13);
        doc.text(
            "Visa Details",
            pageWidth / 2,
            currentY + visaHeaderHeight / 2,
            { align: "center", baseline: "middle" }
        );

        currentY += visaHeaderHeight;

        const visaHeight = 11;
        // doc.setFillColor(224, 224, 224);
        doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, visaHeight);

        doc.setFont("times", "normal");
        doc.setFontSize(13);

        gap = 7;
        // Vacancy Reason
        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Visa Status:                   ", outerMargin + 2, currentY + gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            manpowerData.vacancyReason === "new_position" ? "New Position" : "Replacement",
            outerMargin + space, // adjust x position to align with label
            currentY + gap
        );


        // Vacancy Reason
        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Visa Expiry Date:                   ", outerMargin + space2, currentY + gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            manpowerData.vacancyReason === "new_position" ? "New Position" : "Replacement",
            outerMargin + space3, // adjust x position to align with label
            currentY + gap
        );

        currentY += visaHeight;

        const educationalHeaderHeight = 8;   // shorter header row
        doc.setTextColor(0, 0, 0); // black for label
        // Light blue header
        doc.setFillColor(224, 240, 255);
        doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, educationalHeaderHeight, "FD");
        doc.setFont("times", "italic");
        doc.setFontSize(13);
        doc.text(
            "Highest Eductaional Qualification Details",
            pageWidth / 2,
            currentY + educationalHeaderHeight / 2,
            { align: "center", baseline: "middle" }
        );

        currentY += educationalHeaderHeight;

        const educational = 18;
        // doc.setFillColor(224, 224, 224);
        doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, educational);

        doc.setFont("times", "normal");
        doc.setFontSize(13);

        gap = 7;
        // Vacancy Reason
        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Degree:                   ", outerMargin + 2, currentY + gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            manpowerData.vacancyReason === "new_position" ? "New Position" : "Replacement",
            outerMargin + space, // adjust x position to align with label
            currentY + gap
        );

        // Vacancy Reason
        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Degree Attested:                   ", outerMargin + space2, currentY + gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            manpowerData.vacancyReason === "new_position" ? "New Position" : "Replacement",
            outerMargin + space3, // adjust x position to align with label
            currentY + gap
        );

        gap = 7 + gap;
        // Vacancy Reason
        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Languages Known:                   ", outerMargin + 2, currentY + gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            manpowerData.vacancyReason === "new_position" ? "New Position" : "Replacement",
            outerMargin + space, // adjust x position to align with label
            currentY + gap
        );

        // Vacancy Reason
        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Certifications (If Any):                   ", outerMargin + space2, currentY + gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            manpowerData.vacancyReason === "new_position" ? "New Position" : "Replacement",
            outerMargin + space3, // adjust x position to align with label
            currentY + gap
        );
        currentY += educational;

        // 5️⃣ Candidate Type Section

        const refferalHeight = 8;   // shorter header row
        doc.setTextColor(0, 0, 0); // black for label
        // Light blue header
        doc.setFillColor(224, 240, 255);
        doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, refferalHeight, "FD");
        doc.setFont("times", "italic");
        doc.setFontSize(13);
        doc.text(
            "Referral Information",
            pageWidth / 2,
            currentY + refferalHeight / 2,
            { align: "center", baseline: "middle" }
        );

        currentY += refferalHeight;

        const refferal = 32;
        // doc.setFillColor(224, 224, 224);
        doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, refferal);

        doc.setFont("times", "normal");
        doc.setFontSize(13);

        gap = 7;
        // Vacancy Reason
        doc.setTextColor(0, 0, 0); // black for label
        doc.text("How You Knew About This Position:                   ", outerMargin + 2, currentY + gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            manpowerData.vacancyReason === "new_position" ? "New Position" : "Replacement",
            outerMargin + space + 40, // adjust x position to align with label
            currentY + gap
        );

        gap = 7 + gap;
        // Vacancy Reason
        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Do You Have Friends/Relatives Working In ABS:                   ", outerMargin + 2, currentY + gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            manpowerData.vacancyReason === "new_position" ? "New Position" : "Replacement",
            outerMargin + space + 40, // adjust x position to align with label
            currentY + gap
        );

        gap = 7 + gap;
        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Name:                   ", outerMargin + 2, currentY + gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            manpowerData.vacancyReason === "new_position" ? "New Position" : "Replacement",
            outerMargin + space, // adjust x position to align with label
            currentY + gap
        );

        gap = 7 + gap;
        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Relation:                   ", outerMargin + 2, currentY + gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            manpowerData.vacancyReason === "new_position" ? "New Position" : "Replacement",
            outerMargin + space, // adjust x position to align with label
            currentY + gap
        );

        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Contact No:                   ", outerMargin + space2, currentY + gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            manpowerData.vacancyReason === "new_position" ? "New Position" : "Replacement",
            outerMargin + space3, // adjust x position to align with label
            currentY + gap
        );

        currentY += refferal;

        const declarationHeader = 8;   // shorter header row
        doc.setTextColor(0, 0, 0); // black for label
        // Light blue header
        doc.setFillColor(224, 240, 255);
        doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, declarationHeader, "FD");
        doc.setFont("times", "italic");
        doc.setFontSize(13);
        doc.text(
            "Declaration",
            pageWidth / 2,
            currentY + refferalHeight / 2,
            { align: "center", baseline: "middle" }
        );

        currentY += declarationHeader;

        const declaration = 52;
        // doc.setFillColor(224, 224, 224);
        // doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, declaration);

        doc.setFont("times", "normal");
        doc.setFontSize(11);

        gap = 7;
        // Vacancy Reason
        const availableWidth = pageWidth - 2 * outerMargin - 4; // minus small padding

        // Your long text
        const declarationText =
            "I declare that the above statement given by me is true and correct to the best of my knowledge and belief. I understand that all information provided about me to you will be held by you and used for the purpose of evaluating my qualifications, experience and suitability for employment with you. I also understand that my employment contract will be terminated if, after investigation, the company discovers that any information which I have provided, or which has been provided by me, is false or misleading.";

        // Wrap text to fit width
        const wrappedText = doc.splitTextToSize(declarationText, availableWidth);

        // Print wrapped text
        doc.setTextColor(0, 0, 0); // black
        doc.text(wrappedText, outerMargin + 2, currentY + gap);
        doc.setFontSize(13);
        gap = 7 + gap + 25;
        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Candidate Signature And Date:                   ", outerMargin + 2, currentY + gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            manpowerData.vacancyReason === "new_position" ? "New Position" : "Replacement",
            outerMargin + space + 10, // adjust x position to align with label
            currentY + gap
        );

        gap = 7 + gap;
        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Remarks (If Any):                   ", outerMargin + 2, currentY + gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            manpowerData.vacancyReason === "new_position" ? "New Position" : "Replacement",
            outerMargin + space + 10, // adjust x position to align with label
            currentY + gap
        );

        gap = 7 + gap;
        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Checked By:                   ", outerMargin + 2, currentY + gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            manpowerData.vacancyReason === "new_position" ? "New Position" : "Replacement",
            outerMargin + space + 10, // adjust x position to align with label
            currentY + gap
        );

        currentY += declaration;
        // 8️⃣ Form Version at bottom
        const footerText = "ABS/HR/C/F02 D  (25/04/2022) V. 1";
        const footerHeight = 6;
        const footerY = pageHeight - startY - footerHeight;

        // Draw footer box
        doc.setFillColor(224, 240, 255);
        doc.rect(outerMargin, footerY, pageWidth - 2 * outerMargin, footerHeight, "FD");

        // Footer text (left aligned, vertically centered)
        doc.setFont("times", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(
            footerText,
            outerMargin + 3,                       // small left padding
            footerY + footerHeight / 2,            // vertical center
            { align: "left", baseline: "middle" }  // left alignment
        );

        // doc.save("Candidate Information.pdf");
        doc.output("dataurlnewwindow");
    }


    const handleGeneratePDF = (type: string) => {
        const doc = new jsPDF("p", "mm", "a4");
        let title = "";
        let tableData: any[] = [];
        console.log('formType', type, candidatesData, candidateInfoId);
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
                tableData = Object.entries(interviewData).map(([key, value]) => [key, String(value)]);
                break;

            case "offer_acceptance":
                title = "Offer Acceptance";
                tableData = Object.entries(offerData).map(([key, value]) => [key, String(value)]);
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

                    <h2 className="text-xl font-bold mb-10">PDF Form Generation ({workflowData.workflowName})</h2>
                    {/* <p className="text-gray-600 mb-4"></p> */}

                    {workflowData.steps
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
                                                            {candidate.candidateId?.firstName}
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
