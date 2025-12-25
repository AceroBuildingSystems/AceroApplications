
import { Document, Types } from "mongoose";

export interface visainfo {
    // Request Information
    visaIssueDate?: Date;
    visaExpiryDate?: Date;
    visaFileNo?: string;
    emiratesIdNo?: string;
    emiratesIdIssueDate?: Date;
    emiratesIdExpiryDate?: Date;
    workPermitNo?: string;
    personCode?: string;
    visaType?: Types.ObjectId; // reference to VisaType
    laborCardExpiryDate?: Date;
    iloeExpiryDate?: Date;
    medicalInsuranceProvider?: string;
    visaUrl?: string;
    emiratesIdUrl?: string;
    laborCardUrl?: string;
    iloeUrl?: string;
    addedBy?: string;
    updatedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
