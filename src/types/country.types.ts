import mongoose from "mongoose";
export interface country {
    _id?: mongoose.ObjectId,
    countryCode: string,
    name: string,
    area: mongoose.ObjectId,
    region: mongoose.ObjectId,
    addedBy: string,
    updatedBy: string,
    isActive:boolean,
}
  