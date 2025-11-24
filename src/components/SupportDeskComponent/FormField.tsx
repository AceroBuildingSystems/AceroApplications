'use client';

import React, { useEffect } from 'react';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
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
import { CustomCaption } from '../CustomerCaption';
import { DatePicker } from '../ui/date-picker';
import { request } from 'http';
import useUserAuthorised from '@/hooks/useUserAuthorised';
import { ComboboxMulti } from '../ui/ComboboxMulti';

interface FormFieldProps {
  field: HRMSFormFieldType;
  disabled?: boolean;
  data: any; // Adjust type as needed based on your data structure
  userlist: any
}

export default function FormField({ field, disabled = false, data, userlist }: FormFieldProps) {
  // console.log('HRMSFormField', field, data);
  let scoreSum = 0;
  const { user }: any = useUserAuthorised();
  const { control, formState: { errors }, watch, setValue } = useFormContext();
  console.log('userdata', data)
  const error = errors[field.name];
  const watchedValues = watch();

  const requestedByValue = useWatch({
    control,
    name: "requestedBy",
  });

  const otherAllowanceValue = useWatch({
    control,
    name: "employeeInfo.salaryDetails.otherAllowance",
  });
  const petrolCardValue = useWatch({
    control,
    name: "employeeInfo.salaryDetails.petrolCard",
  });

  const companyCarAllowValue = useWatch({
    control,
    name: "employeeInfo.salaryDetails.companyCarAllow",
  });

  const foodAllowanceValue = useWatch({
    control,
    name: "employeeInfo.salaryDetails.foodAllowance",
  });

  const mobileAllowanceValue = useWatch({
    control,
    name: "employeeInfo.salaryDetails.mobileAllowance",
  });

  const miscAllowanceValue = useWatch({
    control,
    name: "employeeInfo.salaryDetails.miscAllowance",
  });

  const transportAllowanceValue = useWatch({
    control,
    name: "employeeInfo.salaryDetails.transportAllowance",
  });

  const housingAllowanceValue = useWatch({
    control,
    name: "employeeInfo.salaryDetails.housingAllowance",
  });

  const basicSalaryValue = useWatch({
    control,
    name: "employeeInfo.salaryDetails.basic",
  });

  const employeeValue = useWatch({
    control,
    name: "employee",
  });

  const departmentValue = useWatch({
    control,
    name: "requestedDepartment",
  });

  useEffect(() => {

    setValue("employeeInfo.salaryDetails.totalSalary", (basicSalaryValue || 0) + (housingAllowanceValue || 0) + (transportAllowanceValue || 0) + (miscAllowanceValue || 0) + (mobileAllowanceValue || 0) + (foodAllowanceValue || 0) + (companyCarAllowValue || 0) + (petrolCardValue || 0) + (otherAllowanceValue || 0));

  }, [basicSalaryValue, housingAllowanceValue, transportAllowanceValue, miscAllowanceValue, mobileAllowanceValue, foodAllowanceValue, companyCarAllowValue, petrolCardValue, otherAllowanceValue, setValue]);

  // useEffect(() => {
  //   if (field.name === "requiredPosition") {
  //     setValue(field.name, ""); // clear selection
  //   }
  // }, [departmentValue, setValue]);



  // useEffect(() => {
  //   setValue("requiredPosition", ""); // Clear previous selection
  // }, [departmentValue, setValue]);

  useEffect(() => {

    if (requestedByValue) {
      // console.log('userlist', userlist)
      // requestedByValue can be the full object or just _id
      const selectedUser = userlist.find(u => u._id === requestedByValue);

      if (selectedUser) {
        // Update department with full department object or ID
        const departmentValue = selectedUser.department?._id || selectedUser.department || requestedDepartmentValue || "";
        setValue("requestedDepartment", departmentValue);
      }
    } else {
      // Clear department if requestedBy is cleared
      // setValue("requestedDepartment", "");
    }
  }, [requestedByValue, setValue]);

  useEffect(() => {

    if (employeeValue) {
      // console.log('userlist', userlist)
      // requestedByValue can be the full object or just _id
      const selectedUser = userlist.find(u => u._id === employeeValue);

      if (selectedUser) {
        // Update department with full department object or ID
        const departmentValue = selectedUser.recruitmentId?.department?._id || "";
        const designationValue = selectedUser.recruitmentId?.requiredPosition?._id || "";
        const workLocationValue = selectedUser.recruitmentId?.workLocation?._id || "";
        const reportingToValue = selectedUser.recruitmentId?.requestedBy?._id || "";
        const reportingDateValue = selectedUser?.expectedJoiningDate || undefined;
        // setValue("requestedDepartment", departmentValue);
        setValue("designation", designationValue);
        data?.workLocation ? setValue("workLocation", data?.workLocation) : setValue("workLocation", workLocationValue);

        data?.reportingTo ? setValue("reportingTo", data?.reportingTo) : setValue("reportingTo", reportingToValue);
        // data?.dateOfRequest ? setValue("dateOfRequest", data?.dateOfRequest) : setValue("dateOfRequest", new Date().toISOString());

        setValue("dateOfReporting", reportingDateValue);

      }
    } else {
      // Clear department if requestedBy is cleared
      // setValue("requestedDepartment", "");
      if (!requestedByValue) {
        // setValue("requestedDepartment", "");
        setValue("designation", "");
        setValue("workLocation", "");
        setValue("reportingTo", "");
        setValue("dateOfReporting", undefined);
      }

    }
  }, [employeeValue, userlist, setValue]);


  // Check if field should be shown based on dependencies
  const shouldShow = React.useMemo(() => {
    if (!field.showIf) return !field.hidden;
    return field.showIf(watchedValues) && !field.hidden;
  }, [field.showIf, field.hidden, watchedValues]);

  if (!shouldShow) return null;

  const generateTempId = () => {
    return Math.random().toString(36).substring(2, 9);
  };

  const MultiSelectCheckbox = ({ value = [], onChange, options = [], label }) => {
    console.log('options', options);
    const handleToggle = (id) => {
      const updated = value.includes(id)
        ? value.filter((item) => item !== id)
        : [...value, id];
      onChange(updated);
    };

    return (
      <div className="border border-gray-300 rounded p-2 space-y-2">
        {options.map((opt) => (
          <label
            key={opt._id}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={value.includes(opt._id)}
              onChange={() => handleToggle(opt._id)}
            />
            <span>{opt.name}</span>
          </label>
        ))}
        {options.length === 0 && (
          <span className="text-gray-400 text-sm">
            No users available
          </span>
        )}
      </div>
    );
  };


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

      case 'labeltext':
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
                  type='text'
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
        const valueObject = getValueByPath(data, field.name);
        const selectedValue = valueObject?._id || valueObject || "";

        const filteredOptions = React.useMemo(() => {
          if (field.name !== 'requiredPosition') return field.data;
          if (!departmentValue) return [];
          return field.data?.filter((pos: any) => pos.department?._id === departmentValue) || [];
        }, [departmentValue, field.options, field.name]);

        return (
          <Controller
            name={field.name}
            control={control}
            disabled={field?.disable}
            defaultValue={selectedValue}
            rules={{ required: field.required ? `${field.label} is required` : false }}
            render={({ field: controllerField }) => (
              <Combobox
                field={{ ...field, data: filteredOptions }}
                value={controllerField.value ?? ''}
                formData={{ [field?.name]: controllerField.value }}
                handleChange={controllerField.onChange}
                placeholder={
                  field.name === 'requiredPosition' && !departmentValue
                    ? 'Select department first'
                    : field.placeholder || `Select ${field.label}`
                }
                disabled={disabled || field?.disable || (field.name === 'requiredPosition' && !departmentValue)}
              />
            )}
          />
        );

      case 'multiSelect':
        const multiselectedValue = getValueByPath(data, field.name);
        console.log('multiselectedValue', field)
        const filteredOptionsMulti = React.useMemo(() => {
          return field.data;

        }, [field.options, field.name]);

        // Multi-select toggle handler
        const handleMultiSelectChange = (value, currentSelected) => {
          if (!Array.isArray(currentSelected)) currentSelected = [];
          const exists = currentSelected.includes(value);

          return exists
            ? currentSelected.filter((v) => v !== value)
            : [...currentSelected, value];
        };

        return (
          <Controller
            name={field.name}
            control={control}
            defaultValue={multiselectedValue}
            rules={{
              required: field.required ? `${field.label} is required` : false,
            }}
            render={({ field: controllerField }) => (
              <ComboboxMulti
                field={{ ...field, data: filteredOptionsMulti }}
                value={controllerField.value}
                formData={{ [field.name]: controllerField.value }}
                multiple={field.multiple} // ✅ key update
                handleChange={(value) => {
                  const updated = field.multiple
                    ? handleMultiSelectChange(value, controllerField.value)
                    : value;
                  controllerField.onChange(updated);
                }}
                placeholder={field.placeholder || `Select ${field.label}`}
                disabled={
                  disabled ||
                  field?.disable ||
                  (field.name === "requiredPosition" && !departmentValue)
                }
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
                <div className="flex  space-x-2">
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

      case 'checkbox-group':
        return (
          <div key={field.name} className="space-y-2">
            {/* <Label className="font-semibold">{field.label}</Label> */}

            {/* grid for checkboxes → 2 per row */}
            <div className={`grid grid-cols-1  gap-2 ${(field.name === 'itSoftwareAssets' || field.name === 'itHardwareAssets' || field.name === 'workplaceApps' || true) && 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2'}`}>
              {field.options?.map((opt: any) => (
                <Controller
                  key={opt.value}
                  name={field.name}
                  control={control}
                  defaultValue={data?.[field.name] || []}
                  render={({ field: controllerField }) => {
                    const selectedValues: string[] = controllerField.value || [];

                    const handleChange = (checked: boolean) => {
                      let newValues;
                      if (checked) {
                        newValues = [...selectedValues, opt.value];
                      } else {
                        newValues = selectedValues.filter((v) => v !== opt.value);
                        if (opt.value === "laptop") {
                          newValues = newValues.filter(
                            (v) => v !== "keyboard-mouse" && v !== "wireless-mouse"
                          );
                        }
                      }
                      controllerField.onChange(newValues);
                    };

                    return (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${field.name}_${opt.value}`}
                          checked={!selectedValues.includes('laptop') && (opt.value === 'keyboard-mouse' || opt.value === 'wireless-mouse') ? false : selectedValues.includes(opt.value)}
                          onCheckedChange={handleChange}
                          disabled={!selectedValues.includes('laptop') && (opt.value === 'keyboard-mouse' || opt.value === 'wireless-mouse') || disabled || field.disabled}
                        />
                        <Label
                          htmlFor={`${field.name}_${opt.value}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {opt.label}
                        </Label>
                      </div>
                    );
                  }}
                />
              ))}
            </div>
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

      case "date":
      case 'labeldate':
        return (
          <div>
            <Controller
              name={field.name}
              control={control}
              defaultValue={
                data?.[field.name] ||
                getValueByPath(data, field.name) ||
                ""
              }
              rules={{
                required: field.required
                  ? `${field.label} is required`
                  : false,
              }}
              render={({ field: controllerField, fieldState }) => (
                <div>
                  <DatePicker
                    currentDate={
                      controllerField.value
                        ? new Date(controllerField.value)
                        : undefined
                    }
                    placeholder={field.placeholder || "Pick a date"}
                    disabled={field.disable}
                    handleChange={(newDate: Date | undefined, setDate: any) => {
                      // update react-hook-form value
                      controllerField.onChange(
                        newDate ? newDate.toISOString() : ""
                      );
                      // also allow DatePicker to update its internal state
                      if (setDate) setDate(newDate);
                    }}
                  />

                  {fieldState.error && (
                    <p className="text-sm text-red-500 mt-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        );

      case "datetime":
        return (
          <div>
            <Controller
              name={field.name}
              control={control}
              defaultValue={
                data?.[field.name] ||
                getValueByPath(data, field.name) ||
                ""
              }
              rules={{
                required: field.required ? `${field.label} is required` : false,
              }}
              render={({ field: controllerField, fieldState }) => {
                const hasValue = Boolean(controllerField.value);

                // ✅ Convert ISO string (UTC) → local datetime string (YYYY-MM-DDTHH:mm)
                const formatDateTimeLocal = (value: string) => {
                  if (!value) return "";
                  const date = new Date(value);
                  const tzOffset = date.getTimezoneOffset() * 60000; // offset in ms
                  const localISOTime = new Date(date - tzOffset)
                    .toISOString()
                    .slice(0, 16); // keep only YYYY-MM-DDTHH:mm
                  return localISOTime;
                };

                return (
                  <div className="space-y-1">
                    <input
                      type="datetime-local"
                      placeholder="Select date & time"
                      value={formatDateTimeLocal(controllerField.value)}
                      onChange={(e) => controllerField.onChange(e.target.value)}
                      className={`border-2 border-gray-300 rounded-md h-9 px-2 w-full text-sm ${hasValue ? "text-black" : "text-gray-400"
                        } placeholder-gray-400`}
                      disabled={field.disable}
                    />

                    {fieldState.error && (
                      <p className="text-sm text-red-500">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                );
              }}
            />
          </div>
        );


      case "label":
        return (
          <div className='hidden'>

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

              let fileUrl = data?.resumeUrl;
              if (field.name === 'employeeInfo.visaInfo.attachVisa') {
                fileUrl = data?.employeeInfo?.visaInfo?.visaUrl;
              }
              if (field.name === 'employeeInfo.visaInfo.attachEmiratesId') {
                fileUrl = data?.employeeInfo?.visaInfo?.emiratesIdUrl;
              }
              if (field.name === 'employeeInfo.visaInfo.attachLaborCard') {
                fileUrl = data?.employeeInfo?.visaInfo?.laborCardUrl;
              }
              if (field.name === 'employeeInfo.visaInfo.attachIloe') {
                fileUrl = data?.employeeInfo?.visaInfo?.iloeUrl;
              }
              if (field.name === 'employeeInfo.ndaInfo.attachNda') {
                fileUrl = data?.employeeInfo?.ndaInfo?.ndaFormUrl;
              }
              if (field.name === 'employeeInfo.consentInfo.declaration.attachDeclaration') {
                fileUrl = data?.employeeInfo?.consentInfo?.declaration?.declarationFormUrl;
              }
              if (field.name === 'employeeInfo.beneficiaryInfo.declaration.attachBeneficiaryDeclaration') {
                fileUrl = data?.employeeInfo?.beneficiaryInfo?.declaration?.declarationFormUrl;
              }
              if (field.name === 'employeeInfo.uploadDocuments.attachEducationCertificates') {
                fileUrl = data?.employeeInfo?.uploadDocuments?.educationCertificatesUrl;
              }
              if (field.name === 'employeeInfo.uploadDocuments.attachVisitVisa') {
                fileUrl = data?.employeeInfo?.uploadDocuments?.visitVisaUrl;
              }
              if (field.name === 'employeeInfo.uploadDocuments.attachVisaCancellation') {
                fileUrl = data?.employeeInfo?.uploadDocuments?.cancellationVisaUrl;
              }
              if (field.name === 'employeeInfo.passport.attachPassport') {
                fileUrl = data?.employeeInfo?.passport?.passportUrl;
              }
              if (field.name === 'passportInfo.attachPassport') {
                fileUrl = data?.passportInfo?.passportUrl;
              }
              if (field.name === 'offerLetterUrl') {
                fileUrl = data?.offerUrl;
              }

              if (field.name === 'uploadDocuments.attachVisitVisa') {
                fileUrl = data?.uploadDocuments?.visitVisaUrl;
              }
              if (field.name === 'uploadDocuments.attachVisaCancellation') {
                fileUrl = data?.uploadDocuments?.cancellationVisaUrl;
              }
              if (field.name === 'uploadDocuments.passportSizePhoto') {
                fileUrl = data?.uploadDocuments?.passportSizePhotoUrl;
              }
              if (field.name === 'uploadDocuments.attachEducationCertificates') {
                fileUrl = data?.uploadDocuments?.educationCertificatesUrl;
              }

              console.log('url', fileUrl);
              return (
                <div className="flex items-center gap-2">
                  {/* Hidden native file input */}
                  <input
                    id={`file-${field.name}`}
                    type="file"
                    className="hidden"
                    multiple={field.multiple || false}
                    accept={field.accept || ".pdf"}
                    onChange={(e) => {
                      const files = e.target.files;
                      if (!files) return;

                      if (field.multiple) {
                        controllerField.onChange(Array.from(files)); // 👈 save all files
                      } else {
                        controllerField.onChange(files[0]); // 👈 save single file
                      }
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
                  {selectedFile && (
                    Array.isArray(selectedFile) ? (
                      <span>
                        {Array.isArray(fileUrl) && fileUrl.length > 0 ? (
                          // Case 2: pre-filled URLs from backend
                          fileUrl.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline cursor-pointer mr-4"
                            >
                              {url.split('/').pop()}
                            </a>

                          ))
                        ) : selectedFile.length > 0 ? (
                          // Case 1: selected files (new uploads)
                          selectedFile.map((file) =>
                            file instanceof File ? file.name : file?.name || ""
                          ).join(", ")
                        ) : (
                          // Case 3: nothing selected or empty
                          <span>No file</span>
                        )}
                      </span>
                    ) : (
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
                    )
                  )}

                </div>
              );
            }}
          />
        );

      case "handover":
        // Get the array data from form state or default
        const handoverData: any[] = getValueByPath(data, field.name) || field.defaultValue || [];

        // Watch all fields
        const watchedHandover: any[] = watch(field.name) || [];
        const userDepartment = user?.department?.name;

        return (
          <div className="bg-white p-4 rounded-md shadow">
            {/* Header Row */}
            <div className="grid grid-cols-[20px_180px_1fr_230px_140px] gap-4 items-center border-b border-gray-300 pb-2 font-bold text-sm text-gray-800">
              <div className="text-center">S.No</div>
              <div className="text-center">Department</div>
              <div className="text-center">Task Description</div>
              <div className="text-center">Handover Remarks</div>
              <div className="text-center">Signature</div>
            </div>

            {handoverData?.map((dept, index) => {
              const isUserDept = dept.department?.toLowerCase() === userDepartment?.toLowerCase();
              return (
                <div key={index} className=" mb-2 mt-2">
                  {dept.taskDescription.map((task: string, tIndex: number) => (
                    <div
                      key={tIndex}
                      className={`grid grid-cols-[20px_180px_1fr_230px_140px] gap-4 items-start py-2 px-2 ${tIndex !== dept.taskDescription.length - 1 ? "" : "border-b border-gray-100 pb-6"
                        }`}
                    >
                      {/* S.No (only on first task of the department) */}
                      <div className="text-center font-bold text-sm">
                        {tIndex === 0 ? index + 1 : ""}
                      </div>

                      {/* Department (only on first task of the department) */}
                      <div className="font-bold text-sm">
                        {tIndex === 0 ? dept.department : ""}
                      </div>

                      {/* Task Description */}
                      <div className="text-sm text-gray-700 break-words">
                        • {task?.description}
                      </div>

                      {/* Handover Remarks */}
                      <Controller
                        name={`${field.name}[${index}].taskDescription[${tIndex}].remarks`}
                        control={control}
                        render={({ field: rField }) => (
                          <Input
                            {...rField}
                            value={rField.value ?? ""}
                            placeholder="Remarks"
                            className="w-full rounded px-2 py-1 text-sm"
                            readOnly={!isUserDept}
                          />
                        )}
                      />

                      {/* Signature */}
                      <Controller
                        name={`${field.name}[${index}].taskDescription[${tIndex}].signature`}
                        control={control}
                        render={({ field: sField }) => (
                          <Input
                            {...sField}
                            value={sField.value ?? ""}
                            placeholder="Signature"
                            className="w-full rounded px-2 py-1 text-sm"
                            readOnly={!isUserDept}
                          />
                        )}
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        );





      case "evaluation":
        // Get the array data from form state or default
        const evalData: any[] = getValueByPath(data, field.name) || field.defaultValue || [];

        // Watch only scores (react-hook-form tracks them)
        const watchedScores: any[] = watch(field.name) || [];

        // Calculate total score from scores array
        const totalScore = watchedScores.reduce(
          (sum, val) => sum + (Number(val?.score) || 0),
          0
        );
        // Calculate total score dynamically from watched values
        // const watchedEvalData: any[] = watch(field.name) || evalData;
        // const totalScore = watchedEvalData.reduce((sum, param) => sum + (Number(param.score) || 0), 0);

        return (
          <div className="space-y-4 bg-white p-4 rounded-md shadow">
            {/* Header Row */}
            <div className="flex items-center gap-4 border-b border-gray-300 pb-2 font-bold text-sm text-gray-800">
              <div className="w-10 text-center">S.No</div>
              <div className="flex-1 pr-4">Parameters</div>
              <div className="w-32 text-center">Ratings</div>
            </div>

            {evalData.map((param, index) => {
              const isLast = index === evalData.length - 1;
              return (
                <div
                  key={index}
                  className={`flex items-start gap-4 pb-2 ${!isLast ? "border-b border-gray-200" : ""}`}
                >
                  {/* S.No */}
                  <div className="w-10 text-center font-bold text-sm">{index + 1}</div>

                  {/* Parameter Title + Description */}
                  <div className="flex-1 pr-4">
                    <div className="font-bold text-sm">{param.parameterName}</div>
                    <div className="text-gray-700">{param.description}</div>
                  </div>

                  {/* Score Input */}
                  <div className="w-32">
                    <Controller
                      name={`${field.name}[${index}].score`}
                      control={control}
                      defaultValue={watchedScores[index]?.score ?? ""}
                      rules={{
                        required: false,
                        min: 1,
                        max: field?.max ?? 5,
                      }}
                      render={({ field: controllerField }) => (
                        <Input
                          {...controllerField}
                          type="number"
                          min={1}
                          max={field?.max ?? 5}
                          placeholder={field?.placeholder ?? "Enter 1-5"}
                          className="w-full text-center rounded px-2 py-1"
                        />
                      )}
                    />
                  </div>
                </div>
              );
            })}

            {/* Total Score Row */}
            <div className="flex items-center gap-4 border-t border-gray-300 pt-2 font-bold text-sm">
              <div className="w-10 text-center"></div>
              <div className="flex-1">Total Score</div>
              <div className="w-20 text-center">{totalScore}</div>
            </div>

            {/* Guidelines for Evaluation */}
            <div className=" p-3 rounded-md border border-gray-200">
              {/* Heading Row */}
              <div className="flex items-center justify-between mb-2 font-semibold text-gray-800 text-sm">
                <div className="w-20 text-left">Ratings</div>
                <div className="flex-1 text-center">Guidelines for Evaluation</div>
              </div>

              {/* Guidelines List */}
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex gap-10">
                  <span className="w-12  text-center">5</span>
                  <span className="flex-1"><span className="font-bold">Exceptional:</span> Performance and results achieved always exceed the standards and expectations for the position requirements and objectives.</span>
                </li>
                <li className="flex gap-10">
                  <span className="w-12  text-center">4</span>
                  <span className="flex-1"><span className="font-bold">Exceeds Expectations:</span> Performance and results achieved consistently exceed expectations for the position requirements and objectives.</span>
                </li>
                <li className="flex gap-10">
                  <span className="w-12  text-center">3</span>
                  <span className="flex-1"><span className="font-bold">Meets Expectations:</span> Performance and results generally meet the expectations for the position requirements and objectives. Performance requires normal degree of supervision.</span>
                </li>
                <li className="flex gap-10">
                  <span className="w-12  text-center">2</span>
                  <span className="flex-1"><span className="font-bold">Below Expectations:</span> Performance and results achieved generally do not meet established objectives. Performance requires more than normal degree of supervision.</span>
                </li>
                <li className="flex gap-10">
                  <span className="w-12  text-center">1</span>
                  <span className="flex-1"><span className="font-bold">Unsatisfactory:</span> Performance and results achieved consistently do not meet established objectives.</span>
                </li>
              </ul>
            </div>

            {/* Guidelines for Evaluation */}
            <div className=" p-3 rounded-md border border-gray-200">
              {/* Heading Row */}
              <div className="flex items-center justify-between mb-2 font-semibold text-gray-800 text-sm">
                <div className="w-20 text-left">S.No</div>
                <div className="w-40 text-center">Range</div>
                <div className="w-36 text-center">Ranking</div>
                <div className="flex-1 text-center">Performance Level</div>
              </div>

              {/* Guidelines List */}
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex gap-10">
                  <span className="w-8  text-center">1</span>
                  <span className="w-40 pl-4  text-center">46 - 50</span>
                  <span className="w-16  text-center">A</span>
                  <span className="flex-1 text-center">Excellet</span>
                </li>
                <li className="flex gap-10">
                  <span className="w-8  text-center">2</span>
                  <span className="w-40 pl-4  text-center">41 - 45</span>
                  <span className="w-16  text-center">B</span>
                  <span className="flex-1 text-center">Good</span>
                </li>
                <li className="flex gap-10">
                  <span className="w-8  text-center">3</span>
                  <span className="w-40 pl-4  text-center">36 - 40</span>
                  <span className="w-16  text-center">C</span>
                  <span className="flex-1 text-center">Fair</span>
                </li>
                <li className="flex gap-10">
                  <span className="w-8  text-center">4</span>
                  <span className="w-40 pl-4  text-center">30 - 35</span>
                  <span className="w-16  text-center">D</span>
                  <span className="flex-1 text-center">Satisfactory</span>
                </li>
                <li className="flex gap-10">
                  <span className="w-8  text-center">5</span>
                  <span className="w-40 pl-4  text-center">Below 30</span>
                  <span className="w-16  text-center">E</span>
                  <span className="flex-1 text-center">Not eligible for employment, increment, promotion</span>
                </li>

              </ul>
            </div>


          </div>
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
        };


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
      {!(field.type === 'labeltext' || field.type === 'labeldate') && (
        <div className="text-sm font-medium">
          {/** Split the label into lines */}
          {(() => {
            const lines = field.label.split('\n').map(line => line.trim()).filter(Boolean);
            const firstLine = lines[0] || '';
            const listItems = lines.slice(1).map(line => line.replace(/^•\s*/, '')); // remove leading bullet if exists
            return (
              <>
                <div>{firstLine} <span className="text-red-600">{field.required && '*'}</span></div>
                {listItems.length > 0 && (
                  <ul className="list-disc ml-8 mt-1">
                    {listItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                )}
              </>
            );
          })()}
        </div>
      )}

      {renderField()}
      {error && field.type !== 'date' && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}
    </div>
  );
}