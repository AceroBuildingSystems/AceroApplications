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
  customUpdate = false
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
      console.log(updatedFormData)
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


  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent
        className={`max-w-full max-h-[90%] pointer-events-auto mx-2  ${height === 'auto' ? 'h-auto' : 'h-[75%]'} ${width === 'full' ? 'w-[95%] h-[90%]' : 'sm:max-w-md lg:max-w-3xl'}`}>
        <DialogTitle className="pl-1">{`${action} ${selectedMaster?.toProperCase()
          }`}</DialogTitle>
        <div className="bg-white h-full overflow-y-auto p-2 rounded-md">
          <div className=" space-y-4   pr-2 pl-1 my-1 overflow-y-auto">
            {/* Use a responsive grid layout for form fields */}
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 `}>

              {/* 1 column on small screens, 2 on large */}
              {fields.map((field, index) => (
                <div key={index} className={`flex flex-col gap-1 mb-2 ${field.type === "custom" ? "col-span-2" : ""}`}>
                  {field.label !== 'access' && <Label>{field.label}</Label>}
                  {
                    (() => {
                      switch (field.type) {
                        case "multiselect":
                         
                          return (
                           
                            <MultipleSelector
                            value={(formData[field.name] || []).map((id) => ({
                              value: id,
                              label: field.data.find((option) => option.value === id)?.label || "Unknown",
                            }))} // Convert stored `_id`s back to { label, value }
                            onChange={(selected) => handleChange(selected, field.name, "", "multiselect")}
                            defaultOptions={field.data} // Ensure `field.data` is in [{ label, value }] format
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
                          return (
                            <Combobox
                              field={field}
                              formData={formData}
                              handleChange={handleChange}
                              placeholder={field.placeholder || ""}
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
                              placeholder={field.placeholder}
                            />
                          );
                        case "custom":
                          return (
                            <><field.CustomComponent data={formData[field.name]} action={action} fullData={formData} /></>
                          )

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
                    })()
                  }
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          {!customUpdate &&<Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>}
          {action === "Add" && <Button onClick={handleSubmit}>Save</Button>}
          {action === "Update" && !customUpdate && (
            <Button onClick={handleSubmit}>Update</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DynamicDialog;
