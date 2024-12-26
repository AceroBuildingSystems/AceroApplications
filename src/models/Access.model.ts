import mongoose, { Document, Model, Schema } from "mongoose";

import { access } from "@/types/access.types";

const AccessSchema: Schema<access> = new Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    isMenuItem: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    addedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",  
            },
    updatedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",  
            },
}, { timestamps: true })


const Access: Model<access> = mongoose.models.Access || mongoose.model<access>("Access", AccessSchema)

export default Access
