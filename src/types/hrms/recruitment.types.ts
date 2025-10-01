import { Document, Types } from "mongoose";

export interface ApprovalInfo {
  step: number;                // step number in the flow
  key: string;                 // e.g. 'finance', 'hr', 'departmentHead', 'ceo'
  approverId?: Types.ObjectId;
  date?: Date;
  status?: "Pending" | "Approved" | "Rejected";
  remarks?: string;
}

export interface recruitment extends Document {
  // Request Information
  regionRequisition: Types.ObjectId;
  employeeType: Types.ObjectId;
  requestedBy: Types.ObjectId;
  requestDate?: Date;
  expectedCompletionDate?: Date;
  department: Types.ObjectId;
  requiredPosition: Types.ObjectId;

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

  // Final Approvals as an array of approval steps
  approvalFlow?: ApprovalInfo[];

  // Form Status
  approvalStatus?:
  | "draft"
  | "pending_department_head"
  | "pending_hr_review"
  | "pending_finance"
  | "pending_hr"
  | "pending_coo_cfo"
  | "pending_ceo"
  | "approved"
  | "rejected";

  status?: "incomplete" | "completed";

  currentApprovalStep?: number;
  completedStep?: number;
  checker: Types.ObjectId;
  interviewers?: Types.ObjectId[];
  isActive?: boolean;
  updatedBy?: string;

  // Mongoose timestamps
  createdAt?: Date;
  updatedAt?: Date;
}
