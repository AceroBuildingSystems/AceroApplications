import mongoose, { Model, Schema } from "mongoose";
import { vendor, ContactPerson } from "@/types/master/vendor.types";

const ContactPersonSchema = new Schema<ContactPerson>({
    name: { type: String, required: true },
    designation: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
}, { _id: false });


const VendorSchema: Schema<vendor> = new Schema({
    name: { type: String, required: true, unique: true },
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
    isActive: { type: Boolean, default: true },
    addedBy: { type: String },
    updatedBy: { type: String }
}, { timestamps: true });

VendorSchema.plugin(require('mongoose-autopopulate'));
const Vendor: Model<vendor> = mongoose.models.Vendor || mongoose.model<vendor>("Vendor", VendorSchema);

export default Vendor;