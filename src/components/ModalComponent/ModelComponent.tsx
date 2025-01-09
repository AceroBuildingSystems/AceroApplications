import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import mongoose from "mongoose";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectItem } from "@/components/ui/select";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { cn } from "@/lib/utils";
import { ComboboxDemo } from "../ui/ComboBoxWrapper";
import { DatePicker } from "../ui/date-picker";

const DynamicDialog = ({
  isOpen,
  closeDialog,
  selectedMaster,
  onSave,
  fields,
  initialData,
  action,
}) => {
  const [formData, setFormData] = useState({});
  const [date, setDate] = React.useState<Date>();
  // Dynamically generate fields based on selectedMaster

  useEffect(() => {
    const formattedData = Object.keys(initialData).reduce((acc, key) => {
      if (typeof initialData[key] === "object" && initialData[key]?._id) {
        // If the field is an object with an _id, store the _id
        acc[key] = initialData[key]._id;
      } else {
        acc[key] = initialData[key];
      }
      return acc;
    }, {});

    setFormData(formattedData);
  }, [initialData]);

  // Handle form data changes
  const handleChange = (e, fieldName, format, type) => {
    let value = "";
    if (type === "select") {
      value = e;
    } else {
      value = e.target.value;
    }

    setFormData((prev) => {
      let formattedValue = value;
      if (format === "ObjectId") {
        formattedValue = mongoose.Types.ObjectId.isValid(value) ? value : null; // Validate ObjectId format
      } else if (format === "Date") {
        formattedValue = value ? new Date(value) : null; // Convert to Date object
      }
      const updatedFormData = {
        ...prev,
        [fieldName]: formattedValue,
      };

      // Update `fullName` if `firstName` or `lastName` changes
      // Need to generalise later for other master components
      if (fieldName === "firstName" || fieldName === "lastName") {
        updatedFormData.fullName = `${updatedFormData.firstName || ""} ${
          updatedFormData.lastName || ""
        }`.trim();
      }

      return updatedFormData;
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Save the data to the database (e.g., via an API call)
      await onSave({ formData, action });
      closeDialog();
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent
        className="max-w-full max-h-[80%] pointer-events-auto sm:max-w-md lg:max-w-3xl mx-4  h-[75%]">
        <DialogTitle className="pl-1">{`${action} ${
          selectedMaster.charAt(0).toUpperCase() + selectedMaster.slice(1)
        }`}</DialogTitle>
        <div className="bg-white h-full overflow-y-auto p-2 rounded-md">
          <div className=" space-y-4   pr-2 pl-1 my-1 overflow-y-auto">
            {/* Use a responsive grid layout for form fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {" "}
              {/* 1 column on small screens, 2 on large */}
              {fields.map((field, index) => (
                <div key={index} className="flex flex-col gap-1 mb-2">
                  <Label>{field.label}</Label>
                  {field.type === "textarea" ? (
                    <textarea
                      rows={3}
                      onChange={(e) =>
                        handleChange(e, field.name, field?.format)
                      }
                      value={formData[field.name] || ""}
                    />
                  ) : field.type === "select" ? (
                    <ComboboxDemo
                      field={field}
                      formData={formData}
                      handleChange={handleChange}
                    />
                  ) : //    <Popover >
                  //   <PopoverTrigger asChild>
                  //     <Button
                  //       variant="outline"
                  //       role="combobox"
                  //       aria-expanded={open}
                  //       className="w-[200px] justify-between"
                  //     >
                  //       {field?.data?.find((data) => data._id === formData[field.name])?.name ||
                  //         field?.data?.find((data) => data._id === formData[field.name])?.shortName ||
                  //         `Select ${field?.label}`}
                  //       <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  //     </Button>
                  //   </PopoverTrigger>
                  //   <PopoverContent className="w-[200px] p-0 pointer-events-auto">
                  //     <Command>
                  //       <CommandInput placeholder={`Search ${field?.label}`} />

                  //       <CommandList>
                  //         <CommandEmpty>No {field?.label?.toLowerCase()} found.</CommandEmpty>
                  //         <CommandGroup>
                  //           {/* Add "All" option */}
                  //           <CommandItem
                  //             key="all"
                  //             value=""
                  //             onSelect={() => {
                  //               handleChange(null, field.name, field?.format, field?.type); // Set the value to null for "All"
                  //               setOpen(false);
                  //             }}
                  //           >
                  //             <Check
                  //               className={cn(
                  //                 "mr-2 h-4 w-4",
                  //                 formData[field.name] === null ? "opacity-100" : "opacity-0"
                  //               )}
                  //             />
                  //             All
                  //           </CommandItem>

                  //           {field?.data?.map((data) => (
                  //             <CommandItem
                  //               key={data._id}
                  //               value={data._id}
                  //               onSelect={(value) => {
                  //                 handleChange(value, field.name, field?.format, field?.type);
                  //                 setOpen(false);
                  //               }}
                  //             >
                  //               <Check
                  //                 className={cn(
                  //                   "mr-2 h-4 w-4",
                  //                   formData[field.name] === data._id ? "opacity-100" : "opacity-0"
                  //                 )}
                  //               />
                  //               {data.name || data.shortName}
                  //             </CommandItem>
                  //           ))}
                  //         </CommandGroup>
                  //       </CommandList>
                  //     </Command>
                  //   </PopoverContent>
                  // </Popover>

                  // <Select
                  //   value={formData[field.name] || null} // Set the current value
                  //   onValueChange={(value) => handleChange(value, field.name, field?.format, field?.type)} // Pass value to handleChange
                  // >
                  //   <SelectTrigger className={`bg-white  ${!formData[field.name] ? 'opacity-60' : 'opacity-100'}`}>
                  //     {field?.data?.find((data) => data._id === formData[field.name])?.name || field?.data?.find((data) => data._id === formData[field.name])?.shortName || 'Select ' + field.label}
                  //   </SelectTrigger>
                  //   <SelectContent>
                  //     <SelectItem value={null}>Select {field.label}</SelectItem>
                  //     {field?.data?.map((data) => (
                  //       <SelectItem key={data._id} value={data._id}>
                  //         {data.name || data.shortName}
                  //       </SelectItem>
                  //     ))}
                  //   </SelectContent>
                  // </Select>

                  field.type === "date" ? (
                    // <Popover>
                    //   <PopoverTrigger asChild>
                    //     <Button
                    //       variant={"outline"}
                    //       className={cn(
                    //         "justify-start text-left font-normal",
                    //         !formData[field.name] && "text-muted-foreground"
                    //       )}
                    //     >
                    //       <CalendarIcon className="mr-2" />
                    //       {formData[field.name] ? (
                    //         format(new Date(formData[field.name]), "PPP")
                    //       ) : (
                    //         <span>Pick a date</span>
                    //       )}
                    //     </Button>
                    //   </PopoverTrigger>
                    //   <PopoverContent
                    //     className="w-full p-0 pointer-events-auto"
                    //     align="center"
                    //   >
                    //     <Calendar
                    //       mode="single"
                    //       selected={
                    //         formData[field.name]
                    //           ? new Date(formData[field.name])
                    //           : undefined
                    //       }
                    //       onSelect={(selectedDate) => {
                    //         console.log("Selected Date:", selectedDate); // Debug: Check if this logs the selected date
                    //         if (selectedDate) {
                    //           handleChange(
                    //             {
                    //               target: { value: selectedDate.toISOString() },
                    //             }, // Pass the date in ISO format
                    //             field.name,
                    //             field?.format
                    //           );
                    //         }
                    //       }}
                    //       initialFocus
                    //     />
                    //   </PopoverContent>
                    // </Popover>
                    <DatePicker handleChange={(selectedDate) => {
                      handleChange(
                        {
                          target: { value: selectedDate.toISOString() },
                        }, // Pass the date in ISO format
                        field.name,
                        field?.format
                      )
                    }}/>) : (
                    <Input
                      type={field.type}
                      onChange={(e) =>
                        handleChange(e, field.name, field?.format)
                      }
                      value={formData[field.name] || ""}
                      readOnly={field.readOnly}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={closeDialog}>
            Cancel
          </Button>
          {action === "Add" && <Button onClick={handleSubmit}>Save</Button>}
          {action === "Update" && (
            <Button onClick={handleSubmit}>Update</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DynamicDialog;
