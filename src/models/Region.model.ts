import mongoose, { Document, Model, Schema } from "mongoose";

import { region } from "@/types/region.types";

const RegionSchema: Schema<region> = new Schema({
    
    name: { type: String, required: true, unique:true },
    isActive: { type: Boolean, default: true },
    addedBy: { type: String },
    updatedBy: { type: String },
   
}, { timestamps: true })


const Region: Model<region> = mongoose.models.region || mongoose.model<region>("Region", RegionSchema)

export default Region
