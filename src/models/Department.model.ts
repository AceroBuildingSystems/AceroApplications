import mongoose, { Document, Model, Schema } from "mongoose";

import { department } from "@/types/department.types";

const DepartmentSchema: Schema<department> = new Schema({
    name: { type: String },
    isActive: { type: Boolean },
    addedBy: { type: String },
    updatedBy: { type: String },
   
}, { timestamps: true })


const Department: Model<department> = mongoose.models.Department || mongoose.model<department>("Department", DepartmentSchema)

export default Department
