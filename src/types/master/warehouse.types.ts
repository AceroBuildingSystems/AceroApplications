import mongoose from "mongoose";


export interface warehouse {
    _id?: mongoose.ObjectId,
    name: string,
    location: mongoose.ObjectId,
    addedBy: mongoose.ObjectId,
    updatedBy: mongoose.ObjectId,
    isActive:boolean,
}
  