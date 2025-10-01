import { min } from "lodash";
import mongoose, { Document, Model, Schema } from "mongoose";

import { offeracceptance } from "@/types/hrms/offeracceptance.types";
import { passiveEventSupported } from "@tanstack/react-table";

const OfferAccpetanceSchema: Schema<offeracceptance> = new Schema({

    interviewAssesmentId: {
        type: mongoose.Schema.Types.ObjectId, ref: "Interview", required: true, autopopulate: true
    },

    // Optional link to recruitment if you need quick filtering
    recruitmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Recruitment", required: true },
    offerIssueDate: { type: Date, default: Date.now },
    expectedJoiningDate: { type: Date, default: undefined },
    joiningImmediate: { type: String, default: '' },
    reasonToTravel: { type: String, default: '' },
    noOfDays: { type: Number },
    offerStatus: {
        type: String,
        enum: [
            'issued',
            'accepted',
            'rejected', ''
        ],
        default: 'issued'
    },
    onboardingStatus: {
        type: String,
        enum: [
            'active',
            'inactive',

        ],
        default: 'inactive'
    },
    remarks: { type: String, default: '' },
    offerLetterUrl: { type: String },
    passportInfo: {
        passportNo: String,
        issueDate: Date,
        expiryDate: Date,
        passportUrl: String,
    },

    uploadDocuments: {
        visitVisaUrl: String,
        cancellationVisaUrl: String,
        educationCertificatesUrl: [String],
        passportSizePhotoUrl: String,
    },
    isActive: { type: Boolean, default: true },
    createddBy: { type: String },
    updatedBy: { type: String },
},
    {
        timestamps: true,

    }
);

// Add autopopulate plugin
OfferAccpetanceSchema.plugin(require('mongoose-autopopulate'));


OfferAccpetanceSchema.index({ recruitmentId: 1, isActive: 1 });

const OfferAcceptance: Model<offeracceptance> = mongoose.models.OfferAcceptance || mongoose.model<offeracceptance>("OfferAcceptance", OfferAccpetanceSchema)

export default OfferAcceptance
