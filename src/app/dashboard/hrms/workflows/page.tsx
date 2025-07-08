'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowRightIcon,
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
  Loader2Icon,
  FileEditIcon
} from 'lucide-react';
import Link from 'next/link';
import { HRMS_FORM_CONFIG } from '@/types/hrms';
import { HRMS_WORKFLOW_TEMPLATES } from '@/types/workflow';
import { useGetWorkflowInstancesQuery } from '@/services/endpoints/hrmsApi';

export default function HRMSWorkflowsPage() {
  const [activeTab, setActiveTab] = useState('draft');

  const queryParams = useMemo(() => {
    return { status: activeTab };
  }, [activeTab]);

  const { 
    data: workflowData, 
    isLoading, 
    error,
    refetch
  } = useGetWorkflowInstancesQuery(queryParams);

  // Refetch data whenever the active tab changes
  React.useEffect(() => {
    refetch();
  }, [activeTab, refetch]);

  const workflowInstances = workflowData?.data?.instances || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <PlayIcon className="w-4 h-4 text-green-600" />;
      case 'completed': return <CheckCircleIcon className="w-4 h-4 text-blue-600" />;
      case 'paused': return <PauseIcon className="w-4 h-4 text-yellow-600" />;
      case 'draft': return <FileEditIcon className="w-4 h-4 text-gray-600" />;
      default: return <ClockIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'completed': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'paused': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'draft': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const renderWorkflowSteps = (workflowType: string, currentStep: string, completedSteps: string[]) => {
    const template = HRMS_WORKFLOW_TEMPLATES[workflowType.toUpperCase()];

    if (!template) {
      return <div>Unknown workflow type: {workflowType}</div>;
    }

    return (
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {template.steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const formConfig = HRMS_FORM_CONFIG[step.formType];

          return (
            <div key={step.id} className="flex items-center">
              <div className={`min-w-[200px] p-3 rounded-lg border-2 ${
                isCompleted 
                  ? 'bg-green-50 border-green-200' 
                  : isCurrent 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isCurrent 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-300 text-gray-600'
                  }`}>
                    {isCompleted ? (
                      <CheckCircleIcon className="w-5 h-5" />
                    ) : (
                      <span className="text-xs font-bold">{index + 1}</span>
                    )}
                  </div>
                  <Badge variant={step.isRequired ? "default" : "secondary"} className="text-xs">
                    {step.isRequired ? "Required" : "Optional"}
                  </Badge>
                </div>
                <h4 className="font-medium text-sm">{step.stepName}</h4>
                <p className="text-xs text-gray-600">{formConfig?.title}</p>
                {isCurrent && (
                  <div className="mt-2">
                    <Link href={`/dashboard/hrms/forms/${step.formType}/new`}>
                      <Button size="sm" className="w-full">
                        <FileTextIcon className="w-3 h-3 mr-1" />
                        Continue
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
              {index < template.steps.length - 1 && (
                <ArrowRightIcon className="w-5 h-5 text-gray-400 mx-2" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderEmptyState = (tab: string) => {
    const emptyStates: { [key: string]: any } = {
      active: {
        icon: <WorkflowIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />,
        title: 'No Active Workflows',
        description: 'Start a new workflow to begin tracking HR processes.',
        action: (
          <Link href="/dashboard/hrms/workflows/new">
            <Button>Start New Workflow</Button>
          </Link>
        )
      },
      drafts: {
        icon: <FileEditIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />,
        title: 'No Draft Workflows',
        description: 'Draft workflows will appear here before they are officially started.',
      },
      completed: {
        icon: <CheckCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />,
        title: 'No Completed Workflows',
        description: 'Completed workflows will appear here once workflows are finished.'
      },
      paused: {
        icon: <PauseIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />,
        title: 'No Paused Workflows',
        description: 'Paused workflows will appear here when workflows are temporarily stopped.'
      }
    };

    const state = emptyStates[tab];
    return (
      <Card>
        <CardContent className="text-center py-8">
          {state.icon}
          <h3 className="text-lg font-medium text-gray-900 mb-2">{state.title}</h3>
          <p className="text-gray-600 mb-4">{state.description}</p>
          {state.action}
        </CardContent>
      </Card>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Card>
          <CardContent className="text-center py-8">
            <Loader2Icon className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading workflows...</p>
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>{error.message || 'Failed to load workflows.'}</AlertDescription>
        </Alert>
      );
    }

    if (workflowInstances.length === 0) {
      return renderEmptyState(activeTab);
    }
console.log(workflowInstances, 'Workflow Instances Data');
    return (
      <div className="space-y-6">
        {workflowInstances.map((instance: any) => (
          <Card key={instance._id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{instance.workflowName || instance.workflowType.replace('_', ' ')}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-4 h-4" />
                      {instance.metadata?.candidateName || instance.metadata?.employeeName || 'N/A'}
                    </span>
                    <span className="flex items-center gap-1">
                      <BriefcaseIcon className="w-4 h-4" />
                      {instance.metadata?.position || 'N/A'}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4" />
                      {instance.metadata?.department || 'N/A'}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  {instance.progress && !instance.progress.isOnTrack && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertCircleIcon className="w-3 h-3" />
                      Behind Schedule
                    </Badge>
                  )}
                  <Badge className={`flex items-center gap-1 ${getStatusColor(instance.status)}`}>
                    {getStatusIcon(instance.status)}
                    {instance.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              {instance.status !== 'draft' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-600">
                      {instance.completedSteps?.length || 0} of {instance.steps?.length || 0} steps
                    </span>
                  </div>
                  <Progress value={((instance.completedSteps?.length || 0) / (instance.steps?.length || 1)) * 100} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Current: {instance.steps?.[instance.currentStepIndex]?.stepName || 'N/A'}</span>
                    <span>{Math.round(((instance.completedSteps?.length || 0) / (instance.steps?.length || 1)) * 100)}% Complete</span>
                  </div>
                </div>
              )}

              {/* Workflow Steps Visualization */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Workflow Steps</h4>
                {renderWorkflowSteps(instance.workflowType, instance.steps?.[instance.currentStepIndex]?.id, instance.completedSteps || [])}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  {instance.status === 'draft' ? `Draft saved on ${new Date(instance.updatedAt).toLocaleDateString()}` : `Started ${new Date(instance.createdAt).toLocaleDateString()}`}
                </div>
                <div className="space-x-2">
                  <Link href={`/dashboard/hrms/workflows/${instance._id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/dashboard/hrms/workflows/${instance._id}`}>
                    <Button size="sm">
                      {instance.status === 'draft' ? 'Continue Draft' : 'Continue Workflow'}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <WorkflowIcon className="h-8 w-8" />
            HRMS Workflows
          </h1>
          <p className="text-muted-foreground">
            Track and manage HR process workflows from start to finish
          </p>
        </div>
        <div className="space-x-2">
          <Link href="/dashboard/hrms/workflows/new">
            <Button>
              <PlayIcon className="h-4 w-4 mr-2" />
              Start New Workflow
            </Button>
          </Link>
        </div>
      </div>

      {/* Workflow Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Available Workflow Templates</CardTitle>
          <CardDescription>
            Pre-configured workflows for common HR processes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(HRMS_WORKFLOW_TEMPLATES).map(([key, template]) => (
              <Card key={key} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{template.workflowName}</CardTitle>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Steps:</span>
                      <Badge variant="outline">{template.steps.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Type:</span>
                      <Badge variant="secondary" className="capitalize">
                        {template.workflowType.replace('_', ' ')}
                      </Badge>
                    </div>
                    <Link href={`/dashboard/hrms/workflows/new?template=${key.toLowerCase()}`}>
                      <Button size="sm" className="w-full mt-3">
                        Start Workflow
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workflows List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {/* <TabsTrigger value="active">Active Workflows</TabsTrigger> */}
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          {/* <TabsTrigger value="paused">Paused</TabsTrigger> */}
        </TabsList>

        {/* <TabsContent value="active">{renderContent()}</TabsContent> */}
        <TabsContent value="draft">{renderContent()}</TabsContent>
        <TabsContent value="completed">{renderContent()}</TabsContent>
        {/* <TabsContent value="paused">{renderContent()}</TabsContent> */}
      </Tabs>
    </div>
  );
}