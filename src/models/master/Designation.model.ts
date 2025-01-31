import mongoose, { Document, Model, Schema } from "mongoose";
import { designation } from "@/types/designation.types";

const DesignationSchema: Schema<designation> = new Schema({
    name: { type: String, required: true, unique:true },
    isActive: { type: Boolean, default: true },
    addedBy: { type: String },
    updatedBy: { type: String },
   
}, { timestamps: true })


const Designation: Model<designation> = mongoose.models.Designation || mongoose.model<designation>("Designation", DesignationSchema)

export default Designation
