import mongoose from "mongoose";

// Document attachment type
interface TransactionDocumentAttachment {
    type: string;
    name: string;
    url: string;
}

// Maintenance details type
interface MaintenanceDetails {
    type?: string;
    description?: string;
    cost?: number;
    scheduledDate?: Date;
    completionDate?: Date;
}

// Assignment details type
interface AssignmentDetails {
    startDate?: Date;
    endDate?: Date;
    returnDate?: Date;
    condition?: {
        before: string;
        after: string;
    };
}

// Source/Destination entity type
interface TransactionEntity {
    type: 'WAREHOUSE' | 'USER' | 'DEPARTMENT' | 'VENDOR';
    warehouse?: mongoose.ObjectId;
    user?: mongoose.ObjectId;
    department?: mongoose.ObjectId;
    vendor?: mongoose.ObjectId;
    location?: string;
}

// Transaction approval type
interface TransactionApproval {
    required: boolean;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    approver?: mongoose.ObjectId;
    approvedAt?: Date;
    comments?: string;
}

export interface TransactionDocument {
    _id?: mongoose.ObjectId;
    transactionId: string;
    type: 'STOCK_RECEIPT' | 'STOCK_TRANSFER' | 'STOCK_ADJUSTMENT' | 'STOCK_RETURN' |
          'ASSET_ASSIGNMENT' | 'ASSET_TRANSFER' | 'ASSET_RETURN' | 'ASSET_DISPOSAL' |
          'MAINTENANCE_START' | 'MAINTENANCE_END';
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
    product: mongoose.ObjectId;
    serialNumbers?: string[];
    batchNumber?: string;
    quantity?: number;
    source: TransactionEntity;
    destination: TransactionEntity;
    maintenance?: MaintenanceDetails;
    assignment?: AssignmentDetails;
    reason?: string;
    notes?: string;
    documents?: TransactionDocumentAttachment[];
    approval: TransactionApproval;
    organisation: mongoose.ObjectId;
    requestedBy: mongoose.ObjectId;
    processedBy?: mongoose.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}