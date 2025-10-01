
import mongoose, { Document, Model, Schema } from "mongoose";

import { itAssetsAccess } from "@/types/hrms/itAssetsAccess.types";


const ItAssetsAccessSchema: Schema<itAssetsAccess> = new Schema({

    // Request Information
    employeeJoiningId: {
        type: Schema.Types.ObjectId,
        ref: 'EmployeeJoining',
        required: true,
        autopopulate: true
    },
    email: { type: String },
    displayName: { type: String },
    dateOfRequest: { type: Date, default: Date.now },
    itHardwareAssets: {
        type: [String],   // array of strings
        default: []     // default  empty array
    }
    ,
    itSoftwareAssets: {
        type: [String],
        default: []
    }
    ,
    workplaceApps: {
        type: [String],
        default: []
    }
    ,
    accessToProvide: {
        type: [String],   // array of strings
        default: []     // default  empty array
    }
    ,
    othersAccess: {
        type: [String],   // array of strings
        default: []     // default  empty array
    }
    ,
    extensionType: { type: String },
    assignees: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
            autopopulate: true,
        },
    ],
    status: {
        type: String,
        enum: ["Requested", "Approved"],
        default: "Requested",
    },
    approvedByHR: {
        date: { type: Date },
        userId: {
            type: Schema.Types.ObjectId, ref: "User", autopopulate: {
                select: "firstName lastName displayName email empId designation department"
            }
        },
    },
    approvedByIT:
    {
        date: { type: Date },
        userId: {
            type: Schema.Types.ObjectId, ref: "User", autopopulate: {
                select: "firstName lastName displayName email empId designation department"
            }
        },
    },
    isActive: { type: Boolean, default: true },
    addedBy: { type: String },
    updatedBy: { type: String },
},
    {
        timestamps: true,

    }
);

// Add autopopulate plugin
ItAssetsAccessSchema.plugin(require('mongoose-autopopulate'));

// Index for efficient queries
ItAssetsAccessSchema.index({ requestedBy: 1, status: 1 });
ItAssetsAccessSchema.index({ createdAt: -1 });

const ItAssetsAccess: Model<itAssetsAccess> = mongoose.models.ItAssetsAccess || mongoose.model<itAssetsAccess>("ItAssetsAccess", ItAssetsAccessSchema)

export default ItAssetsAccess
