// src/models/ticket/TicketComment.model.ts
import mongoose, { Document, Model, Query, Schema } from "mongoose";

interface Attachment {
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedAt: Date;
}

export interface TicketCommentDocument extends Document {
  ticket: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  content: string;
  attachments?: Attachment[];
  replyTo?: mongoose.Types.ObjectId;
  mentions?: mongoose.Types.ObjectId[];
  isActive: boolean;
  addedBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema({
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const TicketCommentSchema: Schema<TicketCommentDocument> = new Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ticket",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: { type: String, required: true },
  attachments: [AttachmentSchema],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TicketComment"
  },
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  isActive: { type: Boolean, default: true },
  addedBy: { type: String },
  updatedBy: { type: String }
}, { timestamps: true });

TicketCommentSchema.pre<Query<any, TicketCommentDocument>>(/^find/, function (next) {
  this.populate([
    { path: "user" },
    { path: "mentions" },
    {
      path: "replyTo",
      populate: {
        path: "user"
      }
    }
  ]);
  next();
});

const TicketComment: Model<TicketCommentDocument> = 
  mongoose.models.TicketComment || mongoose.model<TicketCommentDocument>("TicketComment", TicketCommentSchema);

export default TicketComment;