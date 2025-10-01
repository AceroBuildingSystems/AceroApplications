

import mongoose from 'mongoose';
import { MenuItemicons } from '../iconMaps';
import { MenuItem } from '../types';
import * as XLSX from "xlsx";
import { toast } from 'react-toastify';
import { SUCCESS, ERROR, itHardWares, itSoftwares, workplaceApps, accessToBeProvided, otherAccess } from '@/shared/constants';
import moment from 'moment';
import { Department, Organisation } from '@/models';
import { exportToExcel } from '@/utils/copyToClipboard';
import { skip } from 'node:test';
import { Package } from 'lucide-react';
import Provider from '@/components/provider/Provider';

import { Types } from 'mongoose';


export function renderCandidateTemplate(doc, manpowerData) {
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
        manpowerData.totalYearsOfExperience.toString() || "0",
        outerMargin + space, // adjust x position to align with label
        currentY + gap
    );


    // Position Type
    doc.setTextColor(0, 0, 0);
    doc.text("Relevant Experience:                       ", outerMargin + space2, currentY + gap);
    doc.setTextColor(70, 70, 70);
    doc.text(
        manpowerData.relevantYearsOfExperience.toString() || "0",
        outerMargin + space3,
        currentY + gap
    );

    gap = gap + 7
    // No Of Vacant Positions
    doc.setTextColor(0, 0, 0);
    doc.text("Current Company:       ", outerMargin + 2, currentY + gap);
    doc.setTextColor(70, 70, 70);
    doc.text(`${manpowerData.currentEmployer || ""}`, outerMargin + space, currentY + gap);

    // Recruitment Type
    doc.setTextColor(0, 0, 0);
    doc.text("Current Work Location:               ", outerMargin + space2, currentY + gap);
    doc.setTextColor(70, 70, 70);
    doc.text(`${manpowerData?.currentWorkLocation?.toProperCase() || ""}`, outerMargin + space3, currentY + gap);

    gap = gap + 7
    // Recruitment Type
    doc.setTextColor(0, 0, 0);
    doc.text("Designation:               ", outerMargin + 2, currentY + gap);
    doc.setTextColor(70, 70, 70);
    doc.text(`${manpowerData.currentDesignation?.toProperCase() || ""}`, outerMargin + space, currentY + gap);

    // Recruitment Type
    doc.setTextColor(0, 0, 0);
    doc.text("Notice Period:               ", outerMargin + space2, currentY + gap);
    doc.setTextColor(70, 70, 70);
    doc.text(`${manpowerData.noticePeriodRequired}`, outerMargin + space3, currentY + gap);

    gap = gap + 7
    // Recruitment Type
    doc.setTextColor(0, 0, 0);
    doc.text("Current Salary:               ", outerMargin + 2, currentY + gap);
    doc.setTextColor(70, 70, 70);
    doc.text(`${manpowerData.currentSalaryPackage || ""}`, outerMargin + space, currentY + gap);

    // Recruitment Type
    doc.setTextColor(0, 0, 0);
    doc.text("Expected Salary:               ", outerMargin + space2, currentY + gap);
    doc.setTextColor(70, 70, 70);
    doc.text(`${manpowerData.expectedSalaryPackage || ""}`, outerMargin + space3, currentY + gap);

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
        manpowerData?.visaType?.toProperCase(),
        outerMargin + space, // adjust x position to align with label
        currentY + gap
    );


    // Vacancy Reason
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Visa Expiry Date:                   ", outerMargin + space2, currentY + gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        moment(manpowerData.visaExpiry).format("DD-MMM-YYYY"),
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
        manpowerData.highestQualification?.toProperCase(),
        outerMargin + space, // adjust x position to align with label
        currentY + gap
    );

    // Vacancy Reason
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Degree Attested:                   ", outerMargin + space2, currentY + gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.degreeCertificateAttested?.toProperCase(),
        outerMargin + space3, // adjust x position to align with label
        currentY + gap
    );

    gap = 7 + gap;
    // Vacancy Reason
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Languages Known:                   ", outerMargin + 2, currentY + gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.languagesKnown,
        outerMargin + space, // adjust x position to align with label
        currentY + gap
    );

    // Vacancy Reason
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Certifications (If Any):                   ", outerMargin + space2, currentY + gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.certifications?.toProperCase(),
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
        manpowerData.sourceOfPositionInfo?.toProperCase(),
        outerMargin + space + 40, // adjust x position to align with label
        currentY + gap
    );

    gap = 7 + gap;
    // Vacancy Reason
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Do You Have Friends/Relatives Working In ABS:                   ", outerMargin + 2, currentY + gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData?.friendsRelativesInABS?.toProperCase(),
        outerMargin + space + 40, // adjust x position to align with label
        currentY + gap
    );

    gap = 7 + gap;
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Name:                   ", outerMargin + 2, currentY + gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData?.friendsRelativesDetails ? manpowerData.friendsRelativesDetails?.name?.toProperCase() : '',
        outerMargin + space, // adjust x position to align with label
        currentY + gap
    );

    gap = 7 + gap;
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Relation:                   ", outerMargin + 2, currentY + gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData?.friendsRelativesDetails ? manpowerData?.friendsRelativesDetails?.relation?.toProperCase() : '',
        outerMargin + space, // adjust x position to align with label
        currentY + gap
    );

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Contact No:                   ", outerMargin + space2, currentY + gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData?.friendsRelativesDetails ? manpowerData?.friendsRelativesDetails?.contactNo : '',
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
        `${manpowerData.declaredBy?.candidateSignature}    ${moment(manpowerData.declaredBy?.date).format("DD-MMM-YYYY")}`,
        outerMargin + space + 10, // adjust x position to align with label
        currentY + gap
    );

    gap = 7 + gap;
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Remarks (If Any):                   ", outerMargin + 2, currentY + gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData?.remarks ? manpowerData.remarks?.toProperCase() : '',
        outerMargin + space + 10, // adjust x position to align with label
        currentY + gap
    );

    gap = 7 + gap;
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Checked By:                   ", outerMargin + 2, currentY + gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData?.checkedBy ? manpowerData?.checkedBy?.displayName?.toProperCase() : '',
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


export function renderInterviewTemplate(doc, manpowerData) {
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
    const titleHeight = 15;
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

    const vacancyHeight = manpowerData.rounds.length > 0 ? (manpowerData.rounds.length * 25) - 25 : 25;
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, vacancyHeight);
    if (manpowerData.rounds.length > 0 && manpowerData.rounds?.[0]?.interviewer) {
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
        let interviewer = manpowerData?.recruitmentId?.interviewers
            ?.find(
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

        if (manpowerData.rounds.length > 1 && manpowerData.rounds?.[1]?.interviewer) {
            doc.setFont("times", "bold");
            doc.setFontSize(11);

            doc.setTextColor(0, 0, 0); // black for label
            doc.text(`Round ${manpowerData.rounds?.[1]?.roundNumber}:`, outerMargin + 2, currentY + gap);

            gap = gap + 7
            doc.setFont("times", "normal");
            doc.setFontSize(13);
            interviewer = manpowerData?.recruitmentId?.interviewers?.find(
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

        if (manpowerData.rounds.length > 2 && manpowerData.rounds?.[2]?.interviewer) {
            doc.setFont("times", "bold");
            doc.setFontSize(11);

            doc.setTextColor(0, 0, 0); // black for label
            doc.text(`Round ${manpowerData.rounds?.[2]?.roundNumber}:`, outerMargin + 2, currentY + gap);

            gap = gap + 7
            doc.setFont("times", "normal");
            doc.setFontSize(13);
            interviewer = manpowerData?.recruitmentId?.interviewers?.find(
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
        if (manpowerData.rounds.length > 3 && manpowerData.rounds?.[3]?.interviewer) {
            doc.setFont("times", "bold");
            doc.setFontSize(11);

            doc.setTextColor(0, 0, 0); // black for label
            doc.text(`Round ${manpowerData.rounds?.[3]?.roundNumber}:`, outerMargin + 2, currentY + gap);

            gap = gap + 7
            doc.setFont("times", "normal");
            doc.setFontSize(13);
            interviewer = manpowerData?.recruitmentId?.interviewers?.find(
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
        let interviewer = manpowerData?.recruitmentId?.interviewers?.find(
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

    const hrFeedbackHeight = 8;
    doc.setFillColor(224, 240, 255);
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, hrFeedbackHeight, "FD");
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.text(
        "Preliminary Interview Feedback – HR/ADMIN",
        pageWidth / 2,
        currentY + hrFeedbackHeight / 2,
        { align: "center", baseline: "middle" }
    );
    // personal detail

    const feedbackDetailHeight = 25;
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, feedbackDetailHeight);
    doc.setFont("times", "normal");
    doc.setFontSize(13);

    // Vacancy Reason

    gap = 7 + 8;
    // Vacancy Reason
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Date:                   ", outerMargin + 2, currentY + gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        `${manpowerData.hrFeedback?.date ? moment(manpowerData.hrFeedback?.date).format("DD-MMM-YYYY") : ''}`,
        outerMargin + space, // adjust x position to align with label
        currentY + gap
    );

    gap = gap + 7

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Remarks:                   ", outerMargin + 2, currentY + gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        `${manpowerData.hrFeedback?.remarks}`,
        outerMargin + space, // adjust x position to align with label
        currentY + gap
    );

    gap = gap + 7

    currentY += feedbackDetailHeight;

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
    doc.text(`Score Scale : Very Good (5),  Good (4), Fair (3), Satisfactory (2), Poor (1)`, outerMargin + 2, currentY + gap);

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
        doc.text(manpowerData?.assessmentParameters?.[i]?.parameterName, tableX + colSNo + 5, rowY + rowHeight / 2, {
            baseline: "middle"
        });

        // Score → center
        doc.setTextColor(70, 70, 70);
        doc.text(manpowerData?.assessmentParameters?.[i]?.score ? manpowerData?.assessmentParameters?.[i]?.score?.toString() : "-", tableX + colSNo + colParam + colScore / 2, rowY + rowHeight / 2, {
            align: "center",
            baseline: "middle"
        });
        doc.setTextColor(0, 0, 0);
        totalScore = totalScore + (manpowerData?.assessmentParameters?.[i]?.score ? manpowerData?.assessmentParameters?.[i]?.score : 0)

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
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, vacancyheaderHeight - 2, "FD");
    doc.setFont("times", "normal");
    doc.setFontSize(9);
    doc.text(
        "*Candidate should at least score 35 out of 50 to eligible for final selection.",
        7,
        currentY + (vacancyheaderHeight - 2) / 2,
        { align: "left", baseline: "middle" }
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
};


export function renderManpowerTemplate(doc, manpowerData) {

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
        "MANPOWER REQUISITION FORM",
        pageWidth / 2,
        currentY + titleHeight / 2,
        { align: "center", baseline: "middle" }
    );
    doc.setTextColor(0, 0, 0);
    currentY += titleHeight;

    // 3️⃣ Requester Information Section (2 rows × 4 columns)
    const headerHeight = 8;   // shorter header row
    const rowHeight = 16;      // taller table rows
    const sectionHeight = headerHeight + rowHeight * 2; // total section height
    const colWidth = (pageWidth - 2 * outerMargin) / 4;

    // Light blue header
    doc.setFillColor(224, 240, 255);
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, headerHeight, "FD");
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.text(
        "Requester Information",
        pageWidth / 2,
        currentY + headerHeight / 2,
        { align: "center", baseline: "middle" }
    );

    currentY += headerHeight;

    // Define custom column widths
    const colWidths = [
        colWidth * 0.8,  // Column 1 (narrower)
        colWidth * 1.2,  // Column 2 (wider)
        colWidth * 0.8,  // Column 3 (narrower)
        colWidth * 1.2   // Column 4 (wider)
    ];

    // Draw 2x4 table with taller rows
    let xPos;
    for (let r = 0; r < 2; r++) {
        xPos = outerMargin;
        for (let c = 0; c < 4; c++) {
            doc.rect(xPos, currentY + r * rowHeight, colWidths[c], rowHeight, "S");
            xPos += colWidths[c];
        }
    }

    // Labels and Values
    doc.setFont("times", "normal");
    doc.setFontSize(13);

    // --- Row 1 Labels ---
    doc.text("Requested By", outerMargin + 2, currentY + 8, { baseline: "middle" });
    doc.text("Requested Date", outerMargin + colWidths[0] + colWidths[1] + 2, currentY + 8, { baseline: "middle" });

    // --- Row 2 Labels ---
    doc.text("Department", outerMargin + 2, currentY + rowHeight + 8, { baseline: "middle" });
    doc.text("Requested Position", outerMargin + colWidths[0] + colWidths[1] + 2, currentY + rowHeight + 8, { baseline: "middle" });

    // --- Row 1 Values ---

    doc.setTextColor(70, 70, 70);
    doc.text(
        `${manpowerData.requestedBy?.displayName?.toProperCase() || ""}`,
        outerMargin + colWidths[0] + 2,
        currentY + 8, { baseline: "middle" }
    );
    doc.text(
        `${moment(manpowerData?.requestDate).format("DD-MMM-YYYY")}`,
        outerMargin + colWidths[0] + colWidths[1] + colWidths[2] + 2,
        currentY + 8, { baseline: "middle" }
    );

    // --- Row 2 Values ---
    doc.text(
        `${manpowerData.department?.name || ""}`,
        outerMargin + colWidths[0] + 2,
        currentY + rowHeight + 8, { baseline: "middle" }
    );
    doc.text(
        `${manpowerData.positionName || ""}`,
        outerMargin + colWidths[0] + colWidths[1] + colWidths[2] + 2,
        currentY + rowHeight + 8, { baseline: "middle" }
    );

    currentY += rowHeight * 2;

    // 4️⃣ Vacancy & Position Type Section

    const vacancyheaderHeight = 8;   // shorter header row


    doc.setTextColor(0, 0, 0);

    // Light blue header
    doc.setFillColor(224, 240, 255);
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, vacancyheaderHeight, "FD");
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.text(
        "Position Information",
        pageWidth / 2,
        currentY + vacancyheaderHeight / 2,
        { align: "center", baseline: "middle" }
    );

    currentY += headerHeight;


    const vacancyHeight = manpowerData.vacancyReason === "replacement" ? 85 : 60;
    // doc.setFillColor(224, 224, 224);
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, vacancyHeight);
    doc.setFont("times", "normal");
    doc.setFontSize(13);

    // Vacancy Reason
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Vacancy Reason:                   ", outerMargin + 2, currentY + 10);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.vacancyReason === "new_position" ? "New Position" : "Replacement",
        outerMargin + 75, // adjust x position to align with label
        currentY + 10
    );

    // Position Type
    doc.setTextColor(0, 0, 0);
    doc.text("Position Type:                       ", outerMargin + 2, currentY + 20);
    doc.setTextColor(70, 70, 70);
    doc.text(
        manpowerData.positionType === "budgeted" ? "Budgeted" : "Non-Budgeted",
        outerMargin + 75,
        currentY + 20
    );

    // No Of Vacant Positions
    doc.setTextColor(0, 0, 0);
    doc.text("No Of Vacant Positions:       ", outerMargin + 2, currentY + 30);
    doc.setTextColor(70, 70, 70);
    doc.text(`${manpowerData.noOfVacantPositions}`, outerMargin + 75, currentY + 30);

    // Recruitment Type
    doc.setTextColor(0, 0, 0);
    doc.text("Recruitment Type:               ", outerMargin + 2, currentY + 40);
    doc.setTextColor(70, 70, 70);
    doc.text(`${manpowerData.recruitmentType?.toProperCase()}`, outerMargin + 75, currentY + 40);

    // Previous Employee Details
    // Previous Employee Details
    doc.setTextColor(0, 0, 0);
    doc.text("Previous Employee Details:    ", outerMargin + 2, currentY + 50);

    if (manpowerData.vacancyReason === "replacement" && manpowerData.prevEmployee) {
        const prev = manpowerData.prevEmployee;
        const labelY = currentY + 50;
        const dataY = labelY + 9; // move EMP details to next line

        // EMP Name
        doc.setTextColor(0, 0, 0);
        doc.text("Employee Name:", outerMargin + 2, dataY);
        doc.setTextColor(70, 70, 70);
        doc.text(`${prev.displayName?.toProperCase() || ""}`, outerMargin + 40, dataY);

        // EMP No
        doc.setTextColor(0, 0, 0);
        doc.text("Employee Id:", outerMargin + 110, dataY);
        doc.setTextColor(70, 70, 70);
        doc.text(`${prev.empId || ""}`, outerMargin + 140, dataY);

        // Designation
        doc.setTextColor(0, 0, 0);
        doc.text("Designation:", outerMargin + 2, dataY + 10);
        doc.setTextColor(70, 70, 70);
        doc.text(`${prev.designation?.name || ""}`, outerMargin + 40, dataY + 10);

        // Department
        doc.setTextColor(0, 0, 0);
        doc.text("Department:", outerMargin + 110, dataY + 10);
        doc.setTextColor(70, 70, 70);
        doc.text(`${prev.department?.name || ""}`, outerMargin + 140, dataY + 10);

        // DOE
        doc.setTextColor(0, 0, 0);
        doc.text("DOE:", outerMargin + 2, dataY + 20);
        doc.setTextColor(70, 70, 70);
        doc.text(`${prev.doe ? moment(prev.doe).format("DD-MMM-YYYY") : ""}`, outerMargin + 40, dataY + 20);

        // Salary
        doc.setTextColor(0, 0, 0);
        doc.text("Salary:", outerMargin + 110, dataY + 20);
        doc.setTextColor(70, 70, 70);
        doc.text(`${manpowerData.prevEmployeeSalary || ""}`, outerMargin + 140, dataY + 20);

    } else {
        doc.setTextColor(70, 70, 70);
        doc.text("N/A", outerMargin + 75, currentY + 50);
    }
    currentY += vacancyHeight;


    const approvalheaderHeight = 8;   // shorter header row


    // Light blue header
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(224, 240, 255);
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, approvalheaderHeight, "FD");
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.text(
        "Approvals",
        pageWidth / 2,
        currentY + approvalheaderHeight / 2,
        { align: "center", baseline: "middle" }
    );

    currentY += headerHeight;
    // Define custom column widths
    const equalColWidth = (pageWidth - 2 * outerMargin) / 4;

    // Define custom row heights
    const rowHeights = [18, 30]; // Row 1 shorter, Row 2 taller

    // Draw 2x4 table with custom row heights
    let yPos = currentY;
    let cellYPositions = []; // store top Y for each row
    for (let r = 0; r < 2; r++) {
        let xPos = outerMargin;
        cellYPositions[r] = yPos;
        for (let c = 0; c < 4; c++) {
            doc.rect(xPos, yPos, equalColWidth, rowHeights[r], "S");
            xPos += equalColWidth;
        }
        yPos += rowHeights[r];
    }

    // Labels
    doc.setFont("times", "normal");
    doc.setFontSize(13);

    // Row 1 (centered text)
    const row1Labels = ["Finance Department", "HEAD OF HR/ADMIN", "COO/CFO", "C.E.O"];
    row1Labels.forEach((label, i) => {
        const xCenter = outerMargin + (i * equalColWidth) + (equalColWidth / 2);
        const yCenter = cellYPositions[0] + (rowHeights[0] / 2);
        doc.text(label, xCenter, yCenter, { align: "center", baseline: "middle" });
    });

    // Row 2 (empty now, but centered)
    const row2Values = ["", "", "", ""];
    row2Values.forEach((val, i) => {
        const xCenter = outerMargin + (i * equalColWidth) + (equalColWidth / 2);
        const yCenter = cellYPositions[1] + (rowHeights[1] / 2);
        doc.text(val, xCenter, yCenter, { align: "center", baseline: "middle" });
    });

    // Update currentY to move below the new box
    currentY = yPos;


    // 5️⃣ Candidate Type Section


    // 8️⃣ Form Version at bottom
    const footerText = "ABS/HR/N/ F01 C (25/04/2022) V.1";
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

    doc.output("dataurlnewwindow");
};

