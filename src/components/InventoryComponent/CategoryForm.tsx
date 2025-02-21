"use client"

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ProductCategoryDocument } from '@/types';
import { useCreateProductCategoryMutation, useUpdateProductCategoryMutation, useGetProductCategoriesQuery } from '@/services/endpoints/inventoryApi';
import { Loader2, Plus, Trash2 } from 'lucide-react';

// Type for specification field
type SpecField = {
    name: string;
    type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'ENUM' | 'OBJECT' | 'ARRAY';
    unit?: string;
    enumValues?: string[];
    isRequired: boolean;
    defaultValue?: any;
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        minLength?: number;
        maxLength?: number;
    };
    nestedFields?: SpecField[];
};

// Validation schema for specification field
const specFieldSchema: z.ZodType<SpecField> = z.lazy(() => 
    z.object({
        name: z.string().min(1, 'Name is required'),
        type: z.enum(['STRING', 'NUMBER', 'BOOLEAN', 'DATE', 'ENUM', 'OBJECT', 'ARRAY']),
        unit: z.string().optional(),
        enumValues: z.array(z.string()).optional(),
        isRequired: z.boolean(),
        defaultValue: z.any().optional(),
        validation: z.object({
            min: z.number().optional(),
            max: z.number().optional(),
            pattern: z.string().optional(),
            minLength: z.number().optional(),
            maxLength: z.number().optional(),
        }).optional(),
        nestedFields: z.array(z.lazy(() => specFieldSchema)).optional(),
    })
);

// Validation schema for the entire form
const formSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    code: z.string().min(1, 'Code is required'),
    parent: z.string().optional(),
    description: z.string().optional(),
    specificationTemplate: z.object({
        fields: z.array(specFieldSchema)
    }),
    isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface CategoryFormProps {
    initialData?: ProductCategoryDocument | null;
    onSuccess?: () => void;
}

// Helper function to convert ObjectId to string
const convertObjectIdToString = (value: any): any => {
    if (value && typeof value === 'object' && typeof value.toString === 'function' && '_bsontype' in value) {
        return value.toString();
    }
    if (Array.isArray(value)) {
        return value.map(convertObjectIdToString);
    }
    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, val]) => [key, convertObjectIdToString(val)])
        );
    }
    return value;
};

export default function CategoryForm({ initialData, onSuccess }: CategoryFormProps) {
    const [createCategory, { isLoading: isCreating }] = useCreateProductCategoryMutation();
    const [updateCategory, { isLoading: isUpdating }] = useUpdateProductCategoryMutation();
    const { data: categories } = useGetProductCategoriesQuery({});

    // Filter out the current category and its children from parent options
    const parentOptions = categories?.filter(cat => 
        (!initialData || cat._id !== initialData._id)
    ) || [];

    // Convert initialData ObjectIds to strings for the form
    const formattedInitialData = initialData ? {
        ...initialData,
        parent: initialData.parent?.toString(),
        specificationTemplate: {
            fields: convertObjectIdToString(initialData.specificationTemplate?.fields || [])
        }
    } : {
        name: '',
        code: '',
        description: '',
        specificationTemplate: {
            fields: []
        },
        isActive: true
    };

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: formattedInitialData
    });

    const onSubmit = async (data: FormValues) => {
        try {
            if (initialData) {
                await updateCategory({
                    _id: initialData._id,
                    ...data
                }).unwrap();
            } else {
                await createCategory(data).unwrap();
            }
            onSuccess?.();
        } catch (error) {
            // Error will be handled by RTK Query
        }
    };

    const addSpecField = () => {
        const currentFields = form.getValues('specificationTemplate.fields');
        form.setValue('specificationTemplate.fields', [
            ...currentFields,
            {
                name: '',
                type: 'STRING',
                isRequired: false,
                validation: {}
            }
        ]);
    };

    const removeSpecField = (index: number) => {
        const currentFields = form.getValues('specificationTemplate.fields');
        form.setValue('specificationTemplate.fields', 
            currentFields.filter((_, i) => i !== index)
        );
    };

    const addEnumValue = (fieldIndex: number) => {
        const currentField = form.getValues(`specificationTemplate.fields.${fieldIndex}`);
        form.setValue(`specificationTemplate.fields.${fieldIndex}.enumValues`, [
            ...(currentField.enumValues || []),
            ''
        ]);
    };

    const removeEnumValue = (fieldIndex: number, valueIndex: number) => {
        const currentField = form.getValues(`specificationTemplate.fields.${fieldIndex}`);
        form.setValue(
            `specificationTemplate.fields.${fieldIndex}.enumValues`,
            currentField.enumValues?.filter((_, i) => i !== valueIndex) || []
        );
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Code</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="parent"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Parent Category</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a parent category" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="">None</SelectItem>
                                    {parentOptions.map((category) => (
                                        <SelectItem
                                            key={category._id?.toString()}
                                            value={category._id?.toString() || ''}
                                        >
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Active</FormLabel>
                                <FormDescription>
                                    Make this category active
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Specification Fields</h3>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addSpecField}
                            size="sm"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Field
                        </Button>
                    </div>

                    {form.watch('specificationTemplate.fields')?.map((field, index) => (
                        <div key={index} className="space-y-4 p-4 border rounded-lg">
                            <div className="flex justify-between items-center">
                                <h4 className="font-medium">Field {index + 1}</h4>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeSpecField(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name={`specificationTemplate.fields.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`specificationTemplate.fields.${index}.type`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="STRING">Text</SelectItem>
                                                    <SelectItem value="NUMBER">Number</SelectItem>
                                                    <SelectItem value="BOOLEAN">Boolean</SelectItem>
                                                    <SelectItem value="DATE">Date</SelectItem>
                                                    <SelectItem value="ENUM">Enum</SelectItem>
                                                    <SelectItem value="OBJECT">Object</SelectItem>
                                                    <SelectItem value="ARRAY">Array</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {field.type === 'NUMBER' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name={`specificationTemplate.fields.${index}.validation.min`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Minimum Value</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={e => field.onChange(e.target.valueAsNumber)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`specificationTemplate.fields.${index}.validation.max`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Maximum Value</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={e => field.onChange(e.target.valueAsNumber)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`specificationTemplate.fields.${index}.unit`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Unit</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="e.g., kg, cm, etc." />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {field.type === 'ENUM' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <FormLabel>Enum Values</FormLabel>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addEnumValue(index)}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Value
                                        </Button>
                                    </div>
                                    {field.enumValues?.map((_, valueIndex) => (
                                        <div key={valueIndex} className="flex gap-2">
                                            <FormField
                                                control={form.control}
                                                name={`specificationTemplate.fields.${index}.enumValues.${valueIndex}`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormControl>
                                                            <Input {...field} placeholder={`Value ${valueIndex + 1}`} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeEnumValue(index, valueIndex)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <FormField
                                control={form.control}
                                name={`specificationTemplate.fields.${index}.isRequired`}
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Required</FormLabel>
                                            <FormDescription>
                                                Make this field required
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    ))}
                </div>

                <div className="flex justify-end space-x-4">
                    <Button
                        type="submit"
                        disabled={isCreating || isUpdating}
                    >
                        {(isCreating || isUpdating) && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {initialData ? 'Update' : 'Create'} Category
                    </Button>
                </div>
            </form>
        </Form>
    );
}