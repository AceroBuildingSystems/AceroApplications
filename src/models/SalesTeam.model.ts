import mongoose, { Document, Model, Schema } from "mongoose";

import { salesTeam } from "@/types/salesTeam.types";

const SalesTeamSchema: Schema<salesTeam> = new Schema({

    name: { type: String, required: true, unique: true },
    director: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the User model

    },
    isActive: { type: Boolean, default: true },
    addedBy: { type: String },
    updatedBy: { type: String },

}, { timestamps: true })


const SalesTeam: Model<salesTeam> = mongoose.models.salesTeam || mongoose.model<salesTeam>("SalesTeam", SalesTeamSchema)

export default SalesTeam
