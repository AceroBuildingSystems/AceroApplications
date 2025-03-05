// src/models/ticket/Ticket.model.ts
import mongoose, { Document, Model, Schema,Query } from "mongoose";

export interface TicketDocument extends Document {
  title: string;
  description: string;
  status: string;
  priority: string;
  department: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  creator: mongoose.Types.ObjectId;
  assignee: mongoose.Types.ObjectId;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  addedBy: string;
  updatedBy: string;
  efforts: number;
  totalEfforts: number;
}

const TicketSchema: Schema<TicketDocument> = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, required: true, default: "NEW" },
  priority: { type: String, required: true, default: "MEDIUM" },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TicketCategory",
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  dueDate: { type: Date },
  isActive: { type: Boolean, default: true },
  addedBy: { type: String },
  updatedBy: { type: String },
  efforts: { type: Number, default: 0 },
  totalEfforts: { type: Number, default: 0 }
}, { timestamps: true });

TicketSchema.pre<Query<any, TicketDocument>>(/^find/, function (next) {
  this.populate([
    { path: "department" },
    { path: "category" },
    { path: "creator" },
    { path: "assignee" }
  ]);
  next();
});

const Ticket: Model<TicketDocument> = mongoose.models.Ticket || mongoose.model<TicketDocument>("Ticket", TicketSchema);

export default Ticket;