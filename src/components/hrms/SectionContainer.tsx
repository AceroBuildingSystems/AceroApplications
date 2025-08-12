import React from 'react';
import { SectionConfig } from './FormContainer';
import HRMSFormField from './HRMSFormField';
import { cn } from '@/lib/utils';

import { useFormContext } from 'react-hook-form';

interface SectionContainerProps {
    section: SectionConfig;
    data?: any; // Optional data for the section, can be used for default values or other purposes
}

const SectionContainer: React.FC<SectionContainerProps> = ({ section, data = {} }) => {
    console.log('Section Config:', section);
    const { watch } = useFormContext();

    return (
        <div className="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-200 mb-4">
            <div className="flex items-center justify-between gap-4 pb-3 ">
                <h3 className="text-xl font-semibold m-0 flex-shrink-0">
                    {section.title}
                </h3>

                {/* {section.description && (
                    <p className="text-gray-500 m-0 flex-grow">
                        {section.description}
                    </p>
                )} */}
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.fields.map((field) => {
                    const watchedValues = watch();
                    const shouldShow = !field.showIf || field.showIf(watchedValues);
                    if (!shouldShow) return null;

                    return (
                        <div key={field.name}>
                            <HRMSFormField field={field} disabled={false} data={data} />
                        </div>
                    );
                })}
            </div>

        </div>
    );
};

export default SectionContainer;
