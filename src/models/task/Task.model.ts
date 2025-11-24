import mongoose, { Document, Model, Schema } from "mongoose";

import { task } from "@/types/tasks/task.types";

const TaskSchema: Schema<task> = new Schema({
    taskId: { type: String, required: true, unique: true },
    subject: { type: String, required: true },
    description: { type: String },

    department: { type: Schema.Types.ObjectId, ref: "Department", required: true, autopopulate: true },

    taskType: {
        type: String,
        enum: ["one-time", "recurring"],
        required: true
    },
    recurring: {
        isRecurring: { type: Boolean, default: false },
        intervalType: {
            type: String,
            enum: ["daily", "weekly", "monthly", "custom"],
            default: "daily"
        },
        customDays: { type: Number, default: 0 } // if custom, e.g., every 5 days
    },

    mode: {
        type: String,
        enum: ["individual", "shared"],
        required: true
    },

    assignees: [{
        type: Schema.Types.ObjectId, ref: "User", autopopulate: {
            select:
                "firstName lastName displayName email",
        },
    }],

    priority: {
        type: String,
        enum: ["normal", "high", "critical"],
        default: "Normal"
    },

    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },

    status: {
        type: String,
        enum: ["Pending", "In Progress", "Completed", "Closed"],
        default: "Pending"
    },

    progress: { type: Number, default: 0 },

    attachments: [
        {
            _id: false,
            fileName: String,
            filePath: String,
            uploadedAt: { type: Date, default: Date.now },
            uploadedBy: { type: Schema.Types.ObjectId, ref: "User" }
        }
    ],

    // Subtask linkage
    parentTaskId: { type: Schema.Types.ObjectId, ref: "Task", default: null },
    isSubtask: { type: Boolean, default: false },

    // History log
    history: [
        {
            field: String,
            oldValue: Schema.Types.Mixed,
            newValue: Schema.Types.Mixed,
            changedBy: { type: Schema.Types.ObjectId, ref: "User", autopopulate: true },
            changedAt: { type: Date, default: Date.now }
        }
    ],
    comments: [
        {
            text: { type: String, required: true },
            commentedBy: { type: Schema.Types.ObjectId, ref: "User", autopopulate: true },
            commentedAt: { type: Date, default: Date.now },
        },
    ],
    isActive: { type: Boolean, default: true },

    addedBy: { type: String },
    updatedBy: { type: String },
},
    {
        timestamps: true,

    }
);
TaskSchema.plugin(require('mongoose-autopopulate'));

TaskSchema.index({ department: 1, isActive: 1 });

TaskSchema.pre("save", function (next) {
    const doc = this as mongoose.Document & task;

    if (doc.isNew) {
        // Ensure history array exists
        if (!doc.history) doc.history = [];

        doc.history.push({
            field: "Task",
            oldValue: null,
            newValue: "Task Created",
            changedBy: (doc as any).addedBy || (doc as any).updatedBy || null,
            changedAt: new Date(),
        });
    }

    next();
});


// Log changes during updates
TaskSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();
    const userId = update.updatedBy || null;

    // Load current doc to compare old vs new values
    const docToUpdate = await this.model.findOne(this.getQuery());

    if (docToUpdate) {
        const historyEntries = [];

        // Compare old vs new values for relevant fields
        ['status', 'priority', 'progress', 'assignees', 'description', 'taskType'].forEach(field => {
            const oldValue = docToUpdate[field];
            const newValue = update[field];

            if (newValue !== undefined && oldValue !== newValue) {
                historyEntries.push({
                    field,
                    oldValue,
                    newValue,
                    changedBy: userId,
                    changedAt: new Date()
                });
            }
        });

        // Push history changes
        if (historyEntries.length) {
            await this.model.updateOne(this.getQuery(), {
                $push: { history: { $each: historyEntries } }
            });
        }
    }

    next();
});



const Task: Model<task> = mongoose.models.Task || mongoose.model<task>("Task", TaskSchema)

export default Task
