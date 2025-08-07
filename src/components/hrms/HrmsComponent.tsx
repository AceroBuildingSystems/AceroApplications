'use client'

import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogFooter,
    DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import mongoose, { set } from "mongoose";
import { Combobox } from "../ui/ComboBoxWrapper";
import { DatePicker } from "../ui/date-picker";
import useUserAuthorised from "@/hooks/useUserAuthorised";
import { Save, Check, X } from 'lucide-react';

import {
    Trash2Icon, SendHorizontal
} from "lucide-react";
import MultipleSelector, { Option } from "../ui/multiple-selector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MONGO_MODELS, SUCCESS } from "@/shared/constants";
import { useCreateApplicationMutation, useLazyGetApplicationQuery } from "@/services/endpoints/applicationApi";
import { toast } from "react-toastify";
import { useSendEmailMutation } from "@/services/endpoints/emailApi";
import moment from "moment";
import WorkflowNavigation from "./NewWorkflowNavigation";
import FormContainer from "./FormContainer";
import { getFormConfig } from "@/configs/hrms-forms";

interface HrmsDialogProps {
    isOpen: boolean;
    closeDialog: () => void;
    formConfig: any;
    workflowType?: string; // Optional, default to 'recruitment'
    initialFormConfig?: any; // Optional, for default form config
}

const HrmsDialog: React.FC<HrmsDialogProps> = ({
    isOpen,
    closeDialog,
    workflowType,
    initialFormConfig, // Default to 'recruitment' if not provided

}) => {
    const { user }: any = useUserAuthorised();

    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [formConfig, setFormConfig] = useState(initialFormConfig);
    const [createMaster, { isLoading: isCreatingMaster }] = useCreateApplicationMutation();
    const [getApplication, { data: applicationData, isLoading, error }] = useLazyGetApplicationQuery();

    const [sendEmail, { isLoading: isSendEMail }]: any = useSendEmailMutation();

    const [formData, setFormData] = useState<Record<string, any>>({});
    const [currentStepIndexState, setCurrentStepIndexState] = useState(0);
    const loading = false;
    console.log('Form Config:', initialFormConfig);

    useEffect(() => {
        if (!initialFormConfig || !initialFormConfig.steps) return;

        // Assume each step has an id or formType to fetch detailed config
        const step = initialFormConfig.steps[currentStepIndex];

        if (step) {
            // Your method to get form config for this step's formType or id
            // For example, getFormConfig(step.formType) or step.formConfig if already embedded
            const configForStep = getFormConfig(step.formType); // replace with your actual fetch

            setFormConfig(configForStep);
        }
    }, [currentStepIndex, initialFormConfig]);

    if (!formConfig) return null;

    return (
        <>

            <Dialog open={isOpen} onOpenChange={closeDialog}>
                <DialogContent
                    className="bg-white max-w-full pointer-events-auto mx-2 max-h-[95vh] w-[75%] h-[95%]"
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <DialogTitle className="pl-1 hidden">Test</DialogTitle>

                    <div className="h-full flex flex-col min-h-0 pt-4">
                        {!loading && formConfig && (
                            <>
                                {/* Fixed WorkflowNavigation inside dialog */}
                                <div className="fixed top-8 left-0 right-0 z-40 flex justify-center bg-white">
                                    <div className="w-full max-w-5xl pt-3 px-3">
                                        <WorkflowNavigation
                                            formConfig={{
                                                workflowType: workflowType,
                                                steps: initialFormConfig.steps, // your steps array from workflow data
                                                currentStepIndex,
                                                onStepChange: setCurrentStepIndex,
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Scrollable Form container below header */}
                                <div className="pt-[235px] flex-1 overflow-y-auto flex justify-center ">
                                    <div className="w-full max-w-5xl p-4 pr-2">
                                        <FormContainer formConfig={formConfig} onSubmit={() => { }} />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>




        </>

    );
};

export default HrmsDialog;
