import mongoose, { Schema, Document, Model } from 'mongoose';
import { IAssetModel } from './AssetModel.model';
import { department } from "@/types/master/department.types";
import { UserDocument } from "@/types";
import { location } from "@/types/master/location.types";
import { IVendor } from './Vendor.model';

export interface IAsset extends Document {
  modelNumber: IAssetModel['_id'];
  specification: any;
  serialNumber: string;
  department: department['_id'];
  user: UserDocument['_id'];
  status: string;
  location: location['_id'];
  vendor: IVendor['_id'];
  purchaseDate: Date;
}

const AssetSchema: Schema = new Schema({
  modelNumber: { type: Schema.Types.ObjectId, required: true, ref: 'AssetModel' },
  specification: { type: Schema.Types.Mixed, required: false },
  serialNumber: { type: String, required: true },
  depatment: { type: Schema.Types.ObjectId, ref: 'Department' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, required: true },
  location: { type: Schema.Types.ObjectId, required: true, ref: 'Location' },
  vendor: { type: Schema.Types.ObjectId, required: true, ref: 'Vendor' },
  purchaseDate: { type: Date, required: true },
});

const Asset: Model<IAsset> = mongoose.models.Asset || mongoose.model<IAsset>("Asset", AssetSchema)

export default Asset