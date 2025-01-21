import mongoose, { Document, Model, Schema } from "mongoose";

import { area } from "@/types/area.types";

const AreaSchema: Schema<area> = new Schema({
    areaId: { type: String, required:true, unique:true},
    name: { type: String, required: true, unique:true },
    regionId: { type: String},
    region: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Region", // Reference to the Region model
           
        },
    isActive: { type: Boolean, default: true },
    addedBy: { type: String },
    updatedBy: { type: String },
   
}, { timestamps: true })


const Area: Model<area> = mongoose.models.area || mongoose.model<area>("Area", AreaSchema)

export default Area