export function renderEmployeeJoiningTemplate(doc, manpowerData) {

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
        "NEW EMPLOYEE JOINING FORM",
        pageWidth / 2,
        currentY + titleHeight / 2,
        { align: "center", baseline: "middle" }
    );
    doc.setTextColor(0, 0, 0);
    currentY += titleHeight;

    // 3️⃣ Requester Information Section (2 rows × 4 columns)
    const headerHeight = 8;   // shorter header row
    const rowHeight = 65;      // taller table rows
    const sectionHeight = headerHeight + rowHeight * 2; // total section height
    const colWidth = (pageWidth - 2 * outerMargin) / 4;

    // Light blue header
    doc.setFillColor(224, 240, 255);
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, headerHeight, "FD");
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.text(
        "Employee Information",
        pageWidth / 2,
        currentY + headerHeight / 2,
        { align: "center", baseline: "middle" }
    );

    currentY += headerHeight;

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Employee Name:                   ", outerMargin + 2, currentY + 10);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.fullName,
        outerMargin + 75, // adjust x position to align with label
        currentY + 10
    );

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Designation Name:                   ", outerMargin + 2, currentY + 20);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.designationName,
        outerMargin + 75, // adjust x position to align with label
        currentY + 20
    );

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Department / Section:                   ", outerMargin + 2, currentY + 30);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.departmentName,
        outerMargin + 75, // adjust x position to align with label
        currentY + 30
    );

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Location:                   ", outerMargin + 2, currentY + 40);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.workLocationName,
        outerMargin + 75, // adjust x position to align with label
        currentY + 40
    );

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Reporting To:                   ", outerMargin + 2, currentY + 50);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.reportingToName?.toProperCase(),
        outerMargin + 75, // adjust x position to align with label
        currentY + 50
    );

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Date Of Reporting:                   ", outerMargin + 2, currentY + 60);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        moment(manpowerData.dateOfReporting).format("DD-MMM-YYYY"),
        outerMargin + 75, // adjust x position to align with label
        currentY + 60
    );

    // Define custom column widths

    currentY += rowHeight;

    // 4️⃣ Vacancy & Position Type Section


    // 5️⃣ Candidate Type Section


    // 8️⃣ Form Version at bottom
    const footerText = "ABS/HR/N/ F01 C (25/04/2022) V.1";
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

    doc.output("dataurlnewwindow");
};

export function renderItAccessTemplate(doc, manpowerData) {

    const startX = 5; // instead of 10
    const startY = 5;
    const totalWidth = 196;
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const outerMargin = startX; // outer border margin
    let currentY = startY;
    const rowGap = 9;

    let gap = 15;

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
        "ASSETS & IT - ACCESS FORM",
        pageWidth / 2,
        currentY + titleHeight / 2,
        { align: "center", baseline: "middle" }
    );
    doc.setTextColor(0, 0, 0);
    currentY += titleHeight;

    // 3️⃣ Requester Information Section (2 rows × 4 columns)
    const headerHeight = 8;   // shorter header row
    const rowHeight = 40;      // taller table rows
    const sectionHeight = headerHeight + rowHeight * 2; // total section height
    const colWidth = (pageWidth - 2 * outerMargin) / 4;

    // Light blue header
    doc.setFillColor(224, 240, 255);
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, headerHeight, "FD");
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.text(
        "Employee Information",
        pageWidth / 2,
        currentY + headerHeight / 2,
        { align: "center", baseline: "middle" }
    );

    currentY += headerHeight;
    gap = currentY + rowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Employee Name:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.fullName,
        outerMargin + 45, // adjust x position to align with label
        gap
    );

    gap += rowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Designation Name:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.designationName,
        outerMargin + 45, // adjust x position to align with label
        gap
    );


    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Department / Section:                   ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.departmentName,
        outerMargin + 150, // adjust x position to align with label
        gap
    );

    gap += rowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Reporting To:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.reportingToName?.toProperCase(),
        outerMargin + 45, // adjust x position to align with label
        gap
    );


    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Date Of Request:                   ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        moment(manpowerData?.itAccess?.dateOfRequest).format("DD-MMM-YYYY"),
        outerMargin + 150, // adjust x position to align with label
        gap
    );

    gap += rowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Email Assigned:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.itAccess?.email,
        outerMargin + 45, // adjust x position to align with label
        gap
    );


    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Display Name:                 ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.itAccess?.displayName,
        outerMargin + 150, // adjust x position to align with label
        gap
    );
    // Define custom column widths

    currentY += rowHeight;
    // const itHarwareSection = 25;
    doc.setFillColor(224, 240, 255);
    doc.setTextColor(0, 0, 0);
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, headerHeight, "FD");
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.text(
        "IT Hardwares Assets To Be Provided",
        pageWidth / 2,
        currentY + headerHeight / 2,
        { align: "center", baseline: "middle" }
    );

    gap = currentY + 15
    // doc.setTextColor(0, 0, 0); // black for label
    // doc.text("Employee Name:                   ", outerMargin + 2, gap);
    const itHardwaresValue: string[] = manpowerData.itAccess?.itHardwareAssets || [];

    let itemsPerRow = 3;
    let itemGapX = 60; // horizontal gap (adjust to fit your layout)
    let itemGapY = 8; // vertical gap
    // let startX = outerMargin + 2;
    // let startY = gap + 10; // starting Y below Employee Name
    doc.setTextColor(70, 70, 70);
    itHardwaresValue.forEach((item, index) => {
        const itemObj = itHardWares.find(h => h.value === item);

        const col = index % itemsPerRow;   // 0,1,2 → columns
        const row = Math.floor(index / itemsPerRow);

        const x = startX + 2 + col * itemGapX;
        const y = gap + row * itemGapY;

        doc.text(itemObj.label, x, y);
    });

    // doc.setTextColor(70, 70, 70); // lighter black for value
    // doc.text(
    //     manpowerData.fullName,
    //     outerMargin + 2, // adjust x position to align with label
    //     gap
    // );


    currentY += (((itHardwaresValue?.length / 3) + 1) * 10 > 15) ? (((itHardwaresValue?.length / 3) + 1) * 10) : (((itHardwaresValue?.length / 3) + 1) * 10 + 5);

    doc.setFillColor(224, 240, 255);
    doc.setTextColor(0, 0, 0);
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, headerHeight, "FD");
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.text(
        "IT Software Assets To Be Provided",
        pageWidth / 2,
        currentY + headerHeight / 2,
        { align: "center", baseline: "middle" }
    );

    gap = currentY + 15

    const itSoftwareValue: string[] = manpowerData.itAccess?.itSoftwareAssets || [];

    itemsPerRow = 3;
    itemGapX = 60; // horizontal gap (adjust to fit your layout)
    itemGapY = 8; // vertical gap
    // let startX = outerMargin + 2;
    // let startY = gap + 10; // starting Y below Employee Name
    doc.setTextColor(70, 70, 70);
    itSoftwareValue.forEach((item, index) => {
        const itemObj = itSoftwares.find(h => h.value === item);

        const col = index % itemsPerRow;   // 0,1,2 → columns
        const row = Math.floor(index / itemsPerRow);

        const x = startX + 2 + col * itemGapX;
        const y = gap + row * itemGapY;

        doc.text(itemObj?.label, x, y);
    });

    // doc.setTextColor(70, 70, 70); // lighter black for value
    // doc.text(
    //     manpowerData.fullName,
    //     outerMargin + 2, // adjust x position to align with label
    //     gap
    // );


    currentY += (((itSoftwareValue?.length / 3) + 1) * 10 > 15) ? (((itSoftwareValue?.length / 3) + 1) * 10) : (((itSoftwareValue?.length / 3) + 1) * 10 + 5);


    doc.setFillColor(224, 240, 255);
    doc.setTextColor(0, 0, 0);
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, headerHeight, "FD");
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.text(
        "Workplace Apps",
        pageWidth / 2,
        currentY + headerHeight / 2,
        { align: "center", baseline: "middle" }
    );

    gap = currentY + 15

    const itWorkplaceApps: string[] = manpowerData.itAccess?.workplaceApps || [];

    itemsPerRow = 3;
    itemGapX = 60; // horizontal gap (adjust to fit your layout)
    itemGapY = 8; // vertical gap
    // let startX = outerMargin + 2;
    // let startY = gap + 10; // starting Y below Employee Name
    doc.setTextColor(70, 70, 70);
    itWorkplaceApps.forEach((item, index) => {
        const itemObj = workplaceApps.find(h => h.value === item);

        const col = index % itemsPerRow;   // 0,1,2 → columns
        const row = Math.floor(index / itemsPerRow);

        const x = startX + 2 + col * itemGapX;
        const y = gap + row * itemGapY;

        doc.text(itemObj?.label, x, y);
    });


    currentY += (((itWorkplaceApps?.length / 3) + 1) * 10 > 15) ? (((itWorkplaceApps?.length / 3) + 1) * 10) : (((itWorkplaceApps?.length / 3) + 1) * 10 + 5);

    doc.setFillColor(224, 240, 255);
    doc.setTextColor(0, 0, 0);
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, headerHeight, "FD");
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.text(
        "Access To Be Provided",
        pageWidth / 2,
        currentY + headerHeight / 2,
        { align: "center", baseline: "middle" }
    );

    gap = currentY + 15

    const accessToProvide: string[] = manpowerData.itAccess?.accessToProvide || [];

    itemsPerRow = 3;
    itemGapX = 60; // horizontal gap (adjust to fit your layout)
    itemGapY = 8; // vertical gap
    // let startX = outerMargin + 2;
    // let startY = gap + 10; // starting Y below Employee Name
    doc.setTextColor(70, 70, 70);
    accessToProvide.forEach((item, index) => {
        const itemObj = accessToBeProvided.find(h => h.value === item);

        const col = index % itemsPerRow;   // 0,1,2 → columns
        const row = Math.floor(index / itemsPerRow);

        const x = startX + 2 + col * itemGapX;
        const y = gap + row * itemGapY;

        doc.text(itemObj?.label, x, y);
    });



    currentY += (((accessToProvide?.length / 3) + 1) * 10 > 15) ? (((accessToProvide?.length / 3) + 1) * 10) : (((accessToProvide?.length / 3) + 1) * 10 + 5);

    doc.setFillColor(224, 240, 255);
    doc.setTextColor(0, 0, 0);
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, headerHeight, "FD");
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.text(
        "Access To Be Provided",
        pageWidth / 2,
        currentY + headerHeight / 2,
        { align: "center", baseline: "middle" }
    );

    gap = currentY + 15

    const othersAccess: string[] = manpowerData.itAccess?.othersAccess || [];

    itemsPerRow = 3;
    itemGapX = 60; // horizontal gap (adjust to fit your layout)
    itemGapY = 8; // vertical gap
    // let startX = outerMargin + 2;
    // let startY = gap + 10; // starting Y below Employee Name
    doc.setTextColor(70, 70, 70);
    othersAccess.forEach((item, index) => {
        const itemObj = otherAccess.find(h => h.value === item);

        const col = index % itemsPerRow;   // 0,1,2 → columns
        const row = Math.floor(index / itemsPerRow);

        const x = startX + 2 + col * itemGapX;
        const y = gap + row * itemGapY;

        doc.text(itemObj?.label, x, y);
    });



    currentY += (((othersAccess?.length / 3) + 1) * 10 > 15) ? (((othersAccess?.length / 3) + 1) * 10) : (((othersAccess?.length / 3) + 1) * 10 + 5);

    doc.setTextColor(0, 0, 0);
    doc.setFillColor(224, 240, 255);
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, headerHeight, "FD");
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.text(
        "Approvals",
        pageWidth / 2,
        currentY + headerHeight / 2,
        { align: "center", baseline: "middle" }
    );

    currentY += headerHeight;
    // Define custom column widths
    const equalColWidth = (pageWidth - 2 * outerMargin) / 3;

    // Define custom row heights
    const rowHeights = [12, 25]; // Row 1 shorter, Row 2 taller

    // Draw 2x4 table with custom row heights
    let yPos = currentY;
    let cellYPositions = []; // store top Y for each row
    for (let r = 0; r < 2; r++) {
        let xPos = outerMargin;
        cellYPositions[r] = yPos;
        for (let c = 0; c < 3; c++) {
            doc.rect(xPos, yPos, equalColWidth, rowHeights[r], "S");
            xPos += equalColWidth;
        }
        yPos += rowHeights[r];
    }

    // Labels
    doc.setFont("times", "normal");
    doc.setFontSize(13);

    // Row 1 (centered text)
    const row1Labels = ["HR Manager", "COO", "CFO"];
    row1Labels.forEach((label, i) => {
        const xCenter = outerMargin + (i * equalColWidth) + (equalColWidth / 2);
        const yCenter = cellYPositions[0] + (rowHeights[0] / 2);
        doc.text(label, xCenter, yCenter, { align: "center", baseline: "middle" });
    });

    // Row 2 (empty now, but centered)
    const row2Values = ["", "", ""];
    row2Values.forEach((val, i) => {
        const xCenter = outerMargin + (i * equalColWidth) + (equalColWidth / 2);
        const yCenter = cellYPositions[1] + (rowHeights[1] / 2);
        doc.text(val, xCenter, yCenter, { align: "center", baseline: "middle" });
    });

    // Update currentY to move below the new box
    currentY = yPos;


    // 8️⃣ Form Version at bottom
    const footerText = "ABS/HR/N/ F01 C (25/04/2022) V.1";
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

    doc.output("dataurlnewwindow");
};



