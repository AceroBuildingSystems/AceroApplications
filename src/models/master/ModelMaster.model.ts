import mongoose, { Document, Model, Schema } from "mongoose";

const ModelMasterSchema = new Schema({
    modelNumber: { 
        type: String, 
        required: true, 
        unique: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductCategory",
        required: true,
        autopopulate: true
    },
    specifications: {
        templateVersion: { type: Number, required: true },
        values: { type: Schema.Types.Mixed, required: true } // Actual values for the category's spec template
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true,
        autopopulate: true
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'DISCONTINUED'],
        default: 'ACTIVE'
    },
    description: { type: String },
    cost: {
        purchasePrice: { type: Number, required: true },
        currency: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: "Currency",
            required: true,
            autopopulate: true
        }
    },
    // Asset specific fields
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
            description: { type: String }
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

ModelMasterSchema.plugin(require('mongoose-autopopulate'));

// Pre-save hook to validate specifications against category template
ModelMasterSchema.pre('save', async function(next) {
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

const ModelMaster: Model<Document> = mongoose.models.ModelMaster || mongoose.model("ModelMaster", ModelMasterSchema);

export default ModelMaster;