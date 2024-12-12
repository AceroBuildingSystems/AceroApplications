import mongoose, { Document, Model, Schema } from "mongoose";

import { role } from "@/types/role.types";

const RoleSchema: Schema<role> = new Schema({
    name: { type: String },
    isActive: { type: Boolean },
    addedBy: { type: String },
    updatedBy: { type: String },
   
}, { timestamps: true })


const Role: Model<role> = mongoose.models.Role || mongoose.model<role>("Role", RoleSchema)

export default Role
