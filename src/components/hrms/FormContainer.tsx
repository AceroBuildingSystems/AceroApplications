'use client';

import React, { useEffect, useMemo } from 'react';
import SectionContainer from './SectionContainer';
import { useForm, FormProvider } from 'react-hook-form';
import { Button } from '../ui/button';

export interface FieldConfig {
    id: string;
    label: string;
    name: string;
    type?: string;
    placeholder?: string;
}

export interface SectionConfig {
    id: string;
    title: string;
    description: string;
    fields: FieldConfig[];
    collapsible?: boolean;
    defaultExpanded?: boolean;
}

export interface FormConfig {
    formType: string;
    title: string;
    description: string;
    submitLabel: string;
    saveDraftLabel?: string;
    sections: SectionConfig[];
}

interface FormContainerProps {
    formConfig: FormConfig;
    onSubmit: (data: any) => void; // Adjust type as needed
    initialData?: any; // Optional initial data for the form
    action: any; // Action to be performed, e.g., 'create', 'update', etc.
    users: any
}


const FormContainer: React.FC<FormContainerProps> = ({ formConfig, onSubmit, initialData = {}, action, users }) => {
    const { title, description, sections, submitLabel, saveDraftLabel } = formConfig;
    const [actionType, setActionType] = React.useState<'update' | 'delete' | 'submit' | null>(null);
    // console.log('Form Config:', formConfig);
    console.log('initia data:', initialData, formConfig);
    // console.log('users:', users);

    // console.log('action:', action);

    const cleanedData = useMemo(() => {
        const fieldsToExtractId = [
            "requestedDepartment",
            "requestedBy",
            "requiredPosition",
            "employeeType",
            "workLocation",
            "prevEmployee",
            "nationality",
            "checkedBy",
        ];

        const clone = { ...initialData };
        
        for (const field of fieldsToExtractId) {
            if (clone[field] && typeof clone[field] === "object" && "_id" in clone[field]) {
                clone[field] = clone[field]._id;
            }
        }
        return clone;
    }, [initialData]);

    // console.log('Cleaned Data:', cleanedData);
    const methods = useForm({
        mode: 'onBlur', // or 'onChange' / 'onSubmit'
        defaultValues: cleanedData,
    });

    const {
        handleSubmit,
        // reset, watch, setValue, etc. can also be used here
    } = methods;

    useEffect(() => {
        if (cleanedData) {
            methods.reset(cleanedData);
        }
    }, [cleanedData, methods]);

    const handleFormSubmit = (data: any) => {
        console.log('Form Submitted Data:', data, formConfig);
        if (actionType === 'delete') {
            // mark inactive and call onSubmit
            onSubmit({ ...data, isActive: false });
        } else {
            // normal submit (add or update)
            onSubmit(data);
        }
        setActionType(null); // reset action // pass to parent or handle it here
    };
    return (
        <FormProvider {...methods}>
            <form
                onSubmit={methods.handleSubmit(handleFormSubmit)}
                className="space-y-6"
            >
                {sections.map((section) => (
                    <SectionContainer key={section.id} section={section} data={cleanedData} userlist={users} />
                ))}

                <div className="flex gap-2 justify-end pb-2">
                    <Button
                        type="submit"
                        className={`${(action !== 'Add') && 'hidden'}`}
                        onClick={() => setActionType('submit')}
                    >
                        {submitLabel}
                    </Button>

                    <Button
                        type="submit"
                        className={`${(action === 'Add') ? 'hidden' : 'bg-blue-700 hover:bg-blue-600 duration-300 px-3'}`}
                        onClick={() => setActionType('update')}
                    >
                        Update
                    </Button>

                    {/* <Button
                        type="submit"
                        className={`${(action === 'Add' || formConfig.formType === 'interview_assesment') ? 'hidden' : 'px-3'}`}
                        onClick={() => setActionType('delete')}
                    >
                        Delete
                    </Button> */}
                </div>
            </form>
        </FormProvider>
    );
};

export default FormContainer;
