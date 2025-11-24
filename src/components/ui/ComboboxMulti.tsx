"use client"

import * as React from "react"
import { useState } from 'react'
import { Check, ChevronDown } from "lucide-react"

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

export function ComboboxMulti({
  field,
  value = [],
  handleChange,
  placeholder,
  disabled
}: any) {

  const [open, setOpen] = useState(false)

  const isMulti = field?.multiple === true
  const selectedValues = Array.isArray(value) ? value : []

  const toggleValue = (id: string) => {
    let updated = [...selectedValues]
    if (updated.includes(id)) {
      updated = updated.filter(v => v !== id)
    } else {
      updated.push(id)
    }
    handleChange(updated)
  }

  const selectedLabels = field?.data
    ?.filter((item: any) => selectedValues.includes(item._id))
    ?.map((item: any) => item.name || item.displayName)
    ?.join(", ")

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full bg-white px-2 py-2 flex items-center justify-between text-left",
            selectedValues.length > 0 ? "text-black" : "text-gray-400"
          )}
        >
          <span className="text-sm truncate">
            {selectedLabels || placeholder}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50 ml-1" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0">
        <Command className="bg-white">
          <CommandInput placeholder={`Search ${field.label}`} />

          <CommandList className="overflow-y-auto max-h-48">
            <CommandEmpty>No options found.</CommandEmpty>

            <CommandGroup>
              {field?.data?.map((item: any) => {
                const checked = selectedValues.includes(item._id)
                return (
                  <CommandItem
                    key={item._id}
                    className="cursor-pointer"
                    onSelect={() => toggleValue(item._id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        checked ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {item.name || item.displayName}
                  </CommandItem>
                )
              })}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
)
}
