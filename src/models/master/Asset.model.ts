import mongoose, { Model, Schema } from "mongoose";
import { asset, ServiceRecord, AssignmentRecord, AssetStatus } from "@/types/master/asset.types";

const ServiceRecordSchema = new Schema<ServiceRecord>({
    date: { type: Date, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    cost: { type: Number },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true,
        autopopulate: true
    },
    nextServiceDue: { type: Date },
    attachments: [{ type: String }]
}, { _id: true, timestamps: true });

const AssignmentRecordSchema = new Schema<AssignmentRecord>({
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        autopopulate: true
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        autopopulate: true
    },
    assignedDate: { type: Date, required: true },
    returnDate: { type: Date },
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        required: true,
        autopopulate: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        autopopulate: true
    },
    remarks: { type: String }
}, { _id: true, timestamps: true });

const AssetSchema: Schema<asset> = new Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
        autopopulate: true
    },
    serialNumber: { type: String, required: true, unique: true },
    status: { 
        type: String,
        enum: ["in-stock", "assigned", "under-repair", "disposed", "in-transit"],
        required: true,
        default: "in-stock"
    },
    purchaseInfo: {
        date: { type: Date, required: true },
        cost: { type: Number, required: true },
        poNumber: { type: String, required: true },
        prNumber: { type: String },
        invoiceNumber: { type: String, required: true },
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: true,
            autopopulate: true
        }
    },
    warranty: {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        type: { type: String, required: true },
        description: { type: String }
    },
    currentAssignment: { type: AssignmentRecordSchema },
    assignmentHistory: [AssignmentRecordSchema],
    serviceHistory: [ServiceRecordSchema],
    currentLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        required: true,
        autopopulate: true
    },
    isActive: { type: Boolean, default: true },
    addedBy: { type: String },
    updatedBy: { type: String }
}, { timestamps: true });

// Create indexes for frequently queried fields
AssetSchema.index({ serialNumber: 1 });
AssetSchema.index({ status: 1 });
AssetSchema.index({ "currentAssignment.assignedTo": 1 });
AssetSchema.index({ currentLocation: 1 });

AssetSchema.plugin(require('mongoose-autopopulate'));
const Asset: Model<asset> = mongoose.models.Asset || mongoose.model<asset>("Asset", AssetSchema);

export default Asset;