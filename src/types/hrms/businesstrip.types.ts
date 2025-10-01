import { Document, Types } from "mongoose";

export interface ApprovalInfo {
    step: number;                // step number in the flow
    key: string;                 // e.g. 'finance', 'hr', 'departmentHead', 'ceo'
    approverId?: Types.ObjectId;
    date?: Date;
    status?: "Pending" | "Approved" | "Rejected";
    remarks?: string;
}

export interface businesstrip extends Document {
    travellerName: string;
    travellerType: "employee" | "guest";
    requestedBy: Types.ObjectId;
    empId?: string;
    requestedDepartment?: string;
    requiredPosition?: string;
    purposeOfVisit?: string;
    placeOfVisit?: string;
    periodFrom?: Date;
    periodTo?: Date;
    airTicketArrangedBy?: string;
    airTicketReimbursement: boolean;
    hotelArrangedBy?: string;
    hotelReimbursement: boolean;
    cashAdvanceRequired?: string;
    reimbursedAmount?: string;
    reimbursedCurrency?: string;
    remarks?: string;
    requestedBySignature?: string;
    approvalFlow?: ApprovalInfo[];

    // Form Status
    approvalStatus?:
    | "pending_department_head"
    | "pending_hr"
    | "pending_coo_cfo"
    | "pending_ceo"
    | "approved"
    | "rejected";

    currentApprovalStep?: number;
    isActive: boolean;
    createddBy?: string; // seems like a typo, maybe 'createdBy'
    updatedBy?: string;
    createdAt?: Date; // from timestamps
    updatedAt?: Date; // from timestamps
}
