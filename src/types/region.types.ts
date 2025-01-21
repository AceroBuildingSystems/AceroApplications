import mongoose from "mongoose";
export interface region {
    _id?: mongoose.ObjectId,
    regionId: string,
    name: string,
    addedBy: string,
    updatedBy: string,
    isActive:boolean,
}
  