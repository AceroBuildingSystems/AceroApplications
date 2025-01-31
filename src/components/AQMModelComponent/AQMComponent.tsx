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
import { Combobox } from "../ui/ComboBoxWrapper";
import { DatePicker } from "../ui/date-picker";
import useUserAuthorised from "@/hooks/useUserAuthorised";
import { LogOut, Save } from 'lucide-react';

import { Switch } from "../ui/switch";
import {
  ArrowUpDown,
  DeleteIcon,
  Download,
  Import,
  Plus,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import MultipleSelector from "../ui/multiple-selector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { log } from "console";

const DynamicDialog = ({
  isOpen,
  closeDialog,
  selectedMaster,
  onSave,
  fields,
  initialData,
  action,
  height,
  width,
}) => {
  const { user, status, authenticated } = useUserAuthorised();

  const [formData, setFormData] = useState<Record<string, any>>({});

  // Dynamically generate fields based on selectedMaster

  useEffect(() => {
    const formattedData = Object.keys(initialData).reduce((acc: Record<string, any>, key: string) => {
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
    let value: string | null = "";


    if (type === "multiselect") {
      value = e.map((item) => item.value); // Store only `_id`s
    } else if (type === "select") {
      value = e; // Ensure single select values are stored correctly
    } else {
      value = e.target.value || "";
    }
    setFormData((prev) => {
      let formattedValue = value;
      if (format === "ObjectId") {
        formattedValue = mongoose.Types.ObjectId.isValid(value || "") ? value : null; // Validate ObjectId format
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
        updatedFormData.fullName = `${updatedFormData.firstName || ""} ${updatedFormData.lastName || ""
          }`.trim();
      }

console.log(updatedFormData);
      return updatedFormData;
    });
  };

  // handle close
  const handleClose = async () => {
    try {

      const formattedData = Object.keys(initialData).reduce((acc: Record<string, any>, key: string) => {
        if (typeof initialData[key] === "object" && initialData[key]?._id) {
          // If the field is an object with an _id, store the _id
          acc[key] = initialData[key]._id;
        } else {
          acc[key] = initialData[key];
        }
        return acc;
      }, {});

      setFormData(formattedData);
      // Save the data to the database (e.g., via an API call)
      closeDialog();
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {

      const updatedData = {
        ...formData, // Spread the existing properties of the object
        addedBy: user._id,
        updatedBy: user._id
      };


      // Save the data to the database (e.g., via an API call)
      await onSave({ formData: updatedData, action });
      closeDialog();
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleTogglePermission = (
    accessId: string,
    permission: string
  ) => {
    setFormData((prevData) => {
      const updatedAccess = prevData.access.map((item: any) => {
        if (item._id === accessId) {
          return {
            ...item,
            permissions: {
              ...item.permissions,
              [permission]: !item.permissions[permission],
            },
          };
        }
        return item;
      });
      return { ...prevData, access: updatedAccess };
    });
  };

  const handleRemoveAccess = (accessId: string) => {
    setFormData((prevData) => {
      const updatedAccess = prevData.access.filter((item: any) => item._id !== accessId);
      return { ...prevData, access: updatedAccess };
    });
  };

  const renderField = (field) => {
    switch (field.type) {
      case "multiselect":
        return (
          <MultipleSelector
            value={(formData[field.name] || []).map((id) => ({
              value: id,
              label: field.data.find((option) => option.value === id)?.label || "Unknown",
            }))}
            onChange={(selected) => handleChange(selected, field.name, "", "multiselect")}
            defaultOptions={field.data}
            placeholder={field.placeholder || "Select options..."}
          />
        );
      case "textarea":
        return (
          <textarea
            rows={3}
            onChange={(e) => handleChange(e, field.name, field?.format)}
            value={formData[field.name] || ""}
            placeholder={field.placeholder || ""}
          />
        );
      case "select":
        return <Combobox field={field} formData={formData} handleChange={handleChange} placeholder={field.placeholder || ""} />;
      case "date":
        return (
          <DatePicker
            currentDate={formData[field.name]}
            handleChange={(selectedDate) => {
              handleChange(
                { target: { value: selectedDate?.toISOString() || "" } },
                field.name,
                field?.format
              );
            }}
            placeholder={field.placeholder || ""}
          />
        );
      case "custom":
        return <field.CustomComponent accessData={formData[field.name]} />;
      default:
        return (
          <Input
            type={field.type}
            onChange={(e) => handleChange(e, field.name, field?.format)}
            value={formData[field.name] || ""}
            readOnly={field.readOnly}
            placeholder={field.placeholder || ""}
            required={field.required || false}
          />
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog} >
      <DialogContent
        className={`max-w-full pointer-events-auto mx-2 h-screen max-h-[95vh] ${width === 'full' ? 'w-[95%] h-[95%]' : 'sm:max-w-md lg:max-w-3xl'}`}
      >
        <DialogTitle className="pl-1 hidden">{`${action} ${selectedMaster?.toProperCase()}`}</DialogTitle>

        <div className="h-full flex flex-col min-h-0">
          {/* Title/Header Section */}
          <div className="flex items-center justify-between py-3 ">
            <div className="font-bold">{selectedMaster?.toProperCase()}</div>
            <div className="flex gap-2">

              {action === "Add" && <Button
                effect="expandIcon"
                className={`w-28 bg-blue-600 hover:bg-blue-700 duration-300`}
              >
                Get Quote No
              </Button>}
              {(action === "Add" || action === "Update") && <Button
                effect="expandIcon"
                icon={Save}
                iconPlacement="right"

                className={`w-28 bg-green-600 hover:bg-green-700 duration-300`}
              >
                Save
              </Button>}

            </div>
          </div>

          {/* Tabs Section */}
          {/* Tabs Section */}
          <div className="w-full flex-1 min-h-0 overflow-hidden">
            <Tabs defaultValue="QuoteDetails" className="h-full flex flex-col min-h-0">
              <TabsList width={"full"}>
                <TabsTrigger value="QuoteDetails" width={"full"}>Quote Details</TabsTrigger>
                <TabsTrigger value="CustomerDetails" width={"full"}>Customer Details</TabsTrigger>
                <TabsTrigger value="ProjectDetails" width={"full"}>Project Details</TabsTrigger>
                <TabsTrigger value="CycleTimeDetails" width={"full"}>Cycle Time Details</TabsTrigger>
                <TabsTrigger value="TechnicalDetails" width={"full"}>Technical Details</TabsTrigger>
                <TabsTrigger value="CommercialDetails" width={"full"}>Commercial Details</TabsTrigger>
                <TabsTrigger value="JobDetails" width={"full"}>Job Details</TabsTrigger>
              </TabsList>

              {/* Tabs Content */}
              <div className="flex-1 overflow-hidden">

                {/* Sections */}
                {["QuoteDetails", "CustomerDetails", "ProjectDetails", "CycleTimeDetails", "TechnicalDetails", "CommercialDetails", "JobDetails"].map(section => (
                  <TabsContent key={section} value={section} className="flex-1 overflow-y-auto">
                    <div className="bg-white flex-1 h-[calc(100vh-180px)] overflow-y-auto p-2 rounded-md">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {fields.filter(field => field.section === section).map((field, index) => (
                          <div key={index} className={`flex flex-col gap-1 mb-2 ${field.type === "custom" ? "col-span-2" : ""} ${field.visibility ? '' : 'hidden'}`}>
                            <div className="flex justify-between">
                              {field.label && <Label>{field.label} {field.required && <span className="text-red-600">*</span>}</Label>}
                              {field.addMore && <Label className="cursor-pointer text-blue-600" onClick={field.onAddMore}>Add More</Label>}
                            </div>

                            {renderField(field)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                ))}

              </div>
            </Tabs>
          </div>

        </div>
      </DialogContent>
    </Dialog>


  );
};

export default DynamicDialog;
