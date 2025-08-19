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
import { renderCandidateTemplate, renderManpowerTemplate } from "@/shared/functions";

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

    function renderInterviewTemplate(doc, manpowerData) {
        console.log('interviewData', manpowerData)
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
            "INTERVIEW ASSESSMENT FORM",
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
            "Candidate Details",
            pageWidth / 2,
            currentY + height / 2,
            { align: "center", baseline: "middle" }
        );
        // personal detail

        const personalDetailHeight = 33;
        doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, personalDetailHeight);
        doc.setFont("times", "normal");
        doc.setFontSize(13);
        let gap = 15;
        const space = 40
        const space2 = 113
        const space3 = 160
        // Vacancy Reason

        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Candidate Name:                   ", outerMargin + 2, currentY + gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            `${manpowerData.candidateId?.firstName?.toProperCase()} ${manpowerData.candidateId?.lastName?.toProperCase()}`,
            outerMargin + space, // adjust x position to align with label
            currentY + gap
        );
        gap = gap + 7
        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Position:                   ", outerMargin + 2, currentY + gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            manpowerData.candidateId?.recruitment?.requiredPosition?.name?.toProperCase(),
            outerMargin + space, // adjust x position to align with label
            currentY + gap
        );
        gap = gap + 7

        // Position Type
        doc.setTextColor(0, 0, 0);
        doc.text("Department:                       ", outerMargin + 2, currentY + gap);
        doc.setTextColor(70, 70, 70);
        doc.text(
            manpowerData.candidateId?.recruitment?.department?.name,
            outerMargin + space,
            currentY + gap
        );



        const vacancyheaderHeight = 8;   // shorter header row

        currentY += personalDetailHeight;
        doc.setTextColor(0, 0, 0); // black for label
        // Light blue header
        doc.setFillColor(224, 240, 255);
        doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, vacancyheaderHeight, "FD");
        doc.setFont("times", "italic");
        doc.setFontSize(13);
        doc.text(
            "Interview Rounds Detail",
            pageWidth / 2,
            currentY + vacancyheaderHeight / 2,
            { align: "center", baseline: "middle" }
        );

        currentY += vacancyheaderHeight;

        const vacancyHeight = manpowerData.rounds.length > 1 ? (manpowerData.rounds.length * 20) - 22 : 25;
        doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, vacancyHeight);
        if (manpowerData.rounds.length > 1) {
            // doc.setFillColor(224, 224, 224);
            doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, vacancyHeight);
            doc.setFont("times", "bold");
            doc.setFontSize(11);
            gap = 7
            doc.setTextColor(0, 0, 0); // black for label
            doc.text(`Round ${manpowerData.rounds?.[0]?.roundNumber}:`, outerMargin + 2, currentY + gap);

            gap = gap + 7
            doc.setFont("times", "normal");
            doc.setFontSize(13);
            let interviewer = candidateData?.find(
                (candidate: any) => candidate?._id == manpowerData.rounds?.[0]?.interviewer
            );
            doc.setTextColor(0, 0, 0); // black for label
            doc.text("Interviewed By:                       ", outerMargin + 2, currentY + gap);
            doc.setTextColor(70, 70, 70); // lighter black for value
            doc.text(
                `${interviewer?.displayName?.toProperCase()}`,
                outerMargin + space, // adjust x position to align with label
                currentY + gap
            );

            doc.setTextColor(0, 0, 0); // black for label
            doc.text("Interview Date:                       ", outerMargin + space2, currentY + gap);
            doc.setTextColor(70, 70, 70); // lighter black for value
            doc.text(
                moment(manpowerData.rounds?.[0]?.date).format("DD-MMM-YYYY"),
                outerMargin + space3, // adjust x position to align with label
                currentY + gap
            );

            gap = gap + 7
            doc.setFont("times", "normal");
            doc.setFontSize(13);

            doc.setTextColor(0, 0, 0); // black for label
            doc.text("Remarks:                       ", outerMargin + 2, currentY + gap);
            doc.setTextColor(70, 70, 70); // lighter black for value
            doc.text(
                manpowerData.rounds?.[0]?.remarks?.toProperCase(),
                outerMargin + space, // adjust x position to align with label
                currentY + gap
            );

            doc.setTextColor(0, 0, 0); // black for label
            doc.text("Status:                       ", outerMargin + space2, currentY + gap);
            doc.setTextColor(70, 70, 70); // lighter black for value
            doc.text(
                manpowerData.rounds?.[0]?.roundStatus?.toProperCase(),
                outerMargin + space3, // adjust x position to align with label
                currentY + gap
            );

            gap = gap + 10

            if (manpowerData.rounds.length > 2) {
                doc.setFont("times", "bold");
                doc.setFontSize(11);

                doc.setTextColor(0, 0, 0); // black for label
                doc.text(`Round ${manpowerData.rounds?.[1]?.roundNumber}:`, outerMargin + 2, currentY + gap);

                gap = gap + 7
                doc.setFont("times", "normal");
                doc.setFontSize(13);
                interviewer = candidateData?.find(
                    (candidate: any) => candidate?._id == manpowerData.rounds?.[1]?.interviewer
                );
                doc.setTextColor(0, 0, 0); // black for label
                doc.text("Interviewed By:                       ", outerMargin + 2, currentY + gap);
                doc.setTextColor(70, 70, 70); // lighter black for value
                doc.text(
                    `${interviewer?.displayName?.toProperCase()}`,
                    outerMargin + space, // adjust x position to align with label
                    currentY + gap
                );

                doc.setTextColor(0, 0, 0); // black for label
                doc.text("Interview Date:                       ", outerMargin + space2, currentY + gap);
                doc.setTextColor(70, 70, 70); // lighter black for value
                doc.text(
                    moment(manpowerData.rounds?.[1]?.date).format("DD-MMM-YYYY"),
                    outerMargin + space3, // adjust x position to align with label
                    currentY + gap
                );

                gap = gap + 7
                doc.setFont("times", "normal");
                doc.setFontSize(13);

                doc.setTextColor(0, 0, 0); // black for label
                doc.text("Remarks:                       ", outerMargin + 2, currentY + gap);
                doc.setTextColor(70, 70, 70); // lighter black for value
                doc.text(
                    manpowerData.rounds?.[1]?.remarks ? manpowerData.rounds?.[1]?.remarks?.toProperCase() : '',
                    outerMargin + space, // adjust x position to align with label
                    currentY + gap
                );

                doc.setTextColor(0, 0, 0); // black for label
                doc.text("Status:                       ", outerMargin + space2, currentY + gap);
                doc.setTextColor(70, 70, 70); // lighter black for value
                doc.text(
                    manpowerData.rounds?.[1]?.roundStatus?.toProperCase(),
                    outerMargin + space3, // adjust x position to align with label
                    currentY + gap
                );
            }
            gap = gap + 10

            if (manpowerData.rounds.length > 3) {
                doc.setFont("times", "bold");
                doc.setFontSize(11);

                doc.setTextColor(0, 0, 0); // black for label
                doc.text(`Round ${manpowerData.rounds?.[2]?.roundNumber}:`, outerMargin + 2, currentY + gap);

                gap = gap + 7
                doc.setFont("times", "normal");
                doc.setFontSize(13);
                interviewer = candidateData?.find(
                    (candidate: any) => candidate?._id == manpowerData.rounds?.[2]?.interviewer
                );
                doc.setTextColor(0, 0, 0); // black for label
                doc.text("Interviewed By:                       ", outerMargin + 2, currentY + gap);
                doc.setTextColor(70, 70, 70); // lighter black for value
                doc.text(
                    `${interviewer?.displayName?.toProperCase()}`,
                    outerMargin + space, // adjust x position to align with label
                    currentY + gap
                );

                doc.setTextColor(0, 0, 0); // black for label
                doc.text("Interview Date:                       ", outerMargin + space2, currentY + gap);
                doc.setTextColor(70, 70, 70); // lighter black for value
                doc.text(
                    moment(manpowerData.rounds?.[2]?.date).format("DD-MMM-YYYY"),
                    outerMargin + space3, // adjust x position to align with label
                    currentY + gap
                );

                gap = gap + 7
                doc.setFont("times", "normal");
                doc.setFontSize(13);

                doc.setTextColor(0, 0, 0); // black for label
                doc.text("Remarks:                       ", outerMargin + 2, currentY + gap);
                doc.setTextColor(70, 70, 70); // lighter black for value
                doc.text(
                    manpowerData.rounds?.[2]?.remarks ? manpowerData.rounds?.[2]?.remarks?.toProperCase() : '',
                    outerMargin + space, // adjust x position to align with label
                    currentY + gap
                );

                doc.setTextColor(0, 0, 0); // black for label
                doc.text("Status:                       ", outerMargin + space2, currentY + gap);
                doc.setTextColor(70, 70, 70); // lighter black for value
                doc.text(
                    manpowerData.rounds?.[2]?.roundStatus?.toProperCase(),
                    outerMargin + space3, // adjust x position to align with label
                    currentY + gap
                );
            }
