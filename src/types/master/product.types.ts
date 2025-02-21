import mongoose from "mongoose";

// Maintenance history entry type
interface MaintenanceRecord {
    type: string;
    date: Date;
    description: string;
    cost: number;
    performedBy: mongoose.ObjectId;
    documents: string[];
}

// Document type
interface ProductDocumentAttachment {
    type: string;
    name: string;
    url: string;
    expiryDate?: Date;
}

// Warehouse inventory type
interface WarehouseInventory {
    warehouse: mongoose.ObjectId;
    quantity: number;
    location?: string;
}

// Asset depreciation type
interface AssetDepreciation {
    method: 'STRAIGHT_LINE' | 'DECLINING_BALANCE' | 'NONE';
    rate?: number;
    salvageValue?: number;
    usefulLife?: number;
}

// Asset maintenance type
interface AssetMaintenance {
    schedule: {
        frequency?: number;
        lastMaintenance?: Date;
        nextMaintenance?: Date;
    };
    history: MaintenanceRecord[];
}

// Product specifications type
interface ProductSpecifications {
    templateVersion: number;
    values: Record<string, any>; // Dynamic based on category template
}

export interface ProductDocument {
    _id?: mongoose.ObjectId;
    code: string;
    name: string;
    description?: string;
    category: mongoose.ObjectId;
    specifications: ProductSpecifications;
    status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
    type: 'INVENTORY' | 'ASSET' | 'BOTH';
    tracking: {
        serialized: boolean;
        batchTracking: boolean;
        expiryTracking: boolean;
    };
    // Inventory specific fields
    inventory?: {
        totalQuantity: number;
        availableQuantity: number;
        reservedQuantity: number;
        unit: string;
        reorderPoint?: number;
        minimumOrderQuantity?: number;
        warehouses: WarehouseInventory[];
    };
    // Asset specific fields
    asset?: {
        depreciation: AssetDepreciation;
        maintenance: AssetMaintenance;
    };
    // Common fields
    vendor: mongoose.ObjectId;
    cost: {
        purchasePrice: number;
        currency: mongoose.ObjectId;
    };
    documents: ProductDocumentAttachment[];
    images: string[];
    tags: string[];
    isActive: boolean;
    organisation: mongoose.ObjectId;
    addedBy?: mongoose.ObjectId;
    updatedBy?: mongoose.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}