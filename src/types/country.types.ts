import mongoose from "mongoose";
export interface country {
    _id?: mongoose.ObjectId,
    countryId: string,
    name: string,
    areaId: string,
    area: mongoose.ObjectId,
    region: mongoose.ObjectId,
    addedBy: string,
    updatedBy: string,
    isActive:boolean,
}
  