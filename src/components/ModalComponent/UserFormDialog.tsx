import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "../ui/ComboBoxWrapper";
import { DatePicker } from "../ui/date-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-toastify";
import { CompleteUserData } from "@/utils/userUtils";
import { ChevronRight, ChevronLeft, Save, X } from "lucide-react";

interface UserFormDialogProps {
  isOpen: boolean;
  closeDialog: () => void;
  onSave: (data: { formData: CompleteUserData; action: string }) => Promise<any>;
  initialData?: any;
  action: string;
  fields: any;
  masterData: {
    departments?: any[];
    designations?: any[];
    roles?: any[];
    employeeTypes?: any[];
    locations?: any[];
    organisations?: any[];
    countries?: any[];
    visaTypes?: any[];
    reportingTo?: any[];
    statusOptions?: any[];
    genderOptions?: any[];
    maritalStatusOptions?: any[];
  };
  isSubmitting?: boolean;
  onFieldChange?: (params: { id: string; fieldName: string }) => void;
}

const UserFormDialog: React.FC<UserFormDialogProps> = ({
  isOpen,
  closeDialog,
  onSave,
  initialData = {},
  action,
  fields,
  masterData,
  isSubmitting = false,
  onFieldChange,
}) => {
  // State for form data and validation
  const [formData, setFormData] = useState<CompleteUserData>({} as CompleteUserData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("core");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [selectedEmployeeType, setSelectedEmployeeType] = useState<string>("");

  // Tabs configuration
  const tabs = [
    { id: "core", label: "Core Info", icon: "👤" },
    { id: "personal", label: "Personal Details", icon: "🏠" },
    { id: "employment", label: "Employment", icon: "💼" },
    { id: "visa", label: "Visa Details", icon: "🛂" },
    { id: "identification", label: "Identification", icon: "🪪" },
    { id: "benefits", label: "Benefits", icon: "🏥" },
  ];

  // Group fields by category tab
  const fieldsByCategory = {
    core: [
      "empId", "email", "firstName", "lastName", "fullName", 
      "displayName", "password", "imageUrl", "isActive"
    ],
    personal: [
      "gender", "dateOfBirth", "maritalStatus", "nationality", "personalNumber"
    ],
    employment: [
      "department", "designation", "reportingTo", "employeeType", "role", 
      "reportingLocation", "activeLocation", "extension", "mobile", 
      "joiningDate", "relievingDate", "organisation", "personCode", "status", "availability",
      "isDepartmentManager", "managedDepartment"
    ],
    visa: [
      "visaType", "visaIssueDate", "visaExpiryDate", "visaFileNo", 
      "workPermit", "labourCardExpiryDate", "iloeExpiryDate"
    ],
    identification: [
      "passportNumber", "passportIssueDate", "passportExpiryDate", 
      "emiratesId", "emiratesIdIssueDate", "emiratesIdExpiryDate"
    ],
    benefits: [
      "medicalInsurance"
    ],
  };

  // Initialize form data with initial values
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({ ...initialData });
    } else {
      setFormData({} as CompleteUserData);
    }
  }, [initialData, isOpen]);

  // Handle field changes
  const handleFieldChange = (fieldName: string, value: any) => {
    if (fieldName === "employeeType") {
      const selectedType = masterData.employeeTypes?.find((type: any) => type._id === value);
      setSelectedEmployeeType(selectedType?.name || "");
      
      // If not a manager, clear managed department
      if (selectedType?.name !== "Manager") {
        setFormData(prev => ({ ...prev, managedDepartment: null }));
      }
    }
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Get fields for current tab - using either category property or name lookup
    const fieldsToValidate = fields.filter((field: any) => 
      (field.category === activeTab) || 
      (fieldsByCategory[activeTab as keyof typeof fieldsByCategory]?.includes(field.name))
    );

    // Validate required fields
    fieldsToValidate.forEach((field: any) => {
      if (field.required && !formData[field.name as keyof CompleteUserData]) {
        newErrors[field.name] = `${field.label} is required`;
        isValid = false;
      }
    });

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Navigate to next tab if validation passes
  const handleNextTab = () => {
    if (validateForm()) {
      const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1].id);
      }
    } else {
      setSubmitAttempted(true);
      toast.error("Please fill all required fields correctly");
    }
  };

  // Navigate to previous tab
  const handlePreviousTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setSubmitAttempted(true);
    
    // Validate all tabs before submission
    let allTabsValid = true;
    const allErrors: Record<string, string> = {};
    
    // Check each tab for validation - using either category property or name lookup
    Object.keys(fieldsByCategory).forEach(tabId => {
      const fieldsToValidate = fields.filter((field: any) => 
        (field.category === tabId) || 
        (fieldsByCategory[tabId as keyof typeof fieldsByCategory]?.includes(field.name))
      );
      
      fieldsToValidate.forEach((field: any) => {
        if (field.required && !formData[field.name as keyof CompleteUserData]) {
          allErrors[field.name] = `${field.label} is required`;
          allTabsValid = false;
        }
      });
    });
    
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      allErrors.email = "Please enter a valid email address";
      allTabsValid = false;
    }
    
    setErrors(allErrors);
    
    if (!allTabsValid) {
      toast.error("Please fill all required fields across all tabs");
      return;
    }

    try {
      const response = await onSave({ formData, action });
      if (response?.data?.status === "success") {
        toast.success(`User ${action === "Add" ? "created" : "updated"} successfully`);
        closeDialog();
      }
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Failed to save user");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{action} User</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 gap-4">
            {tabs.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.icon} {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map(tab => (
            <TabsContent key={tab.id} value={tab.id}>
              <div className="grid grid-cols-2 gap-4">
                {fields
                  .filter(field => fieldsByCategory[tab.id as keyof typeof fieldsByCategory]?.includes(field.name))
                  .map(field => {
                    // Skip managed department field if not a manager
                    if (field.name === "managedDepartment" && selectedEmployeeType !== "Manager") {
                      return null;
                    }
                    return (
                      <div key={field.name} className="space-y-2">
                        <Label htmlFor={field.name}>{field.label}</Label>
                        {field.type === "select" ? (
                          <Combobox
                            field={{
                              ...field,
                              data: field.data || masterData[field.name.toLowerCase() + 's'] || []
                            }}
                            formData={formData}
                            handleChange={(value: any) => handleFieldChange(field.name, value)}
                            placeholder={field.placeholder}
                          />
                        ) : field.type === "date" ? (
                          <DatePicker
                            id={field.name}
                            value={formData[field.name as keyof CompleteUserData]}
                            onChange={(value) => handleFieldChange(field.name, value)}
                            disabled={field.readOnly}
                            required={field.required}
                          />
                        ) : (
                          <Input
                            id={field.name}
                            type={field.type}
                            value={formData[field.name as keyof CompleteUserData]}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            disabled={field.readOnly}
                            required={field.required}
                          />
                        )}
                        {errors[field.name] && (
                          <p className="text-sm text-red-500">{errors[field.name]}</p>
                        )}
                      </div>
                    );
                  })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog; 