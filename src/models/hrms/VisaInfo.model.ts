import { min } from "lodash";
import mongoose, { Document, Model, Schema } from "mongoose";

import { visainfo } from "@/types/hrms/visainfo.types";

const VisaInfoSchema: Schema<visainfo> = new Schema({

    visaIssueDate: {
        type: Date,
    },
    visaExpiryDate: {
        type: Date,
    },
    visaFileNo: {
        type: String,
    },
    emiratesIdNo: {
        type: String,
    },
    emiratesIdIssueDate: {
        type: Date,
    },
    emiratesIdExpiryDate: {
        type: Date,
    },
    workPermitNo: {
        type: String,
    },
    personCode: {
        type: String,
    },
    visaType: {
        type: Schema.Types.ObjectId,
        ref: 'VisaType',
        autopopulate: true,
    },

    laborCardExpiryDate: {
        type: Date,
    },
    iloeExpiryDate: {
        type: Date,
    },
    medicalInsuranceProvider: {
        type: String,
    },
    visaUrl: {
        type: String, // store file path or URL
    },
    emiratesIdUrl: {
        type: String,
    },
    laborCardUrl: {
        type: String,
    },
    iloeUrl: {
        type: String,
    },
    addedBy: { type: String },
    updatedBy: { type: String },
},
    { timestamps: true }
);

VisaInfoSchema.plugin(require('mongoose-autopopulate'));
const VisaInfo: Model<visainfo> = mongoose.models.VisaInfo || mongoose.model<visainfo>("VisaInfo", VisaInfoSchema)

export default VisaInfo
