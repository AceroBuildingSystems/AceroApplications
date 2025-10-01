import { min } from "lodash";
import mongoose, { Document, Model, Schema } from "mongoose";

import { interview } from "@/types/hrms/interview.types";
import { date } from "zod";

const assessmentParameterSchema = new mongoose.Schema({
    parameterName: { type: String, required: true }, // e.g. "Technical Knowledge"
    score: { type: Number, min: 1, max: 5, default: '' },

}, { _id: false });

const interviewRoundSchema = new mongoose.Schema({
    roundNumber: { type: Number },
    interviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: { type: Date, default: undefined },
    roundStatus: {
        type: String,
        enum: ["shortlisted", "rejected", "na"],
        default: "na"
    },
    remarks: { type: String, default: '' }
}, { _id: false });

const InterviewSchema: Schema<interview> = new Schema({

    candidateId: {
        type: mongoose.Schema.Types.ObjectId, ref: "CandidateInfo", required: true, autopopulate: true
    },

    // Optional link to recruitment if you need quick filtering
    recruitmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Recruitment", required: true },

    rounds: [interviewRoundSchema],

    assessmentParameters: [assessmentParameterSchema],

    hrFeedback: {
        date: { type: Date },
        remarks: { type: String }
    },

    status: {
        type: String,
        enum: [
            'recruited',
            'shortlisted',
            'held',
            'rejected',
            'na'
        ],
        default: 'na'
    },
    remarks: { type: String },
    isActive: { type: Boolean, default: true },

    updatedBy: { type: String },
},
    {
        timestamps: true,

    }
);

// Add autopopulate plugin
InterviewSchema.plugin(require('mongoose-autopopulate'));


InterviewSchema.index({ recruitmentId: 1, isActive: 1 });

const Interview: Model<interview> = mongoose.models.Interview || mongoose.model<interview>("Interview", InterviewSchema)

export default Interview
