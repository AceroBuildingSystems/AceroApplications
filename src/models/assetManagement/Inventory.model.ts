import mongoose, { Document, Model, Schema } from "mongoose";

interface Inventory extends Document {
    asset: Schema.Types.ObjectId;
    quantity: number;
    updatedAt: Date;
    updatedBy: Schema.Types.ObjectId;
    assignedQuantity: number;
    addedBy: Schema.Types.ObjectId;
    warehouse: Schema.Types.ObjectId;
    serialNumber: string;
    vendor: Schema.Types.ObjectId;
    specifications: {name:String,data:{ type: Schema.Types.Mixed }};
    status: string;
    purchaseDate: Date;
    warrantyExpiration: Date;
    userAllottedTo: Schema.Types.ObjectId;
    departmentAllottedTo: Schema.Types.ObjectId;
}

const InventorySchema: Schema<Inventory> = new Schema(
  {
    asset: { type: Schema.Types.ObjectId, ref: "Asset" },
    serialNumber: { type: String, required: true, unique: true },
    vendor: { type: Schema.Types.ObjectId, ref: "Vendor" },
    specifications: {name:String,data:{ type: Schema.Types.Mixed }},
    status: {
        type: String,
        required: true,
        enum: ["active", "damaged", "in repair", "inactive"],
      },
    purchaseDate: { type: Date },
    warrantyExpiration: { type: Date },
    userAllottedTo:{ type: Schema.Types.ObjectId, ref: "User" },
    departmentAllottedTo:{ type: Schema.Types.ObjectId, ref: "Department" },
    quantity: { type: Number, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    warehouse: { type: Schema.Types.ObjectId, ref: "Warehouse" },
    addedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Asset: Model<Inventory> =
  mongoose.models.Inventory || mongoose.model<Inventory>("Inventory", InventorySchema);

export default Asset;