import { min } from "lodash";
import mongoose, { Document, Model, Schema } from "mongoose";

import { offboarding } from "@/types/hrms/performanceAppraisal.types";


const handoverDetailSchema = new Schema(
    {
        department: { type: String, required: true },
        taskDescription: [{ type: String }],
        handoverTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // selected employee
        handoverDate: { type: Date },
        status: { type: Boolean, default: false },
        signature: { type: String },
    },
    { _id: false }
);
const clearanceSignatureSchema = new Schema(
    {
        signature: { type: String },
        date: { type: Date },
    },
    { _id: false }
);

const OffboardingSchema: Schema<Offboarding> = new Schema({

    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        autopopulate: {
            select:
                "firstName lastName displayName email empId designation department",
        },
    },

    releavingDate: { type: Date }, // Last working date

    // Handover section
    handoverDetails: [handoverDetailSchema],

    remarks: { type: String },

    // Clearance signatures
    employeeClearance: clearanceSignatureSchema,
    endorsedBy: clearanceSignatureSchema,
    reviewedBy: clearanceSignatureSchema,
    approvedBy: clearanceSignatureSchema,

    // meta
    isActive: { type: Boolean, default: true },
    createdBy: { type: String },
    updatedBy: { type: String },
},
    {
        timestamps: true,

    }
);

// Add autopopulate plugin
OffboardingSchema.plugin(require('mongoose-autopopulate'));


OffboardingSchema.index({ employee: 1, isActive: 1 });

const Offboarding: Model<offboarding> = mongoose.models.Offboarding || mongoose.model<offboarding>("Offboarding", OffboardingSchema)

export default Offboarding
