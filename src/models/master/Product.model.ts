import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductCategory',
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    description: String,
    // unitOfMeasure: {
    //     type: String,
    //     required: true
    // },
    // minimumStockLevel: Number,
    // maximumStockLevel: Number,
    // reorderPoint: Number,
    // unitCost: Number,
    // vendor: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Vendor',
    //     required: true
    // },
    // alternateVendors: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Vendor'
    // }],
    isActive: {
        type: Boolean,
        default: true
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

export default Product;