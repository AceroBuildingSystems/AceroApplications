import { min } from "lodash";
import mongoose, { Document, Model, Schema } from "mongoose";

import { employeeinfo } from "@/types/hrms/employeeinfo.types";


const EmployeeInfoSchema: Schema<employeeinfo> = new Schema({

    itAssetsAccessId: {
        type: Schema.Types.ObjectId,
        ref: 'ItAssetsAccess',
        required: true,
        autopopulate: true
    },
    empId: { type: String, required: true, unique: true },
    displayName: { type: String },
    grade: { type: String },
    dateOfJoining: { type: Date, required: true },

    religion: { type: String },
    bloodGroup: { type: String },
    homeTownAirport: { type: String },

    familyDetails: {
        fatherName: String,
        fatherNationality: {
            type: Schema.Types.ObjectId, ref: "Country", autopopulate: {
                select: "name"
            }
        },
        motherName: String,
        motherNationality: {
            type: Schema.Types.ObjectId, ref: "Country", autopopulate: {
                select: "name"
            }
        },
        spouseName: String,
        spouseNationality: {
            type: Schema.Types.ObjectId, ref: "Country", autopopulate: {
                select: "name"
            }
        },
        child1Name: String,
        child1Nationality: {
            type: Schema.Types.ObjectId, ref: "Country", autopopulate: {
                select: "name"
            }
        },
        child2Name: String,
        child2Nationality: {
            type: Schema.Types.ObjectId, ref: "Country", autopopulate: {
                select: "name"
            }
        },
        child3Name: String,
        child3Nationality: {
            type: Schema.Types.ObjectId, ref: "Country", autopopulate: {
                select: "name"
            }
        },
    },

    contacts: {
        contactAddressUAE: String,
        phoneNumberUAE: String,
        contactAddressHomeCountry: String,
        phoneNumberHomeCountry: String,
        emailId: String,
        emergencyContactNumber: String,
    },

    passport: {
        passportNo: String,
        issueDate: Date,
        expiryDate: Date,
        passportUrl: String,
    },

    uploadDocuments: {
        visitVisaUrl: String,
        cancellationVisaUrl: String,
        educationCertificatesUrl: [String],
    },
    salaryDetails: {
        basic: { type: Number, min: 0 },
        housingAllowance: { type: Number, min: 0 },
        transportAllowance: { type: Number, min: 0 },
        miscAllowance: { type: Number, min: 0 },
        mobileAllowance: { type: Number, min: 0 },
        foodAllowance: { type: Number, min: 0 },
        companyCarAllow: { type: Number, min: 0 },
        petrolCard: { type: Number, min: 0 },
        otherAllowance: { type: Number, min: 0 },
        totalSalary: { type: Number, min: 0 }
    },
    employeeSignature: {
        signature: { type: String },
        signDate: { type: Date, default: Date.now },
    },
    checkedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        autopopulate: {
            select: "firstName lastName displayName email empId"
        }
    },
    approvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        autopopulate: {
            select: "firstName lastName displayName email empId"
        }
    },

    beneficiaryInfo: {
        type: Schema.Types.ObjectId,
        ref: 'BeneficiaryInfo',
        autopopulate: true
    },

    consentInfo: {
        type: Schema.Types.ObjectId,
        ref: 'ConsentInfo',
        autopopulate: true
    },

    ndaInfo: {
        type: Schema.Types.ObjectId,
        ref: 'NdaInfo',
        autopopulate: true
    },

    orientationInfo: {
        type: Schema.Types.ObjectId,
        ref: 'OrientationInfo',
        autopopulate: true
    },

    visaInfo: {
        type: Schema.Types.ObjectId,
        ref: 'VisaInfo',
        autopopulate: true
    },

    isActive: { type: Boolean, default: true },
    addedBy: { type: String },
    updatedBy: { type: String },
},
    { timestamps: true }
);

EmployeeInfoSchema.plugin(require('mongoose-autopopulate'));


EmployeeInfoSchema.index({ itAssetsAccessId: 1, isActive: 1 });


const EmployeeInfo: Model<employeeinfo> = mongoose.models.EmployeeInfo || mongoose.model<employeeinfo>("EmployeeInfo", EmployeeInfoSchema)

export default EmployeeInfo
