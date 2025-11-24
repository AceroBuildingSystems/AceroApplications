import { min } from "lodash";
import mongoose, { Document, Model, Schema } from "mongoose";

import { offboarding } from "@/types/hrms/offboarding.types";


const handoverTaskSchema = new Schema(
    {
        description: { type: String, required: true }, // Task description text
        remarks: { type: String }, // Captured remarks
        signature: { type: String }, // Captured signature
    },
    { _id: false }
);

const handoverDetailSchema = new Schema(
    {
        department: { type: String, required: true },
        taskDescription: [handoverTaskSchema], // Array of objects with description, remarks, signature
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

const OffboardingSchema: Schema<offboarding> = new Schema({

    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        autopopulate: {
            select:
                "firstName lastName displayName email empId designation department joiningDate",
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
