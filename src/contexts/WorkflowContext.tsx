import { HRMS_WORKFLOW_TEMPLATES } from '@/types/workflow';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface WorkflowStep {
  stepIndex: number;
  stepName: string;
  formType: string;
  formId?: string;
  formData?: any;
  status: 'not_started' | 'in_progress' | 'completed';
  isRequired: boolean;
}

interface WorkflowContextType {
  workflowId: string | null;
  workflowType: string | null;
  currentStepIndex: number;
  steps: WorkflowStep[];
  formData: Record<string, any>;

  // Actions
  initializeWorkflow: (workflowData: any) => void;
  updateStepData: (stepIndex: number, formId: string, data: any) => void;
  navigateToStep: (stepIndex: number, advance: boolean, workFlowId: string) => void;
  getStepData: (stepIndex: number) => any;
  getAllPreviousData: () => any;
  isStepAccessible: (stepIndex: number) => boolean;
}

const WorkflowContext = createContext<WorkflowContextType | null>(null);

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [workflowType, setWorkflowType] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const router = useRouter();
  const params = useParams();
  
  const flowId = params.id as string;
  const curStepIndex = params.stepIndex as string;
console.log("curStepIndex", curStepIndex)
  const initializeWorkflow = useCallback((workflowData: any) => {
    console.log('🚀 CONTEXT: Initializing workflow with data:', workflowData);

    const { workflowType, currentStep, steps: savedSteps = [], metadata = {}, } = workflowData?.template ?? workflowData ?? {};
    const { formsData = {},formType='' } = workflowData
    console.log('formsData', formsData)
    const template = HRMS_WORKFLOW_TEMPLATES[workflowType?.toUpperCase() as keyof typeof HRMS_WORKFLOW_TEMPLATES];
    console.log("formData is being shown", formsData)
    console.log('🔍 CONTEXT: Using template for workflow type:', workflowType, template, { savedSteps });
    if (!template) {
      console.error('❌ CONTEXT: No template found for workflow type:', workflowType);
      return;
    }
    console.log('🔍 CONTEXT: Template steps:', template, steps, { currentStep,workflowData });
    let currentStepIndex = template.steps.findIndex(s => s.formType === formType);
    console.log(`🔍 CONTEXT: Current step is "${formType}", which is index ${currentStepIndex}`);
    if (currentStepIndex < 0) {
      currentStepIndex = 0; // Fallback to first step if not found
    }
    const initialFormData: { [key: number]: any } = {};
    // The primary source of truth for form data is the `formData` property on each saved step
    savedSteps.forEach((savedStep: any) => {
      const stepIndex = template.steps.findIndex(s => s.id === savedStep.id);
      console.log(`🔍 CONTEXT: Processing saved step "${savedStep.id}" at index ${stepIndex}`);
      if (stepIndex > -1 && savedStep.formData) {
        initialFormData[stepIndex] = savedStep.formData;
        console.log(`📝 CONTEXT: Loaded data for step ${stepIndex}:`, savedStep.formData);
      }
    });

    // Fallback for the very first step if no data has been saved to a step yet
    if (currentStepIndex === 0 && !initialFormData[0] && Object.keys(metadata).length > 0) {
      initialFormData[0] = metadata;
      console.log('📝 CONTEXT: Using metadata for first step:', metadata);
    }


    const completed = Object.keys(formsData) || [];
    console.log('completed', completed)
    const initialSteps = template.steps.map((templateStep: any, index: number) => {
      const savedStep = savedSteps.find((s: any) => s.id === templateStep.id);
      console.log("completed steps check", { savedStep, status: completed.includes(savedStep?.formType) ? 'completed' : 'not_started', completed })
      return {
        ...templateStep,
        stepIndex: index,
        status: completed.includes(savedStep?.formType) ? 'completed' : 'not_started',
        formId: savedStep?.formId,
      };
    });

    console.log("inital steps for all", { savedSteps, initialSteps, temSAteps: template.steps, completed })

    setWorkflowId(workflowData.workflowId);
    setWorkflowType(workflowType);
    console.log("current step index 11111", curStepIndex)
    if(curStepIndex){
      setCurrentStepIndex(Number(curStepIndex));
    }else{
      setCurrentStepIndex(currentStepIndex);
    }
    setSteps(initialSteps);
    setFormData(initialFormData);

    const workflowSessionData = {
      workflowId,
      workflowType,
      currentStepIndex,
      steps,
      formData
    };
    sessionStorage.setItem('workflowData', JSON.stringify(workflowSessionData));

    console.log('✅ CONTEXT: Initialization complete.', {
      id: workflowData.workflowId,
      type: workflowType,
      stepIndex: currentStepIndex,
      steps: initialSteps,
      formData: initialFormData,
    });
  }, []);

  // Initialize workflow from sessionStorage on load
  useEffect(() => {
    const workflowData = sessionStorage.getItem('workflowData');
    if (workflowData) {
      try {
        const parsed = JSON.parse(workflowData);
        initializeWorkflow(parsed);
      } catch (error) {
        console.error('Failed to parse workflow data:', error);
      }
    }
  }, [initializeWorkflow]);

  // Save workflow data to sessionStorage whenever it changes
  useEffect(() => {
    if (workflowId) {
      const workflowData = {
        workflowId,
        workflowType,
        currentStepIndex,
        steps,
        formData
      };
      sessionStorage.setItem('workflowData', JSON.stringify(workflowData));
      console.log('💾 WORKFLOW: Saved workflow data to session storage', workflowData);
    }
  }, [workflowId, workflowType, currentStepIndex, steps, formData]);

  const isStepAccessible = useCallback((stepIndex: number) => {
    // First step is always accessible
    if (stepIndex === 0) {
      return true;
    }

    // Invalid index is not accessible
    if (stepIndex < 0 || stepIndex >= steps.length) {
      return false;
    }

    // If any previous step is not completed, this step is not accessible
    for (let i = 0; i < stepIndex; i++) {
      if (steps[i]?.status !== 'completed') {
        return false;
      }
    }

    return true;
  }, [steps]);

  const navigateToStep = useCallback((stepIndex: number, advance = false, workFlowformId = '') => {
    console.log('🔄 WORKFLOW: Navigating to step', stepIndex, { advance, workFlowformId });

    // Don't allow navigation to invalid steps
    if (stepIndex < 0 || stepIndex >= steps.length) {
      console.warn('🚫 WORKFLOW: Invalid step index', stepIndex);
      return;
    }

    // Only check accessibility if not advancing programmatically
    if (!advance && !isStepAccessible(stepIndex)) {
      console.warn('🚫 WORKFLOW: Step not accessible', stepIndex);
      return;
    }

    // Update the current step index
    setCurrentStepIndex(stepIndex);

    // Only update status if the step isn't already completed
    setSteps(prevSteps =>
      prevSteps.map((step, idx) => {
        if (idx === stepIndex && step.status !== 'completed') {
          return { ...step, status: 'in_progress' };
        }
        return step;
      })
    );

    const step = steps[stepIndex];
    if (step) {
      // Navigate to the form for this step
      const url = `/dashboard/hrms/forms/${step.formType}/new?workflow=true&id=${workFlowformId}&stepIndex=${stepIndex}`;
      console.log('🔄 WORKFLOW: Navigating to form', url);
      router.push(url);
    }
  }, [isStepAccessible, steps, router]);

  const updateStepData = useCallback((stepIndex: number, formId: string, data: any, advance = false) => {
    console.log('📝 WORKFLOW: Updating step data', { stepIndex, formId, data, advance });
    if (stepIndex == -1) {
      setCurrentStepIndex(0);
      return 0
    }
    console.log('📝 WORKFLOW: Current step index is now', { stepIndex, formId, data, advance, steps });
    setSteps(prevSteps => {
      const newSteps = prevSteps.map((step, index) => {
        console.log('📝 WORKFLOW: Processing step', { step, index, stepIndex, advance });
        if (index === stepIndex) {
          return { ...step, formId, status: advance ? 'completed' : 'in_progress' };
        }
        if (index === stepIndex + 1) {
          return { ...step, status: 'in_progress' };
        }
        return step;
      });
      return newSteps;
    });

    setFormData(prevData => ({
      ...prevData,
      [stepIndex]: data
    }));

    if (advance) {
      setCurrentStepIndex(stepIndex + 1);
    }
    console.log('✅ WORKFLOW: Step data updated successfully', { steps });
  }, []);
  console.log('STEPS STEPS STEPS', steps);
  const getStepData = useCallback((stepIndex: number) => {
    return formData[stepIndex] || {};
  }, [formData]);

  const getAllPreviousData = useCallback(() => {
    // Combine all form data from previous steps
    const allData: any = {};
    for (let i = 0; i < currentStepIndex; i++) {
      const stepData = formData[i];
      if (stepData) {
        Object.assign(allData, stepData);
      }
    }
    return allData;
  }, [currentStepIndex, formData]);

  const value: WorkflowContextType = {
    workflowId,
    workflowType,
    currentStepIndex,
    steps,
    formData,
    initializeWorkflow,
    updateStepData,
    navigateToStep,
    getStepData,
    getAllPreviousData,
    isStepAccessible,

  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
};