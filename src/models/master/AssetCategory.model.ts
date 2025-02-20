import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAssetCategory extends Document {
  _id: string;
  type: string;
  description: string;
  variationSchema: any;
}

const AssetCategorySchema: Schema = new Schema({
  type: { type: String, required: true },
  description: { type: String},
  variationSchema: { type: Schema.Types.Mixed},
});

const AssetCategory: Model<IAssetCategory> = mongoose.models.AssetCategory || mongoose.model<IAssetCategory>("AssetCategory", AssetCategorySchema)

export default AssetCategory