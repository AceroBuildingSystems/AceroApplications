import mongoose, { Document, Model, Schema } from "mongoose";

interface Asset extends Document {
  serialNumber: string;
  modelNumber: string;
  variantSpecifications: object; // Flexible structure
  status: "active" | "damaged" | "in repair" | "inactive";
  vendor: Schema.Types.ObjectId; // Reference to Vendor
  purchaseDate?: Date;
  warrantyExpiration?: Date;
  location: Schema.Types.ObjectId; // Reference to Location
  department: Schema.Types.ObjectId; // Reference to Department
  assignedUser?: Schema.Types.ObjectId; // Reference to User, optional
  notes?: string;
  isActive: boolean;
  addedBy?: string;
  updatedBy?: string;
}

const AssetSchema: Schema<Asset> = new Schema(
  {
    serialNumber: { type: String, required: true, unique: true },
    modelNumber: { type: String, required: true },
    variantSpecifications: { type: Schema.Types.Mixed },
    status: {
      type: String,
      required: true,
      enum: ["active", "damaged", "in repair", "inactive"],
    },
    vendor: { type: Schema.Types.ObjectId, ref: "Vendor" },
    purchaseDate: { type: Date },
    warrantyExpiration: { type: Date },
    location: { type: Schema.Types.ObjectId, ref: "Location" },
    department: { type: Schema.Types.ObjectId, ref: "Department" },
    assignedUser: { type: Schema.Types.ObjectId, ref: "User" },
    notes: { type: String },
    isActive: { type: Boolean, default: true },
    addedBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

const Asset: Model<Asset> =
  mongoose.models.Asset || mongoose.model<Asset>("Asset", AssetSchema);

export default Asset;