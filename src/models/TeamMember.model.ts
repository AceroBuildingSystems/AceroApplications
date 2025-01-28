import mongoose, { Document, Model, Schema } from "mongoose";

import { teamMember } from "@/types";

const TeamMemberSchema: Schema<teamMember> = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",  // based on department
    },
    teamRole:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
    },
    isActive: { type: Boolean, default: true },
    addedBy: { type: String },
    updatedBy: { type: String },

}, { timestamps: true })


const TeamMember: Model<teamMember> = mongoose.models.teamMember || mongoose.model<teamMember>("TeamMember", TeamMemberSchema)

export default TeamMember
