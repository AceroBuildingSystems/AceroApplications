import mongoose from "mongoose";
export interface organisation {
    _id?: mongoose.ObjectId,
    name: string,
    address: {
        state:string,
        pinCode:string,
        country:string,
        area:string,
        location:string
    },
    addedBy: string,
    updatedBy: string,
    isActive:boolean,
}
  