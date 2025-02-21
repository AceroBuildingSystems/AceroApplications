import mongoose, { Document, Model, Schema } from "mongoose";
import { ProductCategoryDocument } from "@/types";

// Schema for individual specification field
const SpecificationFieldSchema = new Schema({
    name: { type: String, required: true },
    type: { 
        type: String, 
        required: true,
        enum: ['STRING', 'NUMBER', 'BOOLEAN', 'DATE', 'ENUM', 'OBJECT', 'ARRAY']
    },
    unit: { type: String }, // For NUMBER types (e.g., GB, MHz)
    enumValues: [{ type: String }], // For ENUM type
    isRequired: { type: Boolean, default: false },
    defaultValue: { type: Schema.Types.Mixed },
    validation: {
        min: { type: Number }, // For NUMBER type
        max: { type: Number }, // For NUMBER type
        pattern: { type: String }, // Regex pattern for STRING type
        minLength: { type: Number }, // For STRING/ARRAY types
        maxLength: { type: Number }, // For STRING/ARRAY types
    },
    nestedFields: [{ type: Schema.Types.Mixed }], // For OBJECT/ARRAY types, recursively contains SpecificationFieldSchema
}, { _id: false });

const ProductCategorySchema: Schema<ProductCategoryDocument> = new Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductCategory",
        autopopulate: true
    },
    description: { type: String },
    specificationTemplate: {
        version: { type: Number, default: 1 },
        fields: [SpecificationFieldSchema],
        previousVersions: [{
            version: { type: Number },
            fields: [SpecificationFieldSchema],
            updatedAt: { type: Date },
            updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
        }]
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

ProductCategorySchema.plugin(require('mongoose-autopopulate'));

// Pre-save hook to handle version control
ProductCategorySchema.pre('save', function(next) {
    if (this.isModified('specificationTemplate.fields')) {
        const currentVersion = this.specificationTemplate.version;
        const currentFields = [...this.specificationTemplate.fields];
        
        // Store current version in history
        const versionHistory = {
            version: currentVersion,
            fields: currentFields,
            updatedAt: new Date(),
            updatedBy: this.updatedBy || this.addedBy // Fallback to addedBy if updatedBy is not set
        };

        // Only add to history if we have a valid updater
        if (versionHistory.updatedBy) {
            this.specificationTemplate.previousVersions.push(versionHistory);
        }

        // Increment version
        this.specificationTemplate.version = currentVersion + 1;
    }
    next();
});

const ProductCategory: Model<ProductCategoryDocument> = mongoose.models.ProductCategory || mongoose.model<ProductCategoryDocument>("ProductCategory", ProductCategorySchema);

export default ProductCategory;