import { Types, Document } from "mongoose";

export interface ApprovalInfo {
    date?: Date;
    userId?: Types.ObjectId; // populated with User
}

export interface itAssetsAccess extends Document {
    // Request Information
    employeeJoiningId: Types.ObjectId; // ref: EmployeeJoining
    email?: string;
    displayName?: string;
    dateOfRequest?: Date;
    // IT Assets
    itHardwareAssets: string[];
    itSoftwareAssets: string[];
    workplaceApps: string[];
    accessToProvide: string[];
    othersAccess: string[];

    extensionType?: string;

    // Assignees (Employee references)
    assignees: Types.ObjectId[];

    // Workflow status
    status: "Requested" | "Approved";

    // Approvals
    approvedByHR?: ApprovalInfo;
    approvedByIT?: ApprovalInfo;

    // Metadata
    isActive: boolean;
    addedBy?: string;
    updatedBy?: string;

    // Mongoose timestamps
    createdAt: Date;
    updatedAt: Date;
}