export function renderEmployeeInfoTemplate(doc, manpowerData) {

    const startX = 5; // instead of 10
    const startY = 5;
    const totalWidth = 196;
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const outerMargin = startX; // outer border margin
    let currentY = startY;
    const rowGap = 9;

    let gap = 15;

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
        "EMPLOYEE INFORMATION FORM",
        pageWidth / 2,
        currentY + titleHeight / 2,
        { align: "center", baseline: "middle" }
    );
    doc.setTextColor(0, 0, 0);
    currentY += titleHeight;

    // 3️⃣ Requester Information Section (2 rows × 4 columns)
    const headerHeight = 8;   // shorter header row
    const rowHeight = 70;      // taller table rows
    const sectionHeight = headerHeight + rowHeight * 2; // total section height
    const colWidth = (pageWidth - 2 * outerMargin) / 4;

    // Light blue header
    doc.setFillColor(224, 240, 255);
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, headerHeight, "FD");
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.text(
        "Employee Details",
        pageWidth / 2,
        currentY + headerHeight / 2,
        { align: "center", baseline: "middle" }
    );

    currentY += headerHeight;
    gap = currentY + rowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Employee Name:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.fullName,
        outerMargin + 45, // adjust x position to align with label
        gap
    );

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Employee ID:                   ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.empId,
        outerMargin + 150, // adjust x position to align with label
        gap
    );

    gap += rowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Designation Name:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.designationName,
        outerMargin + 45, // adjust x position to align with label
        gap
    );

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Grade:                   ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.grade,
        outerMargin + 150, // adjust x position to align with label
        gap
    );

    gap += rowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Department:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.departmentName,
        outerMargin + 45, // adjust x position to align with label
        gap
    );


    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Location:                   ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.workLocationName?.toProperCase(),
        outerMargin + 150, // adjust x position to align with label
        gap
    );

    gap += rowGap

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Date Of Birth:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        moment(manpowerData?.dateOfBirth).format("DD-MMM-YYYY"),
        outerMargin + 45, // adjust x position to align with label
        gap
    );

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Category:                   ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.categoryName?.toProperCase(),
        outerMargin + 150, // adjust x position to align with label
        gap
    );

    gap += rowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Gender:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData?.gender?.toProperCase(),
        outerMargin + 45, // adjust x position to align with label
        gap
    );


    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Nationality:                 ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.nationalityName?.toProperCase(),
        outerMargin + 150, // adjust x position to align with label
        gap
    );

    gap += rowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Religion:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.religion?.toProperCase(),
        outerMargin + 45, // adjust x position to align with label
        gap
    );


    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Blood Group:                 ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.bloodGroup,
        outerMargin + 150, // adjust x position to align with label
        gap
    );

    gap += rowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Marital Status:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData?.maritalStatus,
        outerMargin + 45, // adjust x position to align with label
        gap
    );


    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Hometown Airport:                 ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.homeTownAirport?.toProperCase(),
        outerMargin + 150, // adjust x position to align with label
        gap
    );
    // Define custom column widths

    currentY += rowHeight;
    const familyDetailsHeight = 65;
    // const itHarwareSection = 25;
    doc.setFillColor(224, 240, 255);
    doc.setTextColor(0, 0, 0);
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, headerHeight, "FD");
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.text(
        "Family Details",
        pageWidth / 2,
        currentY + headerHeight / 2,
        { align: "center", baseline: "middle" }
    );

    gap = currentY + 15
    // doc.setTextColor(0, 0, 0); // black for label
    // doc.text("Employee Name:                   ", outerMargin + 2, gap);

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Father's Name:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.familyDetails?.fatherName?.toProperCase(),
        outerMargin + 45, // adjust x position to align with label
        gap
    );


    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Nationality:                 ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.familyDetails?.fatherNationality?.name?.toProperCase(),
        outerMargin + 150, // adjust x position to align with label
        gap
    );

    gap += rowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Mother's Name:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.familyDetails?.motherName?.toProperCase(),
        outerMargin + 45, // adjust x position to align with label
        gap
    );


    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Nationality:                 ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.familyDetails?.motherNationality?.name?.toProperCase(),
        outerMargin + 150, // adjust x position to align with label
        gap
    );

    gap += rowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Spouse's Name:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.familyDetails?.spouseName?.toProperCase(),
        outerMargin + 45, // adjust x position to align with label
        gap
    );


    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Nationality:                 ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.familyDetails?.spouseNationality?.name?.toProperCase(),
        outerMargin + 150, // adjust x position to align with label
        gap
    );

    gap += rowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("First Child's Name:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.familyDetails?.child1Name?.toProperCase(),
        outerMargin + 45, // adjust x position to align with label
        gap
    );


    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Nationality:                 ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.familyDetails?.child1Nationality?.name?.toProperCase(),
        outerMargin + 150, // adjust x position to align with label
        gap
    );

    gap += rowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Second Child's Name:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.familyDetails?.child2Name?.toProperCase(),
        outerMargin + 45, // adjust x position to align with label
        gap
    );


    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Nationality:                 ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.familyDetails?.child2Nationality?.name?.toProperCase(),
        outerMargin + 150, // adjust x position to align with label
        gap
    );

    gap += rowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Third Child's Name:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.familyDetails?.child3Name?.toProperCase(),
        outerMargin + 45, // adjust x position to align with label
        gap
    );


    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Nationality:                 ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        `${manpowerData.employeeInfo?.familyDetails?.child3Nationality ? manpowerData.employeeInfo?.familyDetails?.child3Nationality?.name?.toProperCase() : ''}`,
        outerMargin + 150, // adjust x position to align with label
        gap
    );


    currentY += familyDetailsHeight;

    const contactDetailsHeight = 75;
    // const itHarwareSection = 25;
    doc.setFillColor(224, 240, 255);
    doc.setTextColor(0, 0, 0);
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, headerHeight, "FD");
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.text(
        "Contact Details",
        pageWidth / 2,
        currentY + headerHeight / 2,
        { align: "center", baseline: "middle" }
    );

    gap = currentY + 15
    // doc.setTextColor(0, 0, 0); // black for label
    // doc.text("Employee Name:                   ", outerMargin + 2, gap);

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Address (UAE):                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.contacts?.contactAddressUAE,
        outerMargin + 45, // adjust x position to align with label
        gap
    );
    gap += rowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Address (Home):                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.contacts?.contactAddressHomeCountry,
        outerMargin + 45, // adjust x position to align with label
        gap
    );
    gap += rowGap
    doc.setTextColor(0, 0, 0);
    doc.text("Contact No (UAE)):                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.contacts?.phoneNumberUAE,
        outerMargin + 45, // adjust x position to align with label
        gap
    );

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Contact No (Home):                 ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.contacts?.phoneNumberHomeCountry,
        outerMargin + 150, // adjust x position to align with label
        gap
    );

    gap += rowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Personal Email ID:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.contacts?.emailId,
        outerMargin + 45, // adjust x position to align with label
        gap
    );


    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Emergency Contact No:                 ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.contacts?.emergencyContactNumber,
        outerMargin + 150, // adjust x position to align with label
        gap
    );

    gap += rowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Passport No:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.passport?.passportNo,
        outerMargin + 45, // adjust x position to align with label
        gap
    );


    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Issue date:                 ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        moment(manpowerData.employeeInfo?.passport?.issueDate).format("DD-MMM-YYYY"),
        outerMargin + 150, // adjust x position to align with label
        gap
    );

    gap += rowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Expiry Date:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        moment(manpowerData.employeeInfo?.passport?.expiryDate).format("DD-MMM-YYYY"),
        outerMargin + 45, // adjust x position to align with label
        gap
    );




    gap += rowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Uploaded Documents:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        `${manpowerData?.employeeInfo?.passport?.passportUrl && 'Passport, '} ${manpowerData?.employeeInfo?.uploadDocuments?.visitVisaUrl && 'Visit Visa, '} ${manpowerData?.employeeInfo?.uploadDocuments?.cancellationVisaUrl && 'Cancellation, '} ${manpowerData?.employeeInfo?.uploadDocuments?.educationCertificatesUrl && 'Education Certificates'}`,
        outerMargin + 45, // adjust x position to align with label
        gap
    );




    // currentY += contactDetailsHeight;
    // doc.setTextColor(0, 0, 0);
    // doc.setFillColor(224, 240, 255);
    // doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, headerHeight, "FD");
    // doc.setFont("times", "italic");
    // doc.setFontSize(13);
    // doc.text(
    //     "Approvals",
    //     pageWidth / 2,
    //     currentY + headerHeight / 2,
    //     { align: "center", baseline: "middle" }
    // );

    // currentY += headerHeight;
    // // Define custom column widths
    // const equalColWidth = (pageWidth - 2 * outerMargin) / 3;

    // // Define custom row heights
    // const rowHeights = [12, 25]; // Row 1 shorter, Row 2 taller

    // // Draw 2x4 table with custom row heights
    // let yPos = currentY;
    // let cellYPositions = []; // store top Y for each row
    // for (let r = 0; r < 2; r++) {
    //     let xPos = outerMargin;
    //     cellYPositions[r] = yPos;
    //     for (let c = 0; c < 3; c++) {
    //         doc.rect(xPos, yPos, equalColWidth, rowHeights[r], "S");
    //         xPos += equalColWidth;
    //     }
    //     yPos += rowHeights[r];
    // }

    // // Labels
    // doc.setFont("times", "normal");
    // doc.setFontSize(13);

    // // Row 1 (centered text)
    // const row1Labels = ["HR Manager", "COO", "CFO"];
    // row1Labels.forEach((label, i) => {
    //     const xCenter = outerMargin + (i * equalColWidth) + (equalColWidth / 2);
    //     const yCenter = cellYPositions[0] + (rowHeights[0] / 2);
    //     doc.text(label, xCenter, yCenter, { align: "center", baseline: "middle" });
    // });

    // // Row 2 (empty now, but centered)
    // const row2Values = ["", "", ""];
    // row2Values.forEach((val, i) => {
    //     const xCenter = outerMargin + (i * equalColWidth) + (equalColWidth / 2);
    //     const yCenter = cellYPositions[1] + (rowHeights[1] / 2);
    //     doc.text(val, xCenter, yCenter, { align: "center", baseline: "middle" });
    // });

    // // Update currentY to move below the new box
    // currentY = yPos;


    // 8️⃣ Form Version at bottom
    const footerText = "ABS/HR/N/ F01 C (25/04/2022) V.1";
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

    doc.output("dataurlnewwindow");
};

export function renderBeneficiaryTemplate(doc, manpowerData) {

    const startX = 5; // instead of 10
    const startY = 5;
    const totalWidth = 196;
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const outerMargin = startX; // outer border margin
    let currentY = startY;
    const rowGap = 9;

    let gap = 15;

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
        "BENEFICIARY DECLARATION FORM",
        pageWidth / 2,
        currentY + titleHeight / 2,
        { align: "center", baseline: "middle" }
    );
    doc.setTextColor(0, 0, 0);
    currentY += titleHeight;

    // 3️⃣ Requester Information Section (2 rows × 4 columns)
    const headerHeight = 8;   // shorter header row
    const rowHeight = 25;      // taller table rows
    const sectionHeight = headerHeight + rowHeight * 2; // total section height
    const colWidth = (pageWidth - 2 * outerMargin) / 4;

    // Light blue header
    doc.setFillColor(224, 240, 255);
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, headerHeight, "FD");
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.text(
        "Employee Details",
        pageWidth / 2,
        currentY + headerHeight / 2,
        { align: "center", baseline: "middle" }
    );

    doc.setFont("times", "normal");
    currentY += headerHeight;
    gap = currentY + rowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Employee Name:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.fullName,
        outerMargin + 45, // adjust x position to align with label
        gap
    );

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Employee ID:                   ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.empId,
        outerMargin + 150, // adjust x position to align with label
        gap
    );

    gap += rowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Department:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.departmentName,
        outerMargin + 45, // adjust x position to align with label
        gap
    );

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Designation:                   ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.designationName,
        outerMargin + 150, // adjust x position to align with label
        gap
    );



    currentY += rowHeight;
    const declarationDetailsHeight = 120;
    // const itHarwareSection = 25;
    doc.setFillColor(224, 240, 255);
    doc.setTextColor(0, 0, 0);
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, headerHeight, "FD");
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.text(
        "Declaration",
        pageWidth / 2,
        currentY + headerHeight / 2,
        { align: "center", baseline: "middle" }
    );

    gap = currentY + 18
    // doc.setTextColor(0, 0, 0); // black for label
    // doc.text("Employee Name:                   ", outerMargin + 2, gap);

    doc.setFont("times", "normal");
    doc.setTextColor(0, 0, 0); // black for label
    doc.text(`I, the undersigned`, outerMargin + 2, gap);

    doc.setTextColor(70, 70, 70);
    doc.text(`${manpowerData.fullName?.toProperCase()}`, outerMargin + 40, gap);

    doc.setTextColor(0, 0, 0);
    doc.text(`, holder of`, outerMargin + 40 + manpowerData.fullName.length * 2 + 15, gap);

    doc.setTextColor(70, 70, 70);
    doc.text(`${manpowerData.nationalityName?.toProperCase()}`, outerMargin + 40 + manpowerData.fullName.length * 2 + 20 + 20, gap);

    doc.setTextColor(0, 0, 0);
    doc.text(`Passport No.`, outerMargin + 40 + manpowerData.fullName.length * 2 + 20 + manpowerData.nationalityName.length * 2 + 30, gap);

    doc.setTextColor(70, 70, 70);
    doc.text(`${manpowerData.employeeInfo?.passport?.passportNo} ,`, outerMargin + 40 + manpowerData.fullName.length * 2 + 20 + manpowerData.nationalityName.length * 2 + 45 + 15, gap);
    gap += rowGap

    doc.setTextColor(0, 0, 0);
    doc.text(`as an employee of Acero Building Systems, insured under the company's Group Life Insurance Policy do `, outerMargin + 2, gap);

    gap += rowGap

    doc.text(`hereby appoint`, outerMargin + 2, gap);

    doc.setTextColor(70, 70, 70);
    doc.text(`${manpowerData.employeeInfo?.beneficiaryInfo?.name?.toProperCase()}`, outerMargin + 40, gap);

    doc.setTextColor(0, 0, 0);
    doc.text(`(relationship)`, outerMargin + 40 + manpowerData.employeeInfo?.beneficiaryInfo?.name?.length * 2 + 15, gap);

    doc.setTextColor(70, 70, 70);
    doc.text(`${manpowerData.employeeInfo?.beneficiaryInfo?.relation?.toProperCase()}`, outerMargin + 40 + manpowerData.employeeInfo?.beneficiaryInfo?.name?.length * 2 + 15 + 35, gap);

    doc.setTextColor(0, 0, 0);
    doc.text(`to be the sole beneficiary`, outerMargin + 40 + manpowerData.employeeInfo?.beneficiaryInfo?.name?.length * 2 + 15 + 35 + manpowerData.employeeInfo?.beneficiaryInfo?.relation.length * 2 + 10, gap);

    gap += rowGap
    doc.text(`to receive all amounts and compensation payable under the life insurance policy and my end of service`, outerMargin + 2, gap);

    gap += rowGap
    doc.text(`benefits in the event of my death.`, outerMargin + 2, gap);

    gap += rowGap + 10
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Address And Phone No Of The Nominee:                 ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.setFont("times", "normal");
    doc.setFontSize(13);
    gap += 6
    doc.text(
        manpowerData.employeeInfo?.beneficiaryInfo?.addressAndContact?.toProperCase(),
        outerMargin + 2, // adjust x position to align with label
        gap
    );



    gap += rowGap + 5

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Employee Signature:                 ", outerMargin + 2, gap);

    doc.setTextColor(70, 70, 70); // black for label
    doc.text(manpowerData.employeeInfo?.beneficiaryInfo?.declaration?.employeeSignature, outerMargin + 45, gap);

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Declaration Date:                 ", outerMargin + 105, gap);

    doc.setTextColor(70, 70, 70); // black for label
    doc.text(moment(manpowerData.employeeInfo?.beneficiaryInfo?.declaration?.declarationDate).format("DD-MMM-YYYY"), outerMargin + 150, gap);


    gap += rowGap + 6
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(
        `Note: When ever you have any changes in the nominee and in their contact details, please contact the HR/ADMIN department and update`,
        outerMargin + 2, // adjust x position to align with label
        gap
    );
    gap += 5
    doc.text(
        `the changes accordingly.`,
        outerMargin + 2, // adjust x position to align with label
        gap
    );

    currentY += declarationDetailsHeight;

    const contactDetailsHeight = 75;
    // const itHarwareSection = 25;
    doc.setFillColor(224, 240, 255);
    doc.setTextColor(0, 0, 0);
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, headerHeight, "FD");
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.text(
        "For HR & Admin Use Only",
        pageWidth / 2,
        currentY + headerHeight / 2,
        { align: "center", baseline: "middle" }
    );

    gap = currentY + 15
    // doc.setTextColor(0, 0, 0); // black for label
    // doc.text("Employee Name:                   ", outerMargin + 2, gap);
    doc.setFont("times", "normal");
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Remarks:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.beneficiaryInfo?.hrAdmin?.remarks,
        outerMargin + 45, // adjust x position to align with label
        gap
    );
    gap += rowGap + 5

    doc.setTextColor(0, 0, 0);
    doc.text("HR/Admin Dep. Sign:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.beneficiaryInfo?.hrAdmin?.departmentSignature,
        outerMargin + 45, // adjust x position to align with label
        gap
    );

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Signature Date:                 ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        `${manpowerData.employeeInfo?.beneficiaryInfo?.hrAdmin?.departmentSignatureDate ? moment(manpowerData.employeeInfo?.beneficiaryInfo?.hrAdmin?.departmentSignatureDate).format("DD-MMM-yyyy") : ''}`,
        outerMargin + 150, // adjust x position to align with label
        gap
    );

    gap += rowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Head Of HR/Admin:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.beneficiaryInfo?.hrAdmin?.headHrAdminSignature,
        outerMargin + 45, // adjust x position to align with label
        gap
    );


    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Signature Date:                 ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        `${manpowerData.employeeInfo?.beneficiaryInfo?.hrAdmin?.headSignatureDate ? moment(manpowerData.employeeInfo?.beneficiaryInfo?.hrAdmin?.headSignatureDate).format("DD-MMM-YYYY") : ''}`,
        outerMargin + 150, // adjust x position to align with label
        gap
    );


    // 8️⃣ Form Version at bottom
    const footerText = "ABS/HR/C/F02 (25/04/2022) V. 1";
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

    doc.output("dataurlnewwindow");
};


