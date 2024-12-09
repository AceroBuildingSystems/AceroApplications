import mongoose, { Document, Model, Schema } from "mongoose";

import { access } from "@/types/access.types";

const AccessSchema: Schema<access> = new Schema({
    name: { type: String },
    isActive: { type: Boolean },
    addedBy: { type: String },
    updatedBy: { type: String },
   
}, { timestamps: true })


const Access: Model<access> = mongoose.models.Access || mongoose.model<access>("Access", AccessSchema)

export default Access
