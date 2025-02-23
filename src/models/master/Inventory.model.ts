import mongoose, { Document, Model } from 'mongoose';

interface IInventory extends Document {
    warehouse: mongoose.Types.ObjectId;
    totalQuantity: number;
    assets: mongoose.Types.ObjectId[];
    isActive: boolean;
    addedBy: mongoose.Types.ObjectId;
    updatedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

interface IInventoryMethods {
}

interface IInventoryModel extends Model<IInventory, {}, IInventoryMethods> {
    updateInventoryForAsset(warehouseId: string, assetId: string): Promise<void>;
    transferAsset(assetId: string, fromWarehouseId: string, toWarehouseId: string): Promise<void>;
    getWarehouseInventory(warehouseId: string): Promise<IInventory[]>;
}

const InventorySchema = new mongoose.Schema({
    warehouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Warehouse',
        required: true
    },
    totalQuantity: {
        type: Number,
        default: 0
    },
    assets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asset'
    }],
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

// Create or update inventory when an asset is added
InventorySchema.statics.updateInventoryForAsset = async function(warehouseId: string, assetId: string) {
    const inventory = await this.findOne({ warehouse: warehouseId });
    
    if (inventory) {
        // Update existing inventory
        await this.findByIdAndUpdate(inventory._id, {
            $inc: { totalQuantity: 1 },
            $push: { assets: assetId }
        });
    } else {
        // Create new inventory
        await this.create({
            warehouse: warehouseId,
            totalQuantity: 1,
            assets: [assetId]
        });
    }
};

// Update inventory when an asset is transferred
InventorySchema.statics.transferAsset = async function(assetId: string, fromWarehouseId: string, toWarehouseId: string) {
    // Decrease quantity in source warehouse
    await this.findOneAndUpdate(
        { warehouse: fromWarehouseId },
        {
            $inc: { totalQuantity: -1 },
            $pull: { assets: assetId }
        }
    );

    // Increase quantity in destination warehouse
    const toInventory = await this.findOne({ warehouse: toWarehouseId });
    if (toInventory) {
        await this.findByIdAndUpdate(toInventory._id, {
            $inc: { totalQuantity: 1 },
            $push: { assets: assetId }
        });
    } else {
        await this.create({
            warehouse: toWarehouseId,
            totalQuantity: 1,
            assets: [assetId]
        });
    }
};

// Get inventory levels for a warehouse
InventorySchema.statics.getWarehouseInventory = async function(warehouseId: string) {
    return this.findOne({ warehouse: warehouseId })
        .populate({
            path: 'assets',
            populate: {
                path: 'product',
                model: 'Product'
            }
        });
};

const Inventory = mongoose.models.Inventory || mongoose.model<IInventory, IInventoryModel>('Inventory', InventorySchema);

export type { IInventory, IInventoryModel };
export default Inventory;