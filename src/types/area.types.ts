import mongoose from "mongoose";
export interface area {
    _id?: mongoose.ObjectId,
    areaId: string,
    regionId: string,
    name: string,
    region: mongoose.ObjectId,
    addedBy: string,
    updatedBy: string,
    isActive:boolean,
}
  