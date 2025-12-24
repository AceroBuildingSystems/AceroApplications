import { Document, Types } from "mongoose";

export interface employeeinfo {
    // Request Information

    itAssetsAccessId: Types.ObjectId; // ref: ItAssetsAccess
    empId: string;
    displayName?: string;
    grade?: string;
    dateOfJoining: Date;

    religion?: string;
    bloodGroup?: string;
    homeTownAirport?: string;

    familyDetails?: {
        fatherName?: string;
        fatherNationality?: Types.ObjectId;
        motherName?: string;
        motherNationality?: Types.ObjectId;
        spouseName?: string;
        spouseNationality?: Types.ObjectId;
        child1Name?: string;
        child1Nationality?: Types.ObjectId;
        child2Name?: string;
        child2Nationality?: Types.ObjectId;
        child3Name?: string;
        child3Nationality?: Types.ObjectId;
    };

    contacts?: {
        contactAddressUAE?: string;
        phoneNumberUAE?: string;
        contactAddressHomeCountry?: string;
        phoneNumberHomeCountry?: string;
        emailId?: string;
        emergencyContactNumber?: string;
    };

    passport?: {
        passportNo?: string;
        issueDate?: Date;
        expiryDate?: Date;
        passportUrl?: string;
    };

    uploadDocuments?: {
        visitVisaUrl?: string;
        cancellationVisaUrl?: string;
        educationCertificatesUrl?: [string];
    };

    salaryDetails?: {
        basic?: number;
        housingAllowance?: number;
        transportAllowance?: number;
        miscAllowance?: number;
        mobileAllowance?: number;
        foodAllowance?: number;
        companyCarAllow?: number;
        petrolCard?: number;
        otherAllowance?: number;
        totalSalary?: number;
    };

    employeeSignature?: {
        signature?: string;
        signDate?: Date;
    };

    checkedBy?: Types.ObjectId;
    approvedBy?: Types.ObjectId;

    beneficiaryInfo?: Types.ObjectId; // ref: BeneficiaryInfo
    consentInfo?: Types.ObjectId; // ref: ConsentInfo
    ndaInfo?: Types.ObjectId; // ref: NdaInfo
    orientationInfo?: Types.ObjectId; // ref: OrientationInfo
    visaInfo?: Types.ObjectId; // ref: VisaInfo

    isActive?: boolean;
    addedBy?: string;
    updatedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
