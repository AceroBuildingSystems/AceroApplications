import mongoose, { Schema, Document, Model } from 'mongoose';
import { IAssetCategory } from './AssetCategory.model';

export interface IAssetModel extends Document {
  category: IAssetCategory['_id'];
  modelNumber: string;
  name: string;
  manufacturer: string;
}

const AssetModelSchema: Schema = new Schema({
  category: { type: Schema.Types.ObjectId, required: true, ref: 'AssetCategory',autopopulate: true },
  modelNumber: { type: String, required: true },
  name: { type: String },
  manufacturer: { type: String, required: true },
});

AssetModelSchema.plugin(require('mongoose-autopopulate'));


const AssetModel: Model<IAssetModel> = mongoose.models.AssetModel || mongoose.model<IAssetModel>("AssetModel", AssetModelSchema)

export default AssetModel