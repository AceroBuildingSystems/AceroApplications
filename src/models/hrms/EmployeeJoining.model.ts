import { min } from "lodash";
import mongoose, { Document, Model, Schema } from "mongoose";

import { employeejoining } from "@/types/hrms/employeejoining.types";


const EmployeeJoiningSchema: Schema<employeejoining> = new Schema({

    // Request Information
    offerAcceptance: {
        type: Schema.Types.ObjectId,
        ref: 'OfferAcceptance',
        required: true,
        autopopulate: true,
        unique: true
    },
    reportingTo: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        autopopulate: {
            select: "firstName lastName displayName email empId"
        }
    },
    dateOfReporting: { type: Date, required: true },
    completedStep: { type: Number, default: 1 },
    status: {
        type: String,
        enum: [
            'incomplete',
            'completed'
        ],
        default: 'incomplete'
    },
    isActive: { type: Boolean, default: true },
    addedBy: { type: String },
    updatedBy: { type: String },
},
    {
        timestamps: true,

    }
);

EmployeeJoiningSchema.plugin(require('mongoose-autopopulate'));


EmployeeJoiningSchema.index({ reportingTo: 1, status: 1 });


const EmployeeJoining: Model<employeejoining> = mongoose.models.EmployeeJoining || mongoose.model<employeejoining>("EmployeeJoining", EmployeeJoiningSchema)

export default EmployeeJoining
