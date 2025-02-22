import mongoose, { Document, Model, Schema } from "mongoose";

const AssignmentHistorySchema = new Schema({
    assignedTo: {
        type: {
            type: String,
            enum: ['USER', 'DEPARTMENT'],
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            autopopulate: true
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            autopopulate: true
        }
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        autopopulate: true
    },
    assignedAt: { type: Date, required: true },
    returnedAt: { type: Date },
    notes: { type: String }
}, { _id: true });

const MaintenanceRecordSchema = new Schema({
    type: { 
        type: String,
        enum: ['SCHEDULED', 'REPAIR', 'UPGRADE', 'OTHER'],
        required: true
    },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    cost: { type: Number },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        autopopulate: true
    },
    documents: [{ type: String }]
}, { _id: true });

const SerialNumberSchema = new Schema({
    serialNumber: { type: String, required: true, unique: true },
    // Changed from product to modelMaster reference
    modelMaster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ModelMaster",
        required: true,
        autopopulate: true
    },
    status: {
        type: String,
        enum: ['AVAILABLE', 'ASSIGNED', 'IN_MAINTENANCE', 'DAMAGED', 'RETIRED'],
        default: 'AVAILABLE'
    },
    currentAssignment: {
        type: {
            type: String,
            enum: ['USER', 'DEPARTMENT']
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            autopopulate: true
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            autopopulate: true
        },
        assignedAt: { type: Date },
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            autopopulate: true
        }
    },
    location: {
        warehouse: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Warehouse",
            autopopulate: true
        },
        specificLocation: { type: String }
    },
    purchaseInfo: {
        purchaseDate: { type: Date, required: true },
        warrantyExpiry: { type: Date },
        invoice: { type: String }
    },
    assignmentHistory: [AssignmentHistorySchema],
    maintenanceHistory: [MaintenanceRecordSchema],
    notes: { type: String },
    isActive: { type: Boolean, default: true },
    organisation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organisation",
        required: true,
        autopopulate: true
    },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

SerialNumberSchema.plugin(require('mongoose-autopopulate'));

// Pre-save hook to handle assignment changes
SerialNumberSchema.pre('save', function(next) {
    if (this.isModified('currentAssignment')) {
        // If there was a previous assignment and it had an assignedAt date, add it to history
        const oldAssignment = this.get('currentAssignment');
        if (oldAssignment?.assignedAt) {
            this.assignmentHistory.push({
                assignedTo: {
                    type: oldAssignment.type,
                    user: oldAssignment.user,
                    department: oldAssignment.department
                },
                assignedBy: oldAssignment.assignedBy,
                assignedAt: oldAssignment.assignedAt,
                returnedAt: new Date()
            });
        }

        // Update status based on assignment
        if (this.currentAssignment?.assignedAt) {
            this.status = 'ASSIGNED';
        } else {
            this.status = 'AVAILABLE';
        }
    }
    next();
});

const SerialNumber: Model<Document> = mongoose.models.SerialNumber || mongoose.model("SerialNumber", SerialNumberSchema);

export default SerialNumber;