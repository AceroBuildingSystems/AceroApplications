import mongoose, { Document, Model, Schema } from "mongoose";
import { UserDocument } from "@/types";

const UserSchema: Schema<UserDocument> = new Schema({
    empId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    shortName: { type: String },
    fullName: { type: String },
    designation: { type: String, required: true },
    employeeType: { type: String, required: true },
    department: { type: String, required: true },
    location: { type: String, required: true },
    reportingTo: { type: String, required: true },
    isActive: { type: Boolean, required: true },
    status: { type: String, required: true },
    availability: { type: String, required: true },
    extension: { type: String, required: true },
    mobile: { type: String, required: true },
    joiningDate: { type: Date, required: true },
    relievingDate: { type: Date, required: true },
    access: { type: Object, required: true },
}, { timestamps: true })

UserSchema.pre('save', async function (next) {
    if (!this.fullName) {
        this.fullName = `${this.firstName} ${this.lastName}`
    }
    next()
})

const User: Model<UserDocument> = mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema)

export default User
