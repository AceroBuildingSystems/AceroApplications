import mongoose, { Schema, Document, Model } from 'mongoose';
import { location } from "@/types/master/location.types";

export interface IWarehouse extends Document {
  name: string;
  location: location['_id'];
}

const WarehouseSchema: Schema = new Schema({
  name: { type: String, required: true },
  location: { type: Schema.Types.ObjectId, required: true, ref: 'Location' },
});
const Warehouse: Model<IWarehouse> = mongoose.models.Warehouse || mongoose.model<IWarehouse>("Warehouse", WarehouseSchema)

export default Warehouse