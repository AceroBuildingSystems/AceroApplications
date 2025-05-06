import mongoose, { Schema, Document } from "mongoose";

export interface ApprovalFlowTemplateDocument extends Document {
  name: string;
  description: string;
  entityType: string; // e.g., "requisition", "leave", "expense"
  isActive: boolean;
  nodes: {
    id: string;
    type: 'user' | 'role' | 'department';
    entityId: mongoose.Types.ObjectId; // User, Role or Department ID
    positionX: number;
    positionY: number;
    label: string;
  }[];
  connections: {
    sourceId: string;
    targetId: string;
    label?: string;
    condition?: string; // For conditional routing
  }[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
}

const ApprovalFlowTemplateSchema = new Schema<ApprovalFlowTemplateDocument>(
  {
    name: { type: String, required: true },
    description: { type: String },
    entityType: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    
    // Visual representation for the flow designer
    nodes: [{
      id: { type: String, required: true }, // Unique ID for the node
      type: { type: String, enum: ['user', 'role', 'department'], required: true },
      entityId: { type: Schema.Types.ObjectId, required: true }, // Reference to User, Role or Department
      positionX: { type: Number, default: 0 },
      positionY: { type: Number, default: 0 },
      label: { type: String }
    }],
    
    // Connections between nodes
    connections: [{
      sourceId: { type: String, required: true }, // Node ID for source
      targetId: { type: String, required: true }, // Node ID for target
      label: { type: String },
      condition: { type: String } // For conditional routing
    }],
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

// Index for performance
ApprovalFlowTemplateSchema.index({ entityType: 1, isActive: 1 });
ApprovalFlowTemplateSchema.index({ name: 1 });

export default mongoose.models.ApprovalFlowTemplate || 
  mongoose.model<ApprovalFlowTemplateDocument>("ApprovalFlowTemplate", ApprovalFlowTemplateSchema); 