export function renderConsentTemplate(doc, manpowerData) {

    const startX = 5; // instead of 10
    const startY = 5;
    const totalWidth = 196;
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const outerMargin = startX; // outer border margin
    let currentY = startY;
    const rowGap = 9;

    let gap = 15;

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
        "CONSENT FORM (ACCOMMODATION/TRANSPORTATION)",
        pageWidth / 2,
        currentY + titleHeight / 2,
        { align: "center", baseline: "middle" }
    );
    doc.setTextColor(0, 0, 0);
    currentY += titleHeight;

    // 3️⃣ Requester Information Section (2 rows × 4 columns)
    const headerHeight = 8;   // shorter header row
    const rowHeight = 30;      // taller table rows
    const sectionHeight = headerHeight + rowHeight * 2; // total section height
    const colWidth = (pageWidth - 2 * outerMargin) / 4;

    // Light blue header
    doc.setFillColor(224, 240, 255);
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, headerHeight, "FD");
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.text(
        "Employee Details",
        pageWidth / 2,
        currentY + headerHeight / 2,
        { align: "center", baseline: "middle" }
    );

    doc.setFont("times", "normal");
    currentY += headerHeight;
    gap = currentY + rowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Employee Name:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.fullName,
        outerMargin + 45, // adjust x position to align with label
        gap
    );

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Employee ID:                   ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.empId,
        outerMargin + 150, // adjust x position to align with label
        gap
    );

    gap += rowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Department:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.departmentName,
        outerMargin + 45, // adjust x position to align with label
        gap
    );

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Designation:                   ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.designationName,
        outerMargin + 150, // adjust x position to align with label
        gap
    );

    gap += rowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Date Of Request:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        moment(manpowerData.employeeInfo?.consentInfo?.createdAt).format("DD-MMM-yyyy"),
        outerMargin + 45, // adjust x position to align with label
        gap
    );

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Category:                   ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.categoryName,
        outerMargin + 150, // adjust x position to align with label
        gap
    );


    currentY += rowHeight;
    const declarationDetailsHeight = 55;
    // const itHarwareSection = 25;
    doc.setFillColor(224, 240, 255);
    doc.setTextColor(0, 0, 0);
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, headerHeight, "FD");
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.text(
        "Transportation",
        pageWidth / 2,
        currentY + headerHeight / 2,
        { align: "center", baseline: "middle" }
    );

    gap = currentY + 18
    // doc.setTextColor(0, 0, 0); // black for label
    // doc.text("Employee Name:                   ", outerMargin + 2, gap);
    doc.setFont("times", "normal");
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Place / PickUp Point:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.consentInfo?.pickUpPoint,
        outerMargin + 45, // adjust x position to align with label
        gap
    );

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("City:                   ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.consentInfo?.pickUpCity,
        outerMargin + 150, // adjust x position to align with label
        gap
    );

    gap += rowGap
    // doc.setTextColor(0, 0, 0); // black for label
    // doc.text("Employee Name:                   ", outerMargin + 2, gap);
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Company Provided Transport:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        `${manpowerData.employeeInfo?.consentInfo?.transportationPreference === 'company_provided' ? 'Yes' : 'No'}`,
        outerMargin + 65, // adjust x position to align with label
        gap
    );

    gap += rowGap + 8
    // doc.setTextColor(0, 0, 0); // black for label
    // doc.text("Employee Name:                   ", outerMargin + 2, gap);
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("I hereby authorize the company to deduct AED. ", outerMargin + 2, gap);


    doc.setTextColor(70, 70, 70); // black for label
    doc.text(manpowerData.employeeInfo?.consentInfo?.deductionAmountTransportation ? manpowerData.employeeInfo?.consentInfo?.deductionAmountTransportation : '0', outerMargin + 98, gap);

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("/- per month for the transportation facility", outerMargin + 115, gap);

    gap += 5
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("provided by company.", outerMargin + 2, gap);


    currentY += declarationDetailsHeight;

    const accomodationHeight = 100;
    // const itHarwareSection = 25;
    doc.setFillColor(224, 240, 255);
    doc.setTextColor(0, 0, 0);
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, headerHeight, "FD");
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.text(
        "Accommodation",
        pageWidth / 2,
        currentY + headerHeight / 2,
        { align: "center", baseline: "middle" }
    );

    gap = currentY + 18
    doc.setFont("times", "normal");
    // doc.setTextColor(0, 0, 0); // black for label
    // doc.text("Employee Name:                   ", outerMargin + 2, gap);
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Flat/Room No:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.consentInfo?.flatRoomNo ? manpowerData.employeeInfo?.consentInfo?.flatRoomNo : '',
        outerMargin + 45, // adjust x position to align with label
        gap
    );

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Accommodated Date:                   ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.consentInfo?.accommodatedDate ? moment(manpowerData.employeeInfo?.consentInfo?.accommodatedDate).format("DD-MMM-yyyy") : '',
        outerMargin + 150, // adjust x position to align with label
        gap
    );

    gap += rowGap
    // doc.setTextColor(0, 0, 0); // black for label
    // doc.text("Employee Name:                   ", outerMargin + 2, gap);

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Location:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.consentInfo?.location ? manpowerData.employeeInfo?.consentInfo?.location : '',
        outerMargin + 45, // adjust x position to align with label
        gap
    );

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Accommodation Type:                   ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        `${manpowerData.employeeInfo?.consentInfo?.accomodationPreference === 'own_accomodation' ? 'Own Accommodation' : 'Company Provided'}`,
        outerMargin + 150, // adjust x position to align with label
        gap
    );

    gap += rowGap + 6
    // doc.setTextColor(0, 0, 0); // black for label
    // doc.text("Employee Name:                   ", outerMargin + 2, gap);
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("I hereby authorize the company to deduct AED. ", outerMargin + 2, gap);


    doc.setTextColor(70, 70, 70); // black for label
    doc.text(manpowerData.employeeInfo?.consentInfo?.deductionAmountAccommodation ? manpowerData.employeeInfo?.consentInfo?.deductionAmountAccommodation : '0', outerMargin + 98, gap);

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("/- per month for the accommodation facility", outerMargin + 115, gap);

    gap += 5
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("provided by company.", outerMargin + 2, gap);


    gap += rowGap + 10
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Employee Sign:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.consentInfo?.declaration?.employeeSignature,
        outerMargin + 45, // adjust x position to align with label
        gap
    );

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Date:                   ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        moment(manpowerData.employeeInfo?.consentInfo?.declaration?.declarationDate).format("DD-MMM-yyyy"),
        outerMargin + 150, // adjust x position to align with label
        gap
    );

    gap += rowGap + 10
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Guidelines to be followed while using the above facility:", outerMargin + 2, gap);

    gap += 5
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("•	Shifting/Moving out from the allotted room without HR/ADMIN approval is not permitted.", outerMargin + 4, gap);

    gap += 5
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("•	Changing the picking point without HR/ADMIN approval is not permitted.", outerMargin + 4, gap);

    gap += 5
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("•	Employee should inform the HR/ADMIN while moving out from the accommodation after separation.", outerMargin + 4, gap);

    gap += 5
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("•	Employee should follow the company’s accommodation guidelines and violating the same will be penalized.", outerMargin + 4, gap);

    gap += 5
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("•	Employee should follow the company’s transportation guidelines and violating the same will be penalized.", outerMargin + 4, gap);




    // 8️⃣ Form Version at bottom
    const footerText = "ABS/HR/N/ F09 (01/08/2025) V.2";
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

    doc.output("dataurlnewwindow");
};


export function renderNdaTemplate(doc, manpowerData) {

    const startX = 5; // instead of 10
    const startY = 5;
    const totalWidth = 196;
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const outerMargin = startX; // outer border margin
    let currentY = startY;
    const rowGap = 9;
    const smallrowGap = 5;

    let gap = 15;

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
        "NONDISCLOSURE AGREEMENT",
        pageWidth / 2,
        currentY + titleHeight / 2,
        { align: "center", baseline: "middle" }
    );
    doc.setTextColor(0, 0, 0);
    currentY += titleHeight;

    // 3️⃣ Requester Information Section (2 rows × 4 columns)
    const headerHeight = 8;   // shorter header row
    const rowHeight = 30;      // taller table rows
    const sectionHeight = headerHeight + rowHeight * 2; // total section height
    const colWidth = (pageWidth - 2 * outerMargin) / 4;


    doc.setFontSize(10);
    doc.setFont("times", "normal");
    gap = currentY + 5
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("This agreement is made as of (date)", outerMargin + 2, gap);

    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        moment(manpowerData.employeeInfo?.ndaInfo?.aggrementDate).format("DD-MMM-yyyy"),
        outerMargin + 60, // adjust x position to align with label
        gap
    );

    doc.setTextColor(0, 0, 0); // black for label
    doc.text(", by and between Acero Building Systems and its affiliate Companies with ", outerMargin + 85, gap);

    gap += smallrowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("principal offices at Dubai, UAE , (The Company), and ", outerMargin + 2, gap);


    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData?.fullName,
        outerMargin + 100, // adjust x position to align with label
        gap
    );

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("(The Employee).", outerMargin + 155, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value


    gap += rowGap
    doc.setFont("times", "bold");
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Purpose:                   ", outerMargin + 2, gap);

    doc.setFont("times", "normal");
    doc.text("The Company and The Employee wish to enter an employment relationship in connection with which The Company will disclose", outerMargin + 17, gap);

    gap += smallrowGap

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("its Confidential Information (as defined below) to the Employee (The Relationship).", outerMargin + 2, gap);

    gap += rowGap
    doc.setFont("times", "bold");
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Definition of Confidential Information:", outerMargin + 2, gap);

    doc.setFont("times", "normal");
    doc.text("Confidential Information means any information or know-how, including but not limited to, that", outerMargin + 62, gap);

    gap += smallrowGap
    doc.text("which relates to business strategy, research, product plans, products, services, customers, markets, software, developments, inventions, ", outerMargin + 2, gap);
    gap += smallrowGap
    doc.text("processes, designs, marketing or finances of The Company, which all shall be deemed as Confidential Information. Confidential ", outerMargin + 2, gap);
    gap += smallrowGap
    doc.text("Information does not include information or know how which (i) is in the possession of the employee at the time of disclosure as shown ", outerMargin + 2, gap);
    gap += smallrowGap
    doc.text("by the employee’s files and records immediately prior to the time of disclosure, or (ii) prior to or after the time of disclosure becomes part ", outerMargin + 2, gap);
    gap += smallrowGap
    doc.text("of the public knowledge or literature other than as a result of any improper inaction or action of The Employee or, (iii) is approved by The ", outerMargin + 2, gap);
    gap += smallrowGap
    doc.text("Company, in writing, for release.", outerMargin + 2, gap);

    gap += rowGap
    doc.setFont("times", "bold");
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Nondisclosure of Confidential Information:", outerMargin + 2, gap);

    doc.setFont("times", "normal");
    doc.text("The Employee agrees not to use any Confidential Information disclosed to him/her by The ", outerMargin + 68, gap);

    gap += smallrowGap
    doc.setFont("times", "normal");
    doc.text("Company for any purpose outside of its own operations. The Employee will not disclose any Confidential Information of the Company to ", outerMargin + 2, gap);

    gap += smallrowGap
    doc.setFont("times", "normal");
    doc.text("parties outside the Relationship or to other employees of The Company other than employees or agents under appropriate burden of ", outerMargin + 2, gap);

    gap += smallrowGap
    doc.setFont("times", "normal");
    doc.text("confidentiality and who are required to have the information in order to carry out their duties. The Employee agrees that he/she will take ", outerMargin + 2, gap);

    gap += smallrowGap
    doc.setFont("times", "normal");
    doc.text("all reasonable measures to protect the secrecy of and avoid disclosure or use of Confidential Information of The Company in order to ", outerMargin + 2, gap);

    gap += smallrowGap
    doc.setFont("times", "normal");
    doc.text("prevent it from falling into the public domain or the possession of persons other than those persons authorized under this Agreement to ", outerMargin + 2, gap);

    gap += smallrowGap
    doc.setFont("times", "normal");
    doc.text("have any such information.", outerMargin + 2, gap);


    gap += rowGap
    doc.setFont("times", "bold");
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Publicity:                   ", outerMargin + 2, gap);

    doc.setFont("times", "normal");
    doc.text("The Employee will not, without prior consent of the other party, disclose the confidential information of the company disclosed ", outerMargin + 18, gap);

    gap += smallrowGap
    doc.setFont("times", "normal");
    doc.text("to the employee to any other person under this agreement, and will not disclose any discussions or negotiations taking place between ", outerMargin + 2, gap);

    gap += smallrowGap
    doc.setFont("times", "normal");
    doc.text("the parties, except as required by law and then only with prior notice to The Company.", outerMargin + 2, gap);

    gap += rowGap
    doc.setFont("times", "bold");
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Return of Materials:                   ", outerMargin + 2, gap);

    doc.setFont("times", "normal");
    doc.text("Any materials or documents that have been furnished by The Company to the Employee in connection with The ", outerMargin + 35, gap);

    gap += smallrowGap
    doc.setFont("times", "normal");
    doc.text("Relationship will be promptly returned by The Employee, accompanied by all copies of such documentation or certification of destruction, ", outerMargin + 2, gap);

    gap += smallrowGap
    doc.setFont("times", "normal");
    doc.text("at the time of the Employee’s separation from the Company.", outerMargin + 2, gap);

    gap += rowGap
    doc.setFont("times", "bold");
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Patent or Copyright Infringement:                   ", outerMargin + 2, gap);

    doc.setFont("times", "normal");
    doc.text("The company has not granted any rights to The Employee with regards to The Company’s rights ", outerMargin + 56, gap);

    gap += smallrowGap
    doc.setFont("times", "normal");
    doc.text("to patents and copyrights. The Employee is not authorized to reproduce the Company’s material, to benefit people not in the Company’s ", outerMargin + 2, gap);

    gap += smallrowGap
    doc.setFont("times", "normal");
    doc.text("direct employment.", outerMargin + 2, gap);

    gap += rowGap
    doc.setFont("times", "bold");
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Period:                   ", outerMargin + 2, gap);

    doc.setFont("times", "normal");
    doc.text("The forgoing commitments of each party shall be valid for a period of two years from separation of the employment.", outerMargin + 15, gap);


    gap += rowGap
    doc.setFont("times", "bold");
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Successors and Assigns:                   ", outerMargin + 2, gap);

    doc.setFont("times", "normal");
    doc.text("This agreement shall be binding upon and for the benefits of the undersigned parties, their successors and ", outerMargin + 40, gap);

    gap += smallrowGap
    doc.setFont("times", "normal");
    doc.text("assigns, provided that Confidential Information of The Company may not be assigned without the prior written consent of The Company. ", outerMargin + 2, gap);

    gap += smallrowGap
    doc.setFont("times", "normal");
    doc.text("Failure to enforce any provision of this Agreement shall not constitute a waiver of any term hereof.", outerMargin + 2, gap);

    gap += rowGap
    doc.setFont("times", "bold");
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Governing Law:                   ", outerMargin + 2, gap);

    doc.setFont("times", "normal");
    doc.text("This agreement shall be governed by and enforced in accordance with the laws of the UAE employed region and shall ", outerMargin + 28, gap);

    gap += smallrowGap
    doc.setFont("times", "normal");
    doc.text("be binding upon The Employee in the UAE and worldwide", outerMargin + 2, gap);

    gap += rowGap
    doc.setFont("times", "bold");
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Remedies:                   ", outerMargin + 2, gap);

    doc.setFont("times", "normal");
    doc.text("The Employee agrees that any violation or threatened violation may cause irreparable injury, both financial and strategic, to", outerMargin + 21, gap);

    gap += smallrowGap
    doc.setFont("times", "normal");
    doc.text("The Company and in addition to any and all remedies that may be available, in law, in equity or otherwise; The Company may choose to ", outerMargin + 2, gap);

    gap += smallrowGap
    doc.setFont("times", "normal");
    doc.text("pursue legal action against The Employee.", outerMargin + 2, gap);

    gap += rowGap
    doc.setFont("times", "normal");
    doc.text("In Witness whereof, this Nondisclosure Agreement is executed as of the date first above written:", outerMargin + 2, gap);

    gap += rowGap
    doc.setFont("times", "normal");
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("For Acero Building Systems:", outerMargin + 2, gap);
    doc.text("The Employee:", outerMargin + 105, gap);

    gap += rowGap - 1

    doc.text("Name:", outerMargin + 2, gap);
    doc.text("Employee Name:", outerMargin + 105, gap);

    gap += rowGap - 1

    doc.text("Signature:", outerMargin + 2, gap);
    doc.text("Signature:", outerMargin + 105, gap);
    gap += smallrowGap

    doc.text("Date:", outerMargin + 2, gap);
    doc.text("Date:", outerMargin + 105, gap);


    // 8️⃣ Form Version at bottom
    const footerText = "ABS/HR/C/F06 (01/08/2025) V. 2";
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

    doc.output("dataurlnewwindow");
};

