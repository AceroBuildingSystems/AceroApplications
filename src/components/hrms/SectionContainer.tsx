import React from 'react';
import { SectionConfig } from './FormContainer';
import HRMSFormField from './HRMSFormField';
import { cn } from '@/lib/utils';
interface SectionContainerProps {
    section: SectionConfig;
}

const SectionContainer: React.FC<SectionContainerProps> = ({ section }) => {
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
                {section.fields.map((field) => (
                    <div
                        key={field.name}
                        className={cn(
                            field.type === 'textarea' && "md:col-span-2"
                        )}
                    >
                        <HRMSFormField field={field} disabled={false} data={[]} />
                    </div>
                ))}
            </div>

        </div>
    );
};

export default SectionContainer;
