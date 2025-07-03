"use client"
 
import * as React from "react"
import { format, getMonth, getYear, setMonth, setYear, setHours, setMinutes } from "date-fns"
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react"
 
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
 
interface DatePickerProps {
  currentDate?: any;
  startYear?: number;
  endYear?: number;
  handleChange?: (value: Date | undefined) => void;
  placeholder?: string;
  formData?: any; // Add formData prop
}
export function DatePicker({
  currentDate,
  startYear = getYear(new Date()) - 100,
  endYear = getYear(new Date()) + 100,
  handleChange,
  placeholder,
  formData
}: DatePickerProps) {
 
  console.log("DatePicker Rendered", { currentDate, handleChange: !!handleChange, formData });
  
  // Convert currentDate to Date object if it's a string, and handle updates
  const [date, setDate] = React.useState<Date | undefined>(() => {
    if (!currentDate) return undefined;
    if (currentDate instanceof Date) return currentDate;
    if (typeof currentDate === 'string') {
      const parsedDate = new Date(currentDate);
      return isNaN(parsedDate.getTime()) ? undefined : parsedDate;
    }
    return undefined;
  });
  
  const [isOpen, setIsOpen] = React.useState(false);

  // Update date when currentDate prop changes
  React.useEffect(() => {
    console.log("DatePicker useEffect triggered", { currentDate });
    if (!currentDate) {
      setDate(undefined);
      return;
    }
    
    let newDate: Date | undefined;
    if (currentDate instanceof Date) {
      newDate = currentDate;
    } else if (typeof currentDate === 'string') {
      const parsedDate = new Date(currentDate);
      newDate = isNaN(parsedDate.getTime()) ? undefined : parsedDate;
    }
    
    setDate(newDate);
  }, [currentDate]);
 
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );
  const handleMonthChange = (month: string) => {
    console.log("Month changed:", month);
    if (!date) {
      // If no date is set, create a new date with current year and selected month
      const currentYear = new Date().getFullYear();
      const newDate = new Date(currentYear, months.indexOf(month), 1);
      setDate(newDate);
      if (handleChange) {
        console.log("Calling handleChange with new date:", newDate);
        handleChange(newDate);
      }
      return;
    }
    const newDate = setMonth(date, months.indexOf(month));
    setDate(newDate);
    if (handleChange) {
      console.log("Calling handleChange with updated date:", newDate);
      handleChange(newDate);
    }
  }
 
  const handleYearChange = (year: string) => {
    console.log("Year changed:", year);
    if (!date) {
      // If no date is set, create a new date with selected year and current month
      const currentMonth = new Date().getMonth();
      const newDate = new Date(parseInt(year), currentMonth, 1);
      setDate(newDate);
      if (handleChange) {
        console.log("Calling handleChange with new date:", newDate);
        handleChange(newDate);
      }
      return;
    }
    const newDate = setYear(date, parseInt(year));
    setDate(newDate);
    if (handleChange) {
      console.log("Calling handleChange with updated date:", newDate);
      handleChange(newDate);
    }
  }
 
  const handleSelect = (selectedData: Date | undefined) => {
    console.log("Date selected:", selectedData);
    if (selectedData) {
      const now = new Date();
      const newDate = setHours(setMinutes(selectedData, now.getMinutes()), now.getHours()); // Set default time
      setDate(newDate);
      if (handleChange) {
        console.log("Calling handleChange with selected date:", newDate);
        handleChange(newDate);
      }
    }
  }
 
  return (
    <>
      <div className="relative w-full">
        <Button
          type="button"
          variant={"outline"}
          className={cn(
            "w-full justify-between text-left font-normal",
            !date && "text-muted-foreground"
          )}
          onClick={() => {
            console.log("DatePicker button clicked, toggling open state");
            setIsOpen(!isOpen);
          }}
        >
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>{placeholder || "Pick a date"}</span>}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
        
        {isOpen && (
          <>
            {/* Backdrop to close when clicking outside */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Date picker dropdown - positioned as overlay */}
            <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-4">
              <div className="flex space-x-2 mb-4">
                <Select
                  onValueChange={handleMonthChange}
                  value={date ? months[getMonth(date)] : ""}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(month => (
                      <SelectItem key={month} value={month}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  onValueChange={handleYearChange}
                  value={date ? getYear(date).toString() : ""}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(selectedDate) => {
                  handleSelect(selectedDate);
                  setIsOpen(false); // Close when date is selected
                }}
                initialFocus
                month={date}
                onMonthChange={setDate}
              />
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log("Clear button clicked");
                    setDate(undefined); 
                    if (handleChange) {
                      console.log("Calling handleChange with undefined");
                      handleChange(undefined);
                    }
                    setIsOpen(false);
                  }}
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}