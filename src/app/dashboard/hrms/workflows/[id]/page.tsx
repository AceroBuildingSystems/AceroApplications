'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  FileTextIcon,
  PlayIcon,
  PauseIcon,
  WorkflowIcon,
  CalendarIcon,
  MapPinIcon,
  BriefcaseIcon,
  AlertCircleIcon,
  EditIcon,
  EyeIcon,
  Lock,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { HRMSFormTypes, HRMS_FORM_CONFIG } from '@/types/hrms';
import { HRMS_WORKFLOW_TEMPLATES, HRMSWorkflowStep } from '@/types/workflow';
import { useGetWorkflowByIdQuery } from '@/services/endpoints/hrmsApi';

interface WorkflowMetadata {
  candidateName?: string;
  employeeName?: string;
  position: string;
  department: string;
  startDate: Date;
  expectedEndDate?: Date;
}

interface WorkflowProgress {
  totalSteps: number;
  completedSteps: number;
  progressPercentage: number;
  currentStepName: string;
  isOnTrack: boolean;
  daysSinceStart: number;
}

interface WorkflowStepLog {
  stepId: string;
  stepName: string;
  action: string;
  userId: string;
  timestamp: Date;
  comments?: string;
}

interface Workflow {
  _id: string;
  workflowName: string;
  workflowType: string;
  status: string;
  currentStep: string;
  completedSteps: string[];
  metadata: WorkflowMetadata;
  progress: WorkflowProgress;
  stepsData: Record<string, any>;
  stepLogs: WorkflowStepLog[];
}

interface WorkflowTemplate {
  workflowName: string;
  workflowType: string;
  description: string;
  steps: HRMSWorkflowStep[];
  triggers: any[];
}

