
import { Document, Types } from "mongoose";

export interface consentinfo {
    // Request Information

    transportationPreference: string;
    pickUpPoint?: string;
    pickUpCity?: string;
    deductionAmountTransportation?: number;

    accomodationPreference: string;
    accomodatedDate?: Date;
    flatRoomNo?: string;
    location?: string;
    deductionAmountAccomodation?: number;

    // ✅ Declaration Section
    declaration: {
        employeeSignature: string;
        declarationDate: Date;
        declarationFormUrl?: string;
    };

    addedBy?: string;
    updatedBy?: string;

    createdAt?: Date;
    updatedAt?: Date;
}
