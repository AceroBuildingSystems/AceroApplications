import mongoose, { Schema } from "mongoose";

export interface NotificationDocument extends mongoose.Document {
  recipient: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  type: 'APPROVAL_REQUEST' | 'APPROVAL_ACTION' | 'SYSTEM' | 'INFO';
  title: string;
  message: string;
  relatedEntity?: {
    type: 'REQUISITION' | 'USER' | 'DEPARTMENT' | 'OTHER';
    id: mongoose.Types.ObjectId;
  };
  status: 'UNREAD' | 'READ';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  isActive: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<NotificationDocument>({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['APPROVAL_REQUEST', 'APPROVAL_ACTION', 'SYSTEM', 'INFO'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedEntity: {
    type: {
      type: String,
      enum: ['REQUISITION', 'USER', 'DEPARTMENT', 'OTHER']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  status: {
    type: String,
    enum: ['UNREAD', 'READ'],
    default: 'UNREAD'
  },
  priority: {
    type: String,
    enum: ['HIGH', 'MEDIUM', 'LOW'],
    default: 'MEDIUM'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
NotificationSchema.index({ recipient: 1, status: 1 });
NotificationSchema.index({ recipient: 1, createdAt: -1 });

export const Notification = mongoose.models.Notification || mongoose.model<NotificationDocument>('Notification', NotificationSchema); 