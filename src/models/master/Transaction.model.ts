import mongoose, { Document, Model, Schema } from "mongoose";
import { TransactionDocument } from "@/types";

const TransactionSchema: Schema<TransactionDocument> = new Schema({
    transactionId: { type: String, required: true, unique: true },
    type: {
        type: String,
        required: true,
        enum: [
            // Inventory transactions
            'STOCK_RECEIPT',      // Initial stock receipt
            'STOCK_TRANSFER',     // Transfer between warehouses
            'STOCK_ADJUSTMENT',   // Quantity adjustments
            'STOCK_RETURN',       // Return to vendor
            // Asset transactions
            'ASSET_ASSIGNMENT',   // Assign to user/department
            'ASSET_TRANSFER',     // Transfer between users/departments
            'ASSET_RETURN',       // Return from user/department
            'ASSET_DISPOSAL',     // Asset disposal/retirement
            // Common transactions
            'MAINTENANCE_START',  // Start maintenance
            'MAINTENANCE_END'     // End maintenance
        ]
    },
    status: {
        type: String,
        required: true,
        enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED'],
        default: 'PENDING'
    },
    // Product/Asset being transacted
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
        autopopulate: true
    },
    // For serialized products
    serialNumbers: [{ type: String }],
    // For batch-tracked products
    batchNumber: { type: String },
    // Quantity for inventory items
    quantity: { type: Number },
    // Source location/entity
    source: {
        type: {
            type: String,
            required: true,
            enum: ['WAREHOUSE', 'USER', 'DEPARTMENT', 'VENDOR']
        },
        warehouse: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Warehouse"
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department"
        },
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor"
        },
        location: { type: String } // Specific location within source
    },
    // Destination location/entity
    destination: {
        type: {
            type: String,
            required: true,
            enum: ['WAREHOUSE', 'USER', 'DEPARTMENT', 'VENDOR']
        },
        warehouse: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Warehouse"
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department"
        },
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor"
        },
        location: { type: String } // Specific location within destination
    },
    // For maintenance transactions
    maintenance: {
        type: { type: String },
        description: { type: String },
        cost: { type: Number },
        scheduledDate: { type: Date },
        completionDate: { type: Date }
    },
    // For asset assignments
    assignment: {
        startDate: { type: Date },
        endDate: { type: Date },
        returnDate: { type: Date },
        condition: {
            before: { type: String },
            after: { type: String }
        }
    },
    // Common fields
    reason: { type: String },
    notes: { type: String },
    documents: [{
        type: { type: String },
        name: { type: String },
        url: { type: String }
    }],
    // Approval workflow
    approval: {
        required: { type: Boolean, default: false },
        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            default: 'PENDING'
        },
        approver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        approvedAt: { type: Date },
        comments: { type: String }
    },
    // Audit fields
    organisation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organisation",
        required: true,
        autopopulate: true
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
});

// Automatically populate references
TransactionSchema.plugin(require('mongoose-autopopulate'));

// Generate transaction ID
TransactionSchema.pre('save', async function(next) {
    if (!this.transactionId) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        
        // Get count of transactions for current month
        const count = await mongoose.model('Transaction').countDocuments({
            createdAt: {
                $gte: new Date(date.getFullYear(), date.getMonth(), 1),
                $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
            }
        });
        
        // Format: TRX-YY-MM-XXXXX
        this.transactionId = `TRX-${year}-${month}-${(count + 1).toString().padStart(5, '0')}`;
    }
    next();
});

// Update product/asset status after transaction
TransactionSchema.post('save', async function() {
    const product = await mongoose.model('Product').findById(this.product);
    if (!product) return;

    switch (this.type) {
        case 'STOCK_RECEIPT':
        case 'STOCK_TRANSFER':
            // Update warehouse quantities
            // This would be handled by a separate inventory management service
            break;
        case 'ASSET_ASSIGNMENT':
            if (this.status === 'COMPLETED') {
                // Update asset assignment status
                // This would be handled by a separate asset management service
            }
            break;
        // Handle other transaction types...
    }
});

const Transaction: Model<TransactionDocument> = mongoose.models.Transaction || mongoose.model<TransactionDocument>("Transaction", TransactionSchema);

export default Transaction;