export function renderOrientationTemplate(doc, manpowerData) {

    const startX = 5; // instead of 10
    const startY = 5;
    const totalWidth = 196;
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const outerMargin = startX; // outer border margin
    let currentY = startY;
    const rowGap = 9;
    const smallrowGap = 5;
    const padding = 6;
    const lineHeight = 5;

    const defaultRowHeight = 15;

    let gap = 15;

    // 1️⃣ Outer border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.1); // very thin border
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, pageHeight - 2 * startY);

    // 2️⃣ Main Title Section (merged with outer border)
    const titleHeight = 16;
    // doc.setFillColor(100, 149, 237); // blue
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, titleHeight); // Fill + Draw
    doc.setFont("times", "bolditalic");
    doc.setFontSize(16);
    // doc.setTextColor(255, 255, 255);
    doc.text(
        "EMPLOYEE ORIENTATION FORM",
        pageWidth / 2,
        currentY + titleHeight / 2,
        { align: "center", baseline: "middle" }
    );
    doc.setTextColor(0, 0, 0);
    currentY += titleHeight;

    // 3️⃣ Requester Information Section (2 rows × 4 columns)
    const headerHeight = 8;   // shorter header row
    const rowHeight = 30;      // taller table rows
    const sectionHeight = headerHeight + rowHeight * 2; // total section height
    const colWidth = (pageWidth - 2 * outerMargin) / 4;

    // Light blue header
    doc.setFillColor(224, 240, 255);
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, headerHeight, "FD");
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.text(
        "Employee Details",
        pageWidth / 2,
        currentY + headerHeight / 2,
        { align: "center", baseline: "middle" }
    );

    doc.setFont("times", "normal");
    currentY += headerHeight;
    gap = currentY + rowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Employee Name:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.fullName,
        outerMargin + 45, // adjust x position to align with label
        gap
    );

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Employee ID:                   ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.empId,
        outerMargin + 150, // adjust x position to align with label
        gap
    );

    gap += rowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Designation:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.designationName,
        outerMargin + 45, // adjust x position to align with label
        gap
    );

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Grade:                   ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.employeeInfo?.grade,
        outerMargin + 150, // adjust x position to align with label
        gap
    );

    gap += rowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Department:                   ", outerMargin + 2, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        manpowerData.departmentName,
        outerMargin + 45, // adjust x position to align with label
        gap
    );

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Date Of Joining:                   ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70); // lighter black for value
    doc.text(
        moment(manpowerData.employeeInfo?.dateOfJoining).format("DD-MMM-yyyy"),
        outerMargin + 150, // adjust x position to align with label
        gap
    );


    currentY += rowHeight;
    const declarationDetailsHeight = 55;
    // const itHarwareSection = 25;
    doc.setFillColor(224, 240, 255);
    doc.setTextColor(0, 0, 0);
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, headerHeight, "FD");
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.text(
        "Orientation Program Details",
        pageWidth / 2,
        currentY + headerHeight / 2,
        { align: "center", baseline: "middle" }
    );

    currentY += headerHeight;

    doc.setFont("times", "normal");
    const colWidths = [12, 90, 53, 45];
    const headers = ["S.No", "Program Contents", "Conducted By", "Sign & Date"];

    // === Orientation Data ===
    const orientationData = [
        { sno: 1, program: "About Acero Building Systems", conductedBy: "HR & ADMIN Department" },
        {
            sno: 2, program: `HR Policy & Procedures:
 • Working Days/Hours
 • Leave Entitlement
 • Performance Assessments
 • Training and Advancement
 • Legal Requirements
 • Employee Relations`, conductedBy: "HR & ADMIN Department"
        },
        { sno: 3, program: "Administrative Facilities", conductedBy: "HR & ADMIN Department" },
        { sno: 4, program: "Introduction of Employee’s Department", conductedBy: "Employee’s Department" },
        { sno: 5, program: "Employee’s Roles and Responsibilities", conductedBy: "Employee’s Department" },
        { sno: 6, program: "Initial Job instructions and assignments", conductedBy: "Reporting Head" },
        { sno: 7, program: "Company Quality Policy and Procedure", conductedBy: "QA/QC Department" },
        { sno: 8, program: "QMS/EMS/SMS Awareness", conductedBy: "Management Representative" },
        { sno: 9, program: "Health & Safety Policy and Procedure", conductedBy: "HSE Department" },
        { sno: 10, program: "IT Access and Policy (For Staffs)", conductedBy: "IT Department" },
    ];

    // === Draw header row ===
    let x = outerMargin;

    headers.forEach((header, i) => {
        doc.setFont("times", "normal");
        doc.setFillColor(224, 240, 255); // Set fill color for each cell
        doc.setDrawColor(0); // Optional: border color
        doc.rect(x, currentY, colWidths[i], headerHeight, "FD"); // Fill + Draw border
        doc.setTextColor(0, 0, 0); // Text color
        doc.text(header, x + colWidths[i] / 2, currentY + headerHeight / 2, {
            align: "center",
            baseline: "middle",
        });
        x += colWidths[i];
    });
    currentY += headerHeight;

    // === Draw data rows ===
    orientationData.forEach((row, rowIndex) => {
        x = outerMargin;

        // Calculate dynamic row height based on Program Contents text
        const programLines = doc.splitTextToSize(row.program, colWidths[1] - 4);
        let rowHeight = Math.max(lineHeight * programLines.length + padding - 1, 14); // minimum row height 25

        // Column 1: S.No
        doc.rect(x, currentY, colWidths[0], rowHeight);
        doc.text(String(row.sno), x + colWidths[0] / 2, currentY + rowHeight / 2, {
            align: "center",
            baseline: "middle",
        });
        x += colWidths[0];

        // Column 2: Program Contents (left-aligned, vertically centered)
        doc.rect(x, currentY, colWidths[1], rowHeight);
        const programY = currentY + (rowHeight - programLines.length * lineHeight) / 2 + lineHeight / 2;
        doc.text(programLines, x + 2, programY, { align: "left", baseline: "middle" });
        x += colWidths[1];

        // Column 3: Conducted By (centered)
        doc.rect(x, currentY, colWidths[2], rowHeight);
        const conductedLines = doc.splitTextToSize(row.conductedBy, colWidths[2] - 4);
        const conductedY = currentY + (rowHeight - conductedLines.length * lineHeight) / 2 + lineHeight / 2;
        doc.text(conductedLines, x + colWidths[2] / 2, conductedY, { align: "center", baseline: "middle" });
        x += colWidths[2];

        // Column 4: Name & Sign (left-aligned, vertically centered)
        doc.rect(x, currentY, colWidths[3], rowHeight);
        const stepKey = `step${rowIndex + 1}`; // match row index to step1, step2, ...
        const stepData = manpowerData.employeeInfo?.orientationInfo?.steps?.[stepKey];
        if (stepData) {
            doc.setTextColor(70, 70, 70);
            const nameSign = `${stepData?.signature || ""}\n${stepData?.date ? moment(stepData?.date).format("DD-MMM-yyyy") : ""}`;

            const lines = doc.splitTextToSize(nameSign, colWidths[3] - 4);
            const textY = currentY + (rowHeight - lines.length * lineHeight) / 2 + lineHeight / 2;
            doc.text(lines, x + 2, textY, { align: "left", baseline: "middle" });

            doc.setTextColor(0, 0, 0);
        }

        currentY += rowHeight;
    });

    doc.setFont("times", "normal");
    gap = currentY + rowGap
    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Attended By (New Employee)                   ", outerMargin + 2, gap);
    doc.text("Endorsed by (Department Head)", outerMargin + 105, gap);
    gap += rowGap - 1
    doc.text("Sign: ", outerMargin + 2, gap);
    doc.text("Sign: ", outerMargin + 105, gap);

    doc.setTextColor(70, 70, 70);
    doc.text(manpowerData.employeeInfo?.orientationInfo?.attendedBy?.signature ? manpowerData.employeeInfo?.orientationInfo?.attendedBy?.signature : '', outerMargin + 20, gap);

    doc.text(manpowerData.employeeInfo?.orientationInfo?.endorsedBy?.signature ? manpowerData.employeeInfo?.orientationInfo?.endorsedBy?.signature : '', outerMargin + 125, gap);

    gap += smallrowGap

    doc.setTextColor(0, 0, 0);
    doc.text("Date:", outerMargin + 2, gap);
    doc.text("Date:", outerMargin + 105, gap);

    doc.setTextColor(70, 70, 70);
    doc.text(manpowerData.employeeInfo?.orientationInfo?.attendedBy?.date ? moment(manpowerData.employeeInfo?.orientationInfo?.attendedBy?.date).format("DD-MMM-yyyy") : '', outerMargin + 20, gap);

    doc.text(manpowerData.employeeInfo?.orientationInfo?.endorsedBy?.date ? moment(manpowerData.employeeInfo?.orientationInfo?.endorsedBy?.date).format("DD-MMM-yyyy") : '', outerMargin + 125, gap);

    gap += rowGap - 1

    doc.setTextColor(0, 0, 0); // black for label
    doc.text("Reviewed by (HR/ADMIN Department)", outerMargin + 2, gap);
    doc.text("Approved by Head of HR", outerMargin + 105, gap);
    gap += rowGap - 1
    doc.text("Sign: ", outerMargin + 2, gap);
    doc.text("Sign: ", outerMargin + 105, gap);
    doc.setTextColor(70, 70, 70);
    doc.text(manpowerData.employeeInfo?.orientationInfo?.reviewedBy?.signature, outerMargin + 20, gap);


    doc.text(manpowerData.employeeInfo?.orientationInfo?.approvedBy?.signature, outerMargin + 125, gap);

    gap += smallrowGap
    doc.setTextColor(0, 0, 0);
    doc.text("Date:", outerMargin + 2, gap);
    doc.text("Date:", outerMargin + 105, gap);

    doc.setTextColor(70, 70, 70);
    doc.text(moment(manpowerData.employeeInfo?.orientationInfo?.reviewedBy?.date).format("DD-MMM-yyyy"), outerMargin + 20, gap);


    doc.text(moment(manpowerData.employeeInfo?.orientationInfo?.approvedBy?.date).format("DD-MMM-yyyy"), outerMargin + 125, gap);


    // 8️⃣ Form Version at bottom
    const footerText = "ABS/HR/N/ F04 (01/08/2025) V.2";
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

    doc.output("dataurlnewwindow");
};

