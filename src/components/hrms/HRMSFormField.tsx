'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, UploadIcon } from 'lucide-react';
import { format } from 'date-fns';
import { HRMSFormField as HRMSFormFieldType } from '@/types/hrms';
import { getValueByPath } from '@/utils/toSplit';
import { Combobox } from '../ui/ComboBoxWrapper';

interface HRMSFormFieldProps {
  field: HRMSFormFieldType;
  disabled?: boolean;
  data: any; // Adjust type as needed based on your data structure
}

export default function HRMSFormField({ field, disabled = false, data }: HRMSFormFieldProps) {
  console.log('HRMSFormField', field, data);
  const { control, formState: { errors }, watch } = useFormContext();
  // console.log('data', data)
  const error = errors[field.name];
  const watchedValues = watch();

  // Check if field should be shown based on dependencies
  const shouldShow = React.useMemo(() => {
    if (!field.showIf) return !field.hidden;
    return field.showIf(watchedValues) && !field.hidden;
  }, [field.showIf, field.hidden, watchedValues]);

  if (!shouldShow) return null;

  const generateTempId = () => {
    return Math.random().toString(36).substring(2, 9);
  }

  const renderField = () => {
    if (field.type === 'tempId') {
      console.log(`${field.name} is tempId`)
    }
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'tempId':
        return (
          <div>
            <Controller
              name={field.name}
              control={control}
              disabled={field?.disable}
              defaultValue={data?.[field.name] ?? getValueByPath(data, field.name) ?? ''}
              rules={{
                required: field.required ? `${field.label} is required` : false,
                pattern: field.validation?.pattern ? {
                  value: new RegExp(field.validation.pattern),
                  message: field.validation.message || 'Invalid format'
                } : undefined,
                minLength: field.validation?.minLength ? {
                  value: field.validation.minLength,
                  message: `Minimum ${field.validation.minLength} characters required`
                } : undefined,
                maxLength: field.validation?.maxLength ? {
                  value: field.validation.maxLength,
                  message: `Maximum ${field.validation.maxLength} characters allowed`
                } : undefined
              }}
              render={({ field: controllerField }) => (
                <Input
                  {...controllerField}
                  value={
                    controllerField.value ??
                    data?.[field.name] ??
                    getValueByPath(data, field.name) ??
                    ""
                  }
                  type={field.type}
                  placeholder={field.placeholder}
                  disabled={disabled || field?.disable}
                  className={cn(error && "border-destructive")}
                />
              )}
            />
          </div>
        );

      case 'number':
        return (
          <div>
            <Controller
              name={field.name}
              control={control}
              defaultValue={data?.[field.name] ?? getValueByPath(data, field.name) ?? ''}
              rules={{
                required: field.required ? `${field.label} is required` : false,
                min: field.validation?.min ? {
                  value: field.validation.min,
                  message: `${field.label} must be at least ${field.validation.min}`
                } : undefined,
                max: field.validation?.max ? {
                  value: field.validation.max,
                  message: `${field.label} must be no more than ${field.validation.max}`
                } : undefined
              }}
              render={({ field: controllerField }) => (
                <Input
                  {...controllerField}
                  value={
                    controllerField.value ??
                    data?.[field.name] ??
                    getValueByPath(data, field.name) ??
                    ""
                  }


                  type="number"
                  placeholder={field.placeholder}
                  disabled={disabled || field.disabled}
                  className={cn(error && "border-destructive")}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string or convert to number
                    controllerField.onChange(value === '' ? '' : Number(value));
                  }}
                />
              )}
            />
          </div>
        );

      case 'textarea':
        return (
          <div>
            <Controller
              name={field.name}
              control={control}
              defaultValue={data?.[field.name] ?? getValueByPath(data, field.name ?? '')}
              rules={{
                required: field.required ? `${field.label} is required` : false,
                minLength: field.validation?.min ? {
                  value: field.validation.min,
                  message: `${field.label} must be at least ${field.validation.min} characters`
                } : undefined,
                maxLength: field.validation?.max ? {
                  value: field.validation.max,
                  message: `${field.label} must be no more than ${field.validation.max} characters`
                } : undefined
              }}
              render={({ field: controllerField }) => (
                <Textarea
                  {...controllerField}
                  value={controllerField.value ?? getValueByPath(data, field.name) ?? ''}
                  placeholder={field.placeholder}
                  disabled={disabled || field.disabled}
                  className={cn(error && "border-destructive")}
                  rows={4}
                />
              )}
            />
          </div>
        );

      case 'select':
        const valueObject = getValueByPath(data, field.name); // safely gets the nested object
        console.log('valueObject', valueObject);
        const selectedValue = valueObject?._id || valueObject || "";
        console.log('selectedValue', selectedValue);
        return (
          <Controller
            name={field.name}
            control={control}
            defaultValue={data?.[field.name]?._id ?? ""} // Or getValueByPath()
            rules={{
              required: field.required ? `${field.label} is required` : false
            }}
            render={({ field: controllerField, fieldState }) => (
              <Combobox
                field={field}
                value={controllerField.value ?? ''}
                formData={{ [field?.name]: controllerField.value }}
                handleChange={(value: any) => controllerField.onChange(value)}
                placeholder={field.placeholder || `Select ${field.label}`}
                disabled={disabled || field?.disabled}
              />
            )}
          />
        );


      case 'checkbox':
        return (
          <div>
            <Controller
              name={field.name}
              control={control}
              defaultValue={data?.[field.name] || false}
              render={({ field: controllerField }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={field.name}
                    checked={controllerField.value || data?.[field.name] || false}
                    onCheckedChange={controllerField.onChange}
                    disabled={disabled || field.disabled}
                  />
                  <Label
                    htmlFor={field.name}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {field.label}
                  </Label>
                </div>
              )}
            />
          </div>
        );

      case 'radio':
        return (
          <div>
            <Controller
              name={field.name}
              control={control}
              defaultValue={data?.[field.name] || ""}
              rules={{
                required: field.required ? `${field.label} is required` : false
              }}
              render={({ field: controllerField }) => (
                <RadioGroup
                  onValueChange={controllerField.onChange}
                  value={controllerField.value || data?.[field.name] || ""}
                  disabled={disabled || field.disabled}
                  className="flex space-x-5"
                >
                  {field.options?.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`${field.name}-${option.value}`} />
                      <Label htmlFor={`${field.name}-${option.value}`} className="font-normal">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
          </div>
        );

      case 'date':
        return (
          <div>
            <Controller
              name={field.name}
              control={control}
              defaultValue={data?.[field.name] || getValueByPath(data, field.name) || ''}
              rules={{
                required: field.required ? `${field.label} is required` : false
              }}
              render={({ field: controllerField }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !controllerField.value && "text-muted-foreground",
                        error && "border-destructive"
                      )}
                      disabled={disabled || field.disabled}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {controllerField.value ? (
                        format(new Date(controllerField.value), "PPP")
                      ) : (
                        <span>{field.placeholder || `Pick a date`}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white" align="start">
                    <Calendar
                      mode="single"
                      selected={controllerField.value ? new Date(controllerField.value) : (data?.[field.name] ? new Date(data?.[field.name]) : (getValueByPath(data, field.name) ? new Date(getValueByPath(data, field.name)) : undefined))}
                      onSelect={(date) => controllerField.onChange(date?.toISOString())}
                      disabled={disabled || field.disabled}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>
        );

      case 'file':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{
              required: field.required ? `${field.label} is required` : false
            }}
            render={({ field: controllerField }) => {
              const selectedFile = controllerField.value; // This will be a File object or URL

              const fileName =
                selectedFile instanceof File
                  ? selectedFile.name
                  : selectedFile?.name || ""; // In case you pre-fill

              const fileUrl = data?.resumeUrl;
              console.log('url', fileUrl);
              return (
                <div className="flex items-center gap-2">
                  {/* Hidden native file input */}
                  <input
                    id={`file-${field.name}`}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      controllerField.onChange(file);
                    }}
                    disabled={disabled || field.disabled}
                  />

                  {/* Custom button to trigger file picker */}
                  <Button
                    className={`${field.disable && 'hidden'}`}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById(`file-${field.name}`).click()
                    }
                    disabled={disabled || field.disabled}
                  >
                    <UploadIcon className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>

                  {/* Display file name if available */}
                  {fileName && (
                    fileUrl ? (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline cursor-pointer"
                      >
                        {fileName}
                      </a>
                    ) : (
                      <span>{fileName}</span>
                    )
                  )}
                </div>
              );
            }}
          />
        );

      case 'array':
        const arrayData = getValueByPath(data, field.name) || field.defaultValue || [];
        console.log('field name', field.name, arrayData)
        if (field.name === 'rounds') {

          // Custom rendering for Interview Rounds
          return (
            <div className="space-y-3 ">
              {arrayData.map((item: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 shadow-sm">
                  {/* Round label */}
                  <Label className="font-semibold">Round {index + 1}</Label>

                  {/* Render subfields for this round */}
                  <div className="grid grid-cols-2 gap-4  pt-2">
                    {field.subFields?.map((sub) => (
                      <div key={sub.name} className="space-y-1">
                        <HRMSFormField
                          field={{
                            ...sub,
                            name: `${field.name}[${index}].${sub.name}`, // unique field path
                          }}
                          data={data}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        }

        // Default: assessment parameter layout
        return (
          <div className="border rounded-lg p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              {arrayData.map((item: any, index: number) => (
                <div key={index} className="flex flex-col gap-1">
                  <Label>{item.parameterName}</Label>
                  <Controller
                    name={`${field.name}[${index}].score`}
                    control={control}
                    defaultValue={item.score ?? ''}
                    rules={{
                      required: false,
                      max: `${field?.max}`,
                    }}
                    render={({ field: controllerField }) => (
                      <Input
                        {...controllerField}
                        type="number"
                        max={field?.max}
                        placeholder={field?.placeholder}
                      />
                    )}
                  />
                </div>
              ))}
            </div>
          </div>
        );




      default:
        return (
          <Input
            placeholder={`Unsupported field type: ${field.type}`}
            disabled
          />
        );
    }
  };

  // For checkbox, don't render separate label
  if (field.type === 'checkbox') {
    return (
      <div className="space-y-2">
        {renderField()}
        {error && (
          <p className="text-sm text-destructive">{error.message}</p>
        )}
      </div>
    );
  }
  console.log("Current form values:", watchedValues);

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name} className={cn("text-sm font-medium", field.required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
        {field.label}
      </Label>
      {renderField()}
      {error && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}
    </div>
  );
}