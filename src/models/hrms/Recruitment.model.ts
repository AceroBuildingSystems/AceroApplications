import { min } from "lodash";
import mongoose, { Document, Model, Schema } from "mongoose";

import { recruitment } from "@/types/hrms/recruitment.types";

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


const RecruitmentSchema: Schema<recruitment> = new Schema({

    // Request Information
    regionRequisition: {
        type: Schema.Types.ObjectId,
        ref: 'Country',
        required: true,
        autopopulate: true
    },
    employeeType: {
        type: Schema.Types.ObjectId,
        ref: 'EmployeeType',
        required: true,
        autopopulate: true
    },
    requestedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        autopopulate: {
            select: "firstName lastName displayName email empId"
        }
    },
    requestDate: { type: Date, default: Date.now },
    expectedCompletionDate: { type: Date, default: Date.now },
    department: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
        required: true,
        autopopulate: true
    },
    requiredPosition: {
        type: Schema.Types.ObjectId,
        ref: 'Designation',
        required: true,
        autopopulate: true
    },

    // Position Information
    vacancyReason: {
        type: String,
        enum: ['new_position', 'replacement'],
        required: true
    },
    positionType: {
        type: String,
        enum: ['budgeted', 'nonbudgeted'],
        default: 'budgeted'
    },
    noOfVacantPositions: { type: Number, required: true, min: 1 },
    workLocation: {
        type: Schema.Types.ObjectId,
        ref: 'Location',
        required: true,
        autopopulate: true
    },
    // Previous Employee Details
    prevEmployee: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        autopopulate: {
            select: "firstName lastName displayName email empId designation department"
        }
    },
    dateOfExit: { type: Date },
    prevEmployeeSalary: { type: Number, min: 0 },
    recruitmentType: {
        type: String,
        enum: ['internal', 'external', 'foreign'],
        required: true
    },


    // Final Approvals

    approvalFlow: {
        type: [ApprovalStepSchema],
        default: []
    },


    // Form Status
    approvalStatus: {
        type: String,
        enum: [
            'draft',
            'pending_department_head',
            'pending_hr_review',
            'pending_finance',
            'pending_hr',
            'pending_coo_cfo',
            'pending_ceo',
            'approved',
            'rejected'
        ],
        default: 'pending_finance'
    },

    status: {
        type: String,
        enum: [
            'incomplete',
            'completed'
        ],
        default: 'incomplete'
    },

    currentApprovalStep: { type: Number, default: 0 },
    completedStep: { type: Number, default: 1 },
    checker: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        autopopulate: {
            select: "firstName lastName displayName email empId designation department"
        }
    },
    interviewers: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        autopopulate: {
            select: "firstName lastName displayName email empId designation department"
        }
    }],

    isActive: { type: Boolean, default: true },

    updatedBy: { type: String },
},
    {
        timestamps: true,

    }
);

// Add autopopulate plugin
RecruitmentSchema.plugin(require('mongoose-autopopulate'));

// Generate unique requisition number
// ManpowerRequisitionSchema.pre('save', async function (next) {
//     if (this.isNew && !this.formId) {
//         const count = await mongoose.model('ManpowerRequisition').countDocuments();
//         this.formId = `MPR-${String(count + 1).padStart(6, '0')}`;
//     }
//     next();
// });

// Index for efficient queries
RecruitmentSchema.index({ requestedBy: 1, status: 1 });
RecruitmentSchema.index({ department: 1, status: 1 });
RecruitmentSchema.index({ createdAt: -1 });

const Recruitment: Model<recruitment> = mongoose.models.Recruitment || mongoose.model<recruitment>("Recruitment", RecruitmentSchema)

export default Recruitment
