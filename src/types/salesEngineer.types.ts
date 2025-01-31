import mongoose from "mongoose";
export interface salesEngineer {
    _id?: mongoose.ObjectId,
    salesEngineer: mongoose.ObjectId,
    designation: string,
    reportingTo: mongoose.ObjectId,
    salesTeam: mongoose.ObjectId,
    isSupportEngineer:boolean,
    addedBy: string,
    updatedBy: string,
    isActive:boolean,
}
  