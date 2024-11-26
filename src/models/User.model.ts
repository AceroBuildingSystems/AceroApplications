import mongoose, { Document, Model, Schema } from "mongoose";
import { UserDocument } from "@/types";

const UserSchema: Schema<UserDocument> = new Schema({
    empId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true },
    password: { type: String,  },
    role: { type: String },
    shortName: { type: String },
    fullName: { type: String },
    designation: { type: String },
    employeeType: { type: String },
    department: { type: String },
    location: { type: String },
    reportingTo: { type: String },
    isActive: { type: Boolean },
    status: { type: String },
    availability: { type: String },
    extension: { type: String },
    mobile: { type: String },
    joiningDate: { type: Date },
    relievingDate: { type: Date },
    access: { type: Object, default: {} },
    addedBy: { type: String },
    updatedBy: { type: String },
}, { timestamps: true })

UserSchema.pre('save', async function (next) {
    if (!this.fullName) {
        this.fullName = `${this.firstName} ${this.lastName}`
    }
    next()
})

const User: Model<UserDocument> = mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema)

export default User
