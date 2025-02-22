import mongoose, { Model, Schema } from "mongoose";
import { warehouse, StorageSection } from "@/types/master/warehouse.types";

const StorageSectionSchema = new Schema<StorageSection>({
    name: { type: String, required: true },
    code: { type: String, required: true },
    capacity: { type: Number, required: true },
    unit: { type: String, required: true },
    description: { type: String }
}, { _id: false });

const WarehouseSchema: Schema<warehouse> = new Schema({
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        required: true,
        autopopulate: true
    },
    contactPerson: { type: String, required: true },
    contactNumber: { type: String, required: true },
    storageSections: [StorageSectionSchema],
    totalCapacity: { type: Number, required: true },
    capacityUnit: { type: String, required: true },
    operatingHours: { type: String },
    isActive: { type: Boolean, default: true },
    addedBy: { type: String },
    updatedBy: { type: String }
}, { timestamps: true });

WarehouseSchema.plugin(require('mongoose-autopopulate'));
const Warehouse: Model<warehouse> = mongoose.models.Warehouse || mongoose.model<warehouse>("Warehouse", WarehouseSchema);

export default Warehouse;