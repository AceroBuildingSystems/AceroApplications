import mongoose from "mongoose";
export interface salesTeam {
    _id?: mongoose.ObjectId,
    name: string,
    director: mongoose.ObjectId,
    addedBy: string,
    updatedBy: string,
    isActive:boolean,
}
  