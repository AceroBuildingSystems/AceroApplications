import mongoose, { Document, Model, Schema } from "mongoose";
import { UserDocument } from "@/types";

const UserSchema: Schema<UserDocument> = new Schema({
    empId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true },
    password: { type: String, },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role", // Reference to the Role model
        required: true
    },
    shortName: { type: String },
    fullName: { type: String },
    designation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Designation", // Reference to the Designation model
        required: true
    },
    employeeType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EmployeeType", // Reference to the EmployeeType model
        required: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department", // Reference to the Department model
        required: true
    },
    location: { type: String },
    reportingTo: { type: String },
    isActive: { type: Boolean },
    status: { type: String },
    availability: { type: String },
    extension: { type: String },
    mobile: { type: String },
    joiningDate: { type: Date },
    relievingDate: { type: Date },
    access: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Access", // Reference to the Access model
        required: true
    },
    addedBy: { type: String },
    updatedBy: { type: String },
    organisation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organisation", // Reference to the Organisation model
        required: true
    },
}, { timestamps: true })

UserSchema.pre('save', async function (next) {
    if (!this.fullName) {
        this.fullName = `${this.firstName} ${this.lastName}`
    }
    next()
})

const User: Model<UserDocument> = mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema)

export default User
