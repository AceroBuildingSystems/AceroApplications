// HRMS Workflow Types - Client Safe
import { HRMSFormTypes } from './hrms';

export interface HRMSWorkflowStep {
  id: string;
  formType: HRMSFormTypes;
  stepName: string;
  stepOrder: number;
  isRequired: boolean;
  isCompleted?: boolean;
  formId?: string;
  dependencies?: string[]; // Previous step IDs that must be completed
  nextSteps?: string[]; // Possible next step IDs
  conditions?: WorkflowCondition[];
  dueDate?: Date;
  assignedTo?: string;
  completedBy?: string;
  completedAt?: Date;
  data?: Record<string, any>;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'exists';
  value: any;
  action: 'proceed' | 'skip' | 'branch_to';
  targetStepId?: string;
}

export interface HRMSWorkflow {
  _id?: string;
  workflowName: string;
  workflowType: 'recruitment' | 'onboarding' | 'employee_lifecycle' | 'custom';
  description?: string;
  isActive: boolean;
  steps: HRMSWorkflowStep[];
  triggers: WorkflowTrigger[];
  currentStepId?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'paused' | 'cancelled';
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration?: number; // in days
  actualDuration?: number; // in days
  createdBy?: string;
  assignedTo?: string;
  metadata?: Record<string, any>;
}

export interface WorkflowTrigger {
  id: string;
  triggerType: 'form_submission' | 'approval_completed' | 'date_reached' | 'manual';
  formType?: HRMSFormTypes;
  conditions?: WorkflowCondition[];
  action: 'start_workflow' | 'advance_step' | 'branch_workflow';
  targetWorkflowId?: string;
  targetStepId?: string;
}

export interface HRMSWorkflowInstance {
  _id?: string;
  workflowId: string;
  workflowName: string;
  candidateId?: string; // For recruitment workflows
  employeeId?: string; // For employee workflows
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  currentStep: string;
  completedSteps: string[];
  stepsData: Record<string, any>; // Step ID -> form data
  metadata: {
    candidateName?: string;
    employeeName?: string;
    position?: string;
    department?: string;
    startDate?: Date;
    expectedEndDate?: Date;
  };
  startedAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  createdBy: string;
  assignedTo?: string[];
}

