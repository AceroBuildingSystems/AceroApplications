import { Document, Types } from "mongoose";

export interface DeclaredBy {
    candidateSignature: string; // base64, image URL, or file path
    date?: Date;
}

export interface FriendsRelativeDetails {
    name?: string;
    relation?: string;
    contactNo?: string;
}

export interface candidateInformation extends Document {
    recruitment: Types.ObjectId; // Reference to Recruitment model
    firstName: string;
    lastName: string;
    gender: "male" | "female" | "other" | "";
    dateOfBirth?: Date;
    nationality: Types.ObjectId;
    maritalStatus: "single" | "married" | "divorced" | "widowed" | "";

    contactNumber: string;
    email: string;

    currentEmployer?: string;
    currentDesignation?: string;
    currentLocation?: string;
    currentWorkLocation?: string;
    currentlyWorking: "yes" | "no" | "";

    totalYearsOfExperience?: number;
    relevantYearsOfExperience?: number;

    currentSalaryPackage?: number;
    expectedSalaryPackage?: number;
    noticePeriodRequired?: string;

    highestQualification?: string;
    specialization?: string;
    degreeCertificateAttested: "yes" | "no" | "";
    certifications?: string;

    drivingLicense?: string;
    visaType?: string;
    visaExpiry?: Date;

    sourceOfPositionInfo?: string;
    friendsRelativesInABS?: string;
    friendsRelativesDetails?: FriendsRelativeDetails;

    languagesKnown: string; // Comma-separated string or array of languages

    remarks?: string;
    checkedBy?: Types.ObjectId;

    declaredBy: DeclaredBy;

    attachResume: string; // File path or URL
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
