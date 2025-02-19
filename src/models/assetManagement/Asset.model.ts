import mongoose, { Document, Model, Schema } from "mongoose";

interface Asset extends Document {
  modelNumber: string;
  specifications: [object]; // Flexible structure
  type: string;
  addedBy?: string;
  updatedBy?: string;
}

const AssetSchema: Schema<Asset> = new Schema(
  {
    modelNumber: { type: String, required: true },
    type: { type: String, required: true },
    specifications: [{name:String,data:{ type: Schema.Types.Mixed }}],
    addedBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

const Asset: Model<Asset> =
  mongoose.models.Asset || mongoose.model<Asset>("Asset", AssetSchema);

export default Asset;