export function renderBusinessTripTemplate(doc, manpowerData) {

    const startX = 5; // instead of 10
    const startY = 5;
    const totalWidth = 196;
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const outerMargin = startX; // outer border margin
    let currentY = startY;
    const rowGap = 9;
    const smallrowGap = 5;
    const padding = 6;
    const lineHeight = 5;

    const defaultRowHeight = 15;

    let gap = 15;

    // 1️⃣ Outer border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.1); // very thin border
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, pageHeight - 2 * startY);

    // 2️⃣ Main Title Section (merged with outer border)
    const titleHeight = 16;
    // doc.setFillColor(100, 149, 237); // blue
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, titleHeight); // Fill + Draw
    doc.setFont("times", "bolditalic");
    doc.setFontSize(16);
    // doc.setTextColor(255, 255, 255);
    doc.text(
        "BUSINESS TRIP REQUEST FORM",
        pageWidth / 2,
        currentY + titleHeight / 2,
        { align: "center", baseline: "middle" }
    );
    doc.setTextColor(0, 0, 0);
    currentY += titleHeight;

    // 3️⃣ Requester Information Section (2 rows × 4 columns)
    const headerHeight = 8;   // shorter header row
    const rowHeight = 30;      // taller table rows
    const sectionHeight = headerHeight + rowHeight * 2; // total section height
    const colWidth = (pageWidth - 2 * outerMargin) / 4;

    // Light blue header
    doc.setFillColor(224, 240, 255);
    doc.rect(outerMargin, currentY, pageWidth - 2 * outerMargin, headerHeight, "FD");
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.text(
        "Traveller Details",
        pageWidth / 2,
        currentY + headerHeight / 2,
        { align: "center", baseline: "middle" }
    );

    doc.setFont("times", "normal");
    currentY += headerHeight;

    if (manpowerData?.travellerType === 'employee') {
        gap = currentY + rowGap
        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Employee Name:                   ", outerMargin + 2, gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            manpowerData.travellerName?.toProperCase(),
            outerMargin + 45, // adjust x position to align with label
            gap
        );

        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Employee ID:                   ", outerMargin + 105, gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            manpowerData?.empId,
            outerMargin + 150, // adjust x position to align with label
            gap
        );

        gap += rowGap
        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Designation:                   ", outerMargin + 2, gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            manpowerData.requestedBy?.designation?.name,
            outerMargin + 45, // adjust x position to align with label
            gap
        );

        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Department:                   ", outerMargin + 105, gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            manpowerData.requestedBy?.department?.name,
            outerMargin + 150, // adjust x position to align with label
            gap
        );

        gap += rowGap
        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Place Of Visit:                   ", outerMargin + 2, gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            manpowerData.placeOfVisit,
            outerMargin + 45, // adjust x position to align with label
            gap
        );

        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Purpose Of Visit:                   ", outerMargin + 105, gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            manpowerData.purposeOfVisit,
            outerMargin + 150, // adjust x position to align with label
            gap
        );

        gap += rowGap
        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Trip Start Date:                   ", outerMargin + 2, gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            moment(manpowerData.periodFrom).format("DD-MMM-yyyy"),
            outerMargin + 45, // adjust x position to align with label
            gap
        );

        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Trip End Date:                   ", outerMargin + 105, gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            moment(manpowerData.periodTo).format("DD-MMM-yyyy"),
            outerMargin + 150, // adjust x position to align with label
            gap
        );
    }
    else {
        gap = currentY + rowGap
        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Guest Name:                   ", outerMargin + 2, gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            manpowerData.travellerName?.toProperCase(),
            outerMargin + 45, // adjust x position to align with label
            gap
        );

        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Requested By:                   ", outerMargin + 105, gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            manpowerData?.requestedBy?.displayName?.toProperCase(),
            outerMargin + 150, // adjust x position to align with label
            gap
        );


        gap += rowGap
        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Place Of Visit:                   ", outerMargin + 2, gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            manpowerData.placeOfVisit,
            outerMargin + 45, // adjust x position to align with label
            gap
        );

        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Purpose Of Visit:                   ", outerMargin + 105, gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            manpowerData.purposeOfVisit,
            outerMargin + 150, // adjust x position to align with label
            gap
        );

        gap += rowGap
        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Trip Start Date:                   ", outerMargin + 2, gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            moment(manpowerData.periodFrom).format("DD-MMM-yyyy"),
            outerMargin + 45, // adjust x position to align with label
            gap
        );

        doc.setTextColor(0, 0, 0); // black for label
        doc.text("Trip End Date:                   ", outerMargin + 105, gap);
        doc.setTextColor(70, 70, 70); // lighter black for value
        doc.text(
            moment(manpowerData.periodFrom).format("DD-MMM-yyyy"),
            outerMargin + 150, // adjust x position to align with label
            gap
        );
    }


    currentY += rowHeight;
    const declarationDetailsHeight = 55;
    // const itHarwareSection = 25;


    // 8️⃣ Form Version at bottom
    const footerText = "ABS/HR/N/ F04 (01/08/2025) V.2";
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

    doc.output("dataurlnewwindow");
}




export function sanitizeUserDocs(docs: any[]): any[] {
    return docs.map((doc: any) => {
        const plainDoc = doc.toObject ? doc.toObject() : { ...doc };
        const employment = plainDoc.employmentDetails || {};
        // console.log('plain doc', plainDoc);
        // Safely extract and simplify necessary fields
        // return {
        //     ...simplify(plainDoc),
        //     department: simplify(employment?.department),
        //     designation: simplify(employment?.designation),
        //     reportingTo: employment?.reportingTo,
        //     role: simplify(employment?.role),
        //     mobile: employment?.workMobile || '',
        //     extension: employment?.extension || '',
        //     activeLocation: simplify(employment?.activeLocation),
        //     reportingLocation: simplify(employment?.reportingLocation),
        //     organisation: simplify(employment?.organisation),
        // };
        return {
            ...simplify(plainDoc)
        };
    });
}

// Recursive simplifier to flatten ObjectIds and subdocuments
function simplify(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;

    if (obj instanceof Types.ObjectId) return obj.toString();

    const result: any = {};
    for (const key in obj) {
        const value = obj[key];
        result[key] = simplify(value);
    }

    return result;
}


export const createMongooseObjectId = (id: any) => {
    if (mongoose.Types.ObjectId.isValid(id) && new mongoose.Types.ObjectId(id).toString() === id.toString()) {
        return id;
    }
    return new mongoose.Types.ObjectId(id);
}

export const createSidebarMenuData = (data: any) => {
    if (!data) {
        return {
            user: {},
            navMain: [],
        };
    }

    const user = {
        name: data.displayName,
        email: data.email,
        avatar: data.imageUrl || "",
    };

    const { access } = data || [];

    // Filter access items with `isMenuItem` true
    const menuItems = access
        .filter((item: any) => item.accessId.isMenuItem && item.accessId.isActive)
        .map((item: any) => ({
            id: item.accessId._id.toString(),
            name: item.accessId.name,
            url: item.accessId.url,
            category: item.accessId.category,
            parentId: item.accessId.parentId ? item.accessId.parentId.toString() : null,
            hasAccess: item.hasAccess,
        }));

    // Helper to build nested structure
    const buildMenuTree = (items: any[], parentId: string | null = null): MenuItem[] => {
        return items
            .filter(item => item.parentId === parentId && item.hasAccess) // Stop if hasAccess is false
            .map(item => ({
                title: item.name,
                url: item.url,
                icon: MenuItemicons[item.category],
                items: buildMenuTree(items, item.id), // Recursively add children
            }));
    };

    const navMain = buildMenuTree(menuItems);

    return {
        user,
        navMain,
    };
};

export const isObjectEmpty = (obj: any) => {
    return Object.keys(obj).length === 0;
};


interface BulkImportParams {
    roleData: any;
    continentData: any;
    regionData: any;
    countryData: any;
    locationData: any;
    categoryData: any;
    vendorData: any;
    productData: any;
    warehouseData: any;
    customerTypeData: any;
    customerData: any;
    userData: any;
    teamData: any;
    action: string;
    user: any;
    createUser: (data: any) => Promise<any>;
    db: string;
    masterName: string;
    designationData: any;
    departmentData: any;
    employeeTypeData: any;
    organisationData: any;
    onStart: () => void;
    onFinish: () => void;
}

export const bulkImport = async ({ roleData, continentData, regionData, countryData, locationData, categoryData, vendorData, productData, warehouseData, customerTypeData, customerData, userData, teamData, designationData, departmentData, employeeTypeData, organisationData, action, user, createUser, db, masterName, onStart, onFinish }: BulkImportParams) => {

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx, .xls";
    input.onchange = async (event) => {
        onStart?.();
        const file = (event.target as HTMLInputElement)?.files?.[0];
        if (!file) {
            onFinish?.();
            return;
        };

        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

            if (!sheetData || sheetData.length === 0) {
                toast.error("The uploaded Excel sheet is empty.");
                return;
            }

            const masterRequiredFields: Record<string, string[]> = {
                User: ['Employee ID', 'First Name', 'Full Name', 'Department', 'Designation', 'Employee Type', 'Organisation', 'Reporting Location', 'Role'],
                Asset: ['Vendor Name', 'Invoice No', 'Purchase Date', 'Warehouse', 'Model'], // example
                Vendor: ['Name'], // example
                Category: ['name', 'description', 'specsRequired'], // example
                Department: ['Department Id', 'Department'],
                Designation: ['Designation', 'Department'],
                Customer: ['Name', 'Customer Type'],
                CustomerContact: ['Name', 'Customer Name'],
                IndustryType: ['Industry Type'],
                BuildingType: ['Building Type'],
                State: ['City', 'Country'],
                ProjectType: ['Project Type'],
                Location: ['Location', 'City'],
                Region: ['Region', 'Continent'],
                Product: ['Name', 'Category'],
                ProductType: ['Product Type'],
                Team: ['Team Name', 'Team Head', 'Department'],
                TeamRole: ['Name'],
                TeamMember: ['Name', 'Team Role', 'Reporting To', 'Team'],
                CustomerType: ['Customer Type'],
                Sector: ['Sector'],
                PaintType: ['Paint Type'],
                Incoterm: ['Name', 'Description'],
                QuoteStatus: ['Quote Status'],
                Currency: ['Currency'],
                Continent: ['Continent'],
                Country: ['Country Code', 'Country', 'Region'],
                VisaType: ['Visa Type'],
                SmlGroup: ['Group Name'],
                SmlSubGroup: ['Sub Group Name', 'Group Name'],
                PackageMaster: ['Package Name', 'Description', 'Amount'],
                AccountMaster: ['Account Number', 'Company', 'Provider'],
                PrinterUsage: ['Account Id', 'Printer', 'Date'],
                JobAccount: ['Account Id', 'Employee'],
                PrinterMaster: ['Printer Name'],

                // Add other masters as needed
            };

            const requiredFields = masterRequiredFields[masterName] || [];

            const rowsWithMissingData = sheetData
                .map((row: any, index: number) => {
                    const missingFields = requiredFields.filter(field => {
                        const value = row[field];

                        return value === undefined || value === null || String(value).trim() === "";
                    });

                    return missingFields.length > 0 ? { index: index + 2, missingFields } : null; // +2 for Excel-like indexing
                })
                .filter(Boolean); // Remove nulls


            if (rowsWithMissingData.length > 0) {
                const rowNumbers = rowsWithMissingData.map((_, i) => i + 2).join(', '); // +2 to match Excel rows (header + 1-based index)
                const errorMessage = rowsWithMissingData
                    .map(({ index, missingFields }: any) => `Row ${index}: ${missingFields.join(", ")}`)
                    .join(" | ");

                toast.error(`Missing required fields - ${errorMessage}`);
                return;
            }

            // Transform the sheet data based on the entity
            const formData = mapExcelToEntity(sheetData, masterName as keyof typeof entityFieldMappings);
            const successful: any[] = [];
            const skipped: any[] = [];

            const referenceData = {
                roleData: roleData?.data || [],
                continentData: continentData?.data || [],
                regionData: regionData?.data || [],
                countryData: countryData?.data || [],
                locationData: locationData?.data || [],
                categoryData: categoryData?.data || [],
                vendorData: vendorData?.data || [],
                productData: productData?.data || [],
                warehouseData: warehouseData?.data || [],
                customerTypeData: customerTypeData?.data || [],
                customerData: customerData?.data || [],
                userData: userData?.data || [],
                designationData: designationData?.data || [],
                departmentData: departmentData?.data || [],
                employeeTypeData: employeeTypeData?.data || [],
                teamData: teamData?.data || [],
                organisationData: organisationData?.data || [],
            };

            const finalData = mapFieldsToIds(formData, masterName, referenceData);
            console.log(finalData, 'final data')
            let enrichedData = finalData.map((item: any) => ({
                ...item,
                addedBy: user?._id,
                updatedBy: user?._id,
            }));
            if (masterName === 'Asset') {
                const grouped: any = {};
                let allInsertedAssets = [];
                let allSkippedAssets = [];
                let insertedInventories = [];
                let skippedInventories = [];
                // Group rows by invoiceNumber
                for (const row of enrichedData) {

                    const invoice = row?.invoiceNumber?.toString()?.trim();
                    if (!grouped[invoice]) grouped[invoice] = [];
                    grouped[invoice].push(row);
                }
                console.log(grouped, 'grouped');
                for (const invoiceNumber in grouped) {
                    const rowsForInvoice = grouped[invoiceNumber];
                    const firstRow = rowsForInvoice[0];

                    const inventory = {
                        vendor: firstRow.vendor,
                        warehouse: firstRow.warehouse,
                        purchaseDate: parseExcelDate(firstRow?.purchaseDate),
                        poNumber: firstRow.poNumber,
                        prNumber: firstRow.prNumber,
                        invoiceNumber: firstRow.invoiceNumber,
                        addedBy: user?._id,
                        updatedBy: user?._id,
                    };


                    const formattedData = {
                        action: action === 'Add' ? 'create' : 'update',
                        db: db,
                        bulkInsert: true,
                        data: [inventory],
                    };
                    const inventoryRes = await createUser(formattedData);

                    if (inventoryRes?.data?.data?.inserted?.length) {
                        insertedInventories.push(...inventoryRes.data.data.inserted);
                    }

                    if (inventoryRes?.data?.data?.skipped?.length) {
                        skippedInventories.push(...inventoryRes.data.data.skipped);
                    }

                    const inventoryId = inventoryRes?.data?.data?.inserted?.[0]?._id;
                    console.log(inventoryId, 'inventoryid');
                    const assetEntries = rowsForInvoice.map((row: any) => ({
                        serialNumber: row.serialNumber,
                        product: row.product,
                        warrantyStartDate: parseExcelDate(row?.warrantyStartDate),
                        warrantyEndDate: parseExcelDate(row?.warrantyEndDate),

                        inventory: inventoryId,
                        warehouse: row.warehouse,
                        specifications: JSON.parse(row?.specifications),
                        addedBy: user?._id,
                        updatedBy: user?._id,
                    }));

                    console.log(assetEntries, 'assetEntries');
                    const formattedData1 = {
                        action: action === 'Add' ? 'create' : 'update',
                        db: "ASSET_MASTER",
                        bulkInsert: true,
                        data: assetEntries,
                    };
                    const assetRes = inventoryId && await createUser(formattedData1);


                    if (assetRes?.data?.data?.inserted?.length) {
                        allInsertedAssets.push(...assetRes.data.data.inserted);
                        const insertedAssets = assetRes.data.data.inserted;

                        // If inserted contains full docs
                        const assetIds = insertedAssets.map((asset: any) => asset._id);
                        console.log(assetIds, 'assetids');
                        const inventory = {
                            assets: assetIds,
                        };


                        const formattedData = {
                            action: 'update',
                            db: db,
                            filter: { "_id": inventoryId },
                            data: inventory,
                        };
                        const inventoryRes = await createUser(formattedData);
                        console.log(inventoryRes, 'invetroryupdate')
                    }

                    if (assetRes?.data?.data?.skipped?.length) {
                        allSkippedAssets.push(...assetRes.data.data.skipped);
                    }
                }

                if (insertedInventories.length > 0) {
                    toast.success(`${insertedInventories.length} invoices added successfully.`);
                }
                if (skippedInventories.length > 0) {
                    toast.warning(`${skippedInventories.length} invoices were skipped.`);
                    exportToExcel(skippedInventories);
                }

                if (allInsertedAssets.length > 0) {
                    toast.success(`${allInsertedAssets.length} assets created successfully.`);
                }
                if (allSkippedAssets.length > 0) {
                    toast.warning(`${allSkippedAssets.length} assets were skipped.`);
                    exportToExcel(allSkippedAssets);
                }
                onFinish?.();

                return;
            }


            if (masterName === 'User') {
                enrichedData = finalData.map((item: any) => ({
                    ...item,
                    joiningDate: parseExcelDate(item?.joiningDate),
                }));
            };

            if (masterName === 'PrinterUsage') {
                enrichedData = finalData.map((item: any) => ({
                    ...item,
                    date: parseExcelDate(item?.date),
                }));
            };

            if (masterName === 'Team') {
                enrichedData = finalData.map((item: any) => ({
                    name: item?.name,
                    teamHead: [item?.teamHead],
                    department: item?.department,

                    addedBy: user?._id,
                    updatedBy: user?._id,
                }));
            };

            if (masterName === 'TeamMember') {
                enrichedData = finalData.map((item: any) => ({
                    user: item?.user,
                    teamRole: [item?.teamRole],
                    teamReportingTo: [item?.teamReportingTo],
                    team: item?.team,
                    addedBy: user?._id,
                    updatedBy: user?._id,
                }));
            };

            if (masterName === 'Category') {
                enrichedData = finalData.map((item: any) => ({
                    name: item?.name,
                    description: item?.description,
                    specsRequired: JSON.parse(item?.specsRequired),
                    addedBy: user?._id,
                    updatedBy: user?._id,
                }));
            };

            if (masterName === 'Vendor') {
                enrichedData = finalData.map((item: any) => ({
                    name: item?.name,
                    email: item?.email,
                    phone: item?.phone,
                    city: item?.city,
                    contactPersons: [{ name: item?.contactName, designation: item?.designation, email: item?.contactEmail, phone: item?.contactPhone }],
                    addedBy: user?._id,
                    updatedBy: user?._id,
                }));
            };

            const formattedData = {
                action: action === 'Add' ? 'create' : 'update',
                db: db,
                bulkInsert: true,
                data: enrichedData,
            };
            const response = await createUser(formattedData);

            if (response?.data?.data?.inserted.length > 0) {
                toast.success(`${response?.data?.data?.inserted.length} records imported successfully.`);
            }

            if (response?.data?.data?.skipped.length > 0) {
                exportToExcel(response?.data?.data?.skipped);
                toast.warning(`${response?.data?.data?.skipped.length} duplicates were skipped and exported to Excel.`);
            }

            onFinish?.();
        };
        reader.readAsBinaryString(file);
    };
    input.click();
};

