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
import mongoose, { set } from "mongoose";
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
import { MONGO_MODELS, SUCCESS } from "@/shared/constants";
import { useCreateApplicationMutation } from "@/services/endpoints/applicationApi";
import { toast } from "react-toastify";

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
  customerData,
  customerTypeData,
  statusData,
  onchangeData,
  countryData,
  proposalOffer,
  proposalDrawing,
  locationData,
  stateData,
}) => {
  const { user, status, authenticated } = useUserAuthorised();

  const [createMaster, { isLoading: isCreatingMaster }] = useCreateApplicationMutation();

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [proposalRevData, setProposalRevData] = useState<Record<string, any>>([]);
  const [drawingRevData, setDrawingRevData] = useState<Record<string, any>>([]);
  const [proposalData, setProposalData] = useState<Record<string, any>>({});
  const [offerRevisions, setOfferRevisions] = useState<Record<string, any>>([]);
  const [drawingRevisions, setDrawingRevisions] = useState<Record<string, any>>([]);

  const [formDataSecondary, setFormDataSecondary] = useState<Record<string, any>>({});
  const [isSecondaryDialogOpen, setIsSecondaryDialogOpen] = useState(false);
  const [secondaryDialogType, setSecondaryDialogType] = useState("");

  const [secondaryFields, setSecondaryFields] = useState([]);

  const [approvalAuthorityData, setApprovalAuthorityData] = useState([]);

  const [formDataNew, setFormDataNew] = useState<Record<string, any>>({});
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [newDialogType, setNewDialogType] = useState("");

  const [newFields, setNewFields] = useState([]);

  const [region, setRegion] = useState('');
  const [industryType, setIndustryType] = useState('');
  const [buildingType, setBuildingType] = useState('');
  const [paintType, setPaintType] = useState('');
  const [incotermDescription, setIncotermDescription] = useState('');

  const [isHelp, setIsHelp] = useState(false);


  // Dynamically generate fields based on selectedMaster

  const customerfields: Array<{ label: string; name: string; type: string; data?: any; readOnly?: boolean; format?: string; required?: boolean; placeholder?: string; section?: string; addNew?: boolean; visibility?: boolean; onAddMore?: () => void; }> = [
    { label: 'Customer Name', name: "name", type: "text", required: true, placeholder: 'Customer Name', section: 'Form2' },
    { label: 'Website', name: "website", type: "text", placeholder: 'Website', section: 'Form2' },
    { label: 'Email', name: "email", type: "email", placeholder: 'Email', section: 'Form2' },
    { label: 'Phone', name: "phone", type: "text", placeholder: 'Phone', section: 'Form2' },
    { label: 'Address', name: "address", type: "text", placeholder: 'Address', section: 'Form2' },
    { label: 'Customer Type', name: "customerType", type: "select", data: customerTypeData, placeholder: 'Select Customer Type', section: 'Form2' },
    { label: 'Status', name: "isActive", type: "select", data: statusData, placeholder: 'Select Status', section: 'Form2' },
  ]

  const customerContactfields: Array<{ label: string; name: string; type: string; data?: any; readOnly?: boolean; format?: string; required?: boolean; placeholder?: string; section?: string; addNew?: boolean; visibility?: boolean; onAddMore?: () => void; }> = [
    { label: 'Contact Name', name: "name", type: "text", required: true, placeholder: 'Customer Name', section: 'Form2' },
    { label: 'Email', name: "email", type: "email", placeholder: 'Email', section: 'Form2' },
    { label: 'Phone', name: "phone", type: "text", placeholder: 'Phone', section: 'Form2' },
    { label: 'Position', name: "position", type: "text", placeholder: 'Position', section: 'Form2' },
    { label: 'Customer', name: "customer", type: "select", data: customerData, placeholder: 'Select Customer', section: 'Form2' },
    { label: 'Status', name: "isActive", type: "select", data: statusData, placeholder: 'Select Status', section: 'Form2' },
  ]

  const cityfields: Array<{ label: string; name: string; type: string; data?: any; readOnly?: boolean; format?: string; required?: boolean; placeholder?: string; section?: string; addNew?: boolean; visibility?: boolean; onAddMore?: () => void; }> = [
    { label: 'State / City', name: "name", type: "text", required: true, placeholder: 'State / City', section: 'Form2' },
    { label: 'Country', name: "country", type: "select", required: true, placeholder: 'Select Country', format: 'ObjectId', data: countryData, section: 'Form2' },
    { label: 'Status', name: "isActive", type: "select", data: statusData, placeholder: 'Select Status', section: 'Form2' },

  ]

  const approvalAuthorityFields: Array<{ label: string; name: string; type: string; data?: any; readOnly?: boolean; format?: string; required?: boolean; placeholder?: string; section?: string; addNew?: boolean; visibility?: boolean; onAddMore?: () => void; }> = [
    { label: 'Authority Code', name: "code", type: "text", required: true, placeholder: 'Authority Code', section: 'Form2' },
    { label: 'Approval Authority', name: "name", type: "text", required: true, placeholder: 'Approval Authority', section: 'Form2' },
    { label: 'Location', name: "location", type: "multiselect", required: true, placeholder: 'Select Location', data: locationData, addNew: true, section: 'Form2' },

  ]

  const locationFields: Array<{ label: string; name: string; type: string; data?: any; readOnly?: boolean; format?: string; required?: boolean; placeholder?: string; section?: string; addNew?: boolean; visibility?: boolean; onAddMore?: () => void; }> = [
    { label: 'Location', name: "name", type: "text", required: true, placeholder: 'Location', section: 'Form3' },
    { label: 'Address', name: "address", type: "text", placeholder: 'Address', section: 'Form3' },
    { label: 'Pin Code', name: "pincode", type: "text", placeholder: 'Pin Code', section: 'Form3' },
    { label: 'State / City', name: "state", type: "select", required: true, placeholder: 'Select State / City', format: 'ObjectId', data: stateData, section: 'Form3' },

  ]

  useEffect(() => {
    let formattedData = Object.keys(initialData).reduce((acc: Record<string, any>, key: string) => {
      if (typeof initialData[key] === "object" && initialData[key]?._id) {
        // If the field is an object with an _id, store the _id
        acc[key] = initialData[key]._id;
      } else {
        acc[key] = initialData[key];
      }
      return acc;
    }, {});

    const proposalRevisions = {
      proposals: formattedData?.proposals?.map(data => data._id), // Map `location` to just the `_id`s
      offerrevisions: formattedData?.proposals?.[0]?.revisions.map(data => data._id),
      drawingrevisions: formattedData?.proposals?.[1]?.revisions.map(data => data._id),
      offerRevisionsdata: formattedData?.proposals?.[0]?.revisions,
      drawingRevisionsdata: formattedData?.proposals?.[1]?.revisions,

    };

    if (initialData?.contact) {
      formattedData = { ...formattedData, email: initialData?.contact?.email, phone: initialData?.contact?.phone, position: initialData?.contact?.position }
    }
    setFormData(formattedData);

    if (initialData?.proposals) {
      setProposalRevData(proposalRevisions?.offerRevisionsdata);
      setDrawingRevData(proposalRevisions?.drawingRevisionsdata)
    }
    else {
      setProposalRevData((prev) => {
        if (initialData?.revNo === null || initialData?.revNo === undefined) {
          return []
        }

        if (!prev) {
          return [{ revNo: initialData?.revNo }]
        } else {
          return [...prev, { revNo: initialData?.revNo }]
        }
      });
      setDrawingRevData((prev) => {
        if (initialData?.revNo === null || initialData?.revNo === undefined) {
          return []
        }

        if (!prev) {
          return [{ revNo: initialData?.revNo }]
        } else {
          return [...prev, { revNo: initialData?.revNo }]
        }
      })
    }

  }, [initialData]);

  // Handle form data changes
  const handleChange = (e, fieldName, format, type, data, field) => {

    let value: string | null = "";
    fieldName === 'country' && setRegion(data?.filter((item) => item._id === e)[0]?.region?.name);

    fieldName === 'industryType' && setIndustryType(data?.filter((item) => item._id === e)[0]?.name);

    fieldName === 'buildingType' && setBuildingType(data?.filter((item) => item._id === e)[0]?.name);

    fieldName === 'paintType' && setPaintType(data?.filter((item) => item._id === e)[0]?.name);

    fieldName === 'incoterm' && setIncotermDescription(data?.filter((item) => item._id === e)[0]?.description);

    (fieldName === "company" || fieldName === 'country' || fieldName === 'state') && onchangeData({ id: e, fieldName, name: 'approvalAuthority' });


    if (type === "multiselect") {
      value = e.map((item) => item.value); // Store only `_id`s
    } else if (type === "select") {
      value = e; // Ensure single select values are stored correctly
    } else {
      value = e.target.value || "";
    }

    if (field?.section !== 'CycleTimeDetails') {


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

        if (fieldName === "company") {

          updatedFormData['customerType'] = data?.filter((item) => item._id === e)[0]?.customerType?._id;
        }
        if (fieldName === "contact") {
          updatedFormData['position'] = data?.filter((item) => item._id === e)[0]?.position;
          updatedFormData['phone'] = data?.filter((item) => item._id === e)[0]?.phone;
          updatedFormData['email'] = data?.filter((item) => item._id === e)[0]?.email;
        }


        // Update `fullName` if `firstName` or `lastName` changes
        // Need to generalise later for other master components
        if (fieldName === "firstName" || fieldName === "lastName") {
          updatedFormData.fullName = `${updatedFormData.firstName || ""} ${updatedFormData.lastName || ""
            }`.trim();
        }

        console.log(updatedFormData)

        return updatedFormData;
      });
    }


    {

      ((field?.section === 'CycleTimeDetails' && field?.subSection === 'ProposalOffer') || fieldName === 'revNo') && setProposalRevData((prev) => {
        let formattedValue = value;
        if (format === "ObjectId") {
          formattedValue = mongoose.Types.ObjectId.isValid(value || "") ? value : null; // Validate ObjectId format
        } else if (format === "Date") {
          formattedValue = value ? new Date(value) : null; // Convert to Date object
        }

        const updatedFormData = prev.map(item =>
          ({ ...item, [fieldName]: formattedValue })
        );

        console.log(updatedFormData)

        return updatedFormData;
      })
    };

    {
      ((field?.section === 'CycleTimeDetails' && field?.subSection === 'ProposalDrawing') || fieldName === 'revNo') && setDrawingRevData((prev) => {
        let formattedValue = value;
        if (format === "ObjectId") {
          formattedValue = mongoose.Types.ObjectId.isValid(value || "") ? value : null; // Validate ObjectId format
        } else if (format === "Date") {
          formattedValue = value ? new Date(value) : null; // Convert to Date object
        }

        const updatedFormData = prev.map(item =>
          ({ ...item, [fieldName]: formattedValue })
        );

        console.log(updatedFormData)

        return updatedFormData;
      })
    };

    {
      (field?.section === 'Form2') && setFormDataSecondary((prev) => {
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


        return updatedFormData;
      });
    }

    {
      (field?.section === 'Form3') && setFormDataNew((prev) => {
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
    }


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


  const saveDataQuotation = async ({ formData, action, master }) => {

    const formattedData = {
      db: MONGO_MODELS[master],
      action: action === 'Add' ? 'create' : 'update',
      filter: { "_id": formData._id },
      data: formData,
    };

    const response = await createMaster(formattedData);

    if (response?.error?.data?.message) {
      toast.error(`Error encountered: ${response?.error?.data?.message?.errorResponse?.errmsg}`);
      return new Error({ message: "Something went wrong!", data: "" })
    }
    return response;

  };

  const addRevisionsToProposal = async (data, master) => {
    const response = await Promise.allSettled(data.map(pType => {
      const updatedData = {
        ...pType.data,
        addedBy: user?._id,
        updatedBy: user?._id
      };


      return saveDataQuotation({ formData: updatedData, action, master });
    }))
    return response
  }

  // Handle form submission
  const handleSubmitQuotation = async () => {
    try {
      if (action === 'Add') {
        if(!(formData?.country && formData?.salesEngineer && formData?.salesSupportEngineer && formData?.rcvdDateFromCustomer && formData?.sellingTeam && formData?.responsibleTeam)){
         
          toast.error(`Please fill the required fields.`);
          return;
        }
        const revisionTypes = [{
          data: proposalRevData[0]
        },
        {
          data: drawingRevData[0]
        }
        ]
        const responseIds = await addRevisionsToProposal(revisionTypes, 'PROPOSAL_REVISION_MASTER')
        // {status:"fulfilled",value:} 

        const proposalData = [{
          data: { revisions: [...offerRevisions, responseIds[0]?.value?.data?.data?._id], type: "ProposalOffer" }
        },
        {
          data: { revisions: [...drawingRevisions, responseIds[1]?.value?.data?.data?._id], type: "ProposalDrawing" }
        }
        ]

        const proposalIds = await addRevisionsToProposal(proposalData, 'PROPOSAL_MASTER');

        const proposals = proposalIds.map(item => item.value?.data?.data?._id).filter(id => id);
        //
        delete formData?.phone;
        delete formData?.email;
        delete formData?.position;
        const quotationData = {
          data: { ...formData, proposals: proposals, status: 'Draft', handleBy: formData?.salesEngineer }
        }
        

        await onSave({formData:quotationData?.data, action, master:'QUOTATION_MASTER'})
        
      }
      else {
        delete formData?.phone;
        delete formData?.email;
        delete formData?.position;
        delete formData?.proposals;
        const quotationData = {
          data: { ...formData, status: 'Pending' }
        }

        await onSave({formData:quotationData?.data, action, master:'QUOTATION_MASTER'})
        
      }

      closeDialog();
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  // Handle form submission
  const handleSubmit = async (Form, data) => {
    try {

      const updatedData = {
        ...data, // Spread the existing properties of the object
        addedBy: user?._id,
        updatedBy: user?._id
      };

      let master;
      if (Form === 'Form2') {
        switch (secondaryDialogType) {
          case "Company Name":
            master = "CUSTOMER_MASTER";
            break;

          case "Contact Name":
            master = "CUSTOMER_CONTACT_MASTER";
            break;

          case "City":
            master = "STATE_MASTER";
            break;
          case "Approval Authority (GCC Only)":
            master = "APPROVAL_AUTHORITY_MASTER";
            break;

          default:
            break;
        }
      }
      else {
        switch (newDialogType) {
          case "Location":
            master = "LOCATION_MASTER";
            break;

        }
      }

      // Save the data to the database (e.g., via an API call)
      const response = await onSave({ formData: updatedData, action, master });
      // const response = await onSave({ formData: updatedData, action, master });

      switch (master) {
        case "CUSTOMER_MASTER":
          await onchangeData({ id: response?.data?.data?.customer?._id, fieldName: 'company', name: response?.data?.data?.name })
          handleChange(response?.data?.data?._id, "company", "ObjectId", "select");
          break;

        case "CUSTOMER_CONTACT_MASTER":

          await onchangeData({ id: response?.data?.data?._id, fieldName: 'contact', name: response?.data?.data?.name, parentId: response?.data?.data?.customer?._id, position: response?.data?.data?.position, email: response?.data?.data?.email, phone: response?.data?.data?.phone })
          handleChange(response?.data?.data?._id, "contact", "ObjectId", "select", [response?.data?.data]);

          break;

        case "STATE_MASTER":
          await onchangeData({ id: response?.data?.data?._id, fieldName: 'state', name: response?.data?.data?.name, parentId: response?.data?.data?.country?._id })
          handleChange(response?.data?.data?._id, "state", "ObjectId", "select");
          break;

        case "APPROVAL_AUTHORITY_MASTER":
          await onchangeData({ id: response?.data?.data?._id, fieldName: 'approvalAuthority', name: response?.data?.data?.code, parentId: response?.data?.data?.location?.state?._id, location: response?.data?.data?.location })
          handleChange(response?.data?.data?._id, "state", "ObjectId", "select");
          break;

        default:
          break;
      }
      Form === 'Form2' ? setIsSecondaryDialogOpen(false) : setIsNewDialogOpen(false);;
      // closeDialog();
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };


  const renderField = (field, placeholder) => {

    switch (field.type) {

      case "multiselect":
        return (
          <MultipleSelector
            value={(formData[field.name] || []).map((id) => ({
              value: id,
              label: field.data.find((option) => option.value === id)?.label || "Unknown",
            }))}
            onChange={(selected) => handleChange(selected, field.name, "", "multiselect", field?.data, field)}
            defaultOptions={field.data}
            placeholder={field.placeholder || "Select options..."}
          />
        );
      case "textarea":
        return (
          <textarea
            rows={3}
            onChange={(e) => handleChange(e, field.name, field?.format, field)}
            value={formData[field.name] || ""}
            placeholder={field.placeholder || ""}
          />
        );
      case "select":

        return <Combobox field={field} formData={formData} handleChange={handleChange} placeholder={field.placeholder || ""} />;
      case "date":
        return (
          <DatePicker

            currentDate={field.section !== 'CycleTimeDetails' ? formData[field.name] : (field?.subSection === 'ProposalOffer' ? proposalRevData[field.name] : drawingRevData[field.name])}
            handleChange={(selectedDate) => {
              handleChange(
                { target: { value: selectedDate?.toISOString() || "" } },
                field.name,
                field?.format, field?.data, field
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
            onChange={(e) => handleChange(e, field.name, field?.format, field?.type, field?.data, field)}
            value={field.section !== 'CycleTimeDetails' ? formData[field.name] : ((field?.subSection === 'ProposalOffer' ? proposalRevData[field.name] : drawingRevData[field.name]) || placeholder || "")}
            readOnly={field.readOnly}
            placeholder={field.placeholder || placeholder || ""}
            required={field.required || false}
            className="w-full"
          />
        );
    }
  };

  const openSecondaryDialog = (type, data) => {

    setApprovalAuthorityData(data)
    setFormDataSecondary({});
    switch (type) {
      case "Company Name":
        setSecondaryFields(customerfields);
        break;

      case "Contact Name":
        setSecondaryFields(customerContactfields);
        handleChange(formData["company"], "customer", "ObjectId", "select");
        break;

      case "City":
        setSecondaryFields(cityfields);
        handleChange(formData["country"], "country", "ObjectId", "select");
        break;

      case "Approval Authority (GCC Only)":
        setSecondaryFields(approvalAuthorityFields);

        break;
      default:

        break;
    }

    setSecondaryDialogType(type);
    setIsSecondaryDialogOpen(true);

  };

  const openNewDialog = (type) => {

    setFormDataNew({});

    setNewFields(locationFields);
    setNewDialogType(type);
    setIsNewDialogOpen(true);

  };

  return (
    <>

      <Dialog open={isOpen} onOpenChange={closeDialog} >
        <DialogContent
          className={`max-w-full pointer-events-auto mx-2 h-screen max-h-[95vh] ${width === 'full' ? 'w-[97%] h-[95%]' : 'sm:max-w-md lg:max-w-3xl'}`}
        >
          <DialogTitle className="pl-1 hidden">{`${action} ${selectedMaster?.toProperCase()}`}</DialogTitle>

          <div className="h-full flex flex-col min-h-0">
            {/* Title/Header Section */}
            <div className="flex items-center justify-between py-3 ">
              <div className="font-bold text-lg">{selectedMaster?.toProperCase()}</div>
              <div className="flex gap-2">

                {(action === "Add" || action === "Update") && <Button
                  effect="expandIcon"
                  className={`w-28 bg-blue-600 hover:bg-blue-700 duration-300`}
                >
                  Get Quote No
                </Button>}
                {(action === "Add") && <Button
                  effect="expandIcon"
                  icon={Save}
                  iconPlacement="right"
                  onClick={handleSubmitQuotation}
                  className={`w-28 bg-green-600 hover:bg-green-700 duration-300`}
                >
                  Save
                </Button>}

                {(action === "Update") && <Button
                  effect="expandIcon"
                  icon={Save}
                  iconPlacement="right"
                  onClick={handleSubmitQuotation}
                  className={`w-28  bg-green-600 hover:bg-green-700 ${initialData?.quoteNo && ' bg-blue-600 hover:bg-blue-700'} duration-300`}
                >
                  {initialData?.quoteNo ? 'Update' : 'Save'}
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
                  {action !== 'Add' && (<TabsTrigger value="CycleTimeDetails" width={"full"}>Cycle Time Details</TabsTrigger>)}
                  {action !== 'Add' && (<TabsTrigger value="TechnicalDetails" width={"full"}>Technical Details</TabsTrigger>)}
                  {action !== 'Add' && (<TabsTrigger value="CommercialDetails" width={"full"}>Commercial Details</TabsTrigger>)}
                  {action !== 'Add' && (
                    <TabsTrigger value="JobDetails" width={"full"}>Job Details</TabsTrigger>
                  )}
                </TabsList>

                {/* Tabs Content */}
                <div className="flex-1 overflow-hidden">
                  {[
                    "QuoteDetails", "CustomerDetails", "ProjectDetails",
                    "CycleTimeDetails", "TechnicalDetails", "CommercialDetails", "JobDetails"
                  ].map(section => (
                    <TabsContent key={section} value={section} className="flex-1 overflow-y-auto">
                      <div className="bg-white flex-1 h-[calc(100vh-180px)] overflow-y-auto p-2 rounded-md py-3">
                        {section !== "CycleTimeDetails" && (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {fields.filter(field => field.section === section).map((field, index) => (
                            <div key={index} className={`flex flex-col gap-1 mb-2 ${field.type === "custom" ? "col-span-2" : ""} ${field.visibility ? '' : 'hidden'} ${(field.name === "approvalAuthority" || field.name === "plotNumber") && region !== "GCC" ? "hidden" : ""} ${(field.name === "quoteNo") && initialData?.status === 'Draft' ? "hidden" : ""}`}>
                              <div className="flex justify-between items-center">
                                <div className="flex gap-2 items-center">
                                  {field.label && <Label>{field.label} {field.required && <span className="text-red-600">*</span>}</Label>}
                                  {field.addNew && <Label className="cursor-pointer text-blue-600  " onClick={() => openSecondaryDialog(field.label)}>Add New</Label>}

                                </div>
                                {field.addHelp && <Label className="cursor-pointer text-red-600  " onClick={() => { openSecondaryDialog(field?.title, field?.data); setIsHelp(true) }}>Help</Label>}
                              </div>

                              <div className=" flex gap-2 w-full">
                                <div className={`flex 
                                       ${field?.elementType &&
                                    ((field.name === 'industryType' && industryType === 'Others') ||
                                      (field.name === 'buildingType' && buildingType === 'Others') || (field.name === 'paintType' && paintType === 'Others') || (field.name === 'incoterm' && incotermDescription))
                                    ? 'w-1/3' : 'w-full'} duration-300`}>
                                  {renderField(field)}
                                </div>
                                {field?.elementType && <div className={`flex  ${field?.elementType &&
                                  ((field.name === 'industryType' && industryType === 'Others') ||
                                    (field.name === 'buildingType' && buildingType === 'Others') || (field.name === 'paintType' && paintType === 'Others') || (field.name === 'incoterm' && incotermDescription))
                                  ? 'w-2/3' : 'hidden'} duration-300`}>
                                  {renderField(field?.elementType, incotermDescription)}
                                </div>}

                              </div>

                            </div>
                          ))}
                        </div>)}

                        {/* Nested Tabs for CycleTimeDetails */}
                        {section === "CycleTimeDetails" && (
                          <div className=" flex flex-col h-full">
                            <Tabs defaultValue="ProposalOffer" className="h-full flex flex-col">
                              {/* Fixed Tabs */}
                              <div className="flex justify-between items-center gap-2">


                                <div className="flex items-center gap-2 w-5/6">
                                  <TabsList className="">
                                    <TabsTrigger value="ProposalOffer" width={"full"}>Proposal Offer</TabsTrigger>
                                    <TabsTrigger value="ProposalDrawing" width={"full"}>Proposal Drawing</TabsTrigger>
                                  </TabsList>

                                  <div className='pl-10 flex gap-2'>
                                    <label className='pt-[1px]'>
                                      <input
                                        className=''
                                        type="checkbox"
                                        checked={true}
                                        onChange={() => { }}
                                      />
                                    </label>



                                    <label className='' htmlFor="">Same details for proposal drawing</label>
                                  </div>
                                </div>
                                <div>
                                  {action === "Add" && <Button
                                    effect="expandIcon"
                                    className={`w-28 duration-300`}
                                  >
                                    Add Rev No
                                  </Button>}
                                </div>
                              </div>


                              {/* Scrollable Content */}
                              <div className="flex-1 overflow-y-auto p-2 bg-gray-100 rounded-md my-2 ">
                                {/* Proposal Offer Section */}
                                <TabsContent value="ProposalOffer">
                                  <div className="h-full overflow-y-auto px-2">
                                    {action !== 'Add' ? (
                                      proposalRevData.sort((a, b) => b.revNo - a.revNo).map((rev, revIndex) => (
                                        <div key={revIndex} className="mb-4 p-3 bg-white rounded-md shadow-md">
                                          <h3 className="text-base font-semibold mb-2">Proposal Offer - RevNo: R{rev.revNo}</h3>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {fields.filter(field => field.subSection === "ProposalOffer").map((field, index) => (
                                              <div key={index} className="flex flex-col gap-1 mb-2">
                                                <Label>{field.label} {field.required && <span className="text-red-600">*</span>}</Label>
                                                {renderField(field, '', 'ProposalOffer')}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="p-3 bg-white rounded-md shadow-md">
                                        <h3 className="text-base font-semibold mb-2">Rev No : R{formData.revNo}</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                          {fields.filter(field => field.subSection === "ProposalOffer").map((field, index) => (
                                            <div key={index} className="flex flex-col gap-1 mb-2">
                                              <Label>{field.label} {field.required && <span className="text-red-600">*</span>}</Label>
                                              {renderField(field, '', 'ProposalOffer')}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </TabsContent>

                                {/* Proposal Drawing Section */}
                                <TabsContent value="ProposalDrawing">
                                  <div className="h-full overflow-y-auto px-2">
                                    {action !== 'Add' ? (
                                      drawingRevData.sort((a, b) => b.revNumber - a.revNumber).map((rev, revIndex) => (
                                        <div key={revIndex} className="mb-4 p-3 bg-white rounded-md shadow-md">
                                          <h3 className="text-base font-semibold mb-2">Proposal Drawing - RevNo: R{rev.revNo}</h3>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {fields.filter(field => field.subSection === "ProposalDrawing").map((field, index) => (
                                              <div key={index} className="flex flex-col gap-1 mb-2">
                                                <Label>{field.label} {field.required && <span className="text-red-600">*</span>}</Label>
                                                {renderField(field, '', 'ProposalDrawing')}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="p-3 bg-white rounded-md shadow-md">
                                        <h3 className="text-base font-semibold mb-2">Rev No : R{formData.revNo}</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                          {fields.filter(field => field.subSection === "ProposalDrawing").map((field, index) => (
                                            <div key={index} className="flex flex-col gap-1 mb-2">
                                              <Label>{field.label} {field.required && <span className="text-red-600">*</span>}</Label>
                                              {renderField(field, '', 'ProposalDrawing')}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </TabsContent>
                              </div>
                            </Tabs>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </div>


          </div>
        </DialogContent>
      </Dialog>


      {/* Secondary Dialog */}
      <Dialog open={isSecondaryDialogOpen} onOpenChange={() => { setIsSecondaryDialogOpen(false); setIsHelp(false) }}>
        <DialogContent className={`max-w-full max-h-[90%] pointer-events-auto mx-2 h-[60%] sm:max-w-md lg:max-w-3xl ${isHelp && 'w-1/4 h-[65%]'}`}>
          <DialogTitle className={`${isHelp && 'hidden'}`}>{`Add ${secondaryDialogType}`}</DialogTitle>
          <div className="bg-white h-auto overflow-y-auto p-2 rounded-md ">
            <div className=" space-y-4   pr-2 pl-1 my-1 overflow-y-auto">

              {isHelp && <div >
                <div className="w-full font-semibold text-lg items-center justify-center flex pb-3">
                  {secondaryDialogType}
                </div>

                <div className="w-full flex justify-between font-semibold">
                  <div className="w-1/2">Name</div>
                  <div className="w-1/2">
                    Location
                  </div>
                </div>
                {approvalAuthorityData?.map((item) => (
                  <div key={item._id} className="text-sm w-full flex justify-between">
                    <div className="w-1/2 py-2">{item?.name}</div>
                    <div className="w-1/2 py-2">
                      {item?.location.map((loc) => (
                        <div key={loc?._id}>{loc?.name}</div>
                      ))}
                    </div>
                  </div>
                ))}

              </div>}
              {/* Use a responsive grid layout for form fields */}
              {!isHelp && <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 `}>

                {/* 1 column on small screens, 2 on large */}
                {secondaryFields.map((field, index) => (
                  <div key={index} className={`flex flex-col gap-1 mb-2 ${field.type === "custom" ? "col-span-2" : ""}`}>
                    <div className="flex gap-2 items-center">
                      {field.label && <Label>{field.label} {field.required && <span className="text-red-600">*</span>}</Label>}
                      {field.addNew && <Label className="cursor-pointer text-blue-600 " onClick={() => openNewDialog(field.label)}>Add New</Label>}
                    </div>
                    {
                      (() => {
                        switch (field.type) {
                          case "multiselect":

                            return (

                              <MultipleSelector
                                value={(formDataSecondary[field.name] || []).map((id) => ({
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
                                value={formDataSecondary[field.name] || ""}
                                placeholder={field.placeholder || ""}
                              />
                            );
                          case "select":
                            return (
                              <Combobox
                                field={field}
                                formData={formDataSecondary}
                                handleChange={handleChange}
                                placeholder={field.placeholder || ""}
                              />
                            );
                          case "date":
                            return (

                              <DatePicker
                                currentDate={formDataSecondary[field.name]}
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
                              <><field.CustomComponent accessData={formData[field.name]} /></>
                            )

                          default:
                            return (
                              <Input
                                type={field.type}
                                onChange={(e) => handleChange(e, field.name, field?.format)}
                                value={formDataSecondary[field.name] || ""}
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
              </div>}
            </div>
          </div>

          {!isHelp && <DialogFooter>
            <Button variant="secondary" onClick={() => { setIsSecondaryDialogOpen(false) }}>
              Cancel
            </Button>
            {action === "Add" && <Button onClick={()=>{handleSubmit('Form2', formDataSecondary)}}>Save</Button>}

          </DialogFooter>}
        </DialogContent>
      </Dialog>


      {/* new Dialog */}
      <Dialog open={isNewDialogOpen} onOpenChange={() => setIsNewDialogOpen(false)}>
        <DialogContent className={`max-w-full max-h-[90%] pointer-events-auto mx-2 h-[60%] sm:max-w-md lg:max-w-3xl`}>
          <DialogTitle>{`Add ${newDialogType}`}</DialogTitle>
          <div className="bg-white h-full overflow-y-auto p-2 rounded-md ">
            <div className=" space-y-4   pr-2 pl-1 my-1 overflow-y-auto">
              {/* Use a responsive grid layout for form fields */}
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 `}>

                {/* 1 column on small screens, 2 on large */}
                {newFields.map((field, index) => (
                  <div key={index} className={`flex flex-col gap-1 mb-2 ${field.type === "custom" ? "col-span-2" : ""}`}>
                    <div className="flex gap-2 items-center">
                      {field.label && <Label>{field.label} {field.required && <span className="text-red-600">*</span>}</Label>}
                      {field.addNew && <Label className="cursor-pointer text-blue-600  border-blue-500" >Add New</Label>}
                    </div>
                    {
                      (() => {
                        switch (field.type) {
                          case "multiselect":

                            return (

                              <MultipleSelector
                                value={(formDataNew[field.name] || []).map((id) => ({
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
                                value={formDataNew[field.name] || ""}
                                placeholder={field.placeholder || ""}
                              />
                            );
                          case "select":
                            return (
                              <Combobox
                                field={field}
                                formData={formDataNew}
                                handleChange={handleChange}
                                placeholder={field.placeholder || ""}
                              />
                            );
                          case "date":
                            return (

                              <DatePicker
                                currentDate={formDataNew[field.name]}
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
                              <><field.CustomComponent accessData={formDataNew[field.name]} /></>
                            )

                          default:
                            return (
                              <Input
                                type={field.type}
                                onChange={(e) => handleChange(e, field.name, field?.format)}
                                value={formDataNew[field.name] || ""}
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
            <Button variant="secondary" onClick={() => { setIsNewDialogOpen(false) }}>
              Cancel
            </Button>
            {action === "Add" && <Button onClick={()=>{handleSubmit('Form3', formDataNew)}}>Save</Button>}

          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>

  );
};

export default DynamicDialog;
