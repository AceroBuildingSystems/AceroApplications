import mongoose, { Document, Model, Schema } from "mongoose";

import { employeeType } from "@/types/employeeType.types";

const EmployeTypeSchema: Schema<employeeType> = new Schema({
    name: { type: String },
    isActive: { type: Boolean },
    addedBy: { type: String },
    updatedBy: { type: String },
   
}, { timestamps: true })


const EmployeeType: Model<employeeType> = mongoose.models.EmployeeType || mongoose.model<employeeType>("EmployeeType", EmployeTypeSchema)

export default EmployeeType
