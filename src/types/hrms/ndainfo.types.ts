
import { Document, Types } from "mongoose";

export interface ndainfo {
    // Request Information
    aggrementDate?: Date;
    ndaFormUrl?: string;
    addedBy?: string;
    updatedBy?: string;

    createdAt?: Date;
    updatedAt?: Date;
}
