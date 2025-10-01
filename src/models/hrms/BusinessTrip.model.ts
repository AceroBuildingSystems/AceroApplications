import { min } from "lodash";
import mongoose, { Document, Model, Schema } from "mongoose";

import { businesstrip } from "@/types/hrms/businesstrip.types";

const ApprovalStepSchema = new Schema({
    step: { type: Number, required: true },
    key: { type: String, required: true }, // e.g. 'finance', 'hr', 'departmentHead', 'ceo'
    approverId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        autopopulate: {
            select: "firstName lastName displayName email empId designation department"
        }
    },
    date: { type: Date },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    remarks: { type: String }
}, { _id: false }); // 👈 disables _id for each array element

const BusinessTripSchema: Schema<businesstrip> = new Schema({

    travellerName: { type: String, required: true },
    travellerType: {
        type: String,
        enum: ["employee", "contractor", "guest"],
        default: "employee",
    },
    requestedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        autopopulate: {
            select: "firstName lastName displayName email empId designation department"
        }
    },
    empId: { type: String },
    requestedDepartment: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
        autopopulate: true
    },
    requiredPosition: {
        type: Schema.Types.ObjectId,
        ref: 'Designation',
        autopopulate: true
    },
    purposeOfVisit: { type: String },
    placeOfVisit: { type: String },
    periodFrom: { type: Date },
    periodTo: { type: Date },
    airTicketArrangedBy: { type: String },
    airTicketReimbursement: { type: Boolean, default: false },
    hotelArrangedBy: { type: String },
    hotelReimbursement: { type: Boolean, default: false },
    cashAdvanceRequired: { type: String },
    reimbursedAmount: { type: String },
    reimbursedCurrency: { type: String },
    remarks: { type: String },
    requestedBySignature: { type: String },
    approvalFlow: {
        type: [ApprovalStepSchema],
        default: []
    },


    // Form Status
    approvalStatus: {
        type: String,
        enum: [
            'pending_department_head',
            'pending_hr',
            'pending_coo_cfo',
            'pending_ceo',
            'approved',
            'rejected'
        ],
        default: 'pending_department_head'
    },
    currentApprovalStep: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
    createddBy: { type: String },
    updatedBy: { type: String },
},
    { timestamps: true }
);

// Add autopopulate plugin
BusinessTripSchema.plugin(require('mongoose-autopopulate'));

BusinessTripSchema.index({ requestedDepartment: 1, isActive: 1 });

const BusinessTrip: Model<businesstrip> = mongoose.models.BusinessTrip || mongoose.model<businesstrip>("BusinessTrip", BusinessTripSchema)

export default BusinessTrip
