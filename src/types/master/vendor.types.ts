import { ObjectId } from 'mongoose';
import { state } from './state.types';
import { country } from './country.types';
import { currency } from './currency.types';
import { ProductDocument } from './product.types';
import { organisation } from './organisation.types';
import { UserDocument } from './user.types';

export interface VendorAddress {
    line1: string;
    line2?: string;
    city: string;
    state: string | ObjectId | state;
    country: string | ObjectId | country;
    pincode: string;
}

export interface VendorContact {
    email: string;
    phone: string;
    website?: string;
    address: VendorAddress;
}

export interface BankDetails {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    branchCode?: string;
    swiftCode?: string;
}

export interface VendorBilling {
    currency: string | ObjectId | currency;
    paymentTerms?: string;
    bankDetails?: BankDetails;
}

export interface VendorContract {
    type?: string;
    number?: string;
    startDate?: Date;
    endDate?: Date;
    value?: number;
    documents?: string[]; // URLs to contract documents
}

export interface ProductWarranty {
    duration: number; // In months
    terms?: string;
}

export interface VendorProduct {
    product: string | ObjectId | ProductDocument;
    code?: string; // Vendor's product code
    price?: number;
    minimumOrderQuantity?: number;
    leadTime?: number; // In days
    warranty?: ProductWarranty;
    isPreferred?: boolean;
}

export interface VendorPerformance {
    rating?: number;
    onTimeDelivery?: number; // Percentage
    qualityRating?: number; // Percentage
    responseTime?: number; // In hours
    lastReviewDate?: Date;
}

export interface VendorCertification {
    name: string;
    number?: string;
    validUntil?: Date;
    document?: string; // URL to certificate
}

export interface VendorInsurance {
    type: string;
    provider: string;
    policyNumber: string;
    coverage: number;
    validUntil: Date;
    document?: string; // URL to policy document
}

export interface VendorCompliance {
    certifications?: VendorCertification[];
    insurances?: VendorInsurance[];
}

export type VendorStatus = 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED' | 'PENDING_REVIEW';
export type VendorType = 'MANUFACTURER' | 'DISTRIBUTOR' | 'RETAILER' | 'SERVICE_PROVIDER';

export interface VendorDocument {
    _id: string | ObjectId;
    code: string;
    name: string;
    legalName?: string;
    type: VendorType;
    taxId?: string;
    registrationNumber?: string;
    contact: VendorContact;
    billing: VendorBilling;
    contracts?: VendorContract[];
    products?: VendorProduct[];
    performance?: VendorPerformance;
    compliance?: VendorCompliance;
    status: VendorStatus;
    notes?: string;
    tags?: string[];
    isActive: boolean;
    organisation: string | ObjectId | organisation;
    addedBy?: string | ObjectId | UserDocument;
    updatedBy?: string | ObjectId | UserDocument;
    createdAt?: Date;
    updatedAt?: Date;
}