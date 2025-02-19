import mongoose, { Document, Model, Schema } from "mongoose";

interface assetSpecs extends Document {
    type:string;
    variantSpecifications: object;
}

const AssetSpecsSchema: Schema<assetSpecs> = new Schema(
  {
    type: { type: String, required: true },
    variantSpecifications: [{ name:String,data:{type: Schema.Types.Mixed}}],
  },
  { timestamps: true }
);

const AssetSpecs: Model<assetSpecs> =
  mongoose.models.AssetSpecs || mongoose.model<assetSpecs>("AssetSpecs", AssetSpecsSchema);

export default AssetSpecs;