gap = gap + 10
            if (manpowerData.rounds.length > 4) {
                doc.setFont("times", "bold");
                doc.setFontSize(11);

                doc.setTextColor(0, 0, 0); // black for label
                doc.text(`Round ${manpowerData.rounds?.[3]?.roundNumber}:`, outerMargin + 2, currentY + gap);

                gap = gap + 7
                doc.setFont("times", "normal");
                doc.setFontSize(13);
                interviewer = candidateData?.find(
                    (candidate: any) => candidate?._id == manpowerData.rounds?.[3]?.interviewer
                );
                doc.setTextColor(0, 0, 0); // black for label
                doc.text("Interviewed By:                       ", outerMargin + 2, currentY + gap);
                doc.setTextColor(70, 70, 70); // lighter black for value
                doc.text(
                    `${interviewer?.displayName?.toProperCase()}`,
                    outerMargin + space, // adjust x position to align with label
                    currentY + gap
                );

                doc.setTextColor(0, 0, 0); // black for label
                doc.text("Interview Date:                       ", outerMargin + space2, currentY + gap);
                doc.setTextColor(70, 70, 70); // lighter black for value
                doc.text(
                    moment(manpowerData.rounds?.[3]?.date).format("DD-MMM-YYYY"),
                    outerMargin + space3, // adjust x position to align with label
                    currentY + gap
                );

                gap = gap + 7
                doc.setFont("times", "normal");
                doc.setFontSize(13);

                doc.setTextColor(0, 0, 0); // black for label
                doc.text("Remarks:                       ", outerMargin + 2, currentY + gap);
                doc.setTextColor(70, 70, 70); // lighter black for value
                doc.text(
                    manpowerData.rounds?.[3]?.remarks ? manpowerData.rounds?.[3]?.remarks?.toProperCase() : '',
                    outerMargin + space, // adjust x position to align with label
                    currentY + gap
                );

                doc.setTextColor(0, 0, 0); // black for label
                doc.text("Status:                       ", outerMargin + space2, currentY + gap);
                doc.setTextColor(70, 70, 70); // lighter black for value
                doc.text(
                    manpowerData.rounds?.[3]?.roundStatus?.toProperCase(),
                    outerMargin + space3, // adjust x position to align with label
                    currentY + gap
                );
            }

        }
        else {
            doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, vacancyHeight);
            doc.setFont("times", "bold");
            doc.setFontSize(11);
            gap = 7
            doc.setTextColor(0, 0, 0); // black for label
            doc.text(`Round 1:`, outerMargin + 2, currentY + gap);

            gap = gap + 7
            doc.setFont("times", "normal");
            doc.setFontSize(13);
            let interviewer = candidateData?.find(
                (candidate: any) => candidate?._id == manpowerData.rounds?.[0]?.interviewer
            );
            doc.setTextColor(0, 0, 0); // black for label
            doc.text("Interviewed By:                       ", outerMargin + 2, currentY + gap);
            doc.setTextColor(70, 70, 70); // lighter black for value
            doc.text(
                ``,
                outerMargin + space, // adjust x position to align with label
                currentY + gap
            );

            doc.setTextColor(0, 0, 0); // black for label
            doc.text("Interview Date:                       ", outerMargin + space2, currentY + gap);
            doc.setTextColor(70, 70, 70); // lighter black for value
            doc.text(
                '',
                outerMargin + space3, // adjust x position to align with label
                currentY + gap
            );

            gap = gap + 7
            doc.setFont("times", "normal");
            doc.setFontSize(13);

            doc.setTextColor(0, 0, 0); // black for label
            doc.text("Remarks:                       ", outerMargin + 2, currentY + gap);
            doc.setTextColor(70, 70, 70); // lighter black for value
            doc.text(
                '',
                outerMargin + space, // adjust x position to align with label
                currentY + gap
            );

            doc.setTextColor(0, 0, 0); // black for label
            doc.text("Status:                       ", outerMargin + space2, currentY + gap);
            doc.setTextColor(70, 70, 70); // lighter black for value
            doc.text(
                '',
                outerMargin + space3, // adjust x position to align with label
                currentY + gap
            );

        }


        currentY += vacancyHeight;

        const assessmentHeight = 10
        doc.setTextColor(0, 0, 0); // black for label
        // Light blue header
        doc.setFillColor(224, 240, 255);
        doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, vacancyheaderHeight, "FD");
        doc.setFont("times", "italic");
        doc.setFontSize(13);
        doc.text(
            "Assessment Sheet",
            pageWidth / 2,
            currentY + vacancyheaderHeight / 2,
            { align: "center", baseline: "middle" }
        );



        currentY += vacancyheaderHeight;

        // doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, assessmentHeight);
        doc.setFont("times", "normal");
        doc.setFontSize(11);
        gap = 6
        doc.setTextColor(0, 0, 0); // black for label
        doc.text(`Score Scale : Very Good (5),  Good (4), Average (3), Poor (2), Very Poor (1)`, outerMargin + 2, currentY + gap);

        gap = gap + 7
        // Vacancy Reason

        currentY += assessmentHeight;


        // ---------------- TABLE ----------------
        const tableX = outerMargin;
        const tableY = currentY;
        const tableWidth = pageWidth - 2 * outerMargin;
        const rowHeight = 7;
        const rows = 10; // 10 rows

        // Column widths
        const colSNo = 20;                  // small
        const colScore = 30;                // small
        const colParam = tableWidth - colSNo - colScore; // remaining for Parameter Name

        // Table header
        doc.setFillColor(224, 240, 255);
        doc.rect(tableX, tableY, tableWidth, rowHeight, "FD");
        doc.setFont("times", "normal");

        doc.setFillColor(255, 255, 255);
        doc.rect(tableX, tableY, colSNo, rowHeight, "FD");
        doc.text("S. No", tableX + colSNo / 2, tableY + rowHeight / 2, {
            align: "center",
            baseline: "middle",
        });

        // Draw Parameter Name box
        doc.setFillColor(255, 255, 255);
        doc.rect(tableX + colSNo, tableY, colParam, rowHeight, "FD");
        doc.text("Parameters", tableX + colSNo + colParam / 2, tableY + rowHeight / 2, {
            align: "center",
            baseline: "middle",
        });

        // Draw Score box
        doc.setFillColor(255, 255, 255);
        doc.rect(tableX + colSNo + colParam, tableY, colScore, rowHeight, "FD");
        doc.text("Score", tableX + colSNo + colParam + colScore / 2, tableY + rowHeight / 2, {
            align: "center",
            baseline: "middle",
        });
        // Table rows
        doc.setFont("times", "normal");
        let totalScore = 0
        for (let i = 0; i < rows; i++) {
            const rowY = tableY + (i + 1) * rowHeight;

            // Draw row borders
            doc.rect(tableX, rowY, tableWidth, rowHeight);

            // Draw vertical lines (columns)
            doc.line(tableX + colSNo, rowY, tableX + colSNo, rowY + rowHeight);
            doc.line(tableX + colSNo + colParam, rowY, tableX + colSNo + colParam, rowY + rowHeight);

            // S. No → center
            doc.text(String(i + 1), tableX + colSNo / 2, rowY + rowHeight / 2, {
                align: "center",
                baseline: "middle"
            });

            // Parameter Name → left aligned
            doc.text(manpowerData?.assessmentParameters ?. [i]?.parameterName, tableX + colSNo + 5, rowY + rowHeight / 2, {
                baseline: "middle"
            });

            // Score → center
            doc.setTextColor(70, 70, 70);
            doc.text(manpowerData?.assessmentParameters ?. [i]?.score ? manpowerData?.assessmentParameters ?. [i]?.score?.toString() : "-", tableX + colSNo + colParam + colScore / 2, rowY + rowHeight / 2, {
                align: "center",
                baseline: "middle"
            });
            doc.setTextColor(0, 0, 0);
            totalScore = totalScore + (manpowerData?.assessmentParameters ?. [i]?.score ? manpowerData?.assessmentParameters ?. [i]?.score : 0) 

            currentY = rowY
        }

        currentY += 7;
        doc.setFont("times", "normal");
        doc.setFontSize(11);
        gap = 6
        doc.setTextColor(0, 0, 0); // black for label
        doc.text(`Total Score:    `, outerMargin + 2, currentY + gap);
         doc.setTextColor(70, 70, 70);
        doc.text(`${totalScore}`, outerMargin + space, currentY + gap);


        gap = gap + 6

         currentY += 9

        doc.setTextColor(0, 0, 0); // black for label
        // Light blue header
        doc.setFillColor(224, 240, 255);
        doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, vacancyheaderHeight-2, "FD");
        doc.setFont("times", "normal");
        doc.setFontSize(9);
        doc.text(
            "*Candidate should at least score 35 out of 50 to eligible for final selection.",
            7,
            currentY + (vacancyheaderHeight-2) / 2,
            {align: "left", baseline: "middle" }
        );

         currentY += 7;
        doc.setFont("times", "normal");
        doc.setFontSize(11);
        gap = 5
        doc.setTextColor(0, 0, 0); // black for label
        doc.text(`Interview Status:       `, outerMargin + 2, currentY + gap);
        doc.setTextColor(70, 70, 70);
        doc.text(`${manpowerData?.status?.toProperCase()}`, outerMargin + space, currentY + gap);

        gap = gap + 6

        // 8️⃣ Form Version at bottom
        const footerText = "ABS/HR/N/F02 B (25/04/2022) V. 1";
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
