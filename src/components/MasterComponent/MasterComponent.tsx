"use client"

import React from 'react'
import DashboardLoader from '../ui/DashboardLoader';
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from '../ui/button';
import { Plus, Import, Download, Upload } from 'lucide-react';
import { use } from 'chai';
import { DataTable } from '../TableComponent/TableComponent';
import { useState } from 'react';
import { SelectGroup, SelectItem, SelectLabel } from '@radix-ui/react-select';
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import { useEffect } from 'react';
import { ObjectId } from 'mongoose';


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

// Interface for Data Table configuration
interface DataTableConfig {
    columns: string[]; // Column names for the table
    userData: Record<string, string | number | object | Date | ObjectId>[]; // Array of rows where each row is an object with column data
}

// Main interface for the page configuration
interface PageConfig {
    searchFields?: FieldConfig[]; // Array of search field configurations
    filterFields?: FieldConfig[]; // Array of filter field configurations
    dataTable: DataTableConfig; // Data table configuration
    buttons?: ButtonConfig[]; // Array of button configurations
}

interface MasterComponentProps {
    config: PageConfig;
    loadingState: boolean;
}




const MasterComponent: React.FC<MasterComponentProps> = ({ config, loadingState }) => {

    const [searchValues, setSearchValues] = useState<Record<string, string>>({});
    const [filterValues, setFilterValues] = useState<Record<string, string | null>>({});
    const [filteredData, setFilteredData] = useState(config.dataTable.userData);

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
        const filtered = config.dataTable.userData.filter((item) => {
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
               
                
                return item[key] === filterValue;
            });

            return matchesSearch && matchesFilter;
        });

        setFilteredData(filtered); // Update filtered data state
    };


    return (
        <>
            <DashboardLoader loading={loadingState}>
                <div className='flex flex-col gap-1 w-full h-full px-4'>

                    {/* Filter Section */}
                    <div className='flex flex-row items-center justify-between'>
                        <div className="flex flex-row items-center gap-2">
                            {/* Render search fields */}
                            <div className='flex items-center gap-1'>{config.searchFields?.map((field, index) => (
                                <div key={index}>

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
                                {config.filterFields?.map((field, index) => (
                                    <div key={index}>

                                        {/* Using ShadCN Select component */}
                                        <Select
                                            value={filterValues[field.label] || null} // Set default value to null or a valid value
                                            onValueChange={(value) => handleFilterChange(value, field.label)} // Directly pass value
                                        >
                                            <SelectTrigger className={`bg-white w-[180px] ${!filterValues[field.label] ? 'opacity-60' : 'opacity-100'}`}>
                                                {filterValues[field.label] || 'Select ' + field.label}
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={null}>All</SelectItem> {/* 'All' option with null value */}
                                                {field?.options?.map((option, i) => (
                                                    <SelectItem key={i} value={option}>
                                                        {option}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ))}
                            </div>
                        </div>


                        {/* Button Section */}
                        <div className='flex justify-end gap-1'>

                            {config.buttons?.map((button, index) => (
                                <Button effect="expandIcon" icon={button.icon} iconPlacement="right" key={index} onClick={button.action} className={`w-28 font-semibold tracking-wide ${button.className}`}>
                                    {button.label}
                                </Button>
                            ))}


                        </div>
                    </div>

                    <div className='h-[90%]' >
                        <DataTable data={filteredData.length > 0 ? filteredData : config.dataTable.userData} columns={config.dataTable.columns || []} />
                    </div>
                </div>

            </DashboardLoader>
        </>

    )
}

export default MasterComponent