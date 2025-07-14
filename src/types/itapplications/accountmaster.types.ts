import mongoose from "mongoose";
export interface accountmaster {
    _id?: mongoose.ObjectId,
    name: mongoose.ObjectId,
    package: mongoose.ObjectId,
    addedBy: string,
    updatedBy: string,
    isActive:boolean,
}
  