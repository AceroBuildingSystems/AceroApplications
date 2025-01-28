import mongoose, { Document, Model, Schema } from "mongoose";

import { projectType } from "@/types/projectType.types";

const ProjectTypeSchema: Schema<projectType> = new Schema({
    name: { type: String, required:true, unique:true },
    isActive: { type: Boolean, default:true },
    addedBy: { type: String },
    updatedBy: { type: String },
   
}, { timestamps: true })


const ProjectType: Model<projectType> = mongoose.models.ProjectType || mongoose.model<projectType>("ProjectType", ProjectTypeSchema)

export default ProjectType
