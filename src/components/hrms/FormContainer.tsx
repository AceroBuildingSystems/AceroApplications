'use client';

import React from 'react';
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
}


const FormContainer: React.FC<FormContainerProps> = ({ formConfig, onSubmit, initialData = {}} ) => {
    const { title, description, sections, submitLabel, saveDraftLabel } = formConfig;
console.log('Form Config:', formConfig);
console.log('initia data:', initialData);

const fieldsToExtractId = [
    "department",
    "requestedBy",
    "requiredPosition",
    "employeeType",
    "workLocation",
    "prevEmployee",
  ];

  // Replace objects with their _id
  const cleanedData = { ...initialData };
  for (const field of fieldsToExtractId) {
    if (cleanedData[field] && typeof cleanedData[field] === "object" && "_id" in cleanedData[field]) {
      cleanedData[field] = cleanedData[field]._id;
    }
  }
    const methods = useForm({
        mode: 'onBlur', // or 'onChange' / 'onSubmit'
        defaultValues: cleanedData,
    });

    const {
        handleSubmit,
        // reset, watch, setValue, etc. can also be used here
    } = methods;

    const handleFormSubmit = (data: any) => {
        console.log('Form Data:', data);
        onSubmit(data); // pass to parent or handle it here
    };
    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                {sections.map((section) => (
                    <SectionContainer key={section.id} section={section} data={cleanedData} />
                ))}

                <div className="flex gap-4 justify-end pb-2">
                    <Button
                       
                    >
                        {submitLabel}
                    </Button>

                    {/* {saveDraftLabel && (
                        <Button
                            type="button"
                            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                            onClick={() => {
                                const draftData = methods.getValues();
                                console.log('Saving draft...', draftData);
                                // handle save draft logic
                            }}
                        >
                            {saveDraftLabel}
                        </Button>
                    )} */}
                </div>
            </form>
        </FormProvider>
    );
};

export default FormContainer;
