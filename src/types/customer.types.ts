import mongoose from "mongoose";
export interface customer {
    _id?: mongoose.ObjectId,
    name: string,
    website: string,
    email: string,
    phone: string,
    address: string,
    addedBy: string,
    updatedBy: string,
    isActive:boolean,
}
  