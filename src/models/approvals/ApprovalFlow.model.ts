import mongoose, { Schema, Document } from "mongoose";

export interface ApprovalFlowDocument extends Document {
  name: string;
  description: string;
  entityType: string; // e.g., "ManpowerRequisition", "LeaveRequest", "Expense"
  isActive: boolean;
  steps: {
    order: number;
    role: mongoose.Types.ObjectId; // The role that can approve this step
    department?: mongoose.Types.ObjectId; // Optional department restriction
    approvalType: 'Single' | 'Any' | 'All'; // Single person, any person in role, all people in role
    actionName: string; // Display name for the action (e.g., "Department Head Approval")
    isOptional: boolean;
    allowSkip: boolean;
    allowDelegate: boolean;
    notifyEmails?: string[];
    escalationTime?: number; // In hours, if approval not done in this time
    escalateTo?: mongoose.Types.ObjectId; // User to escalate to
  }[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
}

const ApprovalFlowSchema = new Schema<ApprovalFlowDocument>(
  {
    name: { type: String, required: true },
    description: { type: String },
    entityType: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    steps: [
      {
        order: { type: Number, required: true },
        role: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
        department: { type: Schema.Types.ObjectId, ref: 'Department' },
        approvalType: { 
          type: String, 
          enum: ['Single', 'Any', 'All'], 
          default: 'Any' 
        },
        actionName: { type: String, required: true },
        isOptional: { type: Boolean, default: false },
        allowSkip: { type: Boolean, default: false },
        allowDelegate: { type: Boolean, default: false },
        notifyEmails: [{ type: String }],
        escalationTime: { type: Number },
        escalateTo: { type: Schema.Types.ObjectId, ref: 'User' }
      }
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

// Index for performance
ApprovalFlowSchema.index({ entityType: 1, isActive: 1 });

export default mongoose.models.ApprovalFlow || 
  mongoose.model<ApprovalFlowDocument>("ApprovalFlow", ApprovalFlowSchema); 