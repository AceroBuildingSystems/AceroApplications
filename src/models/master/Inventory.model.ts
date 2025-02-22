import mongoose, { Model, Schema } from "mongoose";
import { inventory, BatchInfo, StockMovement } from "@/types/master/inventory.types";

const BatchInfoSchema = new Schema<BatchInfo>({
    batchNumber: { type: String, required: true },
    manufacturingDate: { type: Date },
    expiryDate: { type: Date },
    quantity: { type: Number, required: true },
    purchasePrice: { type: Number, required: true },
    purchaseDate: { type: Date, required: true },
    invoiceNumber: { type: String, required: true },
    poNumber: { type: String },
    prNumber: { type: String }
}, { _id: false });

const StockMovementSchema = new Schema<StockMovement>({
    type: { type: String, enum: ["in", "out"], required: true },
    quantity: { type: Number, required: true },
    date: { type: Date, required: true },
    reference: { type: String, required: true },
    remarks: { type: String },
    batchNumber: { type: String }
}, { _id: false });

const InventorySchema: Schema<inventory> = new Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
        autopopulate: true
    },
    warehouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Warehouse",
        required: true,
        autopopulate: true
    },
    totalQuantity: { type: Number, required: true, default: 0 },
    batches: [BatchInfoSchema],
    movements: [StockMovementSchema],
    lastStockCheck: { type: Date },
    isActive: { type: Boolean, default: true },
    addedBy: { type: String },
    updatedBy: { type: String }
}, { timestamps: true });

// Create a compound index for product and warehouse to ensure unique combination
InventorySchema.index({ product: 1, warehouse: 1 }, { unique: true });

InventorySchema.plugin(require('mongoose-autopopulate'));
const Inventory: Model<inventory> = mongoose.models.Inventory || mongoose.model<inventory>("Inventory", InventorySchema);

export default Inventory;