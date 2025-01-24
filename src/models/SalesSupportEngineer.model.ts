import mongoose, { Document, Model, Schema } from "mongoose";

import { salesSupportEngineer } from "@/types/salesSupportEngineer.types";

const SalesSupportEngineerSchema: Schema<salesSupportEngineer> = new Schema({
    supportEngineer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the Region model
        required: true,
        unique: true
       
    },
   
    salesTeam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SalesTeam", // Reference to the Region model
           
        },
    isActive: { type: Boolean, default: true },
    addedBy: { type: String },
    updatedBy: { type: String },
   
}, { timestamps: true })


const SalesSupportEngineer: Model<salesSupportEngineer> = mongoose.models.salesSupportEngineer || mongoose.model<salesSupportEngineer>("SalesSupportEngineer", SalesSupportEngineerSchema)

export default SalesSupportEngineer
