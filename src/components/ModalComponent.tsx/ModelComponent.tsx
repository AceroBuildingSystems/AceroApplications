import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


const DynamicDialog = ({ isOpen, closeDialog, selectedMaster, onSave, fields }) => {
  const [formData, setFormData] = useState({});

  // Dynamically generate fields based on selectedMaster
 
  
  // Handle form data changes
  const handleChange = (e, fieldName) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: e.target.value
    }));

    console.log(typeof(formData.isActive));
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Save the data to the database (e.g., via an API call)
      await onSave(selectedMaster, formData);
      closeDialog();
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>

      <DialogContent className="max-w-full max-h-[80%] sm:max-w-md lg:max-w-3xl mx-4  h-[75%]">
        <DialogTitle className="pl-1">{`Add ${selectedMaster.charAt(0).toUpperCase() + selectedMaster.slice(1)}`}</DialogTitle>
        <div className="bg-white h-full overflow-y-auto p-2 rounded-md">
          <div className=" space-y-4   pr-2 pl-1 my-1 overflow-y-auto">
            {/* Use a responsive grid layout for form fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"> {/* 1 column on small screens, 2 on large */}
              {fields.map((field, index) => (
                <div key={index} className="mb-2">
                  <Label>{field.label}</Label>
                  {field.type === 'textarea' ? (
                    <textarea

                      rows={3}
                      onChange={(e) => handleChange(e, field.name)}
                      value={formData[field.name] || ""}
                    />
                  ) : field.type === 'select' ? (
                    <select

                      onChange={(e) => handleChange(e, field.name)}
                      value={formData[field.name] || ""}
                    >
                      <option value="">Select {field.label}</option>
                      {field.data.map((data) => (
                        <option key={data._id} value={data._id}>
                          {data.name || data.shortName}
                        </option>
                      ))}
                     
                    </select>
                  ) :  (
                    <Input
                      type={field.type}

                      onChange={(e) => handleChange(e, field.name)}
                      value={formData[field.name] || ""}
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
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};

export default DynamicDialog;
