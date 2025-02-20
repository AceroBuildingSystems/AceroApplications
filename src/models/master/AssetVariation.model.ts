import mongoose, { Schema, Document, Model } from 'mongoose';
import { IAssetModel } from './AssetModel.model';

export interface IAssetVariation extends Document {
  modelNumber: IAssetModel['_id'];
  specification: object;
}

const AssetVariationSchema: Schema = new Schema({
  modelNumber: { type: Schema.Types.ObjectId, required: true, ref: 'AssetModel' },
  specification: [{ type: Schema.Types.Mixed}],
});

const AssetVariation: Model<IAssetVariation> = mongoose.models.AssetVariation || mongoose.model<IAssetVariation>("AssetVariation", AssetVariationSchema)

export default AssetVariation