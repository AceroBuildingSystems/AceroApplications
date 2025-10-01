import { Document, Types } from "mongoose";

export interface offeracceptance extends Document {
  interviewAssesmentId: Types.ObjectId; // populated with InterviewAssessment doc if autopopulated
  recruitmentId: Types.ObjectId;
  offerIssueDate?: Date;
  expectedJoiningDate?: Date;
  joiningImmediate?: string;
  reasonToTravel?: string;
  noOfDays?: number;
  offerStatus: "issued" | "accepted" | "rejected";
  onboardingStatus: "active" | "inactive";
  remarks?: string;
  offerLetterUrl?: string;
  passportInfo?: {
    passportNo?: string;
    issueDate?: Date;
    expiryDate?: Date;
    passportUrl?: string;
  };

  uploadDocuments?: {
    visitVisaUrl?: string;
    cancellationVisaUrl?: string;
    educationCertificatesUrl?: [string];
    passportSizePhoto?: string;
  };
  isActive: boolean;
  createddBy?: string; // seems like a typo, maybe 'createdBy'
  updatedBy?: string;
  createdAt?: Date; // from timestamps
  updatedAt?: Date; // from timestamps
}