// Predefined Workflow Templates
export const HRMS_WORKFLOW_TEMPLATES:any = {
  RECRUITMENT: {
    workflowName: 'Recruitment Process',
    workflowType: 'recruitment' as const,
    description: 'Full recruitment process from manpower requisition to offer acceptance',
    steps: [
      {
        id: 'manpower_req',
        formType: HRMSFormTypes.MANPOWER_REQUISITION,
        stepName: 'Manpower Requisition',
        stepOrder: 1,
        isRequired: true,
        dependencies: [],
        nextSteps: ['candidate_sourcing']
      },
      {
        id: 'candidate_information',
        formType: HRMSFormTypes.CANDIDATE_INFORMATION,
        stepName: 'Candidate Information',
        stepOrder: 2,
        isRequired: true,
        dependencies: ['manpower_req'],
        nextSteps: ['interview_assessment']
      },
      {
        id: 'interview_assessment',
        formType: HRMSFormTypes.EMPLOYEE_INFORMATION, // For detailed evaluation and interview notes
        stepName: 'Interview Assessment',
        stepOrder: 3,
        isRequired: true,
        dependencies: ['candidate_information'],
        nextSteps: ['offer_acceptance']
      },
      {
        id: 'offer_acceptance',
        formType: HRMSFormTypes.NEW_EMPLOYEE_JOINING, // For hiring decision and joining details
        stepName: 'Offer Acceptance',
        stepOrder: 4,
        isRequired: true,
        dependencies: ['interview_assessment'],
        nextSteps: []
      }
     
    ],
    triggers: [
      {
        id: 'start_recruitment',
        triggerType: 'form_submission' as const,
        formType: HRMSFormTypes.MANPOWER_REQUISITION,
        action: 'start_workflow' as const
      }
    ]
  },

  ONBOARDING: {
    workflowName: 'Employee Onboarding Process',
    workflowType: 'onboarding' as const,
    description: 'Complete onboarding process for new employees',
    steps: [
      {
        id: 'employee_info',
        formType: HRMSFormTypes.EMPLOYEE_INFORMATION,
        stepName: 'Employee Information Setup',
        stepOrder: 1,
        isRequired: true,
        dependencies: [],
        nextSteps: ['assets_access']
      },
      {
        id: 'assets_access',
        formType: HRMSFormTypes.ASSETS_IT_ACCESS,
        stepName: 'IT Assets & Access Setup',
        stepOrder: 2,
        isRequired: true,
        dependencies: ['employee_info'],
        nextSteps: ['accommodation_transport']
      },
      {
        id: 'accommodation_transport',
        formType: HRMSFormTypes.ACCOMMODATION_TRANSPORT_CONSENT,
        stepName: 'Accommodation & Transport Setup',
        stepOrder: 3,
        isRequired: false,
        dependencies: ['employee_info'],
        nextSteps: ['beneficiary_declaration']
      },
      {
        id: 'beneficiary_declaration',
        formType: HRMSFormTypes.BENEFICIARY_DECLARATION,
        stepName: 'Beneficiary Information',
        stepOrder: 4,
        isRequired: true,
        dependencies: ['employee_info'],
        nextSteps: ['nda_signing']
      },
      {
        id: 'nda_signing',
        formType: HRMSFormTypes.NON_DISCLOSURE_AGREEMENT,
        stepName: 'NDA & Legal Documents',
        stepOrder: 5,
        isRequired: true,
        dependencies: ['employee_info'],
        nextSteps: []
      },
      {
        id: 'accommodation_transport1',
        formType: HRMSFormTypes.ACCOMMODATION_TRANSPORT_CONSENT,
        stepName: 'Accommodation & Transport Setup',
        stepOrder: 3,
        isRequired: false,
        dependencies: ['employee_info'],
        nextSteps: ['beneficiary_declaration']
      },
      {
        id: 'beneficiary_declaration1',
        formType: HRMSFormTypes.BENEFICIARY_DECLARATION,
        stepName: 'Beneficiary Information',
        stepOrder: 4,
        isRequired: true,
        dependencies: ['employee_info'],
        nextSteps: ['nda_signing']
      },
      {
        id: 'nda_signing1',
        formType: HRMSFormTypes.NON_DISCLOSURE_AGREEMENT,
        stepName: 'NDA & Legal Documents',
        stepOrder: 5,
        isRequired: true,
        dependencies: ['employee_info'],
        nextSteps: []
      }
    ],
    triggers: [
      {
        id: 'start_onboarding',
        triggerType: 'form_submission' as const,
        formType: HRMSFormTypes.NEW_EMPLOYEE_JOINING,
        action: 'start_workflow' as const
      }
    ]
  },

  OFFBOARDING: {
    workflowName: 'Employee Offboarding Process',
    workflowType: 'offboarding' as const,
    description: 'Complete offboarding process for departing employees',
    steps: [
      {
        id: 'offboarding',
        formType: HRMSFormTypes.MANPOWER_REQUISITION,
        stepName: 'Offboarding Process',
        stepOrder: 1,
        isRequired: true,
        dependencies: [],
        nextSteps: []
      },
      
     
    ],
    triggers: [
      {
        id: 'start_recruitment',
        triggerType: 'form_submission' as const,
        formType: HRMSFormTypes.MANPOWER_REQUISITION,
        action: 'start_workflow' as const
      }
    ]
  },

   PERFORMANCE_APPRAISAL: {
    workflowName: 'Performamnce Appraisal Request',
    workflowType: 'appraisal' as const,
    description: 'Employee performance appraisal process',
    steps: [
      {
        id: 'appraisal_request',
        formType: HRMSFormTypes.BUSINESS_TRIP_REQUEST,
        stepName: 'Performance Appraisal Request',
        stepOrder: 1,
        isRequired: true,
        dependencies: [],
        nextSteps: []
      }
    ],
    triggers: [
      {
        id: 'start_travel_request',
        triggerType: 'form_submission' as const,
        formType: HRMSFormTypes.BUSINESS_TRIP_REQUEST,
        action: 'start_workflow' as const
      }
    ]
  },
  BUSINESS_TRAVEL: {
    workflowName: 'Business Travel Request Process',
    workflowType: 'custom' as const,
    description: 'Business travel request and approval workflow',
    steps: [
      {
        id: 'travel_request',
        formType: HRMSFormTypes.BUSINESS_TRIP_REQUEST,
        stepName: 'Travel Request Submission',
        stepOrder: 1,
        isRequired: true,
        dependencies: [],
        nextSteps: []
      }
    ],
    triggers: [
      {
        id: 'start_travel_request',
        triggerType: 'form_submission' as const,
        formType: HRMSFormTypes.BUSINESS_TRIP_REQUEST,
        action: 'start_workflow' as const
      }
    ]
  }


};

// Workflow Status and Progress Types
export interface WorkflowProgress {
  workflowInstanceId: string;
  totalSteps: number;
  completedSteps: number;
  currentStepName: string;
  progressPercentage: number;
  estimatedTimeRemaining?: number; // in days
  isOnTrack: boolean;
  overdueSteps: string[];
  upcomingDeadlines: Array<{
    stepId: string;
    stepName: string;
    dueDate: Date;
  }>;
}

export interface WorkflowActionRequest {
  workflowInstanceId: string;
  stepId: string;
  action: 'complete_step' | 'skip_step' | 'reassign_step' | 'pause_workflow' | 'cancel_workflow';
  formData?: Record<string, any>;
  comments?: string;
  assignTo?: string;
  reassignReason?: string;
}