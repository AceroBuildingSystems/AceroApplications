// src/models/ticket/TicketComment.model.ts
import mongoose, { Document, Model, Query, Schema } from "mongoose";

export interface TicketCommentDocument extends Document {
  ticket: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  content: string;
  attachments: string[];
  isActive: boolean;
  addedBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

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
  attachments: [{ type: String }],
  isActive: { type: Boolean, default: true },
  addedBy: { type: String },
  updatedBy: { type: String }
}, { timestamps: true });

TicketCommentSchema.pre<Query<any, TicketCommentDocument>>(/^find/, function (next) {
  this.populate([
    { path: "user" }
  ]);
  next();
});

const TicketComment: Model<TicketCommentDocument> = 
  mongoose.models.TicketComment || mongoose.model<TicketCommentDocument>("TicketComment", TicketCommentSchema);

export default TicketComment;