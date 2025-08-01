import mongoose, { Document, Model, Schema } from "mongoose";
import { UserDocument } from "@/types";
import { Query } from "mongoose";

const UserSchema: Schema<UserDocument> = new Schema({
    // Core user information
    empId: { type: String, sparse: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    fullName: { type: String },
    email: { type: String, unique: true, sparse: true },
    displayName: { type: String },

    isActive: { type: Boolean, default: true },

    password: { type: String, },

    imageUrl: { type: String, default: "" },

    // Personal user information

    gender: {
        type: String,
        enum: ["Male", "Female", "Other", ""],
        required: false,
        null: true,
        default: ""
    },
    dateOfBirth: { type: Date },
    maritalStatus: {
        type: String,
        enum: ["Single", "Married", "Divorced", "Widowed", ""],
        default: "",
        null: true,
        required: false
    },
    nationality: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Country",
        autopopulate: true
    },
    personalMobileNo: { type: String },

    // Employment information

    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department", // Reference to the Department model

    },
    designation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Designation",

    },
    reportingTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the Organisation model

    },
    employeeType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EmployeeType", // Reference to the EmployeeType model

    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role", // Reference to the Role model

    },
    reportingLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location", // Reference to the Organisation model

    },
    activeLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location", // Reference to the Organisation model

    },
    organisation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organisation", // Reference to the Organisation model

    },
    extension: { type: String },
    mobile: { type: String },
    joiningDate: { type: Date, default: null },
    relievingDate: { type: Date, default: null },
    personCode: { type: String },
    availability: {
        type: String,
        enum: ["Available", "Busy", "Away", "In Meeting", "On Leave", ""],
        default: "Available",
        null: true,
    },
    // Visa details

    visaType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VisaType",
        autopopulate: true
    },
    visaFileNo: { type: String },
    visaIssueDate: { type: Date },
    visaExpiryDate: { type: Date },
    workPermit: { type: String },
    labourCardExpiryDate: { type: Date },
    iloeExpiryDate: { type: Date },

    // Identification details

    passportNumber: { type: String },
    passportIssueDate: { type: Date },
    passportExpiryDate: { type: Date },
    emiratesId: { type: String },
    emiratesIdIssueDate: { type: Date },
    emiratesIdExpiryDate: { type: Date },

    // Benefits details

    medicalInsurance: { type: String },
    medicalInsuranceStartDate: { type: Date, default: null},
    medicalInsuranceEndDate: { type: Date, default: null},


access: [{
        accessId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Access",
        },
        hasAccess: { type: Boolean, default: false },
        permissions: {
            view: { type: Boolean, default: false },
            create: { type: Boolean, default: false },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false },
            import: { type: Boolean, default: false },
            export: { type: Boolean, default: false },
        },
        _id: false
    }],
    addedBy: { type: String },
    updatedBy: { type: String },

}, { timestamps: true })

UserSchema.pre('save', async function (next) {
    if (!this.fullName) {
        this.fullName = `${this.firstName} ${this.lastName}`
    }
    next()
})

UserSchema.pre<Query<any, UserDocument>>(/^find/, function (next) {
    this.populate([
        { path: "role" },
        { path: "designation" },
        { path: "employeeType" },
        { path: "department" },
        { path: "organisation" },
        { path: "activeLocation" },
        { path: "reportingLocation" },
        { path: "access.accessId" },
    ]);

    next();
});
const User: Model<UserDocument> = mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema)

export default User
