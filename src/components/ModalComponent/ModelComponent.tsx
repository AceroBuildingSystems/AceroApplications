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

const DynamicDialog = ({
  isOpen,
  closeDialog,
  selectedMaster,
  onSave,
  fields,
  initialData,
  action,
  height,
  user,
}) => {  
  const [formData, setFormData] = useState({});

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
        updatedFormData.fullName = `${updatedFormData.firstName || ""} ${updatedFormData.lastName || ""
          }`.trim();
      }
      return updatedFormData;
    });
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
      await onSave({ formData:updatedData, action });
      closeDialog();
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent
        className={`max-w-full max-h-[80%] pointer-events-auto sm:max-w-md lg:max-w-3xl mx-4  ${height === 'auto' ? 'h-auto' : 'h-[75%]'}`}>
        <DialogTitle className="pl-1">{`${action} ${selectedMaster.charAt(0).toUpperCase() + selectedMaster.slice(1)
          }`}</DialogTitle>
        <div className="bg-white h-full overflow-y-auto p-2 rounded-md">
          <div className=" space-y-4   pr-2 pl-1 my-1 overflow-y-auto">
            {/* Use a responsive grid layout for form fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {" "}
              {/* 1 column on small screens, 2 on large */}
              {fields.map((field, index) => (
                <div key={index} className={`flex flex-col gap-1 mb-2 ${field.type === "custom"?"col-span-2":""}`}>
                  <Label>{field.label}</Label>
                  {
                    (() => {
                      switch (field.type) {
                        case "textarea":
                          return (
                            <textarea
                              rows={3}
                              onChange={(e) => handleChange(e, field.name, field?.format)}
                              value={formData[field.name] || ""}
                            />
                          );
                        case "select":
                          return (
                            <Combobox
                              field={field}
                              formData={formData}
                              handleChange={handleChange}
                            />
                          );
                        case "date":
                          return (
                            <DatePicker
                              currentDate={formData[field.name]}
                              handleChange={(selectedDate) => {
                                handleChange(
                                  {
                                    target: { value: selectedDate?.toISOString() || "" },
                                  }, // Pass the date in ISO format
                                  field.name,
                                  field?.format
                                );
                              }}
                            />
                          );
                        case "custom":
                          return (
                           <><field.CustomComponent accessData={formData[field.name]} /></>
                          )
                        default:
                          return (
                            <Input
                              type={field.type}
                              onChange={(e) => handleChange(e, field.name, field?.format)}
                              value={formData[field.name] || ""}
                              readOnly={field.readOnly}
                            />
                          );
                      }
                    })()
                  }
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
