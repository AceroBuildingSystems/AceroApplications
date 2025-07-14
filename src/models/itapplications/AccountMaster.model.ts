import mongoose, { Document, Model, Schema } from "mongoose";

import { accountmaster } from "@/types/itapplications/accountmaster.types";

const AccountMasterSchema: Schema<accountmaster> = new Schema({
    name: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Asset", // Reference
        autopopulate: true
    },
    
    package: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PackageMaster", // Reference
        autopopulate: true
    },
    isActive: { type: Boolean, default: true },
    addedBy: { type: String },
    updatedBy: { type: String },

}, { timestamps: true })


AccountMasterSchema.plugin(require('mongoose-autopopulate'));
const AccountMaster: Model<accountmaster> = mongoose.models.AccountMaster || mongoose.model<accountmaster>("AccountMaster", AccountMasterSchema)

export default AccountMaster
