import mongoose, { Document, Model, Schema } from "mongoose";
import { UserDocument } from "@/types";
import { Query } from "mongoose";

const UserSchema: Schema<UserDocument> = new Schema({
    empId: { type: String, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true,sparse: true },
    password: { type: String, },
    role1: { type: String },
    imageUrl: { type: String ,default:""},
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role", // Reference to the Role model
       
    },
    displayName: { type: String },
    fullName: { type: String },
    designation1: { type: String },
    // designation: { type: String },
    designation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Designation",
       
      },
      employeeType1: { type: String },
    employeeType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EmployeeType", // Reference to the EmployeeType model
        
    },
    department1: { type: String },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department", // Reference to the Department model
       
    },
    location: { type: String },
    reportingTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the Organisation model
        
    },
    isActive: { type: Boolean, default:true },
    status: { type: String },
    availability: { type: String },
    extension: { type: String },
    mobile: { type: String },
    joiningDate: { type: Date, default:null },
    relievingDate: { type: Date, default:null },
    access: [{
        accessId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Access",  
        },
        hasAccess: { type: Boolean, default: false },
        permissions: {
            view:   { type: Boolean,default:false },
            create: { type: Boolean,default:false },
            update: { type: Boolean,default:false },
            delete: { type: Boolean,default:false },
            import: { type: Boolean,default:false },
            export: { type: Boolean,default:false },
        },
        _id: false
    }],
    addedBy: { type: String },
    updatedBy: { type: String },
    organisation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organisation", // Reference to the Organisation model
        
    },
    activeLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location", // Reference to the Organisation model
        
    },
    reportingLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location", // Reference to the Organisation model
        
    },
    personalNumber: { type: String },
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
