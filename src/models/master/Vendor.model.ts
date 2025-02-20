import mongoose, { Schema, Document, Model } from 'mongoose';
import { location } from "@/types/master/location.types";

export interface IVendor extends Document {
  _id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  location: location['_id'];
}

const VendorSchema: Schema = new Schema({
  name: { type: String, required: true },
  contactPerson: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String},
  location: { type: Schema.Types.ObjectId, required: true, ref: 'Location' },
});
const Vendor: Model<IVendor> = mongoose.models.Vendor || mongoose.model<IVendor>("Vendor", VendorSchema)

export default Vendor