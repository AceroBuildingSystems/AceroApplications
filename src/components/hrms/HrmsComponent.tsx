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
import { deepCloneWithOptionsInjection, getFormConfig, injectOptionsIntoFormConfig } from "@/configs/hrms-forms";

interface HrmsDialogProps {
    isOpen: boolean;
    closeDialog: () => void;
    formConfig: any;
    workflowType?: string; // Optional, default to 'recruitment'
    initialFormConfig?: any; // Optional, for default form config
    departments?: Option[]; // Optional, for department options
    users?: Option[]; // Optional, for user options
    designations?: Option[]; // Optional, for designation options
    employeeTypes?: Option[]; // Optional, for employee type options
    action?: string; // Optional, for action type (Add/Update)
    locationData?: Option[]; // Optional, for location options
    recruitymentTypes: any; // Optional, for recruitment types
}

const HrmsDialog: React.FC<HrmsDialogProps> = ({
    isOpen,
    closeDialog,
    workflowType,
    initialFormConfig, // Default to 'recruitment' if not provided
    departments,
    users,
    designations,
    employeeTypes,
    action,
    locationData,
    recruitymentTypes

}) => {
    const { user }: any = useUserAuthorised();
    const [employeeType, setEmployeeType] = useState<any>(null);
    const [isEmployeeTypeSelected, setIsEmployeeTypeSelected] = useState(false);
    const [isStaff, setIsStaff] = useState(false);

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
        if (!employeeType) return;

        // Find selected employee
        const employeeTypeName: any = employeeTypes?.find(emp => emp._id === employeeType)?.name;


        if (employeeTypeName?.toLowerCase() === 'staff') {
            setIsStaff(true);
        } else {
            setIsStaff(false);
        }

    }, [employeeType, employeeTypes]);

    useEffect(() => {
        if (!initialFormConfig || !initialFormConfig.steps) return;

        const step = initialFormConfig.steps[currentStepIndex];

        const loadStepConfig = async () => {
            const baseConfig = getFormConfig(step.formType);
            if (!baseConfig) return;

            const optionsMap = {
                department: departments,
                requestedBy: users,
                requiredPosition: designations,
                workingLocation: locationData,
                recruitmentType: recruitymentTypes,
                prevEmployee: users,
            };

            const updatedConfig = deepCloneWithOptionsInjection(baseConfig, optionsMap);
            setFormConfig(updatedConfig);
        };

        loadStepConfig();
    }, [currentStepIndex, initialFormConfig, users, departments, designations, employeeTypes, recruitymentTypes, locationData]);


    // if (!formConfig) return null;
    console.log('formconfig', formConfig);

    console.log('employeeTypes', employeeType);

    const handleSave = async (data: any) => {
        console.log('Form Data:', data);
        const formattedData = {
            db: MONGO_MODELS.CUSTOMER_MASTER,
            action: action === 'Add' ? 'create' : 'update',
            filter: { "_id": data?._id },
            data: { ...data, employeeType: employeeType },
        };
        console.log('Formatted Data:', formattedData);
        return;
        const response = await createMaster(formattedData);



    };

    return (
        <>

            <Dialog open={isOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        // Reset everything when dialog closes
                        closeDialog();

                        setIsStaff(false);

                    }
                }}>
                <DialogContent
                    className="bg-white max-w-full pointer-events-auto mx-2 max-h-[95vh] w-[75%] h-[95%]"
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <DialogTitle className="pl-1 hidden">Test</DialogTitle>


                    <div className="h-full flex flex-col min-h-0 pt-4">

                        {!isStaff && (
                            <div className="w-[200px] mb-4">
                                <Label className="mb-1 block">Select Employee Type</Label>
                                <Combobox
                                    field={{
                                        name: 'employeeType',
                                        label: 'Employee Type',
                                        data: employeeTypes, // this should come from props or fetched API (with _id and name)
                                        key: 'employeeType',
                                    }}
                                    formData={formData}
                                    handleChange={(value: any) => {
                                        setEmployeeType(value); // value = _id of selected employee type
                                        setIsEmployeeTypeSelected(true);
                                        setFormData((prev) => ({
                                            ...prev,
                                            employeeType: value,
                                        }));

                                        // Optionally: update form config if needed
                                    }}
                                    placeholder="Choose employee type"
                                />
                            </div>
                        )}

                        {isStaff && !loading && formConfig && (
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
                                <div className="pt-[220px] flex-1 overflow-y-auto flex justify-center ">
                                    <div className="w-full max-w-5xl p-4 pr-2">
                                        <FormContainer formConfig={formConfig} onSubmit={handleSave} />
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