function convertToCSV(data: any[]): string {
    if (!data.length) return "";
    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
        headers.map(field => `${(row[field] ?? '').toString().replace(/\t/g, ' ')}`).join("\t")
    );
    return [headers.join("\t"), ...rows].join("\n");
}

interface BulkImportQuotationParams {
    roleData: any;
    continentData: any;
    regionData: any;
    countryData: any;
    quoteStatusData: any;
    teamMemberData: any;
    teamData: any;
    customerData: any;
    customerContactData: any;
    customerTypeData: any;
    sectorData: any;
    industryData: any;
    buildingData: any;
    stateData: any;
    approvalAuthorityData: any;
    projectTypeData: any;
    paintTypeData: any;
    currencyData: any;
    incotermData: any;
    quotationData: any;
    locationData: any;
    action: string;
    user: any;
    createUser: (data: any) => Promise<any>;
    db: string;
    masterName: string;
    onStart: () => void;
    onFinish: () => void;
}

export const bulkImportQuotation = async ({ roleData, continentData, regionData, countryData,
    quoteStatusData,
    teamMemberData,
    teamData,
    customerData,
    customerContactData,
    customerTypeData,
    sectorData,
    industryData,
    buildingData,
    stateData,
    approvalAuthorityData,
    projectTypeData,
    paintTypeData,
    currencyData,
    incotermData, quotationData, locationData, action, user, createUser, db, masterName, onFinish, onStart }: BulkImportQuotationParams) => {

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx, .xls";
    input.onchange = async (event) => {
        onStart?.();
        const file = (event.target as HTMLInputElement)?.files?.[0];
        if (!file) {
            onFinish?.();
            return;
        };

        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

            if (!sheetData || sheetData.length === 0) {
                toast.error("The uploaded Excel sheet is empty.");
                onFinish?.();
                return;
            }

            const masterRequiredFields: Record<string, string[]> = {
                Quotation: ['Region', 'Area', 'Country', 'Year', 'Option', 'SO', 'RO', 'Quote Status', 'Date Received From Customer', 'Quote Rev', 'Sales Eng/Mng', 'Handle By', 'Status'],

                // Add other masters as needed
            };

            const requiredFields = masterRequiredFields[masterName] || [];
            const rowsWithMissingData = sheetData
                .map((row: any, index: number) => {
                    const missingFields = requiredFields.filter(field => {
                        const value = row[field];

                        return value === undefined || value === null || String(value).trim() === "";
                    });

                    return missingFields.length > 0 ? { index: index + 2, missingFields } : null; // +2 for Excel-like indexing
                })
                .filter(Boolean); // Remove nulls

            if (rowsWithMissingData.length > 0) {
                const rowNumbers = rowsWithMissingData.map((_, i) => i + 2).join(', '); // +2 to match Excel rows (header + 1-based index)
                const errorMessage = rowsWithMissingData
                    .map(({ index, missingFields }: any) => `Row ${index}: ${missingFields.join(", ")}`)
                    .join(" | ");

                toast.error(`Missing required fields - ${errorMessage}`);
                onFinish?.();
                return;
            }

            // Transform the sheet data based on the entity
            const formData = mapExcelToEntity(sheetData, masterName as keyof typeof entityFieldMappings);
            const successful: any[] = [];
            const skipped: any[] = [];
            // Transform the sheet data based on the entity

            const referenceData = {
                roleData: roleData?.data || [],
                continentData: continentData?.data || [],
                regionData: regionData?.data || [],
                countryData: countryData?.data || [],
                quoteStatusData: quoteStatusData?.data || [],
                teamMemberData: teamMemberData?.data || [],
                teamData: teamData?.data || [],
                customerData: customerData?.data || [],
                customerContactData: customerContactData?.data || [],
                customerTypeData: customerTypeData?.data || [],
                sectorData: sectorData?.data || [],
                industryData: industryData?.data || [],
                buildingData: buildingData?.data || [],
                stateData: stateData?.data || [],
                approvalAuthorityData: approvalAuthorityData?.data || [],
                projectTypeData: projectTypeData?.data || [],
                paintTypeData: paintTypeData?.data || [],
                currencyData: currencyData?.data || [],
                incotermData: incotermData?.data || []
            };
            const finalData = mapFieldsToIds(formData, masterName, referenceData);
            const enrichedData = finalData.map((item: any) => ({
                ...item,
                addedBy: user?._id,
                updatedBy: user?._id,
            }));


            // Send the transformed data for bulk insert
            try {
                const existingSet = new Set(
                    quotationData?.data?.map((record: { year: any; quoteNo: any; option: any; }) =>
                        `${record.year}-${record.quoteNo}-${record.option}`
                    )
                );
                const uniqueSet = new Set();

                const uniqueEnrichedData = enrichedData.filter((item: { year: any; quoteNo: any; option: any; }) => {
                    const key = `${item.year}-${item.quoteNo}-${item.option}`;
                    if (existingSet.has(key) || uniqueSet.has(key)) {
                        skipped.push(item); // Store duplicates
                        return false;
                    }
                    uniqueSet.add(key);

                    return true;
                });

                if (uniqueEnrichedData.length === 0) {
                    if (skipped.length > 0) {
                        exportToExcel(skipped);
                        toast.warning(`${skipped.length} duplicates were skipped and exported to excel.`);

                    } else {

                        toast.warning("No unique records found for import.");

                    }
                    onFinish?.();
                    return;
                }


                // Step 1: Insert ProposalRevision Entries (Bulk Insert)
                const revisionData = uniqueEnrichedData.map((item: { revNo: any; sentToEstimation: any; receivedFromEstimation: any; cycleTime: any; sentToCustomer: any; addedBy: any; updatedBy: any; }) => [
                    {
                        revNo: item.revNo,
                        sentToEstimation: item.sentToEstimation,
                        receivedFromEstimation: item.receivedFromEstimation,
                        cycleTime: item.cycleTime,
                        sentToCustomer: item.sentToCustomer,
                        addedBy: item.addedBy,
                        updatedBy: item.updatedBy,
                        changes: {}
                    },
                    {
                        revNo: item.revNo,
                        sentToEstimation: item.sentToEstimation,
                        receivedFromEstimation: item.receivedFromEstimation,
                        cycleTime: item.cycleTime,
                        sentToCustomer: item.sentToCustomer,
                        addedBy: item.addedBy,
                        updatedBy: item.updatedBy,
                        changes: {}
                    },
                ]).flat();

                const revisionResponse = await createUser({
                    action: "create",
                    db: "PROPOSAL_REVISION_MASTER",
                    bulkInsert: true,
                    data: revisionData,
                });

                if (revisionResponse.error) {
                    throw new Error(revisionResponse.error.data.message);
                }

                const insertedRevisions = revisionResponse?.data?.data?.inserted?.map((item: { _id: any; }) => item._id).filter(Boolean);
                if (insertedRevisions.length !== revisionData.length) {
                    onFinish?.();
                    throw new Error("Mismatch in inserted ProposalRevision records.");
                }

                // Step 2: Insert Proposal Entries
                const proposalData = uniqueEnrichedData.map((item: { addedBy: any; updatedBy: any; }, index: number) => [
                    {
                        revisions: [insertedRevisions[index * 2]], // ProposalOffer revision ID
                        type: "ProposalOffer",
                        addedBy: item.addedBy,
                        updatedBy: item.updatedBy,
                    },
                    {
                        revisions: [insertedRevisions[index * 2 + 1]], // ProposalDrawing revision ID
                        type: "ProposalDrawing",
                        addedBy: item.addedBy,
                        updatedBy: item.updatedBy,
                    },
                ]).flat();

                const proposalResponse = await createUser({
                    action: "create",
                    db: "PROPOSAL_MASTER",
                    bulkInsert: true,
                    data: proposalData,
                });

                if (proposalResponse.error) {
                    throw new Error(proposalResponse.error.data.message);
                }
                const insertedProposals = proposalResponse?.data?.data?.inserted?.map((item: { _id: any; }) => item._id).filter(Boolean);

                if (insertedProposals.length !== proposalData.length) {
                    throw new Error("Mismatch in inserted Proposal records.");
                }

                // Step 3: Insert Quotation Entries
                const quotationDataImport = uniqueEnrichedData.map((item: { country: any; year: any; option: any; revNo: any; quoteNo: any; quoteStatus: any; salesEngineer: any; salesSupportEngineer1: any; salesSupportEngineer2: any; salesSupportEngineer3: any; rcvdDateFromCustomer: any; sellingTeam: any; responsibleTeam: any; forecastMonth: string | number; status: any; handleBy: any; addedBy: any; updatedBy: any; }, index: number) => ({
                    ...item,
                    country: item.country,
                    year: item.year,
                    option: item.option,
                    proposals: [insertedProposals[index * 2], insertedProposals[index * 2 + 1]], // Proposal IDs
                    revNo: item.revNo,
                    quoteNo: item.quoteNo || '',
                    quoteStatus: item.quoteStatus,
                    salesEngineer: item.salesEngineer,
                    salesSupportEngineer: [item.salesSupportEngineer1, item.salesSupportEngineer2, item.salesSupportEngineer3].filter(Boolean),
                    rcvdDateFromCustomer: item.rcvdDateFromCustomer,
                    sellingTeam: item.sellingTeam,
                    responsibleTeam: item.responsibleTeam,
                    forecastMonth: monthMap[item?.forecastMonth as keyof typeof monthMap] ?? null,
                    status: item.status,
                    handleBy: item.handleBy,
                    addedBy: item.addedBy,
                    updatedBy: item.updatedBy,
                }));


                const formattedData = {
                    action: action === 'Add' ? 'create' : 'update',
                    db: db,
                    bulkInsert: true,
                    data: quotationDataImport,
                };
                const response = await createUser(formattedData);// Replace this with your actual insert logic

                if (response?.data?.data?.inserted.length > 0) {
                    toast.success(`${response?.data?.data?.inserted.length} records imported successfully.`);
                }

                if (skipped.length > 0) {
                    const combinedData = [...response?.data?.data?.skipped, ...skipped];
                    exportToExcel(combinedData);
                    toast.warning(`${combinedData.length} duplicates were skipped and exported to excel.`);

                }

                // if (response?.data?.data?.skipped.length > 0) {
                //     exportToExcel(response?.data?.data?.skipped);
                //     toast.warning(`${response?.data?.data?.skipped.length} duplicates were skipped and exported to Excel.`);
                // }

                onFinish?.();

            } catch (err) {
                onFinish?.();
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                toast.error(`Error during import: ${errorMessage}`);
            }
        };
        reader.readAsBinaryString(file);
    };
    input.click();
};

const fieldMappingConfig: { [key: string]: any } = {
    User: {
        role: { source: "roleData", key: "name", value: "_id" },
        department: { source: "departmentData", key: "name", value: "_id" },
        designation: { source: "designationData", key: "name", value: "_id" },
        employeeType: { source: "employeeTypeData", key: "name", value: "_id" },
        organisation: { source: "organisationData", key: "name", value: "_id" },
        activeLocation: { source: "locationData", key: "name", value: "_id" },
        reportingLocation: { source: "locationData", key: "name", value: "_id" },
        reportingTo: { source: "userData", key: "fullName", value: "_id" },

    },
    Designation: {
        department: { source: "departmentData", key: "name", value: "_id" },
    },
    Region: {
        continent: { source: "continentData", key: "name", value: "_id" },
    },
    Country: {
        region: { source: "regionData", key: "name", value: "_id" },
    },
    State: {
        country: { source: "countryData", key: "name", value: "_id" },
    },
    Quotation: {
        country: { source: "countryData", key: "name", value: "_id" },
        quoteStatus: { source: "quoteStatusData", key: "name", value: "_id" },
        salesEngineer: {
            source: "teamMemberData",
            key: "user.displayName", // Accessing displayName from the User table via TeamMember
            value: "_id",
            transform: (name: string, teamMemberData: any[]) => {
                if (!name || !Array.isArray(teamMemberData)) return null;
                const found = teamMemberData.find(member => {
                    return member.user?.displayName?.trim().toLowerCase() === name.trim().toLowerCase();
                });
                return found ? found._id : null;
            }
        },
        salesSupportEngineer1: {
            source: "teamMemberData",
            key: "user.displayName", // Accessing displayName from the User table via TeamMember
            value: "_id",
            transform: (name: string, teamMemberData: any[]) => {
                if (!name || !Array.isArray(teamMemberData)) return null;
                const found = teamMemberData.find(member => {
                    return member.user?.displayName?.trim().toLowerCase() === name.trim().toLowerCase();
                });
                return found ? found._id : null;
            }
        },
        salesSupportEngineer2: {
            source: "teamMemberData",
            key: "user.displayName", // Accessing displayName from the User table via TeamMember
            value: "_id",
            transform: (name: string, teamMemberData: any[]) => {
                if (!name || !Array.isArray(teamMemberData)) return null;
                const found = teamMemberData.find(member => {
                    return member.user?.displayName?.trim().toLowerCase() === name.trim().toLowerCase();
                });
                return found ? found._id : null;
            }
        },
        salesSupportEngineer3: {
            source: "teamMemberData",
            key: "user.displayName", // Accessing displayName from the User table via TeamMember
            value: "_id",
            transform: (name: string, teamMemberData: any[]) => {
                if (!name || !Array.isArray(teamMemberData)) return null;
                const found = teamMemberData.find(member => {
                    return member.user?.displayName?.trim().toLowerCase() === name.trim().toLowerCase();
                });
                return found ? found._id : null;
            }
        },
        sellingTeam: { source: "teamData", key: "name", value: "_id" },
        responsibleTeam: { source: "teamData", key: "name", value: "_id" },
        company: { source: "customerData", key: "name", value: "_id" },
        contact: { source: "customerContactData", key: "name", value: "_id" },
        customerType: { source: "customerTypeData", key: "name", value: "_id" },
        sector: { source: "sectorData", key: "name", value: "_id" },
        industryType: { source: "industryData", key: "name", value: "_id" },
        buildingType: { source: "buildingData", key: "name", value: "_id" },
        state: { source: "stateData", key: "name", value: "_id" },
        approvalAuthority: { source: "approvalAuthorityData", key: "name", value: "_id" },
        projectType: { source: "projectTypeData", key: "name", value: "_id" },
        paintType: { source: "paintTypeData", key: "name", value: "_id" },
        currency: { source: "currencyData", key: "name", value: "_id" },
        incoterm: { source: "incotermData", key: "name", value: "_id" },
        handleBy: {
            source: "teamMemberData",
            key: "user.displayName", // Accessing displayName from the User table via TeamMember
            value: "_id",
            transform: (name: string, teamMemberData: any[]) => {
                if (!name || !Array.isArray(teamMemberData)) return null;
                const found = teamMemberData.find(member => {
                    return member.user?.displayName?.trim().toLowerCase() === name.trim().toLowerCase();
                });
                return found ? found._id : null;
            }
        },
    },
    Warehouse: {
        location: { source: "locationData", key: "name", value: "_id" },
    },
    Vendor: {
        city: { source: "locationData", key: "name", value: "_id" },
    },
    Product: {
        category: { source: "categoryData", key: "name", value: "_id" },
    },
    Asset: {
        vendor: { source: "vendorData", key: "name", value: "_id" },
        product: { source: "productData", key: "model", value: "_id" },
        warehouse: { source: "warehouseData", key: "name", value: "_id" },
    },
    Customer: {
        customerType: { source: "customerTypeData", key: "name", value: "_id" },
    },
    CustomerContact: {
        customer: { source: "customerData", key: "name", value: "_id" },
    },
    Role: {
        role: { source: "roleData", key: "name", value: "_id" },
    },
    Team: {
        teamHead: { source: "userData", key: "displayName", value: "_id" },
        department: { source: "departmentData", key: "name", value: "_id" },
    },
    TeamMember: {
        user: { source: "userData", key: "displayName", value: "_id" },
        teamRole: { source: "roleData", key: "name", value: "_id" },
        teamReportingTo: { source: "userData", key: "displayName", value: "_id" },
        team: { source: "teamData", key: "name", value: "_id" },
    },
    Location: {
        state: { source: "locationData", key: "name", value: "_id" },

    },
    SmlSubGroup: {
        group: { source: "categoryData", key: "name", value: "_id" },
    },
    AccountMaster: {
        employee: { source: "userData", key: "displayName", value: "_id" },
        others: { source: "teamData", key: "name", value: "_id" },
        company: { source: "organisationData", key: "name", value: "_id" },
        provider: { source: "vendorData", key: "name", value: "_id" },
        package: { source: "productData", key: "name", value: "_id" },
    },
    PrinterUsage: {
        jobAccount: { source: "userData", key: "name", value: "_id" },
        printer: { source: "teamData", key: "name", value: "_id" },

    },
    JobAccount: {
        employee: { source: "userData", key: "displayName", value: "_id" },

    },


    // Add more entity mappings if needed
};

