import mongoose from "mongoose";
export interface productType {
    _id?: mongoose.ObjectId,
    name: string,
    addedBy: string,
    updatedBy: string,
    isActive:boolean,
}
  