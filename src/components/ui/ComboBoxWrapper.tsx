"use client"

import * as React from "react"
import { useState } from 'react'
import { Check, ChevronsUpDown, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"



export function Combobox({ field, formData, handleChange, placeholder, selectedRegion, setSelectedRegion, selectedArea, setSelectedArea, setSelectedYear, setSelectedMonth }: any) {
    const [open, setOpen] = useState(false)
    const [selectedValue, setSelectedValue] = useState<string | null>(null);

    // Ensure field.data is always an array and has the correct structure
    const options = Array.isArray(field?.data) ? field.data.map((item: any) => ({
        _id: item._id || item.id,
        name: item.name || item.displayName || item.label,
        displayName: item.displayName || item.name || item.label
    })) : [];

    // Find the selected option
    const selectedOption = options.find((option: any) => option._id === formData?.[field?.name]);

    return (
        <Popover modal={true} open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={`w-full bg-white px-2 py-2 flex items-center justify-between text-left ${
                        selectedOption?.name || selectedValue ? "text-black" : "text-gray-400"
                    }`}
                >
                    <span className="text-sm truncate whitespace-nowrap overflow-hidden max-w-[calc(100%-1.5rem)]">
                        {selectedOption?.name || selectedValue || placeholder || "Select an option"}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50 ml-1" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 pointer-events-auto">
                <Command className="bg-white">
                    <CommandInput className="pointer-events-auto" placeholder={`Search ${field?.label || 'options'}`} />
                    <CommandList className="overflow-y-scroll">
                        <CommandEmpty>No {field?.label?.toLowerCase() || 'options'} found.</CommandEmpty>
                        <CommandGroup>
                            {/* Add "All" option */}
                            <CommandItem
                                key="all"
                                value=""
                                onSelect={() => {
                                    setSelectedValue(null);
                                    handleChange(null);
                                    if (field?.key === "year") {
                                        setSelectedYear?.(0);
                                    }
                                    if (field?.key === "month") {
                                        setSelectedMonth?.(0);
                                    }
                                    setOpen(false);
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        (!formData?.[field?.name] && !selectedValue) ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                All
                            </CommandItem>

                            {options.map((option: any) => (
                                <CommandItem
                                    className="cursor-pointer"
                                    key={option._id}
                                    value={option.name}
                                    onSelect={(value) => {
                                        setSelectedValue(value);
                                        handleChange(option._id);
                                        if (field?.key === "region") {
                                            setSelectedRegion?.(option._id);
                                        }
                                        if (field?.key === "area") {
                                            setSelectedArea?.(option._id);
                                        }
                                        if (field?.key === "year") {
                                            setSelectedYear?.(option._id);
                                        }
                                        if (field?.key === "month") {
                                            setSelectedMonth?.(option._id);
                                        }
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            (formData?.[field?.name] === option._id || selectedValue === option.name) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