const entityFieldMappings = {
    User: {
        "Employee ID": "empId",
        "First Name": "firstName",
        "Last Name": "lastName",
        "Full Name": "fullName",
        "Email": "email",
        "Display Name": "displayName",
        "Department": "department",
        "Designation": "designation",
        "Employee Type": "employeeType",
        "Reporting To": "reportingTo",
        "Organisation": "organisation",
        "Reporting Location": "reportingLocation",
        "Active Location": "activeLocation",
        "Role": "role",
        "Extension": "extension",
        "Mobile": "mobile",
        "Joining Date": "joiningDate",
        "Personal Number": "personalNumber",
        // "Relieving Date": "relievingDate",
        // Add more mappings for users
    },
    Department: {
        "Department Id": "depId",
        "Department": "name",
        // Add more mappings for departments
    },
    Role: {
        "Role": "name",
        // Add more mappings for Role
    },

    EmployeeType: {
        "Employee Type": "name",

        // Add more mappings for EmployeeType
    },
    Designation: {
        "Designation": "name",
        "Department": "department",

        // Add more mappings for Designation
    },
    Continent: {
        "Continent": "name",

        // Add more mappings for Continent
    },
    Region: {
        "Region": "name",
        "Continent": "continent",

        // Add more mappings for Region
    },

    Country: {
        "Country Code": "countryCode",
        "Country": "name",
        "Region": "region",

        // Add more mappings for Country
    },

    State: {
        "City": "name",
        "Country": "country",

        // Add more mappings for State
    },
    Currency: {
        "Currency": "name",

        // Add more mappings for State
    },
    PaintType: {
        "Paint Type": "name",

        // Add more mappings for State
    },
    ProjectType: {
        "Project Type": "name",

        // Add more mappings for State
    },
    BuildingType: {
        "Building Type": "name",

        // Add more mappings for State
    },
    IndustryType: {
        "Industry Type": "name",

        // Add more mappings for State
    },
    QuoteStatus: {
        "Quote Status": "name",

        // Add more mappings for State
    },
    Quotation: {
        "Country": "country",
        "Year": "year",
        "Quote No": "quoteNo",
        "Option": "option",
        "SO": "sellingTeam",
        "RO": "responsibleTeam",
        "Quote Rev": "revNo",
        "Quote Status": "quoteStatus",
        "Date Received From Customer": "rcvdDateFromCustomer",
        "Sales Eng/Mng": "salesEngineer",
        "Sales Support 1": "salesSupportEngineer1",
        "Sales Support 2": "salesSupportEngineer2",
        "Sales Support 3": "salesSupportEngineer3",
        "Customer Name": "company",
        "Contact Name": "contact",
        "Customer Type": "customerType",
        "End Client": "endClient",
        "Project Management": "projectManagementOffice",
        "Consultant": "consultant",
        "Main Contractor": "mainContractor",
        "Erector": "erector",
        "Project Name": "projectName",
        "Sectors": "sector",
        "Industry Type": "industryType",
        "Other Industry": "otherIndustryType",
        "Building Type": "buildingType",
        "Other Building Type": "otherBuildingType",
        "Building Usage": "buildingUsage",
        "City": "state",
        "Approval Authority": "approvalAuthority",
        "Plot No": "plotNumber",
        "Date Sent To Estimation": "sentToEstimation",
        "Date Received From Estimation": "receivedFromEstimation",
        "Cycle Time (Days)": "cycleTime",
        "Date Sent To Customer": "sentToCustomer",
        "No Of Buildings": "noOfBuilding",
        "Project Type": "projectType",
        "Paint Type": "paintType",
        "Other Paint Type": "otherPaintType",
        "Projected Area (Sq. Mtr)": "projectArea",
        "Total Weight (Tons)": "totalWt",
        "Mezzanine Area (Sq. Mtr)": "mezzanineArea",
        "Mezzanine Weight (Tons)": "mezzanineWt",
        "Currency": "currency",
        "Total Estimated Price": "totalEstPrice",
        "Q22 Value (AED)": "q22Value",
        "Sp. BuyOut Price": "spBuyoutPrice",
        "Freight Price": "freightPrice",
        "Incoterm": "incoterm",
        "Incoterm Description": "incotermDescription",
        "Booking Probability": "bookingProbability",
        "Job No": "jobNo",
        "Job Date": "jobDate",
        "Forecast Month": "forecastMonth",
        "Payment Term": "paymentTerm",
        "Remarks": "remarks",
        "Lost To": "lostTo",
        "Lost To Others": "lostToOthers",
        "Lost Date": "lostDate",
        "Reason": "reason",
        "Initial Ship Date": "initialShipDate",
        "Final Ship Date": "finalShipDate",
        "Status": 'status',
        "Handle By": 'handleBy',
    },

    Warehouse: {
        "Name": "name",
        "Location": "location",
        "Contact Person": "contactPerson",
        "Contact Number": "contactNumber",
        // Add more mappings for Country
    },
    Vendor: {
        "Name": "name",
        "Email": "email",
        "Contact Number": "phone",
        "City": "city",
        "Contact Person": "contactName",
        "Designation": "designation",
        "Contact Email": "contactEmail",
        "Phone": "contactPhone",
        // Add more mappings for Country
    },
    Product: {
        "Name": "name",
        "Description": "description",
        "Category": "category",
        "Brand": "brand",
        "Model": "model",
        // Add more mappings for Country
    },
    Category: {
        "Name": "name",
        "Description": "description",
        "Required Specification": "specsRequired",
        // Add more mappings for Country
    },
    Asset: {
        'Vendor Name': 'vendor',
        'Invoice No': 'invoiceNumber',
        'PO Number': 'poNumber',
        'PR Number': 'prNumber',
        'Purchase Date': 'purchaseDate',
        'Warehouse': 'warehouse',

        'Serial Number': 'serialNumber',
        'Model': 'product',
        'Warranty Start Date': 'warrantyStartDate',
        'Warranty End Date': 'warrantyEndDate',
        'Specifications': 'specifications'
    },
    Customer: {
        "Name": "name",
        "Website": "website",
        "Email": "email",
        "Phone": "phone",
        "Address": "address",
        "Customer Type": "customerType",
        // Add more mappings for Country
    },
    CustomerContact: {
        "Name": "name",
        "Email": "email",
        "Phone": "phone",
        "Position": "position",
        "Customer Name": "customer",
        // Add more mappings for Country
    },
    ProductType: {
        "Product Type": "name",

    },
    Team: {
        "Team Name": "name",
        "Team Head": "teamHead",
        "Department": "department",

    },
    TeamRole: {
        "Name": "name",

    },
    TeamMember: {
        "Name": "user",
        "Team Role": "teamRole",
        "Reporting To": "teamReportingTo",
        "Team": "team",

    },
    CustomerType: {
        "Customer Type": "name",

    },
    Sector: {
        "Sector": "name",

    },
    Incoterm: {
        "Name": "name",
        "Description": "description",

    },
    Location: {
        "Location": "name",
        "Address": "address",
        "Pin Code": "pincode",
        "City": "state",

    },
    VisaType: {
        "Visa Type": "name"
    },
    SmlGroup: {
        "Group Name": "name"
    },
    SmlSubGroup: {
        "Sub Group Name": "name",
        "Group Name": "group"
    },
    PackageMaster: {
        "Package Name": "name",
        "Description": "description",
        "Amount": "amount",
    },
    AccountMaster: {
        "Account Number": "name",
        "Provider": "provider",
        "Employee": "employee",
        "Others": "others",
        "Company": "company",
        "Package Name": "package",
    },
    PrinterUsage: {
        "Account Id": "jobAccount",
        "Printer": "printer",
        "Date": "date",
        "Copy Color": "copyColor",
        "Copy BW": "copyBw",
        "Print Color": "printColor",
        "Print BW": "printBw",
    },
    JobAccount: {
        "Account Id": "name",
        "Employee": "employee",

    },
    PrinterMaster: {
        "Printer Name": "name",
        "Printer Location": "printerLocation",

    },


    // Add mappings for other entities
};


const mapFieldsToIds = (data: any[], entityType: string, referenceData: { [x: string]: any; roleData?: any; continentData?: any; regionData?: any; countryData?: any; quoteStatusData?: any; teamMemberData?: any; teamData?: any; customerData?: any; customerContactData?: any; customerTypeData?: any; sectorData?: any; industryData?: any; buildingData?: any; stateData?: any; approvalAuthorityData?: any; projectTypeData?: any; paintTypeData?: any; currencyData?: any; incotermData?: any; locationData?: any; }) => {

    const mappings = fieldMappingConfig[entityType as keyof typeof fieldMappingConfig];
    return data.map((item) => {
        const transformedItem = { ...item };
        if (mappings) {
            Object.entries(mappings).forEach(([field, mapping]) => {
                const { source, key, value, transform } = mapping as { source: string, key: string, value: string, transform?: Function };

                const referenceArray = referenceData[source]?.data || referenceData[source];

                if (!Array.isArray(referenceArray)) {
                    console.error(`Invalid reference data for source: ${source}`, referenceData[source]);
                    transformedItem[field] = undefined; // Default to empty if reference data is invalid
                    return;
                }

                if (transform) {
                    // Apply transform function if defined

                    transformedItem[field] = transform(item[field], referenceArray);
                } else {
                    // Default mapping lookup
                    const reference = referenceArray.find((ref) => ref[key]?.toLowerCase() === item[field]?.toLowerCase());
                    // const reference = referenceArray.find((ref) => {
                    //     const refValue = ref[key];

                    //     const itemValue = item[field];
                    //     return refValue?.toLowerCase() === itemValue?.toLowerCase();
                    // });
                    transformedItem[field] = reference ? reference[value] : undefined;
                }

                if (!transformedItem[field]) {
                    console.warn(`No reference found for field: ${field} with value: ${item[field]}`);
                }
            });
        }

        return transformedItem;
    });
};


const monthMap = {
    January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
    July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
};
export const validate = {
    required: (value: string) => (value ? undefined : "Required"),
    text: (value: string) => {
        if (value.length < 3) return "Must be at least 3 characters";
        if (value.length > 100) return "Must be less than 100 characters";
        return undefined;
    },
    textSmall: (value: string) => {
        if (value.length < 2) return "Must be at least 2 characters";
        if (value.length > 50) return "Must be less than 50 characters";
        return undefined;
    },
    number: (value: string) => {
        if (isNaN(Number(value))) return "Invalid number";
        return undefined;
    },
    greaterThanZero: (value: string) => {
        if (isNaN(Number(value)) || Number(value) <= 0) return "Must be greater than 0";
        return undefined;
    },
    phone: (value: string) => {
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(value) ? undefined : "Invalid phone number";
    },
    email: (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Invalid email address";
        if (value.length < 5) return "Email must be at least 5 characters";
        if (value.length > 100) return "Email must be less than 100 characters";
        return undefined;
    },
    desription: (value: string) => {
        if (value && value.length > 500) return "Description must be less than 500 characters";
        return undefined;
    },
    specification: (value: Record<string, string>) => {
        if (Object.keys(value).length === 0) return "At least one specification is required";
        return undefined;
    },
    mixString: (value: string) => {
        if (!/^[A-Z0-9-]+$/.test(value)) {
            return "Must contain only uppercase letters, numbers, and hyphens";
        }
        if (value.length < 4) {
            return "Must be at least 4 characters";
        }
        if (value.length > 50) {
            return "Must be less than 50 characters";
        }
        return undefined;
    },
    notFutureDate: (value: string) => {
        const purchaseDate = new Date(value);
        if (purchaseDate > new Date()) {
            return "Dateate cannot be in the future";
        }
        return undefined;
    },
    locationSelected: (value: string) => {
        if (!value) return "Location must be selected";
        return undefined;
    }
}

export const generateTicketId = async () => {
    // Get today's date in format YYYYMMDD
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    // Get tickets from today to determine the sequence number
    const dbEngine = (await import('@/server/Engines/DbEngine')).dbEngine;
    const result = await dbEngine.mongooose.find('TICKET_MASTER', {
        filter: {
            ticketId: { $regex: `^TKT-${dateStr}` }
        },
        sort: { createdAt: 'asc' }
    });

    // Determine the next sequence number
    let sequence = 1;
    if (result.status === 'SUCCESS' && result.data.length > 0) {
        // Extract the sequence number from the last ticket ID
        const lastTicketId = result.data[0].ticketId;
        const lastSequence = parseInt(lastTicketId.split('-')[2]);
        sequence = lastSequence + 1;
    }

    // Format the sequence number with leading zeros
    const sequenceStr = String(sequence).padStart(3, '0');

    // Return the generated ticket ID
    return `TKT-${dateStr}-${sequenceStr}`;
};




const mapExcelToEntity = (excelData: any[], entityType: keyof typeof entityFieldMappings) => {

    const mappings = entityFieldMappings[entityType];
    console.log("mappings", mappings);
    return excelData.map((row) =>
        Object.keys(row).reduce((acc: Record<string, any>, key) => {
            const mappedKey = (mappings as Record<string, string>)[key];
            if (mappedKey) acc[mappedKey] = row[key];
            return acc;
        }, {} as Record<string, any>)
    );
};


function parseExcelDate(value: any): Date | null {
    if (value instanceof Date && !isNaN(value.getTime())) {
        return value; // Already a valid JS Date
    }

    if (typeof value === 'number') {
        const excelEpoch = new Date(1899, 11, 30);
        return new Date(excelEpoch.getTime() + value * 86400000);
    }

    if (typeof value === 'string') {
        // Try DD/MM/YYYY
        const parsed = moment(value, "DD/MM/YYYY", true);
        if (parsed.isValid()) {
            return parsed.toDate();
        }

        // Try MM/DD/YYYY as fallback
        const fallbackParsed = moment(value, "MM/DD/YYYY", true);
        if (fallbackParsed.isValid()) {
            return fallbackParsed.toDate();
        }
    }

    return null;
}







