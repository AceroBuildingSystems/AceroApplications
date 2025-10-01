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
export const HRMS_WORKFLOW_TEMPLATES: any = {
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
        formType: HRMSFormTypes.INTERVIEW_ASSESSMENT, // For detailed evaluation and interview notes
        stepName: 'Interview Assessment',
        stepOrder: 3,
        isRequired: true,
        dependencies: ['candidate_information'],
        nextSteps: ['offer_acceptance']
      },
      {
        id: 'offer_acceptance',
        formType: HRMSFormTypes.OFFER_ACCEPTANCE, // For hiring decision and joining details
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
        id: 'employee_joining',
        formType: HRMSFormTypes.NEW_EMPLOYEE_JOINING,
        stepName: 'Employee Joining',
        stepOrder: 1,
        isRequired: true,
        dependencies: [],
        nextSteps: ['assets_access']
      },
      {
        id: 'assets_access',
        formType: HRMSFormTypes.ASSETS_IT_ACCESS,
        stepName: 'Assets & IT - Access',
        stepOrder: 2,
        isRequired: true,
        dependencies: ['employee_joining'],
        nextSteps: ['employee_info']
      },
      {
        id: 'employee_info',
        formType: HRMSFormTypes.EMPLOYEE_INFORMATION,
        stepName: 'Employee Information Setup',
        stepOrder: 3,
        isRequired: true,
        dependencies: ['assets_access'],
        nextSteps: ['beneficiary_declaration']
      },
      {
        id: 'beneficiary_declaration',
        formType: HRMSFormTypes.BENEFICIARY_DECLARATION,
        stepName: 'Beneficiary Declaration',
        stepOrder: 4,
        isRequired: true,
        dependencies: ['employee_info'],
        nextSteps: ['accommodation_transport']
      },
      {
        id: 'accommodation_transport',
        formType: HRMSFormTypes.ACCOMMODATION_TRANSPORT_CONSENT,
        stepName: 'Consent (Accommodation & Transport)',
        stepOrder: 5,
        isRequired: false,
        dependencies: ['beneficiary_declaration'],
        nextSteps: ['nda_signing']
      },

      {
        id: 'nda_signing',
        formType: HRMSFormTypes.NON_DISCLOSURE_AGREEMENT,
        stepName: 'Non-Disclosure Agreement',
        stepOrder: 6,
        isRequired: true,
        dependencies: ['accommodation_transport'],
        nextSteps: ['employee_orientation']
      },

      {
        id: 'employee_orientation',
        formType: HRMSFormTypes.EMPLOYEE_ORIENTATION,
        stepName: 'Employee Orientation',
        stepOrder: 7,
        isRequired: true,
        dependencies: ['nda_signing'],
        nextSteps: ['visa_process']
      },
      {
        id: 'visa_process',
        formType: HRMSFormTypes.VISA_PROCESS,
        stepName: 'Medical & Visa Process',
        stepOrder: 8,
        isRequired: true,
        dependencies: ['employee_orientation'],
        nextSteps: []
      },

    ],

  },

  BUSINESS_TRAVEL: {
    workflowName: 'Business Trip Request Process',
    workflowType: 'business_travel' as const,
    description: 'Business travel request and approval workflow',
    steps: [
      {
        id: 'travel_request',
        formType: HRMSFormTypes.BUSINESS_TRIP_REQUEST,
        stepName: 'Business Trip Request',
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

  PERFORMANCE_APPRAISAL: {
    workflowName: 'Performance Appraisal Request',
    workflowType: 'performance_appraisal' as const,
    description: 'Employee performance appraisal process',
    steps: [
      {
        id: 'appraisal_request',
        formType: HRMSFormTypes.PERFORMANCE_APPRAISAL,
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
        formType: HRMSFormTypes.PERFORMANCE_APPRAISAL,
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
        formType: HRMSFormTypes.OFFBOARDING,
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