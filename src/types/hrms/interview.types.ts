import { Document, Types } from "mongoose";

export interface AssessmentParameter {
  parameterName: string; // e.g. "Technical Knowledge"
  score: number;         // 0–10

}

export interface InterviewRound {
  roundNumber: number;
  interviewer: Types.ObjectId; // Reference to User
  date: Date;
  roundStatus: "shortlisted" | "rejecteded" | "na";
  remarks?: string;
}

export interface interview extends Document {
  candidateId: Types.ObjectId; // Reference to CandidateInfo
  recruitmentId: Types.ObjectId; // Reference to Recruitment
  rounds: InterviewRound[];
  assessmentParameters: AssessmentParameter[];
  status: "recruited" | "shortlisted" | "held" | "rejected" | "na";
  isActive: boolean;
  remarks?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}