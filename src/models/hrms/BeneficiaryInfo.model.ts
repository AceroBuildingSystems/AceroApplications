import { min } from "lodash";
import mongoose, { Document, Model, Schema } from "mongoose";

import { beneficiaryinfo } from "@/types/hrms/beneficiaryinfo.types";


const BeneficiaryInfoSchema: Schema<beneficiaryinfo> = new Schema({

    name: { type: String, required: true },
    relation: { type: String, required: true },
    addressAndContact: { type: String },
    
    declaration: {
      employeeSignature: { type: String, required: true },
      declarationDate: { type: Date, required: true },
      declarationFormUrl: { type: String },
    },
    hrAdmin: {
      departmentSignature: { type: String },
      departmentSignatureDate: { type: Date },
      headHrAdminSignature: { type: String },
      headSignatureDate: { type: Date },
      remarks: { type: String },
    },
    addedBy: { type: String },
    updatedBy: { type: String },
},
    { timestamps: true }
);


const BeneficiaryInfo: Model<beneficiaryinfo> = mongoose.models.BeneficiaryInfo || mongoose.model<beneficiaryinfo>("BeneficiaryInfo", BeneficiaryInfoSchema)

export default BeneficiaryInfo
