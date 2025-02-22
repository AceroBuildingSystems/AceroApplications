import mongoose from "mongoose";

// This stores the actual values for the specifications
// e.g., { ram: "16GB", rom: "512GB", cpu: "Intel i7" }
export type SpecificationValues = {
    [key: string]: string | number | boolean;
}

export interface product {
    _id?: mongoose.ObjectId;
    name: string;
    code: string;
    category: mongoose.ObjectId; // Reference to ProductCategory
    brand: string;
    model: string;
    specifications: SpecificationValues; // Actual values for the category's required specs
    description?: string;
    unitOfMeasure: string;
    minimumStockLevel?: number;
    maximumStockLevel?: number;
    reorderPoint?: number;
    unitCost?: number;
    vendor: mongoose.ObjectId; // Reference to default/primary Vendor
    alternateVendors?: mongoose.ObjectId[]; // References to other Vendors
    warranty?: {
        duration: number;
        unit: string; // months, years
        description?: string;
    };
    isActive: boolean;
    addedBy: string;
    updatedBy: string;
}