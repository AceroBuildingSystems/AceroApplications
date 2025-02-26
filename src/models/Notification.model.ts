import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  message: string;
  type: string; // e.g., 'approval', 'info', 'warning'
  read: boolean;
  createdAt: Date;
data?: object; // Optional data object
  link?: string; // Optional link to related content
}

const NotificationSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  message: { type: String, required: true },
  type: { type: String, required: true },
  read: { type: Boolean, default: false },
  data: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  link: { type: String },
});

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);