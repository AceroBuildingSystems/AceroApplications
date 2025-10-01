
import { Document, Types } from "mongoose";

export interface beneficiaryinfo {
    // Request Information

    name: string;
    relation: string;
    addressAndContact: string;

    declaration?: {
        employeeSignature: string;
        declarationDate: Date;
        declarationFormUrl: string;
    };
    hrAdmin?: {
        departmentSignature?: string;
        departmentSignatureDate?: Date;
        headHrAdminSignature?: string;
        headSignatureDate?: Date;
        remarks?: string;
    };
    addedBy?: string;
    updatedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
