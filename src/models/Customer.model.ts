import mongoose, { Document, Model, Schema } from "mongoose";

import { customer } from "@/types/customer.types";

const CustomerSchema: Schema<customer> = new Schema({
    name: { type: String, required: true, unique:true },
    website: { type: String },
    email: { type: String},
    phone: { type: String},
    address: { type: String },
    isActive: { type: Boolean, default: true },
    addedBy: { type: String },
    updatedBy: { type: String },
   
}, { timestamps: true })


const Customer: Model<customer> = mongoose.models.Customer || mongoose.model<customer>("Customer", CustomerSchema)

export default Customer
