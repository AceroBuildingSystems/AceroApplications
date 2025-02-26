import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  action: string; // e.g., 'create', 'update', 'delete'
  module: string; // e.g., 'Country', 'User'
  recordId: mongoose.Schema.Types.ObjectId; // ID of the record being acted upon
  outcome: string; // e.g., 'success', 'failure'
  timestamp: Date;
  details?: object; // Optional details about the activity
}

const ActivityLogSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  action: { type: String, required: true },
  module: { type: String, required: true },
  recordId: { type: mongoose.Schema.Types.ObjectId },
  outcome: { type: String },
  timestamp: { type: Date, default: Date.now },
  details: { type: Object },
});

export default mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);