import mongoose, { Document, Model, Schema } from "mongoose";

import { organisation } from "@/types/organisation.types";

const OrganisationSchema: Schema<organisation> = new Schema({
    name: { type: String },
    address: { type: String },
    isActive: { type: Boolean },
    addedBy: { type: String },
    updatedBy: { type: String },
   
}, { timestamps: true })


const Organisation: Model<organisation> = mongoose.models.Organisation || mongoose.model<organisation>("Organisation", OrganisationSchema)

export default Organisation
