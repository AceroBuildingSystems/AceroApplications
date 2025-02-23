import mongoose, { Model, Schema } from "mongoose";
import { vendor, ContactPerson, PaymentDetails } from "@/types/master/vendor.types";

const ContactPersonSchema = new Schema<ContactPerson>({
    name: { type: String, required: true },
    designation: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
}, { _id: false });

// const PaymentDetailsSchema = new Schema<PaymentDetails>({
//     accountName: { type: String, required: true },
//     accountNumber: { type: String, required: true },
//     bankName: { type: String, required: true },
//     swiftCode: { type: String },
//     taxId: { type: String }
// }, { _id: false });

const VendorSchema: Schema<vendor> = new Schema({
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    website: { type: String },
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        required: true,
        autopopulate: true
    },
    contactPersons: [ContactPersonSchema],
    // paymentDetails: { type: PaymentDetailsSchema, required: true },
    // registrationNumber: { type: String },
    // taxRegistrationNumber: { type: String },
    // creditPeriod: { type: Number },
    isActive: { type: Boolean, default: true },
    addedBy: { type: String },
    updatedBy: { type: String }
}, { timestamps: true });

VendorSchema.plugin(require('mongoose-autopopulate'));
const Vendor: Model<vendor> = mongoose.models.Vendor || mongoose.model<vendor>("Vendor", VendorSchema);

export default Vendor;