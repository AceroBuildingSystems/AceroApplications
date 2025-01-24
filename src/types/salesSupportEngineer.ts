import mongoose from "mongoose";
export interface salesSupportEngineer {
    _id?: mongoose.ObjectId,
    supportEngineer: mongoose.ObjectId,
    salesTeam: mongoose.ObjectId,
    addedBy: string,
    updatedBy: string,
    isActive:boolean,
}
  