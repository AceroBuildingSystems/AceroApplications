"use client"

import React from 'react'
import DashboardLoader from '../ui/DashboardLoader';
import { Input } from "@/components/ui/inputSearch";
import { Button } from '../ui/button';
import { ChevronsUpDown, Check, ListFilter } from 'lucide-react';

import { DataTable } from '../TableComponent/TableComponent';
import { useState } from 'react';
import { useEffect } from 'react';
import { ObjectId } from 'mongoose';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import * as XLSX from "xlsx";
import { Combobox } from '../ui/ComboBoxWrapper';

// Interface for individual Input and Select field configurations
interface FieldConfig {
    key: string
    label: string; // The label for the field
    type: 'text' | 'email' | 'select'; // Type of the field (input or select)
    placeholder?: string; // Placeholder for input fields (optional)
    options?: string[]; // Options for select fields (optional)
}

// Interface for Button configuration
interface ButtonConfig {
    label: string; // The label for the button
    action: () => void; // Function to handle button click
    icon?: React.ElementType; // Icon for the button
    className?: string; // Optional CSS class for styling
}

interface MasterComponentProps {
    config: any;
    loadingState: boolean;
    rowClassMap: any;
    summary: boolean;
}




const MasterComponent: React.FC<MasterComponentProps> = ({ config, loadingState, rowClassMap, summary }) => {

    const [searchValues, setSearchValues] = useState<Record<string, string>>({});
    const [filterValues, setFilterValues] = useState<Record<string, string | null>>({});
    const [filteredData, setFilteredData] = useState(config?.dataTable?.data);

    useEffect(() => {
        setFilteredData(config?.dataTable?.data)
    }, [config, loadingState])

    // Handle input field change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const newSearchValues = { ...searchValues, [field]: e.target.value };

        setSearchValues(newSearchValues);
        // filterData(newSearchValues, filterValues); // Trigger filterData after search change
    };

    // Handle filter field change (select)
    const handleFilterChange = (value: string | null, field: string) => {

        const newFilterValues = { ...filterValues, [field]: value };

        setFilterValues(newFilterValues);
        // filterData(searchValues, newFilterValues); // Trigger filterData after filter change
    };

    useEffect(() => {

        filterData(searchValues, filterValues); // Trigger filtering after search/filter change
    }, [searchValues, filterValues]);

    // Filter data based on search and filter criteria
    const filterData = (searchValues: any, filterValues: any) => {

        const filtered = config?.dataTable?.data?.filter((item: { [x: string]: string; }) => {
            // Check if item matches search criteria
            const matchesSearch = Object.keys(searchValues).every((key) => {

                const searchQuery = searchValues[key]?.toLowerCase() || ''; // Get search query, default to empty string

                const value = item[key]?.toString().toLowerCase() || ''; // Convert the item value to string and make it lowercase

                return value.includes(searchQuery);
            });

            // Check if item matches filter criteria

            const matchesFilter = Object.keys(filterValues).every((key) => {

                const filterValue = filterValues[key];

                // If no filter value, pass the filter
                if (filterValue === null) return true;


                return typeof item[key] === 'string' && item[key].toLowerCase() === filterValue?.toLowerCase();
            });

            return matchesSearch && matchesFilter;
        });
        setFilteredData(filtered); // Update filtered data state
    };


    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Exported Data", 10, 10);
        // Add table or other content
        doc.save("table_data.pdf");
    };

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(config.dataTable.userData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data");
        XLSX.writeFile(wb, "table_data.xlsx");
    };

    const [open, setOpen] = React.useState(false)
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

    interface FieldObject {
        options: any;
        key: string;
        addNew: string;
        label: string;
        name: string;
        type: string;
        section: string;
        subSection?: string;
        data: { value: any; label: string }[];
        placeholder?: string;
        format: string;
        required?: boolean;
        readOnly?: boolean;
        CustomComponent?: React.FC<{ accessData: any }>;
    }

    return (
        <>
            <DashboardLoader loading={loadingState}>
                <div className='flex flex-col gap-2 w-full h-full px-4 py-1'>

                    {/* Filter Section */}
                    <div className='flex flex-row items-center justify-between'>
                        <div className="flex flex-row items-center gap-2 w-full">
                            {/* Render search fields */}
                            <div className='flex items-center gap-1'>{config.searchFields?.map((field: FieldObject, index: React.Key | null | undefined) => (
                                <div key={index} className='w-full'>

                                    <Input
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        value={searchValues[field.label] || ''}
                                        onChange={(e) => handleSearchChange(e, field.label)}
                                    />
                                </div>
                            ))}
                            </div>


                            <div className='flex items-center gap-1'>
                                {config.filterFields?.map((field: FieldObject, index: number) => {

                                    return (
                                        <div key={index} className='w-full'>
                                        <Combobox
                                            key={field.key || index}
                                            field={field}
                                            formData={[]}
                                            handleChange={handleFilterChange}
                                            placeholder={field.placeholder || ""}

                                        />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className='flex gap-1'>
                            {/* Button Section */}
                            {config.buttons?.map((button: ButtonConfig & { dropdownOptions?: { label: string; value: any; action: (value: any) => void; }[] }, index: number) => (
                                <div key={index} className="relative">
                                    {/* Button */}
                                    <Button
                                        effect="expandIcon"
                                        icon={button.icon}
                                        iconPlacement="right"
                                        onClick={() => {
                                            if (button.dropdownOptions) {
                                                // Toggle dropdown visibility for this button
                                                setActiveDropdown(index === activeDropdown ? null : index);
                                            } else {
                                                button.action(); // Call action directly if no dropdown
                                            }
                                        }}
                                        className={`w-28 ${button.className}`}
                                    >
                                        {button.label}
                                    </Button>

                                    {/* Dropdown (only if dropdownOptions are provided and active) */}
                                    {button.dropdownOptions && activeDropdown === index && (
                                        <div className="absolute right-0 mt-2 p-2 bg-white shadow-lg border rounded-md w-40 z-50">
                                            {button.dropdownOptions.map((option:any, optionIndex) => (
                                                <div
                                                    key={optionIndex}
                                                    className="rounded-md cursor-pointer px-4 p-2 hover:bg-gray-100"
                                                    onClick={() => {
                                                        console.log(option)
                                                        option.action(option.value, (filteredData !== undefined && filteredData?.length > 0) ? filteredData : filteredData?.length === 0 ? [] : config?.dataTable?.data); // Execute the action for this dropdown option
                                                        setActiveDropdown(null); // Close the dropdown after selection
                                                    }}
                                                >
                                                    {option.label}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                    </div>

                    <div className="h-[86%]">
                        {<DataTable data={filteredData && filteredData?.length > 0 ? filteredData : filteredData ? [] : config?.dataTable?.data} columns={config?.dataTable?.columns || []}
                            rowClassMap={rowClassMap} summary={summary} summaryTotal={undefined} title={''} />}
                    </div>
                </div>

            </DashboardLoader>
        </>

    )
}

export default MasterComponent