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
  remarks?: string;
  offerLetterUrl?: string;
  isActive: boolean;
  createddBy?: string; // seems like a typo, maybe 'createdBy'
  updatedBy?: string;
  createdAt?: Date; // from timestamps
  updatedAt?: Date; // from timestamps
}
