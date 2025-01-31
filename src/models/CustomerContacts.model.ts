import mongoose, { Document, Model, Schema } from "mongoose";

import { customerContacts } from "@/types/customerContacts.types";

const CustomerContactSchema: Schema<customerContacts> = new Schema({
    name: { type: String, required: true, unique:true },
    email: { type: String },
    phone: { type: String},
    position: { type: String },
    customerType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CustomerType", // Reference to the CustomerType model
           
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer", // Reference to the CustomerType model
           
        },
    isActive: { type: Boolean, default: true },
    addedBy: { type: String },
    updatedBy: { type: String },
   
}, { timestamps: true })


const CustomerContact: Model<customerContacts> = mongoose.models.CustomerContact || mongoose.model<customerContacts>("CustomerContact", CustomerContactSchema)

export default CustomerContact
