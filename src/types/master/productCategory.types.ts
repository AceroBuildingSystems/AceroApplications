import mongoose from "mongoose";

// Type for specification field validation
interface SpecificationValidation {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
}

// Type for specification field
export interface SpecificationField {
    name: string;
    type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'ENUM' | 'OBJECT' | 'ARRAY';
    unit?: string;
    enumValues?: string[];
    isRequired: boolean;
    defaultValue?: any;
    validation?: SpecificationValidation;
    nestedFields?: SpecificationField[];
}

// Type for specification template version history
interface SpecificationVersionHistory {
    version: number;
    fields: SpecificationField[];
    updatedAt: Date;
    updatedBy?: mongoose.ObjectId; // Made optional
}

// Type for specification template
interface SpecificationTemplate {
    version: number;
    fields: SpecificationField[];
    previousVersions: SpecificationVersionHistory[];
}

export interface ProductCategoryDocument {
    _id?: mongoose.ObjectId;
    name: string;
    code: string;
    parent?: mongoose.ObjectId;
    description?: string;
    specificationTemplate: SpecificationTemplate;
    isActive: boolean;
    organisation: mongoose.ObjectId;
    addedBy?: mongoose.ObjectId;
    updatedBy?: mongoose.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}