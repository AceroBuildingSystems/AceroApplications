'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { usePathname, useParams, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import HRMSFormContainer from '@/components/hrms/HRMSFormContainer';
import HRMSFormSection from '@/components/hrms/HRMSFormSection';
import WorkflowNavigation from '@/components/hrms/WorkflowNavigation';
import PDFGenerator from '@/components/hrms/PDFGenerator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircleIcon, FileTextIcon, DownloadIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircleIcon } from 'lucide-react';
import { getFormConfig } from '@/configs/hrms-forms';
import { useCreateFormMutation, useSaveDraftMutation, useUpdateWorkflowInstanceMutation, useUpdateFormMutation, useGetFormByIdQuery, useGetWorkflowByIdQuery } from '@/services/endpoints/hrmsApi';
import { useGetDepartmentsQuery, useGetAvailableApproversQuery, useGetCountriesQuery, useGetRolesQuery, useGetOrganizationsQuery, useGetLocationsQuery } from '@/services/endpoints/hrmsApi';
import { HRMSFormConfig } from '@/types/hrms';
import { useWorkflow } from '@/contexts/WorkflowContext';
import { skipToken } from '@reduxjs/toolkit/query';
import { progress } from 'framer-motion';
// Workflow Completion Dialog Component
interface WorkflowCompletionDialogProps {
  workflow: any;
  onClose: () => void;
}

