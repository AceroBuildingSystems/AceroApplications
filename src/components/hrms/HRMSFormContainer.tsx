'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  SaveIcon, 
  SendIcon, 
  FileTextIcon, 
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  DownloadIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { HRMSFormConfig, HRMSFormDocument } from '@/types/hrms';
import PDFGenerator from './PDFGenerator';

interface HRMSFormContainerProps {
  formConfig: HRMSFormConfig;
  initialData?: Partial<HRMSFormDocument>;
  mode: 'create' | 'edit' | 'view';
  disabledFields?: string[];
  onSaveDraft?: (data: any) => Promise<any>;
  onSubmit?: (data: any) => Promise<any>;
  onUpdate?: (data: any) => Promise<any>;
  isLoading?: boolean;
  children: React.ReactNode;
  showFormInfo?: boolean;
  formType?: string;
  formId?: string;
}

export default function HRMSFormContainer({
  formConfig,
  initialData,
  mode,
  disabledFields = [],
  onSaveDraft,
  onSubmit,
  onUpdate,
  isLoading = false,
  children,
  showFormInfo = true,
  formType,
  formId
}: HRMSFormContainerProps) {
  const [isDraft, setIsDraft] = useState(initialData?.isDraft ?? true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm({
    defaultValues: useMemo(() => {
      const defaults = { ...initialData };
      // Ensure all fields have default values to prevent controlled/uncontrolled issues
      if (defaults) {
        Object.keys(defaults).forEach(key => {
          if (defaults[key] === undefined || defaults[key] === null) {
            defaults[key] = '';
          }
        });
      }
      return defaults || {};
    }, [initialData]),
    mode: 'onChange'
  });

  const { handleSubmit, formState: { errors, isDirty }, watch, reset } = methods;

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  // Auto-save draft functionality with smart debouncing (only save when user stops typing)
  useEffect(() => {
    if (mode === 'create' || mode === 'edit') {
      let timeoutId: NodeJS.Timeout | null = null;
      
      const subscription = watch((value, { name, type }) => {
        if (type === 'change' && onSaveDraft && isDraft && isDirty) {
          console.log('⏰ AUTO-SAVE: Field changed, scheduling auto-save', { field: name });
          
          // Clear previous timeout
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          
          // Set new timeout for auto-save - longer delay to reduce frequency
          // timeoutId = setTimeout(() => {
          //   console.log('⏰ AUTO-SAVE: Executing auto-save after user stopped typing for 10 seconds');
          //   handleSaveDraft(value, false); // Pass false for isManualSubmit
          // }, 10000); // 10 seconds - only save when user stops typing for 10 seconds
          
          console.log('⏰ AUTO-SAVE: Debounce timeout set for 10 seconds');
        }
      });

      return () => {
        subscription.unsubscribe();
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }
  }, [watch, mode, onSaveDraft, isDraft, isDirty]);

  const handleSaveDraft = async (data?: any, isManualSubmit = false) => {
    if (!onSaveDraft) return;

    try {
      setIsSaving(true);
      console.log('💾 DRAFT SAVE: Starting draft save', { isManualSubmit });
      
      const formData = data || methods.getValues();
      await onSaveDraft(formData);
      setLastSaved(new Date());
      if (isManualSubmit) {
        toast.success('Draft saved successfully');
      }
      console.log('💾 DRAFT SAVE: Draft saved successfully');
    } catch (error: any) {
      console.error('💾 DRAFT SAVE: Failed', error);
      toast.error('Failed to save draft: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormSubmit = async (data: any, event?: React.BaseSyntheticEvent) => {
    console.log('📝 FORM CONTAINER: handleFormSubmit called', data)
    console.log('📝 FORM CONTAINER: handleFormSubmit called', { 
      mode, 
      hasHandlers: { onSubmit: !!onSubmit, onUpdate: !!onUpdate },
      eventType: event?.type,
      submitterName: event?.nativeEvent?.submitter?.name,
      submitterType: event?.nativeEvent?.submitter?.type
    });
    
    if (!onSubmit && !onUpdate) return;

    // This is a manual submission, so we can proceed
    if (event?.nativeEvent?.submitter?.name === 'submit-button') {
      try {
        setIsSubmitting(true);
        
        if (mode === 'create' || mode === 'edit') {
          const handler = mode === 'create' ? onSubmit : onUpdate;
          if (handler) {
            console.log('📝 FORM CONTAINER: Calling handler function', data);
            await handler(data);
            setIsDraft(false);
            toast.success(`Form ${mode === 'create' ? 'submitted' : 'updated'} successfully`);
          }
        }
      } catch (error: any) {
        console.error('📝 FORM CONTAINER: Handler failed', error);
        toast.error(`Failed to ${mode === 'create' ? 'submit' : 'update'} form: ` + error.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getStatusBadge = () => {
    if (mode === 'view') {
      const status = initialData?.status;
      const statusConfig = {
        draft: { label: 'Draft', variant: 'secondary' as const },
        submitted: { label: 'Submitted', variant: 'default' as const },
        pending: { label: 'Pending Approval', variant: 'default' as const },
        approved: { label: 'Approved', variant: 'default' as const },
        rejected: { label: 'Rejected', variant: 'destructive' as const },
        withdrawn: { label: 'Withdrawn', variant: 'secondary' as const }
      };

      const config = statusConfig[status as keyof typeof statusConfig] || 
                    { label: status || 'Unknown', variant: 'secondary' as const };

      return <Badge variant={config.variant}>{config.label}</Badge>;
    }

    return isDraft ? (
      <Badge variant="secondary">
        <FileTextIcon className="h-3 w-3 mr-1" />
        Draft
      </Badge>
    ) : (
      <Badge variant="default">
        <CheckCircleIcon className="h-3 w-3 mr-1" />
        Submitted
      </Badge>
    );
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <FormProvider {...methods}>
      <div className="space-y-6">
        {/* Form Header */}
        {showFormInfo && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {formConfig.title}
                    {getStatusBadge()}
                  </CardTitle>
                  <CardDescription>
                    {formConfig.description}
                  </CardDescription>
                  {initialData?.formId && (
                    <p className="text-sm text-muted-foreground">
                      Form ID: {initialData.formId}
                    </p>
                  )}
                </div>
                
                <div className="text-right text-sm text-muted-foreground">
                  {mode === 'view' && initialData?.createdAt && (
                    <p>Created: {new Date(initialData.createdAt).toLocaleDateString()}</p>
                  )}
                  {lastSaved && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircleIcon className="h-3 w-3" />
                      <span>Saved {lastSaved.toLocaleTimeString()}</span>
                    </div>
                  )}
                  {isSaving && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <ClockIcon className="h-3 w-3 animate-spin" />
                      <span>Saving...</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Error Alert */}
        {hasErrors && (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>
              Please correct the following errors before submitting:
              <ul className="mt-2 list-disc list-inside space-y-1">
                {Object.entries(errors).map(([field, error]: [string, any]) => (
                  <li key={field} className="text-sm">
                    {field}: {error.message}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {children}

          {/* Form Actions */}
          {mode !== 'view' && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {isDirty ? 'You have unsaved changes' : 'All changes saved'}
                    {onSaveDraft && (
                      <span className="ml-2 text-xs text-gray-500">
                        (Auto-save: 10s after typing stops)
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {onSaveDraft && (
                      <Button
                        type="button"
                        name="save-draft-button"
                        variant="outline"
                        onClick={() => {
                          console.log('💾 MANUAL SAVE: Save Draft button clicked');
                          handleSaveDraft(methods.getValues(), true);
                        }}
                        disabled={isSaving || isLoading}
                      >
                        <SaveIcon className="h-4 w-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save Draft'}
                      </Button>
                    )}
                    
                    <Button
                        type="submit"
                        name="submit-button"
                        disabled={isSubmitting || isSaving}
                        className="w-full"
                      >
                      <SendIcon className="h-4 w-4 mr-2" />
                      {isSubmitting 
                        ? 'Submitting...' 
                        : mode === 'create' 
                          ? 'Submit Form' 
                          : 'Update Form'
                      }
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </form>

        {/* Form Information Footer */}
        {showFormInfo && mode === 'view' && initialData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Form Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Created By:</span>
                  <p className="text-muted-foreground">{initialData.addedBy}</p>
                </div>
                <div>
                  <span className="font-medium">Created Date:</span>
                  <p className="text-muted-foreground">
                    {initialData.createdAt ? new Date(initialData.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>
                  <p className="text-muted-foreground">
                    {initialData.updatedAt ? new Date(initialData.updatedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Updated By:</span>
                  <p className="text-muted-foreground">{initialData.updatedBy}</p>
                </div>
              </div>
              
              {/* PDF Generation Section for submitted forms */}
              {formType && formId && initialData?.status && initialData.status !== 'draft' && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">Export & Documents</h4>
                      <p className="text-xs text-muted-foreground">Generate PDF documents for this form</p>
                    </div>
                    <PDFGenerator
                      formType={formType}
                      formId={formId}
                      formData={initialData}
                      triggerButton={
                        <Button variant="outline" size="sm" className="gap-2">
                          <DownloadIcon className="h-4 w-4" />
                          Generate PDF
                        </Button>
                      }
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </FormProvider>
  );
}