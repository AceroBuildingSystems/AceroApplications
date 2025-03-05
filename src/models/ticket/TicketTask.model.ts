// src/models/ticket/TicketTask.model.ts
import mongoose, { Document, Model, Query, Schema } from "mongoose";

export interface TicketTaskDocument extends Document {
  ticket: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: string;
  assignee: mongoose.Types.ObjectId;
  dueDate: Date;
  priority: string;
  efforts: number;
  progress: number;
  isActive: boolean;
  addedBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const TicketTaskSchema: Schema<TicketTaskDocument> = new Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ticket",
    required: true
  },
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, required: true, default: "TODO" },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  dueDate: { type: Date },
  priority: { type: String, default: "MEDIUM" },
  efforts: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  addedBy: { type: String },
  updatedBy: { type: String }
}, { timestamps: true });

TicketTaskSchema.pre<Query<any, TicketTaskDocument>>(/^find/, function (next) {
  this.populate([
    { path: "assignee" }
  ]);
  next();
});

const TicketTask: Model<TicketTaskDocument> = 
  mongoose.models.TicketTask || mongoose.model<TicketTaskDocument>("TicketTask", TicketTaskSchema);

export default TicketTask;