const WorkflowCompletionDialog: React.FC<WorkflowCompletionDialogProps> = ({ workflow, onClose }) => {
  const { getStepData } = useWorkflow();
  const completedForms = workflow.steps.filter((step: any) => step.formId);

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircleIcon className="h-6 w-6" />
            Workflow Completed Successfully!
          </DialogTitle>
          <DialogDescription>
            Your {workflow.workflowType} workflow has been completed. You can now generate PDF documents for all submitted forms.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Workflow Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Workflow Summary</CardTitle>
              <CardDescription>
                {completedForms.length} of {workflow.steps.length} forms completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {workflow.steps.map((step: any, index: number) => (
                  <div key={step.stepIndex} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step.formId ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{step.stepName}</p>
                        <p className="text-sm text-muted-foreground">{step.formType.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                    {step.formId && (
                      <PDFGenerator
                        formType={step.formType}
                        formId={step.formId}
                        formData={getStepData(step.stepIndex)}
                        triggerButton={
                          <Button variant="outline" size="sm" className="gap-2">
                            <FileTextIcon className="h-3 w-3" />
                            PDF
                          </Button>
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Generate All PDFs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DownloadIcon className="h-5 w-5" />
                Bulk PDF Generation
              </CardTitle>
              <CardDescription>
                Generate PDF documents for all completed forms at once
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full gap-2"
                onClick={() => {
                  // Generate PDFs for all completed forms
                  completedForms.forEach((step: any) => {
                    // This would trigger PDF generation for each form
                    console.log('Generating PDF for', step);
                  });
                }}
              >
                <DownloadIcon className="h-4 w-4" />
                Generate All PDFs ({completedForms.length} files)
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={onClose}>
              Go to Workflows Dashboard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function NewHRMSFormPage() {
  const pathname = usePathname()
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isWorkflow = searchParams.get('workflow') === 'true';
  const id = searchParams.get('id');
  const stepIndex = searchParams.get('stepIndex');

  console.log('NewHRMSFormPage', { params, isWorkflow, id, pathname, stepIndex });
  // Workflow context
  const workflow = useWorkflow();
  const {
    workflowId,
    currentStepIndex,
    getAllPreviousData,
    updateStepData,
    getStepData,
    formData,
    steps,
    navigateToStep
  } = workflow;
  console.log('formID', steps, currentStepIndex, formData, workflowId, isWorkflow);
  const formType = params.formType as string;
  const [formId, setFormId] = useState<string | null>(null);
  const [formConfig, setFormConfig] = useState<HRMSFormConfig | null>(null);
  const [showWorkflowCompletion, setShowWorkflowCompletion] = useState(false);


  // RTK Query mutations
  const [createForm, { isLoading: isCreating }] = useCreateFormMutation();
  const [updateForm, { isLoading: isUpdating }] = useUpdateFormMutation();
  const [saveDraft, { isLoading: isSavingDraft }] = useSaveDraftMutation();
  const [updateWorkflowInstance, { isLoading: isUpdatingStatus }] = useUpdateWorkflowInstanceMutation();

  const { data: workFlowData = {}, isLoading: WorkFlowLoading } = useGetWorkflowByIdQuery(id);
  const currentWorkflowId = workFlowData?.data?._id;
  // Extract the form ID once the workflow data is ready
  const workFlowformId = workFlowData?.data?.formsData?.[formType];

  console.log('📄 WORKFLOW DATA:', workFlowData, formType)
  // Only run query if `formId` exists
  const {
    data: requisitionData = {},
    isLoading: requisitionDataLoading
  } = useGetFormByIdQuery(workFlowformId ? { formType, id: workFlowformId } : skipToken);


  console.log('📄 REQUISITION DATA:', requisitionData);
  const isLoading = isCreating || isUpdating || isSavingDraft || isUpdatingStatus || requisitionDataLoading || WorkFlowLoading;


  console.log('📄 FORM DATA LOG:', requisitionData);
  useEffect(() => {
    if (requisitionData?.data?._id) {
      setFormId(requisitionData.data._id);

    }
  }, [requisitionData, requisitionData?.data])

  // Debug: Log workflow state when component loads
  useEffect(() => {
    if (isWorkflow && steps.length > 0 && Object.keys(formData).length > 0) {
      console.log('📋 WORKFLOW: Form page loaded', {
        formType,
        currentStepIndex,
        totalSteps: steps.length,
        expectedFormType: steps[currentStepIndex]?.formType
      });

      // Check if current step has a formId (completed step)
      const currentStep = steps[currentStepIndex];
      if (currentStep?.formId) {
        console.log('📝 WORKFLOW: Current step has existing form, setting formId', currentStep.formId);
        setFormId(currentStep.formId);
      } else {
        console.log('📝 WORKFLOW: Current step is new, clearing formId');
        setFormId(null);
      }
    }
  }, [isWorkflow, formType, currentStepIndex, steps, formData]);

  // Get prefill data from previous workflow steps
  const getInitialFormData = () => {
    if (!isWorkflow) return {};

    // Get all data from the steps that have been completed
    const previousData = getAllPreviousData();

    // Get the data for the current step, if it exists
    const currentStepData = getStepData(currentStepIndex);

    console.log('📋 FORM PAGE: Calculating initial data', {
      previousData,
      currentStepData,
    });

    // Combine them, with the current step's data taking precedence
    return { ...previousData, ...currentStepData };
  };

  const initialFormData = useMemo(() => {
    return getInitialFormData();
  }, [isWorkflow, currentStepIndex, getAllPreviousData, getStepData, steps, formData]);

  // Get fields that should be disabled (already filled in previous steps)
  const getDisabledFields = () => {
    if (!isWorkflow || currentStepIndex === 0) return [];

    const previousData = getAllPreviousData();
    const disabledFields = Object.keys(previousData);

    console.log('🔒 WORKFLOW: Disabled fields from previous steps', disabledFields);
    console.log('🔒 WORKFLOW: Current step index', currentStepIndex, steps);
    return disabledFields;
  };

  // Data for dropdowns
  const { data: departmentsData, isLoading: departmentsDataLoading } = useGetDepartmentsQuery({});
  const { data: approversData, isLoading: approversDataLoading } = useGetAvailableApproversQuery({});
  const { data: countriesData, isLoading: countriesDataLoading } = useGetCountriesQuery({});
  const { data: rolesData, isLoading: rolesDataLoading } = useGetRolesQuery({});
  const { data: organizationsData, isLoading: organizationsDataLoading } = useGetOrganizationsQuery({});
  const { data: locationsData, isLoading: locationsDataLoading } = useGetLocationsQuery({});

  const loading = departmentsDataLoading || approversDataLoading || countriesDataLoading || rolesDataLoading || organizationsDataLoading || locationsDataLoading || requisitionDataLoading;
  useEffect(() => {
    const config = getFormConfig(formType);
    if (!config) {
      toast.error('Invalid form type');
      router.push('/dashboard/hrms');
      return;
    }

    // Populate dropdown options
    const updatedConfig = { ...config };
    updatedConfig.sections = updatedConfig.sections.map(section => ({
      ...section,
      fields: section.fields.map(field => {
        if (field.name === 'department' || field.name === 'departmentSection') {
          return {
            ...field,
            options: departmentsData?.data?.map((dept: any) => ({
              label: dept.name,
              value: dept._id
            })) || []
          };
        }

        if (field.name === 'requestedBy' || field.name === 'reportingTo') {
          return {
            ...field,
            options: approversData?.data?.map((user: any) => ({
              label: user.displayName || `${user.firstName} ${user.lastName}`,
              value: user._id
            })) || []
          };
        }

        if (field.name === 'nationality' || field.name === 'familyDetails.fatherNationality' || field.name === 'familyDetails.motherNationality' || field.name === 'familyDetails.spouseNationality') {
          console.log('🌍 COUNTRIES: Loading nationality options', {
            fieldName: field.name,
            countriesDataExists: !!countriesData,
            countriesCount: countriesData?.data?.length || 0
          });
          return {
            ...field,
            options: countriesData?.data?.map((country: any) => ({
              label: country.name,
              value: country._id  // Use ObjectId instead of name
            })) || []
          };
        }

        if (field.name === 'designation') {
          console.log('👔 ROLES: Loading designation options', {
            rolesDataExists: !!rolesData,
            rolesCount: rolesData?.data?.length || 0
          });
          return {
            ...field,
            options: rolesData?.data?.map((role: any) => ({
              label: role.name,
              value: role._id
            })) || []
          };
        }

        if (field.name === 'location') {
          console.log('📍 LOCATIONS: Loading location options', {
            locationsDataExists: !!locationsData,
            locationsCount: locationsData?.data?.length || 0
          });
          return {
            ...field,
            options: locationsData?.data?.map((location: any) => ({
              label: location.name,
              value: location._id
            })) || []
          };
        }

        return field;
      })
    }));

    setFormConfig(updatedConfig);
  }, [formType, router, departmentsData, approversData, countriesData, rolesData, organizationsData, locationsData]);

  const handleSaveDraft = async (data: any) => {
    console.log('🟡 DRAFT SAVE: handleSaveDraft called', { formId, formType, isWorkflow });
    try {
      let result;
      if (formId) {
        // Update existing draft using the dedicated saveDraft endpoint
        console.log('🟡 DRAFT SAVE: Updating existing draft');
        result = await saveDraft({ formType, id: formId, data }).unwrap();
      } else {
        // Create new draft using createForm with isDraft: true
        console.log('🟡 DRAFT SAVE: Creating new draft');
        result = await createForm({ formType, data: { ...data, isDraft: true } }).unwrap();
        console.log('🟡 DRAFT SAVE: New draft created', result);
        const workFlowUpdate = await updateWorkflowInstance({
          id: currentWorkflowId, data: { ...workFlowData?.data?.formsData, [formType]: result.data._id, ...result.data?.candidateInfo }
        })
        console.log('🟡 DRAFT SAVE: Workflow instance updated with new draft', workFlowUpdate);
        console.log('🟡 DRAFT SAVE: Workflow instance updated with new draft', workFlowUpdate);
        if (result.success) {
          setFormId(result.data._id);
          // Don't redirect immediately, just update the URL quietly
          if (!isWorkflow) {
            window.history.replaceState(
              {},
              '',
              `/dashboard/hrms/forms/${formType}/${result.data._id}/edit${isWorkflow ? '?workflow=true' : ''}`
            );
          } else {
            window.history.replaceState(
              {},
              '',
              `/dashboard/hrms/forms/${formType}/new?workflow=true&id=${currentWorkflowId}`
            );
          }
        }
      }

      // Update workflow data if in workflow mode
      if (isWorkflow && result?.success) {
        // Only update the form data, not the step status
        workflow.updateStepData(currentStepIndex, result.data._id, data, true);
      }

      console.log('🟡 DRAFT SAVE: Completed successfully', result);

    } catch (error: any) {
      console.error('🔴 DRAFT SAVE: Failed', error);
      throw new Error(error.message || 'Failed to save draft');
    }
  };

  const handleSubmit = async (data: any) => {
    console.log('🟢 FORM SUBMIT: handleSubmit called', { formId, formType, isWorkflow });

    // If in workflow mode, prevent any default navigation first
    if (isWorkflow) {
      console.log('🚫 WORKFLOW: Blocking any potential redirects');
    }

    try {
      let result;

      // First, ensure the form is saved with the submitted data
      if (formId) {
        // Update existing form and mark as submitted (use appropriate status for each form type)
        console.log('🟢 FORM SUBMIT: Updating existing form for submission');
        const submissionStatus = formType === 'manpower_requisition' ? 'pending_department_head' : 'submitted';
        result = await updateForm({ formType, id: formId, data: { ...data, isDraft: false, status: submissionStatus } }).unwrap();
      } else {
        // Create new form and mark as submitted (use appropriate status for each form type)
        console.log('🟢 FORM SUBMIT: Creating new form for submission');
        const submissionStatus = formType === 'manpower_requisition' ? 'pending_department_head' : 'submitted';
        result = await createForm({
          formType,
          data: { ...data, isDraft: false, status: submissionStatus }
        }).unwrap();
      }
console.log('🟢 FORM SUBMIT: Form submission result', result);
      if (result?.data?._id) {
        console.log('🟢 FORM SUBMIT: Updating workflow instance with new form ID', { workFlowData });

        // Update the workflow instance with the new form ID
        const workFlowUpdate = await updateWorkflowInstance({
          id: currentWorkflowId,
          data: {
            ...workFlowData?.data?.formsData, formsData: { [formType]: result.data._id }, progress: {
              ...workFlowData?.data?.progress,
              currentStep: steps[workFlowData?.data?.progress?.completedSteps+1]?.id,
              progress: (100/workFlowData?.data?.progress?.totalSteps)*((workFlowData?.data?.progress?.completedSteps || 0)),
              currentStepName:steps[workFlowData?.data?.progress?.completedSteps+1]?.stepName || '',
            },
            ...result.data?.candidateInfo,
          }
        }).unwrap();
        console.log('🟢 FORM SUBMIT: Workflow instance updated', workFlowUpdate);
      }

      console.log('🟢 FORM SUBMIT: API Result', result);

      // Only proceed with workflow logic if this was successful
      if (result.success) {
        console.log('🟢 FORM SUBMIT: Form submitted successfully, checking workflow');
        toast.success(`Form ${formType} submitted successfully!`);
        // Check if this is part of a workflow - HANDLE IMMEDIATELY
        if (isWorkflow && workflow.steps.length > 0) {
          console.log('🟢 FORM SUBMIT: Workflow detected - immediate processing');
          console.log('🔄 WORKFLOW: Current step index:', currentStepIndex);
          console.log('🔄 WORKFLOW: Total steps:', workflow.steps.length);


          // Update current step data
          console.log('📝 WORKFLOW: Updating step data for current step', currentStepIndex, result.data._id, data);
          updateStepData(currentStepIndex, result.data._id, data, true);

          if (currentStepIndex < workflow.steps.length - 1) {
            // Get next step info
            const nextStepIndex = currentStepIndex + 1;
            const nextStep = workflow.steps[nextStepIndex];

            console.log('🔄 WORKFLOW: Advancing to step', nextStepIndex, nextStep);
            console.log('🔄 WORKFLOW: All workflow steps:', workflow.steps);

            // CRITICAL: Update the workflow context current step BEFORE navigation
            // We need to ensure the context reflects the new step

            // Use a small delay to ensure the step data update completes first
            setTimeout(() => {
              console.log('🚀 WORKFLOW: Navigating to next step after data update');
              workflow.navigateToStep(nextStepIndex, true, currentWorkflowId);
            }, 50);

            return; // Stop all further execution
          } else {
            // Last step - show workflow completion with PDF options
            console.log('🎉 WORKFLOW: Completed - showing completion dialog');
            setShowWorkflowCompletion(true);
            return;
          }
        } else {
          console.log('🔍 WORKFLOW: Not in workflow mode or no steps', { isWorkflow, stepsLength: workflow.steps.length });
        }

        // Only if NOT in workflow mode
        if (!isWorkflow) {
          console.log('📄 NON-WORKFLOW: Redirecting to view page');
          // router.push(`/dashboard/hrms/forms/${formType}/${result.data._id}`);
        }
      } else {
        console.error('🔴 FORM SUBMIT: Form submission failed', result);
      }
    } catch (error: any) {
      console.error('🔴 FORM SUBMIT: Exception during submission', error);
      throw new Error(error.message || 'Failed to submit form');
    }
  };

  if (!formConfig) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>
            Invalid or unsupported form type: {formType}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  console.log(initialFormData, 'initialFormData');
  return (
    <>
      {!isLoading && (<div className="container mx-auto p-6 max-w-4xl">
        {/* Workflow Navigation */}
        {isWorkflow && <WorkflowNavigation />}

        <HRMSFormContainer
          formConfig={formConfig}
          mode="create"
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          initialData={initialFormData}
          disabledFields={getDisabledFields()}
        >
          {formConfig.sections.map((section) => (
            <HRMSFormSection
              key={section.id}
              section={section}
              data={requisitionData?.data || []}
            />
          ))}
        </HRMSFormContainer>

        {/* Workflow Completion Dialog */}
        {showWorkflowCompletion && (
          <WorkflowCompletionDialog
            workflow={workflow}
            onClose={() => {
              setShowWorkflowCompletion(false);
              router.push('/dashboard/hrms/workflows');
            }}
          />
        )}
      </div>)}
    </>

  );
};