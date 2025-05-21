import mongoose, { Document, Model, Schema } from "mongoose";

import { othermaster } from "@/types/itapplications/othermaster.types";

const OtherMasterSchema: Schema<othermaster> = new Schema({
    name: { type: String, required: true, unique:true },
    department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            required: true
        },
    isActive: { type: Boolean, default: true },
    addedBy: { type: String },
    updatedBy: { type: String },
   
}, { timestamps: true })


const OtherMaster: Model<othermaster> = mongoose.models.OtherMaster || mongoose.model<othermaster>("OtherMaster", OtherMasterSchema)

export default OtherMaster
