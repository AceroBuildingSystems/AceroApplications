'use client';

import React, { useEffect } from 'react';
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
}


const FormContainer: React.FC<FormContainerProps> = ({ formConfig, onSubmit, initialData = {}, action }) => {
    const { title, description, sections, submitLabel, saveDraftLabel } = formConfig;
    const [actionType, setActionType] = React.useState<'update' | 'delete' | 'submit' | null>(null);
    console.log('Form Config:', formConfig);
    console.log('initia data:', initialData);

    console.log('action:', action);

    const fieldsToExtractId = [
        "department",
        "requestedBy",
        "requiredPosition",
        "employeeType",
        "workLocation",
        "prevEmployee",
        "nationality",
        "checkedBy",
    ];

    // Replace objects with their _id
    const cleanedData = { ...initialData };
    for (const field of fieldsToExtractId) {
        if (cleanedData[field] && typeof cleanedData[field] === "object" && "_id" in cleanedData[field]) {
            cleanedData[field] = cleanedData[field]._id;
        }
    }

    console.log('Cleaned Data:', cleanedData);
    const methods = useForm({
        mode: 'onBlur', // or 'onChange' / 'onSubmit'
        defaultValues: cleanedData,
    });

    const {
        handleSubmit,
        // reset, watch, setValue, etc. can also be used here
    } = methods;

    useEffect(() => {
        methods.reset(cleanedData);
    }, [initialData]);

    const handleFormSubmit = (data: any) => {
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
                    <SectionContainer key={section.id} section={section} data={cleanedData} />
                ))}

                <div className="flex gap-2 justify-end pb-2">
                    <Button
                        type="submit"
                        className={`${action !== 'Add' && 'hidden'}`}
                        onClick={() => setActionType('submit')}
                    >
                        {submitLabel}
                    </Button>

                    <Button
                        type="submit"
                        className={`${(action === 'Add' ) ? 'hidden' : 'bg-blue-700 hover:bg-blue-600 duration-300 px-3'}`}
                        onClick={() => setActionType('update')}
                    >
                        Update
                    </Button>

                    <Button
                        type="submit"
                        className={`${(action === 'Add' || formConfig.formType === 'interview_assesment') ? 'hidden' : 'px-3'}`}
                        onClick={() => setActionType('delete')}
                    >
                        Delete
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
};

export default FormContainer;
