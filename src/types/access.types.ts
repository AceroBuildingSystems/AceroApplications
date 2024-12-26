import mongoose from "mongoose";
export interface access {
    _id?: mongoose.ObjectId,
    name: string,
    category: string,
    addedBy: mongoose.ObjectId,
    updatedBy: mongoose.ObjectId,
    isActive:boolean,
    isMenuItem: boolean,
}
  