import { Document, Types } from "mongoose";

export interface EvaluationParameter {
    parameterName: string;
    description?: string;
    score?: number;
}

export interface EmployeeResponse {
    reviewed: boolean;
    signature?: string;
    comments?: string;
    date?: Date;
}

export interface DepHeadFeedback {
    findings?: string;
    trainingRecommenedation?: string;
    otherRecommenedation?: string;
    signature?: string;
    date?: Date;
}

export interface performanceAppraisal extends Document {
    employee: Types.ObjectId | {
        firstName: string;
        lastName: string;
        displayName: string;
        email: string;
        empId: string;
        designation: string;
        department: string;
    };
    evaluationDate: Date;
    evaluationParameters: EvaluationParameter[];
    employeeResponse?: EmployeeResponse;
    depHeadFeedback?: DepHeadFeedback;
    purposeOfEvaluation?: string;
    isActive: boolean;
    createddBy?: string;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}