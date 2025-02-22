import mongoose, { Model, Schema } from "mongoose";
import { product } from "@/types/master/product.types";

const WarrantySchema = new Schema({
    duration: { type: Number, required: true },
    unit: { type: String, required: true },
    description: { type: String }
}, { _id: false });

const ProductSchema: Schema<product> = new Schema({
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductCategory",
        required: true,
        autopopulate: true
    },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    specifications: { type: mongoose.Schema.Types.Mixed, required: true }, // Stores the actual spec values
    description: { type: String },
    unitOfMeasure: { type: String, required: true },
    minimumStockLevel: { type: Number },
    maximumStockLevel: { type: Number },
    reorderPoint: { type: Number },
    unitCost: { type: Number },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true,
        autopopulate: true
    },
    alternateVendors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        autopopulate: true
    }],
    warranty: { type: WarrantySchema },
    isActive: { type: Boolean, default: true },
    addedBy: { type: String },
    updatedBy: { type: String }
}, { timestamps: true });

ProductSchema.plugin(require('mongoose-autopopulate'));
const Product: Model<product> = mongoose.models.Product || mongoose.model<product>("Product", ProductSchema);

export default Product;