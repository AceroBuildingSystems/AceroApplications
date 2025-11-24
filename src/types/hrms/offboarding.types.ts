import { Document, Types } from "mongoose";

export interface handoverTaskSchema {
    description: string;
    remarks: string;
    signature: string
}

export interface HandoverDetail {
    department: string;
    taskDescription: handoverTaskSchema[];
}

export interface ClearanceSignature {
    signature?: string;
    date?: Date;
}

// -----------------------------
// Main Offboarding type
// -----------------------------
export interface offboarding extends Document {
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