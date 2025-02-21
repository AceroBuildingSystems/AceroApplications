import mongoose, { Document, Model, Schema } from "mongoose";
import { VendorDocument } from "@/types";

const VendorSchema: Schema<VendorDocument> = new Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    legalName: { type: String },
    type: { 
        type: String,
        enum: ['MANUFACTURER', 'DISTRIBUTOR', 'RETAILER', 'SERVICE_PROVIDER'],
        required: true
    },
    taxId: { type: String },
    registrationNumber: { type: String },
    contact: {
        email: { type: String, required: true },
        phone: { type: String, required: true },
        website: { type: String },
        address: {
            line1: { type: String, required: true },
            line2: { type: String },
            city: { type: String, required: true },
            state: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "State",
                required: true,
                autopopulate: true
            },
            country: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Country",
                required: true,
                autopopulate: true
            },
            pincode: { type: String, required: true }
        }
    },
    billing: {
        currency: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Currency",
            required: true,
            autopopulate: true
        },
        paymentTerms: { type: String },
        bankDetails: {
            accountName: { type: String },
            accountNumber: { type: String },
            bankName: { type: String },
            branchCode: { type: String },
            swiftCode: { type: String }
        }
    },
    contracts: [{
        type: { type: String },
        number: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        value: { type: Number },
        documents: [{ type: String }] // URLs to contract documents
    }],
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            autopopulate: true
        },
        code: { type: String }, // Vendor's product code
        price: { type: Number },
        minimumOrderQuantity: { type: Number },
        leadTime: { type: Number }, // In days
        warranty: {
            duration: { type: Number }, // In months
            terms: { type: String }
        },
        isPreferred: { type: Boolean, default: false }
    }],
    performance: {
        rating: { type: Number, min: 0, max: 5 },
        onTimeDelivery: { type: Number }, // Percentage
        qualityRating: { type: Number }, // Percentage
        responseTime: { type: Number }, // In hours
        lastReviewDate: { type: Date }
    },
    compliance: {
        certifications: [{
            name: { type: String },
            number: { type: String },
            validUntil: { type: Date },
            document: { type: String } // URL to certificate
        }],
        insurances: [{
            type: { type: String },
            provider: { type: String },
            policyNumber: { type: String },
            coverage: { type: Number },
            validUntil: { type: Date },
            document: { type: String } // URL to policy document
        }]
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'BLACKLISTED', 'PENDING_REVIEW'],
        default: 'ACTIVE'
    },
    notes: { type: String },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    organisation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organisation",
        required: true,
        autopopulate: true
    },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

VendorSchema.plugin(require('mongoose-autopopulate'));

// Generate vendor code if not provided
VendorSchema.pre('save', async function(next) {
    if (!this.code) {
        const vendorCount = await mongoose.model('Vendor').countDocuments();
        this.code = `VEN${(vendorCount + 1).toString().padStart(5, '0')}`;
    }
    next();
});

const Vendor: Model<VendorDocument> = mongoose.models.Vendor || mongoose.model<VendorDocument>("Vendor", VendorSchema);

export default Vendor;