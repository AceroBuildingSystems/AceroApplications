import mongoose, { Document, Model } from 'mongoose';
import Inventory, { IInventoryModel } from './Inventory.model';

interface IMaintenanceRecord {
    date: Date;
    type: 'preventive' | 'corrective' | 'upgrade';
    description: string;
    cost: number;
    performedBy: string;
    nextMaintenanceDate?: Date;
}

interface IAssignment {
    assignedTo: string;
    assignedType: 'user' | 'department';
    assignedDate: Date;
    assignedBy: mongoose.Types.ObjectId;
    location?: string;
    remarks?: string;
    returnedDate?: Date;
}

interface IAsset extends Document {
    _id: mongoose.Types.ObjectId;
    serialNumber: string;
    product: mongoose.Types.ObjectId;
    warehouse: mongoose.Types.ObjectId;
    status: 'available' | 'assigned' | 'maintenance' | 'retired';
    purchaseDate: Date;
    purchasePrice: number;
    vendor: mongoose.Types.ObjectId;
    poNumber: string;
    prNumber?: string;
    invoiceNumber: string;
    warrantyStartDate: Date;
    warrantyEndDate: Date;
    warrantyDetails?: string;
    specifications: Map<string, any>;
    currentAssignment?: IAssignment;
    assignmentHistory: IAssignment[];
    maintenanceRecords: IMaintenanceRecord[];
    isActive: boolean;
    addedBy: mongoose.Types.ObjectId;
    updatedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

interface IAssetMethods {
    assign(assignedTo: string, assignedType: 'user' | 'department', assignedBy: string, location?: string, remarks?: string): Promise<void>;
    return(remarks?: string): Promise<void>;
    transfer(toWarehouseId: string): Promise<void>;
    addMaintenanceRecord(record: Omit<IMaintenanceRecord, 'date'>): Promise<void>;
    completeMaintenance(): Promise<void>;
    retire(remarks?: string): Promise<void>;
}

interface IAssetModel extends Model<IAsset, {}, IAssetMethods> {}

const AssetSchema = new mongoose.Schema({
    // Basic Information
    serialNumber: {
        type: String,
        required: true,
        unique: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    warehouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Warehouse',
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'assigned', 'maintenance', 'retired'],
        default: 'available'
    },

    // Purchase Information
    purchaseDate: {
        type: Date,
        required: true
    },
    purchasePrice: {
        type: Number,
        required: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    poNumber: {
        type: String,
        required: true
    },
    prNumber: String,
    invoiceNumber: {
        type: String,
        required: true
    },

    // Warranty Information
    warrantyStartDate: {
        type: Date,
        required: true
    },
    warrantyEndDate: {
        type: Date,
        required: true
    },
    warrantyDetails: String,

    // Specifications (based on product category)
    specifications: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        required: true
    },

    // Assignment Information
    currentAssignment: {
        assignedTo: {
            type: String,
            ref: 'User'
        },
        assignedType: {
            type: String,
            enum: ['user', 'department']
        },
        assignedDate: Date,
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        location: String,
        remarks: String
    },

    // Assignment History
    assignmentHistory: [{
        assignedTo: {
            type: String,
            ref: 'User'
        },
        assignedType: {
            type: String,
            enum: ['user', 'department']
        },
        assignedDate: Date,
        returnedDate: Date,
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        location: String,
        remarks: String
    }],

    // Maintenance Records
    maintenanceRecords: [{
        date: Date,
        type: {
            type: String,
            enum: ['preventive', 'corrective', 'upgrade']
        },
        description: String,
        cost: Number,
        performedBy: String,
        nextMaintenanceDate: Date
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

// Update inventory when asset is created
AssetSchema.post('save', async function(this: IAsset) {
    const inventory = mongoose.model('Inventory') as IInventoryModel;
    await inventory.updateInventoryForAsset(
        this.warehouse.toString(),
        this._id.toString()
    );
});

// Handle asset assignment
AssetSchema.methods.assign = async function(assignedTo: string, assignedType: 'user' | 'department', assignedBy: string, location?: string, remarks?: string) {
    // If already assigned, add to history first
    if (this.currentAssignment?.assignedTo) {
        this.assignmentHistory.push({
            ...this.currentAssignment,
            returnedDate: new Date()
        });
    }

    // Update current assignment
    this.currentAssignment = {
        assignedTo,
        assignedType,
        assignedDate: new Date(),
        assignedBy: new mongoose.Types.ObjectId(assignedBy),
        location,
        remarks
    };

    this.status = 'assigned';
    await this.save();
};

// Handle asset return
AssetSchema.methods.return = async function(remarks?: string) {
    if (this.currentAssignment) {
        this.assignmentHistory.push({
            ...this.currentAssignment,
            returnedDate: new Date(),
            remarks: remarks || this.currentAssignment.remarks
        });
    }

    this.currentAssignment = undefined;
    this.status = 'available';
    await this.save();
};

// Handle asset transfer between warehouses
AssetSchema.methods.transfer = async function(toWarehouseId: string) {
    const fromWarehouseId = this.warehouse.toString();
    this.warehouse = new mongoose.Types.ObjectId(toWarehouseId);
    await this.save();

    const inventory = mongoose.model('Inventory') as IInventoryModel;
    await inventory.transferAsset(
        this._id.toString(),
        fromWarehouseId,
        toWarehouseId
    );
};

// Add maintenance record
AssetSchema.methods.addMaintenanceRecord = async function(record: Omit<IMaintenanceRecord, 'date'>) {
    this.maintenanceRecords.push({
        ...record,
        date: new Date()
    });

    this.status = 'maintenance';
    await this.save();
};

// Complete maintenance
AssetSchema.methods.completeMaintenance = async function() {
    this.status = 'available';
    await this.save();
};

// Retire asset
AssetSchema.methods.retire = async function(remarks?: string) {
    this.status = 'retired';
    if (remarks) {
        this.remarks = remarks;
    }
    await this.save();
};

const Asset = mongoose.models.Asset || mongoose.model<IAsset, IAssetModel>('Asset', AssetSchema);

export type { IAsset, IAssetModel, IMaintenanceRecord, IAssignment };
export default Asset;