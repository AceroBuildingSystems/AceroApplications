import mongoose from "mongoose";
export interface teamMember {
    _id?: mongoose.ObjectId,
    user: mongoose.ObjectId,
    teamDesignation: mongoose.ObjectId,
    teamRole: mongoose.ObjectId,
    addedBy: string,
    updatedBy: string,
    isActive:boolean,
}
  