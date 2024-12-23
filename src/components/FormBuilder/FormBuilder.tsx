"use client";

import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  TrashIcon,
  Bars3Icon,
  PlusCircleIcon,
  MinusCircleIcon,
  PrinterIcon,
} from "@heroicons/react/24/outline";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, GripVertical, MinusCircle, Printer, Trash2 } from "lucide-react";
import { PlusCircle } from "lucide-react";

import { Layout } from './Layout';
// Define drag item types
const ItemTypes = {
  FIELD: "field",
};

// Sidebar draggable items (unchanged)
const SidebarItem = ({ name, type }) => {
    const [, drag] = useDrag(() => ({
      type: ItemTypes.FIELD,
      item: { type, name, fromSidebar: true },
    }));
  
    return (
      <div
        ref={drag}
        className="p-2 mb-2 bg-secondary text-secondary-foreground rounded-md cursor-move hover:bg-secondary/80 transition-colors"
      >
        {name}
      </div>
    );
  };

// Multi-Option Field (unchanged)
const MultiOptionField = ({ options, updateOptions, preview = false }) => {
    const handleAddOption = () =>
      updateOptions([...options, `Option ${options.length + 1}`]);
  
    const handleRemoveOption = (index) => {
      const updatedOptions = options.filter((_, i) => i !== index);
      updateOptions(updatedOptions);
    };
  
    const handleEditOption = (index, value) => {
      const updatedOptions = [...options];
      updatedOptions[index] = value;
      updateOptions(updatedOptions);
    };
  
    if (preview) {
      return (
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox id={`option-${index}`} disabled />
              <Label htmlFor={`option-${index}`}>{option}</Label>
            </div>
          ))}
        </div>
      );
    }
  
    return (
      <div className="space-y-2">
        <Label>Options:</Label>
        {options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Input
              type="text"
              value={option}
              onChange={(e) => handleEditOption(index, e.target.value)}
              className="flex-1"
            />
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleRemoveOption(index)}
            >
              <MinusCircle className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button onClick={handleAddOption} variant="secondary" className="w-full">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Option
        </Button>
      </div>
    );
  };
