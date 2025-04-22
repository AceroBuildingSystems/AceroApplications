import mongoose from "mongoose";
export interface group {
    _id?: mongoose.ObjectId,
    name: string,
    isActive:boolean,
} 