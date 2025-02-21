import mongoose, { Document, Model, Schema } from "mongoose";
import { WarehouseDocument } from "@/types";

const WarehouseSchema: Schema<WarehouseDocument> = new Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true, enum: ['PRIMARY', 'SECONDARY', 'TEMPORARY'] },
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        required: true,
        autopopulate: true
    },
    capacity: {
        total: { type: Number, required: true },
        available: { type: Number, required: true },
        unit: { type: String, required: true, default: 'sqft' }
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        autopopulate: true
    },
    status: { 
        type: String, 
        enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'],
        default: 'ACTIVE'
    },
    isActive: { type: Boolean, default: true },
    organisation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organisation",
        required: true,
        autopopulate: true
    },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

WarehouseSchema.plugin(require('mongoose-autopopulate'));

const Warehouse: Model<WarehouseDocument> = mongoose.models.Warehouse || mongoose.model<WarehouseDocument>("Warehouse", WarehouseSchema);

export default Warehouse;