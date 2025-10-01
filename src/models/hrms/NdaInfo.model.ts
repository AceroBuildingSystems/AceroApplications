import { min } from "lodash";
import mongoose, { Document, Model, Schema } from "mongoose";

import { ndainfo } from "@/types/hrms/ndainfo.types";

const NdaInfoSchema: Schema<ndainfo> = new Schema({

    aggrementDate: { type: Date },
    ndaFormUrl: { type: String },
    addedBy: { type: String },
    updatedBy: { type: String },
},
    { timestamps: true }
);


const NdaInfo: Model<ndainfo> = mongoose.models.NdaInfo || mongoose.model<ndainfo>("NdaInfo", NdaInfoSchema)

export default NdaInfo
