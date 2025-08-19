import mongoose, { Document, Model, Schema } from "mongoose";

import { candidateInformation } from "@/types/hrms/candidateInformation.types";

const DeclaredBySchema = new mongoose.Schema({
    candidateSignature: { type: String, default: "" }, // Could store base64, image URL, or file path
    date: { type: Date, default: Date.now }
});
const FriendsRelativeDetailsSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    relation: { type: String, trim: true },
    contactNo: { type: String, trim: true }
}, { _id: false });

const CandidateInfoSchema: Schema<candidateInformation> = new Schema({
    recruitment: {
        type: Schema.Types.ObjectId,
        ref: 'Recruitment',
        required: true,
        autopopulate: true
    },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    gender: { type: String, enum: ["male", "female", "other", ""] },
    dateOfBirth: { type: Date },
    nationality: {
        type: Schema.Types.ObjectId,
        ref: 'Country',
        required: true,
        autopopulate: true
    },
    maritalStatus: { type: String, enum: ["single", "married", "divorced", "widowed", ""] },

    contactNumber: { type: String, trim: true },
    email: { type: String, trim: true },

    currentEmployer: { type: String, trim: true },
    currentDesignation: { type: String, trim: true },
    currentLocation: { type: String, trim: true },
    currentWorkLocation: { type: String, trim: true },
    currentlyWorking: { type: String, enum: ["yes", "no", ""] },

    totalYearsOfExperience: { type: Number },
    relevantYearsOfExperience: { type: Number },

    currentSalaryPackage: { type: Number }, // Store in yearly value
    expectedSalaryPackage: { type: Number },
    noticePeriodRequired: { type: String, trim: true },

    highestQualification: { type: String, trim: true },
    degreeCertificateAttested: { type: String, enum: ["yes", "no", ""] },
    certifications: { type: String, trim: true },

    drivingLicense: { type: String, trim: true },
    visaType: { type: String, trim: true },
    visaExpiry: { type: Date },

    sourceOfPositionInfo: { type: String, trim: true },
    friendsRelativesInABS: { type: String, trim: true },
    friendsRelativesDetails: { type: FriendsRelativeDetailsSchema, default: {} },

    languagesKnown: { type: String, default: '' },

    remarks: { type: String, trim: true },
    checkedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        autopopulate: {
            select: "firstName lastName displayName email empId"
        }
    },

    declaredBy: { type: DeclaredBySchema, default: {} },

    attachResume: { type: String, required: true }, // Store file path or URL
     isActive: { type: Boolean, default: true },

},
    {
        timestamps: true,

    });

CandidateInfoSchema.plugin(require('mongoose-autopopulate'));

// Generate unique requisition number
// ManpowerRequisitionSchema.pre('save', async function (next) {
//     if (this.isNew && !this.formId) {
//         const count = await mongoose.model('ManpowerRequisition').countDocuments();
//         this.formId = `MPR-${String(count + 1).padStart(6, '0')}`;
//     }
//     next();
// });

// Index for efficient queries
CandidateInfoSchema.index({recruitment: 1, createdAt: -1 });

const CandidateInfo: Model<candidateInformation> = mongoose.models.CandidateInfoSchema || mongoose.model<candidateInformation>("CandidateInfo", CandidateInfoSchema)

export default CandidateInfo

