"use client"

import React, { useEffect, useState } from 'react'
import DashboardLoader from '../ui/DashboardLoader';
import { Input } from "@/components/ui/input";
import { Button } from '../ui/button';
import { Plus, Import, Download, Upload, ChevronsUpDown, Check } from 'lucide-react';
import { DataTable } from '../TableComponent/TableComponent';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import * as XLSX from "xlsx";

// Interface for individual Input and Select field configurations
interface FieldConfig {
    key: string;
    label: string;
    type: 'text' | 'email' | 'select';
    placeholder?: string;
    options?: string[];
}

// Interface for Button configuration
interface ButtonConfig {
    label: string;
    action: () => void;
    icon?: React.ElementType;
    className?: string;
    dropdownOptions?: {
        label: string;
        value: string;
        action: (value: string) => void;
    }[];
}

// Interface for Data Table configuration
interface DataTableConfig {
    columns: any[];
    data: any[];
}

// Main interface for the page configuration
interface PageConfig {
    searchFields?: FieldConfig[];
    filterFields?: FieldConfig[];
    dataTable: DataTableConfig;
    buttons?: ButtonConfig[];
}

interface InventoryComponentProps {
    config: PageConfig;
    loadingState: boolean;
}

const InventoryComponent: React.FC<InventoryComponentProps> = ({ config, loadingState }) => {
    const [searchValues, setSearchValues] = useState<Record<string, string>>({});
    const [filterValues, setFilterValues] = useState<Record<string, string | null>>({});
    const [filteredData, setFilteredData] = useState(config?.dataTable?.data);
    const [open, setOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

    useEffect(() => {
        setFilteredData(config?.dataTable?.data);
    }, [config, loadingState]);

    // Handle input field change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const newSearchValues = { ...searchValues, [field]: e.target.value };
        setSearchValues(newSearchValues);
    };

    // Handle filter field change
    const handleFilterChange = (value: string | null, field: string) => {
        const newFilterValues = { ...filterValues, [field]: value };
        setFilterValues(newFilterValues);
    };

    useEffect(() => {
        filterData(searchValues, filterValues);
    }, [searchValues, filterValues]);

    // Filter data based on search and filter criteria
    const filterData = (searchValues: any, filterValues: any) => {
        const filtered = config?.dataTable?.data?.filter((item) => {
            // Check if item matches search criteria
            const matchesSearch = Object.keys(searchValues).every((key) => {
                const searchQuery = searchValues[key]?.toLowerCase() || '';
                const value = item[key]?.toString().toLowerCase() || '';
                return value.includes(searchQuery);
            });

            // Check if item matches filter criteria
            const matchesFilter = Object.keys(filterValues).every((key) => {
                const filterValue = filterValues[key];
                if (filterValue === null) return true;
                return typeof item[key] === 'string' && item[key].toLowerCase() === filterValue?.toLowerCase();
            });

            return matchesSearch && matchesFilter;
        });

        setFilteredData(filtered);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Inventory Data", 10, 10);
        doc.save("inventory_data.pdf");
    };

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(config.dataTable.data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Inventory");
        XLSX.writeFile(wb, "inventory_data.xlsx");
    };

    return (
        <DashboardLoader loading={loadingState}>
            <div className='flex flex-col gap-1 w-full h-full px-4'>
                {/* Filter Section */}
                <div className='flex flex-row items-center justify-between'>
                    <div className="flex flex-row items-center gap-2">
                        {/* Search Fields */}
                        <div className='flex items-center gap-1'>
                            {config.searchFields?.map((field, index) => (
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

                        {/* Filter Fields */}
                        <div className='flex items-center gap-1'>
                            {config.filterFields?.map((field, index) => (
                                <div key={index}>
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={open}
                                                className="w-[200px] justify-between overflow-hidden text-ellipsis whitespace-nowrap"
                                            >
                                                {filterValues[field.label] || field.placeholder}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[200px] p-0">
                                            <Command>
                                                <CommandInput placeholder={`Search ${field.label.toLowerCase()}`} />
                                                <CommandList>
                                                    <CommandEmpty>No {field.key} found.</CommandEmpty>
                                                    <CommandGroup>
                                                        <CommandItem
                                                            key="all"
                                                            value="All"
                                                            onSelect={() => {
                                                                handleFilterChange(null, field.label);
                                                                setOpen(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    filterValues[field.label] === null ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            All
                                                        </CommandItem>
                                                        {field.options?.map((option, i) => (
                                                            <CommandItem
                                                                key={i}
                                                                value={option}
                                                                onSelect={(value) => {
                                                                    handleFilterChange(value, field.label);
                                                                    setOpen(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        filterValues[field.label] === option ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {option}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex gap-1'>
                        {config.buttons?.map((button, index) => (
                            <div key={index} className="relative">
                                <Button
                                    variant="default"
                                    onClick={() => {
                                        if (button.dropdownOptions) {
                                            setActiveDropdown(index === activeDropdown ? null : index);
                                        } else {
                                            button.action();
                                        }
                                    }}
                                    className={cn("w-28", button.className)}
                                >
                                    {button.icon && <button.icon className="mr-2 h-4 w-4" />}
                                    {button.label}
                                </Button>

                                {button.dropdownOptions && activeDropdown === index && (
                                    <div className="absolute right-0 mt-2 p-2 bg-white shadow-lg border rounded-md w-40 z-50">
                                        {button.dropdownOptions.map((option, optionIndex) => (
                                            <div
                                                key={optionIndex}
                                                className="rounded-md cursor-pointer px-4 p-2 hover:bg-gray-100"
                                                onClick={() => {
                                                    option.action(option.value);
                                                    setActiveDropdown(null);
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

                {/* Data Table */}
                <div className='h-[90%]'>
                    <DataTable 
                        data={filteredData?.length > 0 ? filteredData : filteredData ? [] : config?.dataTable?.data} 
                        columns={config?.dataTable?.columns || []} 
                    />
                </div>
            </div>
        </DashboardLoader>
    );
};

export default InventoryComponent;