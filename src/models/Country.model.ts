import mongoose, { Document, Model, Schema } from "mongoose";

import { country } from "@/types/country.types";

const CountrySchema: Schema<country> = new Schema({
    countryId: { type: String},
    name: { type: String, required: true, unique:true },
    areaId: { type: String},
    area: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Area", // Reference to the Region model
       
    },
    region: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Region", // Reference to the Region model
           
        },
    isActive: { type: Boolean, default: true },
    addedBy: { type: String },
    updatedBy: { type: String },
   
}, { timestamps: true })


const Country: Model<country> = mongoose.models.country || mongoose.model<country>("Country", CountrySchema)

export default Country
