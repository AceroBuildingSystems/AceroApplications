import mongoose, { Model, Schema, Types } from "mongoose";

import type { warehouse } from "@/types/master/warehouse.types";

const WarehouseSchema: Schema<warehouse> = new Schema({
       name: String,
       location: { type: Types.ObjectId, ref: 'Location', autopopulate: true },
       addedBy: { type: Schema.Types.ObjectId, ref: 'User', autopopulate: true },
       updatedBy: { type: Schema.Types.ObjectId, ref: 'User', autopopulate: true },
       isActive:{ type: Boolean, default: true },
}, { timestamps: true })

WarehouseSchema.plugin(require('mongoose-autopopulate'));
const Warehouse: Model<warehouse> = mongoose.models.Warehouse || mongoose.model<warehouse>("warehouse", WarehouseSchema)

export default Warehouse
