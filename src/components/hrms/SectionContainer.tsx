import React from 'react';
import { SectionConfig } from './FormContainer';
import HRMSFormField from './HRMSFormField';
import { cn } from '@/lib/utils';

import { useFormContext } from 'react-hook-form';

interface SectionContainerProps {
    section: SectionConfig;
    data?: any; // Optional data for the section, can be used for default values or other purposes
    userlist: any
}

const SectionContainer: React.FC<SectionContainerProps> = ({ section, data = {}, userlist }) => {
    console.log('Section Config:', section, data, userlist);
    const { watch } = useFormContext();

    const departmentValue = watch("requestedDepartment"); // watch only the department field


    return (
        <div className="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-200 mb-4">
            <div className="flex flex-col justify-between gap-4 pb-3 ">
                <h3 className="text-lg font-semibold m-0 flex-shrink-0">
                    {section.title}
                </h3>

                {section.description && section.title === 'Declaration' && (
                    <p className="text-gray-500 m-0 flex-grow">
                        {section.description}
                    </p>
                )}
            </div>


            <div className={`grid gap-5 ${(section?.id === 'assessment_section' || section?.id === 'rounds_section' || section?.id === 'assets_hardware' || section?.id === 'assets_access' || section?.id === 'nda_Info_Details' || section?.id === 'offboarding_handover' || section?.id === 'evaluation_section') ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} ${section?.id === 'program_contents' ? 'md:grid-cols-4' : ''} `}>
                {section.fields.map((field) => {
                    const shouldShow = !field.showIf || field.showIf(watch());
                    if (!shouldShow) return null;

                    const isRequiredPosition = field.name === "requiredPosition";

                    // Filter positions based on selected department
                    const filteredPositions = isRequiredPosition
                        ? field.options?.filter(
                            (pos) =>
                                departmentValue &&
                                pos.requestedDepartment?._id === (typeof departmentValue === "object" ? departmentValue._id : departmentValue)
                        ) ?? []
                        : field.options;



                    return (
                        <div key={field.name}>
                            <HRMSFormField
                                field={{
                                    ...field,
                                    options: isRequiredPosition ? filteredPositions : field.options,
                                    placeholder: isRequiredPosition
                                        ? departmentValue
                                            ? field.placeholder
                                            : "Select department first"
                                        : field.placeholder,
                                }}
                                disabled={isRequiredPosition && !departmentValue}
                                data={data}
                                userlist={userlist}
                            />
                        </div>
                    );
                })}
            </div>

        </div>
    );
};

export default SectionContainer;
