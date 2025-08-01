'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useWorkflow } from '@/contexts/WorkflowContext';
import { HRMS_WORKFLOW_TEMPLATES } from '@/types/workflow';

export default function ResumeWorkflow() {
  const router = useRouter();
  const { initializeWorkflow } = useWorkflow();
  const searchParams = useSearchParams();
  const workflowDataParam = searchParams.get('workflowData');

  useEffect(() => {
    if (workflowDataParam) {
      try {
        const parsedWorkflow = JSON.parse(decodeURIComponent(workflowDataParam));
        const template = HRMS_WORKFLOW_TEMPLATES[parsedWorkflow.workflowType.toUpperCase() as keyof typeof HRMS_WORKFLOW_TEMPLATES];

        if (template) {
          const currentStepIndex = template.steps.findIndex(step => step.id === parsedWorkflow.currentStep);

          if (currentStepIndex === -1) {
            toast.error("Could not find the current step in the workflow template.");
            router.push('/dashboard/hrms/workflows');
            return;
          }

          const currentStep = template.steps[currentStepIndex];
          const workflowWithSteps = { ...parsedWorkflow, steps: template.steps, currentStepIndex };
          initializeWorkflow({ ...workflowWithSteps, template });

          if (currentStep) {
            router.push(`/dashboard/hrms/forms/${currentStep.formType}/new?workflow=true`);
          } else {
            toast.error("Could not determine the current step of the draft.");
            router.push('/dashboard/hrms/workflows');
          }
        } else {
          toast.error("Invalid workflow template type.");
          router.push('/dashboard/hrms/workflows');
        }
      } catch (error) {
        toast.error("Failed to parse workflow draft data.");
        router.push('/dashboard/hrms/workflows');
      }
    }
  }, [workflowDataParam, initializeWorkflow, router]);

  return null;
}