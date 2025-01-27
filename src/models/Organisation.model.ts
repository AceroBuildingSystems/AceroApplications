import mongoose, { Document, Model, Schema } from "mongoose";
import { organisation } from "@/types/organisation.types";

const OrganisationSchema: Schema<organisation> = new Schema({
    name: { type: String, required: true },
    address: {
        state: { type: String, required: true },
        pinCode: { type: String, required: true },
        country: { type: String, required: true },
        area: { type: String, required: true },
        location: { type: String, required: true }
    },
    isActive: { type: Boolean, required: true },
    addedBy: { type: String, required: true },
    updatedBy: { type: String, required: true }
}, { timestamps: true });

const Organisation: Model<organisation> = mongoose.models.Organisation || mongoose.model<organisation>("Organisation", OrganisationSchema);

export default Organisation;
