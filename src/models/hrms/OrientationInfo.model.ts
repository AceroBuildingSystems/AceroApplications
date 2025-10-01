import mongoose, { Schema, Document, Model } from "mongoose";

interface SignatureInfo {
    signature: string;
    date: Date | null;
}

export interface OrientationInfo extends Document {
    approvedBy: SignatureInfo;
    attendedBy: SignatureInfo;
    endorsedBy: SignatureInfo;
    reviewedBy: SignatureInfo;
    steps: {
        step1: SignatureInfo;
        step2: SignatureInfo;
        step3: SignatureInfo;
        step4: SignatureInfo;
        step5: SignatureInfo;
        step6: SignatureInfo;
        step7: SignatureInfo;
        step8: SignatureInfo;
        step9: SignatureInfo;
        step10: SignatureInfo;
    };
    addedBy?: string;
    updatedBy?: string;

    createdAt?: Date;
    updatedAt?: Date;

}

const SignatureSchema = new Schema<SignatureInfo>({
    signature: { type: String, default: "" },
    date: { type: Date, default: null },
});

const OrientationInfoSchema = new Schema<OrientationInfo>({
    approvedBy: { type: SignatureSchema, default: () => ({}) },
    attendedBy: { type: SignatureSchema, default: () => ({}) },
    endorsedBy: { type: SignatureSchema, default: () => ({}) },
    reviewedBy: { type: SignatureSchema, default: () => ({}) },
    steps: {
        step1: { type: SignatureSchema, default: () => ({}) },
        step2: { type: SignatureSchema, default: () => ({}) },
        step3: { type: SignatureSchema, default: () => ({}) },
        step4: { type: SignatureSchema, default: () => ({}) },
        step5: { type: SignatureSchema, default: () => ({}) },
        step6: { type: SignatureSchema, default: () => ({}) },
        step7: { type: SignatureSchema, default: () => ({}) },
        step8: { type: SignatureSchema, default: () => ({}) },
        step9: { type: SignatureSchema, default: () => ({}) },
        step10: { type: SignatureSchema, default: () => ({}) },
    },
    addedBy: { type: String },
    updatedBy: { type: String },
},
    { timestamps: true }
);

const OrientationInfo: Model<OrientationInfo> =
    mongoose.models.OrientationInfo ||
    mongoose.model<OrientationInfo>("OrientationInfo", OrientationInfoSchema);

export default OrientationInfo;