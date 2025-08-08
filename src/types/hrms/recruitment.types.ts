import { Document, Types } from "mongoose";

export interface ApprovalInfo {
  approverId?: Types.ObjectId;
  date?: Date;
  status?: "Pending" | "Approved" | "Rejected";
  remarks?: string;
}

export interface recruitment extends Document {
  // Request Information
  employeeType: Types.ObjectId;
  requestedBy: Types.ObjectId;
  requestDate?: Date;
  expectedCompletionDate?: Date;
  department: Types.ObjectId;
  requiredPosition: string;

  // Position Information
  vacancyReason: "new_position" | "replacement";
  positionType: "budgeted" | "nonbudgeted";
  noOfVacantPositions: number;
  workLocation: Types.ObjectId;

  // Previous Employee Details
  prevEmployee?: Types.ObjectId;
  dateOfExit?: Date;
  prevEmployeeSalary?: number;
  recruitmentType: "internal" | "external" | "foreign";

  // Final Approvals
  approvedByFinance?: ApprovalInfo;
  approvedByHR?: ApprovalInfo;
  approvedByDepartmentHead?: ApprovalInfo;
  approvedByCEO?: ApprovalInfo;

  // Form Status
  approvalStatus?:
    | "draft"
    | "pending_department_head"
    | "pending_hr_review"
    | "pending_finance"
    | "pending_hr_head"
    | "pending_coo_cfo"
    | "pending_ceo"
    | "approved"
    | "rejected";

  status?: "incomplete" | "completed";

  currentApprovalStep?: number;
  completedStep?: number;

  updatedBy?: string;

  // Mongoose timestamps
  createdAt?: Date;
  updatedAt?: Date;
}
