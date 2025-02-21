import mongoose from "mongoose";
import { location } from "./location.types";

export interface WarehouseDocument {
    _id?: mongoose.ObjectId;
    code: string;
    name: string;
    type: 'PRIMARY' | 'SECONDARY' | 'TEMPORARY';
    location: mongoose.ObjectId | location;
    capacity: {
        total: number;
        available: number;
        unit: string;
    };
    manager: mongoose.ObjectId;
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
    isActive: boolean;
    organisation: mongoose.ObjectId;
    addedBy?: mongoose.ObjectId;
    updatedBy?: mongoose.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}