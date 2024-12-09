import mongoose from "mongoose";
export interface organisation {
    _id?: mongoose.ObjectId,
    name: string,
    address: string,
    addedBy: string,
    updatedBy: string,
    isActive:boolean,
}
  