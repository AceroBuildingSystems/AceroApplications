import mongoose from "mongoose";

export interface PaymentDetails {
    accountName: string;
    accountNumber: string;
    bankName: string;
    swiftCode?: string;
    taxId?: string;
}

export interface ContactPerson {
    name: string;
    designation: string;
    email: string;
    phone: string;
}

export interface vendor {
    _id?: mongoose.ObjectId;
    name: string;
    code: string;
    email: string;
    phone: string;
    website?: string;
    location: mongoose.ObjectId; // Reference to Location model
    contactPersons: ContactPerson[];
    paymentDetails: PaymentDetails;
    registrationNumber?: string;
    taxRegistrationNumber?: string;
    creditPeriod?: number; // in days
    isActive: boolean;
    addedBy: string;
    updatedBy: string;
}