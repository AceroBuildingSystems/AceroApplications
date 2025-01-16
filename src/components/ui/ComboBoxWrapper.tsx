"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

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



export function Combobox({ field, formData, handleChange }: any) {
    const [open, setOpen] = React.useState(false)
    // console.log(field, formData);
    return (
        <Popover modal={true} open={open} onOpenChange={setOpen} >
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className=" justify-between"
                >
                    {field && field?.data?.find((data) => data._id === formData[field.name])?.name ||
                        field && field?.data?.find((data) => data._id === formData[field.name])?.shortName ||
                        `Select ${field?.label}`}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0 pointer-events-auto">
                <Command>
                    <CommandInput  className="pointer-events-auto" placeholder={`Search ${field?.label}`} />

                    <CommandList className="overflow-y-scroll">
                        <CommandEmpty>No {field?.label?.toLowerCase()} found.</CommandEmpty>
                        <CommandGroup>
                            {/* Add "All" option */}
                            <CommandItem
                                key="all"
                                value=""
                                onSelect={() => {
                                    handleChange(null, field.name, field?.format, field?.type); // Set the value to null for "All"
                                    setOpen(false);
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        formData[field.name] === null ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                All
                            </CommandItem>

                            {field?.data?.map((data) => (
                                <CommandItem
                                    className="cursor-pointer"
                                    key={data._id}
                                    value={data.name}
                                    onSelect={(value) => {
                                        handleChange(data._id, field.name, field?.format, field?.type);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            formData[field.name] === data._id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {data.name || data.shortName}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
