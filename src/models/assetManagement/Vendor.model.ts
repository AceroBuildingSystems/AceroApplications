// src/models/master/Vendor.model.ts
import mongoose, { Document, Model, Schema } from "mongoose";

interface Vendor extends Document {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  addedBy?: string;
  updatedBy?: string;
}

const VendorSchema: Schema<Vendor> = new Schema(
  {
    name: { type: String, required: true },
    contactPerson: { type: String },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    isActive: { type: Boolean, default: true },
    addedBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

const Vendor: Model<Vendor> =
  mongoose.models.Vendor || mongoose.model<Vendor>("Vendor", VendorSchema);

export default Vendor;