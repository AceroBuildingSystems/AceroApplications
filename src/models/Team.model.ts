import mongoose, { Document, Model, Schema } from "mongoose";

import { team } from "@/types";

const TeamSchema: Schema<team> = new Schema({
    name: { type: String, required: true, unique: true },
    reportingTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the User model
    }],
    teamMembers:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "TeamMember", // Reference to the User model
    }],
    department:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department", // Reference to the User model
    },
    isActive: { type: Boolean, default: true },
    addedBy: { type: String },
    updatedBy: { type: String },
}, { timestamps: true })


const Team: Model<team> = mongoose.models.team || mongoose.model<team>("Team", TeamSchema)

export default Team
