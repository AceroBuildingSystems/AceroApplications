import mongoose, { Model, Schema } from "mongoose";
import { productCategory } from "@/types/master/productCategory.types";

const ProductCategorySchema: Schema<productCategory> = new Schema({
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    description: { type: String },
    specsRequired: { type: mongoose.Schema.Types.Mixed, required: true }, // Stores the JSON object of required specs
    isActive: { type: Boolean, default: true },
    addedBy: { type: String },
    updatedBy: { type: String }
}, { timestamps: true });

const ProductCategory: Model<productCategory> = mongoose.models.ProductCategory || mongoose.model<productCategory>("ProductCategory", ProductCategorySchema);

export default ProductCategory;