import { Document, Types } from "mongoose";

export interface HandoverDetail {
    department: string;
    taskDescription: string[];
    handoverTo?: Types.ObjectId; // reference to User
    handoverDate?: Date;
    status: boolean;
    signature?: string;
}

export interface ClearanceSignature {
    signature?: string;
    date?: Date;
}

// -----------------------------
// Main Offboarding type
// -----------------------------
export interface Offboarding extends Document {
    employee: Types.ObjectId; // Ref: User
    releavingDate?: Date;
    handoverDetails: HandoverDetail[];
    remarks?: string;

    // Clearance signatures
    employeeClearance?: ClearanceSignature;
    endorsedBy?: ClearanceSignature;
    reviewedBy?: ClearanceSignature;
    approvedBy?: ClearanceSignature;

    // Meta
    isActive: boolean;
    createdBy?: string;
    updatedBy?: string;

    createdAt: Date; // from timestamps
    updatedAt: Date;
}