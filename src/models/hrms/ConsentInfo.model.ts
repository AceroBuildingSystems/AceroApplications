import { min } from "lodash";
import mongoose, { Document, Model, Schema } from "mongoose";

import { consentinfo } from "@/types/hrms/consentinfo.types";


const ConsentInfoSchema: Schema<consentinfo> = new Schema({

    transportationPreference: { type: String, required: true },
    pickUpPoint: { type: String },
    pickUpCity: { type: String },
    deductionAmountTransportation: { type: Number, min: 0 },
    accomodationPreference: { type: String, required: true },
    accomodatedDate: { type: Date },
    flatRoomNo: { type: String },
    location: { type: String },
    deductionAmountAccomodation: { type: Number, min: 0 },
    declaration: {
        employeeSignature: { type: String, required: true },
        declarationDate: { type: Date, required: true },
        declarationFormUrl: { type: String },
    },

    addedBy: { type: String },
    updatedBy: { type: String },
},
    { timestamps: true }
);


const ConsentInfo: Model<consentinfo> = mongoose.models.ConsentInfo || mongoose.model<consentinfo>("ConsentInfo", ConsentInfoSchema)

export default ConsentInfo