// Form Field Component (unchanged)
const FormField = ({ field, index, moveField, updateField, deleteField, preview = false }) => {
    let dragDropProps = {};
    
    if (!preview) {
      const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.FIELD,
        item: { index, fromSidebar: false },
        collect: (monitor) => ({
          isDragging: !!monitor.isDragging(),
        }),
      }));
  
      const [, drop] = useDrop({
        accept: ItemTypes.FIELD,
        hover: (draggedItem) => {
          if (draggedItem.fromSidebar) return;
          if (draggedItem.index !== undefined && draggedItem.index !== index) {
            moveField(draggedItem.index, index);
            draggedItem.index = index;
          }
        },
      });
  
      dragDropProps = {
        ref: (node) => drag(drop(node)),
        className: `relative p-4 mb-4 bg-card text-card-foreground rounded-lg shadow-sm ${
          isDragging ? "opacity-50" : "opacity-100"
        }`,
      };
    } else {
      dragDropProps = {
        className: "mb-6",
      };
    }
  
    const handleFieldChange = (updates) =>
      updateField(index, { ...field, ...updates });
  
    const renderField = () => {
      const commonProps = preview ? { disabled: true } : {};
  
      return (
        <>
          {!preview && (
            <div className="absolute top-2 right-2 flex space-x-2">
              <Button
                variant="destructive"
                size="icon"
                onClick={() => deleteField(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon" className="cursor-move">
                <GripVertical className="h-4 w-4" />
              </Button>
            </div>
          )}
  
          <Label className={`block ${preview ? 'text-sm font-medium mb-1' : 'mb-2 font-bold'}`}>
            {preview ? (
              <span>{field.label || "New Field"}</span>
            ) : (
              <Input
                type="text"
                value={field.label || "New Field"}
                onChange={(e) => handleFieldChange({ label: e.target.value })}
                className="w-full"
                placeholder="Field Label"
              />
            )}
          </Label>
  
          {field.type === "TextInput" && (
            <Input
              type="text"
              placeholder={field.placeholder || "Enter text"}
              onChange={(e) => !preview && handleFieldChange({ placeholder: e.target.value })}
              {...commonProps}
            />
          )}
  
          {field.type === "TextArea" && (
            <Textarea
              placeholder={field.placeholder || "Enter text"}
              onChange={(e) => !preview && handleFieldChange({ placeholder: e.target.value })}
              {...commonProps}
            />
          )}
  
          {field.type === "RichText" && (
            preview ? (
              <div dangerouslySetInnerHTML={{ __html: field.value || "" }} />
            ) : (
              <ReactQuill
                theme="snow"
                value={field.value || ""}
                onChange={(value) => !preview && handleFieldChange({ value })}
                readOnly={preview}
              />
            )
          )}
  
          {field.type === "CheckboxGroup" && (
            <MultiOptionField
              options={field.options || []}
              updateOptions={(options) => handleFieldChange({ options })}
              preview={preview}
            />
          )}
  
          {field.type === "RadioGroup" && (
            <RadioGroup
              onValueChange={(value) => !preview && handleFieldChange({ value })}
              defaultValue={field.value}
              {...commonProps}
            >
              {(field.options || []).map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`radio-${index}`} />
                  <Label htmlFor={`radio-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
  
          {field.type === "Dropdown" && (
            <Select
              onValueChange={(value) => !preview && handleFieldChange({ value })}
              defaultValue={field.value}
              {...commonProps}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {(field.options || []).map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
  
          {field.type === "DatePicker" && (
            <Input
              type="date"
              onChange={(e) => !preview && handleFieldChange({ value: e.target.value })}
              {...commonProps}
            />
          )}
  
          {field.type === "FileUpload" && (
            <Input
              type="file"
              onChange={(e) => !preview && handleFieldChange({ value: e.target.files[0] })}
              {...commonProps}
            />
          )}
  
          {field.type === "Slider" && (
            <Slider
              defaultValue={[50]}
              max={100}
              step={1}
              onValueChange={(value) => !preview && handleFieldChange({ value: value[0] })}
              {...commonProps}
            />
          )}
        </>
      );
    };
  
    return <Card {...dragDropProps}><CardContent>{renderField()}</CardContent></Card>;
  };
  
// Updated FormCanvas to work with current page
const FormCanvas = ({ formFields, setFormFields, currentPage }) => {
    const [, drop] = useDrop({
      accept: ItemTypes.FIELD,
      drop: (item) => {
        if (item.fromSidebar) {
          addField(item.type, item.name);
        }
      },
    });
  
    const addField = (type, name) => {
      setFormFields((pages) => {
        const updatedPages = [...pages];
        updatedPages[currentPage] = [
          ...updatedPages[currentPage],
          { id: Date.now(), type, label: name || "New Field", options: [] },
        ];
        return updatedPages;
      });
    };
  
    const moveField = (fromIndex, toIndex) => {
      if (fromIndex === toIndex) return;
      setFormFields((pages) => {
        const updatedPages = [...pages];
        const updatedFields = [...updatedPages[currentPage]];
        const [movedField] = updatedFields.splice(fromIndex, 1);
        updatedFields.splice(toIndex, 0, movedField);
        updatedPages[currentPage] = updatedFields;
        return updatedPages;
      });
    };
  
    const deleteField = (index) => {
      setFormFields((pages) => {
        const updatedPages = [...pages];
        updatedPages[currentPage] = updatedPages[currentPage].filter((_, i) => i !== index);
        return updatedPages;
      });
    };
  
    const updateField = (index, updatedField) => {
      setFormFields((pages) => {
        const updatedPages = [...pages];
        const updatedFields = [...updatedPages[currentPage]];
        updatedFields[index] = updatedField;
        updatedPages[currentPage] = updatedFields;
        return updatedPages;
      });
    };
  
    return (
      <div
        ref={drop}
        className="w-full h-[80vh] border-dashed border-2 p-4 bg-gray-50 overflow-auto"
      >
        {formFields[currentPage].length === 0 ? (
          <p className="text-gray-400 text-center">Drag fields here...</p>
        ) : (
          formFields[currentPage].map((field, index) => (
            <FormField
              key={field.id}
              index={index}
              field={field}
              moveField={moveField}
              updateField={updateField}
              deleteField={deleteField}
            />
          ))
        )}
      </div>
    );
  };
  
  const PageManager = ({ pages, currentPage, setCurrentPage, addPage, removePage }) => {
    return (
      <div className="flex items-center space-x-2 mb-4">
        {pages.map((_, index) => (
          <Button
            key={index}
            variant={currentPage === index ? "default" : "outline"}
            onClick={() => setCurrentPage(index)}
          >
            Page {index + 1}
          </Button>
        ))}
        <Button variant="outline" onClick={addPage}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Page
        </Button>
        {pages.length > 1 && (
          <Button variant="outline" onClick={removePage}>
            <MinusCircle className="h-4 w-4 mr-2" />
            Remove Page
          </Button>
        )}
      </div>
    );
  };
  
  // Update the FormPreview component
  const FormPreview = ({ formFields }) => {
    const [currentPage, setCurrentPage] = useState(0);
  
    const renderField = (field) => {
      switch (field.type) {
        case "TextInput":
          return (
            <div className="border-b border-gray-300 py-2">
              {field.value || "________________"}
            </div>
          );
        case "TextArea":
          return (
            <div className="border border-gray-300 h-24 py-2">
              {field.value || ""}
            </div>
          );
        case "RichText":
          return (
            <div className="border border-gray-300 min-h-[100px] py-2" dangerouslySetInnerHTML={{ __html: field.value || "" }} />
          );
        case "CheckboxGroup":
        case "RadioGroup":
          return (
            <div className="space-y-1">
              {(field.options || []).map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-4 h-4 border border-gray-300">{field.value === option ? '✓' : ''}</div>
                  <span>{option}</span>
                </div>
              ))}
            </div>
          );
        case "Dropdown":
          return (
            <div className="border-b border-gray-300 py-2">
              {field.value || "Select an option"}
            </div>
          );
        case "DatePicker":
          return (
            <div className="border-b border-gray-300 py-2">
              {field.value || "MM/DD/YYYY"}
            </div>
          );
        case "FileUpload":
          return (
            <div className="border-b border-gray-300 py-2">
              {field.value ? "File selected" : "No file selected"}
            </div>
          );
        case "Slider":
          return (
            <div className="flex items-center space-x-2">
              <div className="w-full bg-gray-200 h-2">
                <div className="bg-gray-600 h-full" style={{ width: `${field.value || 50}%` }}></div>
              </div>
              <span>{field.value || 50}</span>
            </div>
          );
        default:
          return null;
      }
    };
  
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg print:shadow-none">
        {formFields.map((page, pageIndex) => (
          <div key={pageIndex} className={cn(pageIndex === currentPage ? "" : "hidden", "mb-8 print:mb-0 print:block")}>
            <h2 className="text-2xl font-semibold mb-6 print:text-xl">Page {pageIndex + 1}</h2>
            <div className="space-y-6">
              {page.map((field) => (
                <div key={field.id} className="print:mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1 print:text-xs">
                    {field.label || "Untitled Field"}
                  </label>
                  {renderField(field)}
                </div>
              ))}
            </div>
            {pageIndex < formFields.length - 1 && <div className="print:break-after-page" />}
          </div>
        ))}
        <div className="flex justify-between mt-6 print:hidden">
          <Button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous Page
          </Button>
          <Button
            onClick={() => setCurrentPage(Math.min(formFields.length - 1, currentPage + 1))}
            disabled={currentPage === formFields.length - 1}
          >
            Next Page
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };
  
  // Update the main FormBuilderPage component
  export default function FormBuilderPage() {
    const [formFields, setFormFields] = useState([[]]);
    const [currentPage, setCurrentPage] = useState(0);
    const [showPreview, setShowPreview] = useState(false);
  
    const handlePrint = () => {
      setShowPreview(true);
      setTimeout(() => {
        window.print();
        setShowPreview(false);
      }, 100);
    };
  
    const addPage = () => {
      setFormFields([...formFields, []]);
      setCurrentPage(formFields.length);
    };
  
    const removePage = () => {
      if (formFields.length > 1) {
        const newFormFields = formFields.filter((_, index) => index !== currentPage);
        setFormFields(newFormFields);
        setCurrentPage(Math.min(currentPage, newFormFields.length - 1));
      }
    };
  
    if (showPreview) {
      return <FormPreview formFields={formFields} />;
    }
  
    return (
      <DndProvider backend={HTML5Backend}>
        <div className="flex h-screen bg-background text-foreground">
          <div className="w-1/4 p-4 bg-muted border-r border-border">
            <h2 className="text-xl font-bold mb-4">Components</h2>
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="space-y-2">
                <SidebarItem name="Text Input" type="TextInput" />
                <SidebarItem name="Text Area" type="TextArea" />
                <SidebarItem name="Rich Text" type="RichText" />
                <SidebarItem name="Checkbox Group" type="CheckboxGroup" />
                <SidebarItem name="Radio Group" type="RadioGroup" />
                <SidebarItem name="Dropdown" type="Dropdown" />
                <SidebarItem name="Date Picker" type="DatePicker" />
                <SidebarItem name="File Upload" type="FileUpload" />
                <SidebarItem name="Slider" type="Slider" />
              </div>
            </ScrollArea>
          </div>
          <div className="flex-1 p-4 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Form Builder</h2>
              <Button onClick={handlePrint} className="flex items-center">
                <Printer className="h-4 w-4 mr-2" />
                Print Preview
              </Button>
            </div>
            <PageManager
              pages={formFields}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              addPage={addPage}
              removePage={removePage}
            />
            <FormCanvas
              formFields={formFields}
              setFormFields={setFormFields}
              currentPage={currentPage}
            />
          </div>
        </div>
      </DndProvider>
    );
  }
  

