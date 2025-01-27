import mongoose, { Document, Model, Schema } from "mongoose";

import { salesEngineer } from "@/types/salesEngineer.types";

const SalesEngineerSchema: Schema<salesEngineer> = new Schema({
    salesEngineer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the Region model
        required: true,
        unique: true

    },
    designation: { type: String, required: true },
    reportingTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the Region model

    },
    salesTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SalesTeam", // Reference to the Region model

    },
    isSupportEngineer: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    addedBy: { type: String },
    updatedBy: { type: String },

}, { timestamps: true })


const SalesEngineer: Model<salesEngineer> = mongoose.models.salesEngineer || mongoose.model<salesEngineer>("SalesEngineer", SalesEngineerSchema)

export default SalesEngineer