export default function WorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;

  const [workflow, setWorkflow] = useState<Workflow | null>(null);

  const [error, setError] = useState<string | null>(null);

  const { data: workFlowData = {}, isLoading: WorkFlowLoading } = useGetWorkflowByIdQuery(workflowId);
  console.log('workFlowData:', workFlowData);
  // Simple step status check
  const isStepCompleted = (stepId: string) => {
    return Object.keys(workFlowData?.data?.formsData).includes(stepId) || false;
  };

  const isLoading = WorkFlowLoading;


  // Handle step completion
  const handleStepComplete = async (stepId: string, formData: any) => {
    if (!workFlowData?.data) return;

    try {

      // Update the workflow state
      // const updatedWorkflow = {
      //   ...workFlowData?.data,
      //   stepsData: {
      //     ...workFlowData?.data?.stepsData,
      //     [stepId]: formData
      //   },
      //   completedSteps: [...new Set([...workFlowData?.data.completedSteps, stepId])],
      //   currentStep: stepId, // Keep the current step as the one being completed
      //   progress: {
      //     ...workFlowData?.data.progress,
      //     completedSteps: new Set([...workFlowData?.data.completedSteps, stepId]).size,
      //     progressPercentage: Math.round((new Set([...workFlowData?.data.completedSteps, stepId]).size / workFlowData?.data.progress.totalSteps) * 100)
      //   },
      //   stepLogs: [
      //     ...workFlowData?.data.stepLogs,
      //     {
      //       stepId,
      //       stepName: template?.steps.find(s => s.id === stepId)?.stepName || stepId,
      //       action: 'completed',
      //       userId: 'current-user',
      //       timestamp: new Date(),
      //       comments: 'Step completed'
      //     }
      //   ]
      // };

      // Update local state
      setWorkflow(workFlowData?.data);

    } catch (error) {
      console.error('Error completing step:', error);
      setError('Failed to complete step. Please try again.');
    } finally {

    }
  };

  // Handle step navigation
  const navigateToStep = (stepId: string) => {
    if (!workFlowData?.data) return;

    setWorkflow({
      ...workFlowData?.data,
      currentStep: stepId
    });
  };

  useEffect(() => {
    // For now, use mock data - replace with actual API call
    // const mockWorkflow = workFlowData?.data;

    // Simulate API call
    setTimeout(() => {
      setWorkflow(workFlowData?.data);

    }, 1000);
  }, [workFlowData?.data]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <PlayIcon className="w-4 h-4 text-green-600" />;
      case 'completed': return <CheckCircleIcon className="w-4 h-4 text-blue-600" />;
      case 'paused': return <PauseIcon className="w-4 h-4 text-yellow-600" />;
      default: return <ClockIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'completed': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'paused': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTemplate = (workflowType: string): WorkflowTemplate | null => {
    switch (workflowType) {
      case 'recruitment':
        return HRMS_WORKFLOW_TEMPLATES.RECRUITMENT;
      case 'onboarding':
        return HRMS_WORKFLOW_TEMPLATES.ONBOARDING;
      case 'business_travel':
        return HRMS_WORKFLOW_TEMPLATES.BUSINESS_TRAVEL;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!isLoading && (error || !workflow)) {
    return (
      <Loader2 />
    );
  }

  const template = getTemplate(workFlowData?.data.workflowType);
  console.log('Workflow data:', workflow);
  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/hrms/workflows">
          <Button variant="outline" size="sm">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Workflows
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <WorkflowIcon className="h-8 w-8" />
            {workFlowData?.data.workflowName}
          </h1>
          <p className="text-muted-foreground">
            Track progress and manage workflow steps
          </p>
        </div>
        <Badge className={`flex items-center gap-1 ${getStatusColor(workFlowData?.data.status)}`}>
          {getStatusIcon(workFlowData?.data.status)}
          {workFlowData?.data.status.toUpperCase()}
        </Badge>
      </div>

      {/* Workflow Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Workflow Progress</CardTitle>
            <CardDescription>Current status and next steps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-gray-600">
                  {workFlowData?.data.progress.completedSteps} of {workFlowData?.data.progress.totalSteps} steps completed
                </span>
              </div>
              <Progress value={workflow.progress.progressPercentage} className="h-3" />
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Current: {workflow.progress.currentStepName}</span>
                <span>{workflow.progress.progressPercentage}% Complete</span>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Started {new Date(workflow.metadata.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {workflow.progress.daysSinceStart} days ago
                </span>
              </div>
              {!workflow.progress.isOnTrack && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircleIcon className="w-3 h-3" />
                  Behind Schedule
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Workflow Information */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">
                    {workflow.metadata.candidateName || workflow.metadata.employeeName}
                  </p>
                  <p className="text-xs text-gray-600">Person</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <BriefcaseIcon className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">{workflow.metadata.position}</p>
                  <p className="text-xs text-gray-600">Position</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">{workflow.metadata.department}</p>
                  <p className="text-xs text-gray-600">Department</p>
                </div>
              </div>

              {workflow.metadata.expectedEndDate && (
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(workflow.metadata.expectedEndDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-600">Expected Completion</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Steps</CardTitle>
          <CardDescription>Detailed view of all workflow steps and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {template?.steps?.map((step: HRMSWorkflowStep, index: number) => {
              const isCompleted = isStepCompleted(step.formType);
              const isCurrent = workflow.currentStep === step.id;
              const formConfig = HRMS_FORM_CONFIG[step.formType];
              const stepData = workflow?.stepsData?.[step.id];
              const isLocked = step?.isLocked && !isCompleted && !isCurrent;
              console.log('Step data:', isCompleted, isLocked, step, step.formType);
              return (
                <div key={step.id} className={`p-4 border rounded-lg ${isCompleted
                  ? 'bg-green-50 border-green-200'
                  : isCurrent
                    ? 'bg-blue-50 border-blue-200'
                    : isLocked
                      ? 'bg-gray-100 border-gray-200 opacity-70'
                      : 'bg-white border-gray-200'
                  }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                          ? 'bg-blue-500 text-white'
                          : isLocked
                            ? 'bg-gray-300 text-gray-600'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                        {isCompleted ? (
                          <CheckCircleIcon className="w-6 h-6" />
                        ) : isLocked ? (
                          <Lock className="w-5 h-5" />
                        ) : (
                          <span className="font-bold">{index + 1}</span>
                        )}
                      </div>

                      <div>
                        <h3 className="font-medium">{step.stepName}</h3>
                        <p className="text-sm text-gray-600">{formConfig?.title}</p>
                        {step.isRequired && (
                          <Badge variant="outline" className="text-xs mt-1">Required</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {stepData && (
                        <Button variant="outline" size="sm">
                          <EyeIcon className="w-4 h-4 mr-1" />
                          View Data
                        </Button>
                      )}



                      {isCurrent &&
                        <Button
                          size="sm"
                          variant={isCurrent ? 'default' : 'outline'}
                          onClick={() => navigateToStep(step.id)}
                          disabled={isLocked}
                        >
                          <Link href={`/dashboard/hrms/forms/${step.formType}/new?id=${workflow._id}&workflow=true&stepIndex=${workflow?.progress.completedSteps}`}>

                            <Button size="sm">
                              <EditIcon className="w-4 h-4 mr-1" />
                              Continue
                            </Button>
                          </Link>
                        </Button>}


                      {isLocked && (
                        <Button variant="ghost" size="sm" disabled>
                          <Lock className="w-4 h-4 mr-1" />
                          Locked
                        </Button>
                      )}
                    </div>
                  </div>

                  {stepData && (
                    <div className="mt-3 p-3 bg-white rounded border">
                      <h4 className="text-sm font-medium mb-2">Form Data:</h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        {Object.entries(stepData).slice(0, 3).map(([key, value]) => (
                          <div key={key} className="flex">
                            <span className="font-medium w-24">{key}:</span>
                            <span>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Activity Log */}
      {workflow.stepLogs && workflow.stepLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>History of workflow actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workflow.stepLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{log.stepName}</h4>
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 capitalize">{log.action}</p>
                    {log.comments && (
                      <p className="text-xs text-gray-500 mt-1">{log.comments}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}