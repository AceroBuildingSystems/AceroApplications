import { min } from "lodash";
import mongoose, { Document, Model, Schema } from "mongoose";

import { performanceAppraisal } from "@/types/hrms/performanceAppraisal.types";


const evaluationParameters = new mongoose.Schema({
    parameterName: { type: String, required: true }, // e.g. "Technical Knowledge"
    description: { type: String },
    score: { type: Number, min: 1, max: 5, default: '' },

}, { _id: false });

const employeeResponse = new mongoose.Schema(
    {
        reviewed: { type: Boolean, default: false },
        signature: { type: String },
        comments: { type: String },
        date: { type: Date },
    },
    { _id: false }
);

const depHeadFeedbackSchema = new mongoose.Schema({
    findings: { type: String },
    trainingRecommenedation: { type: String },
    otherRecommenedation: { type: String },
    signature: { type: String },
    date: { type: Date }
}, { _id: false });

const PerformanceAppraisalSchema: Schema<performanceAppraisal> = new Schema({

    employee: {
        type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, autopopulate: {
            select: "firstName lastName displayName email empId designation department"
        }
    },
    evaluationDate: { type: Date, default: Date.now },

    evaluationParameters: [evaluationParameters],
    employeeResponse: employeeResponse,
    depHeadFeedback: depHeadFeedbackSchema,
    purposeOfEvaluation: { type: String },

    isActive: { type: Boolean, default: true },
    createddBy: { type: String },
    updatedBy: { type: String },
},
    {
        timestamps: true,

    }
);

// Add autopopulate plugin
PerformanceAppraisalSchema.plugin(require('mongoose-autopopulate'));


PerformanceAppraisalSchema.index({ employee: 1, isActive: 1 });

const PerformanceAppraisal: Model<performanceAppraisal> = mongoose.models.PerformanceAppraisal || mongoose.model<performanceAppraisal>("PerformanceAppraisal", PerformanceAppraisalSchema)

export default PerformanceAppraisal
