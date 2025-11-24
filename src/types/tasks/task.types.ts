import { Types } from "mongoose";

export interface TaskAttachment {
    fileName: string;
    filePath: string;
    uploadedAt?: Date;
    uploadedBy?: Types.ObjectId;
}

export interface TaskHistory {
    field: string;
    oldValue: any;
    newValue: any;
    changedBy?: Types.ObjectId;
    changedAt?: Date;
}

export interface TaskComment {
    text: string;
    commentedBy?: Types.ObjectId;
    commentedAt?: Date;
}


export interface TaskRecurring {
    isRecurring?: boolean;
    intervalType?: "daily" | "weekly" | "monthly" | "custom";
    customDays?: number;
}

export type TaskMode = "individual" | "shared";
export type TaskType = "one-time" | "recurring";
export type TaskPriority = "normal" | "high" | "critical";
export type TaskStatus = "Pending" | "In Progress" | "Completed" | "Closed";

export interface task {
    taskId: string;
    subject: string;
    description?: string;

    department: Types.ObjectId;

    taskType: TaskType;
    recurring?: TaskRecurring;

    mode: TaskMode;
    assignees?: Types.ObjectId[];

    priority?: TaskPriority;

    startDateTime: Date;
    endDateTime: Date;

    status?: TaskStatus;
    progress?: number;

    attachments?: TaskAttachment[];

    // Subtask linkage
    parentTaskId?: Types.ObjectId | null;
    isSubtask?: boolean;

    // History log
    comments?: TaskComment[];
    history?: TaskHistory[];
    isActive: boolean;

    addedBy?: string;
    updatedBy?: string;

    // Timestamps
    createdAt?: Date;
    updatedAt?: Date;
}
