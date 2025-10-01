import { Document, Types } from "mongoose";

export interface employeejoining {
  // Request Information
  offerAcceptance: Types.ObjectId; // populated with OfferAcceptance
  reportingTo: Types.ObjectId;     // populated with User (with select fields)
  dateOfReporting: Date;
  completedStep?: number;
  status?: "incomplete" | "completed";
  // Meta
  isActive?: boolean;
  addedBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
