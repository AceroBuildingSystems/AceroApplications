import mongoose, { Document, Model, Schema } from "mongoose";
import { ProductDocument } from "@/types";

const ProductSchema: Schema<ProductDocument> = new Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductCategory",
        required: true,
        autopopulate: true
    },
    specifications: {
        templateVersion: { type: Number, required: true },
        values: { type: Schema.Types.Mixed, required: true } // Validated against category template
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'DISCONTINUED'],
        default: 'ACTIVE'
    },
    type: {
        type: String,
        enum: ['INVENTORY', 'ASSET', 'BOTH'],
        required: true
    },
    tracking: {
        serialized: { type: Boolean, default: false }, // Track individual units with serial numbers
        batchTracking: { type: Boolean, default: false }, // Track by batch/lot numbers
        expiryTracking: { type: Boolean, default: false } // Track expiry dates
    },
    // Inventory specific fields
    inventory: {
        totalQuantity: { type: Number, default: 0 },
        availableQuantity: { type: Number, default: 0 },
        reservedQuantity: { type: Number, default: 0 },
        unit: { type: String, required: true },
        reorderPoint: { type: Number },
        minimumOrderQuantity: { type: Number },
        warehouses: [{
            warehouse: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Warehouse",
                autopopulate: true
            },
            quantity: { type: Number, default: 0 },
            location: { type: String } // Specific location within warehouse (e.g., "Rack A-123")
        }]
    },
    // Asset specific fields
    asset: {
        depreciation: {
            method: { 
                type: String,
                enum: ['STRAIGHT_LINE', 'DECLINING_BALANCE', 'NONE'],
                default: 'NONE'
            },
            rate: { type: Number }, // Annual depreciation rate
            salvageValue: { type: Number },
            usefulLife: { type: Number } // In months
        },
        maintenance: {
            schedule: {
                frequency: { type: Number }, // In days
                lastMaintenance: { type: Date },
                nextMaintenance: { type: Date }
            },
            history: [{
                type: { type: String },
                date: { type: Date },
                description: { type: String },
                cost: { type: Number },
                performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                documents: [{ type: String }] // URLs to maintenance documents
            }]
        }
    },
    // Common fields for both inventory and assets
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true,
        autopopulate: true
    },
    cost: {
        purchasePrice: { type: Number, required: true },
        currency: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: "Currency",
            required: true,
            autopopulate: true
        }
    },
    documents: [{
        type: { type: String }, // e.g., "WARRANTY", "MANUAL", "CERTIFICATE"
        name: { type: String },
        url: { type: String },
        expiryDate: { type: Date }
    }],
    images: [{ type: String }], // URLs to product images
    tags: [{ type: String }],
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

ProductSchema.plugin(require('mongoose-autopopulate'));

// Pre-save hook to validate specifications against category template
ProductSchema.pre('save', async function(next) {
    if (this.isModified('specifications')) {
        const category = await mongoose.model('ProductCategory').findById(this.category);
        if (!category) {
            throw new Error('Product category not found');
        }

        // Ensure template version matches
        if (this.specifications.templateVersion !== category.specificationTemplate.version) {
            throw new Error('Product specifications template version mismatch');
        }

        // TODO: Add validation of specification values against template
        // This would involve recursive validation of nested fields
        // and type checking based on the template
    }
    next();
});

// Pre-save hook to update inventory quantities
ProductSchema.pre('save', function(next) {
    if (this.isModified('inventory.warehouses')) {
        // Calculate total quantity across all warehouses
        const totalQty = (this.inventory?.warehouses || []).reduce((sum: number, w: { quantity?: number }) => {
            return sum + (w.quantity || 0);
        }, 0);

        if (this.inventory) {
            this.inventory.totalQuantity = totalQty;
            this.inventory.availableQuantity = totalQty - (this.inventory.reservedQuantity || 0);
        }
    }
    next();
});

const Product: Model<ProductDocument> = mongoose.models.Product || mongoose.model<ProductDocument>("Product", ProductSchema);

export default Product;