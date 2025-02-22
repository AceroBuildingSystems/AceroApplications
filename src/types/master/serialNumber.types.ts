import mongoose from "mongoose";

interface AssignmentHistory {
    assignedTo: {
        type: 'USER' | 'DEPARTMENT';
        user?: mongoose.ObjectId;
        department?: mongoose.ObjectId;
    };
    assignedBy: mongoose.ObjectId;
    assignedAt: Date;
    returnedAt?: Date;
    notes?: string;
}

interface MaintenanceRecord {
    type: 'SCHEDULED' | 'REPAIR' | 'UPGRADE' | 'OTHER';
    date: Date;
    description: string;
    cost?: number;
    performedBy?: mongoose.ObjectId;
    documents?: string[];
}

interface CurrentAssignment {
    type: 'USER' | 'DEPARTMENT';
    user?: mongoose.ObjectId;
    department?: mongoose.ObjectId;
    assignedAt: Date;
    assignedBy: mongoose.ObjectId;
}

interface Location {
    warehouse: mongoose.ObjectId;
    specificLocation?: string;
}

interface PurchaseInfo {
    purchaseDate: Date;
    warrantyExpiry?: Date;
    invoice?: string;
}

export interface SerialNumberDocument {
    _id?: mongoose.ObjectId;
    serialNumber: string;
    product: mongoose.ObjectId;
    status: 'AVAILABLE' | 'ASSIGNED' | 'IN_MAINTENANCE' | 'DAMAGED' | 'RETIRED';
    currentAssignment?: CurrentAssignment;
    location?: Location;
    purchaseInfo: PurchaseInfo;
    assignmentHistory: AssignmentHistory[];
    maintenanceHistory: MaintenanceRecord[];
    notes?: string;
    isActive: boolean;
    organisation: mongoose.ObjectId;
    addedBy?: mongoose.ObjectId;
    updatedBy?: mongoose.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}