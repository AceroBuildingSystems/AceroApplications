"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useGetProductCategoriesQuery, useGetWarehousesQuery } from '@/services/endpoints/inventoryApi';
import { Loader2 } from 'lucide-react';

interface ProductFormProps {
    type: 'INVENTORY' | 'ASSET';
    initialData?: any;
    onSubmit: (data: any) => void;
    isSubmitting?: boolean;
}

export default function ProductForm({ type, initialData, onSubmit, isSubmitting }: ProductFormProps) {
    const { data: categories = [], isLoading: categoriesLoading } = useGetProductCategoriesQuery({});
    const { data: warehouses = [], isLoading: warehousesLoading } = useGetWarehousesQuery({});
    const [selectedCategory, setSelectedCategory] = useState<any>(null);

    // Create dynamic form schema based on type and specifications
    const createFormSchema = () => {
        const baseSchema = {
            code: z.string().min(1, 'Code is required'),
            name: z.string().min(1, 'Name is required'),
            category: z.string().min(1, 'Category is required'),
            description: z.string().optional(),
            isActive: z.boolean().default(true),
        };

        const inventoryFields = type === 'INVENTORY' ? {
            minQuantity: z.number().min(0, 'Minimum quantity must be 0 or greater'),
            availableQuantity: z.number().min(0, 'Available quantity must be 0 or greater'),
            warehouse: z.string().min(1, 'Warehouse is required'),
        } : {};

        const specificationFields = selectedCategory?.specificationTemplate?.fields?.reduce((acc: any, field: any) => {
            const fieldSchema = (() => {
                switch (field.type) {
                    case 'NUMBER':
                        let numberSchema = z.number();
                        if (field.validation?.min !== undefined) {
                            numberSchema = numberSchema.min(field.validation.min);
                        }
                        if (field.validation?.max !== undefined) {
                            numberSchema = numberSchema.max(field.validation.max);
                        }
                        return field.isRequired ? numberSchema : numberSchema.optional();
                    case 'ENUM':
                        return field.isRequired 
                            ? z.enum(field.enumValues as [string, ...string[]])
                            : z.enum(field.enumValues as [string, ...string[]]).optional();
                    default:
                        return field.isRequired ? z.string().min(1) : z.string().optional();
                }
            })();
            return { ...acc, [`spec_${field.name}`]: fieldSchema };
        }, {}) || {};

        return z.object({
            ...baseSchema,
            ...inventoryFields,
            ...specificationFields,
        });
    };

    const form = useForm({
        resolver: zodResolver(createFormSchema()),
        defaultValues: {
            code: initialData?.code || '',
            name: initialData?.name || '',
            category: initialData?.category?._id || '',
            description: initialData?.description || '',
            isActive: initialData?.isActive ?? true,
            minQuantity: initialData?.inventory?.minQuantity || 0,
            availableQuantity: initialData?.inventory?.availableQuantity || 0,
            warehouse: initialData?.inventory?.warehouse?._id || '',
            ...initialData?.specifications,
        },
    });

    // Update form schema when category changes
    useEffect(() => {
        if (form.watch('category')) {
            const category = categories.find(c => c._id === form.watch('category'));
            setSelectedCategory(category);
            form.clearErrors();
        }
    }, [form.watch('category'), categories]);

    const handleSubmit = (data: any) => {
        // Extract specification fields
        const specifications = Object.entries(data).reduce((acc: any, [key, value]) => {
            if (key.startsWith('spec_')) {
                acc[key.replace('spec_', '')] = value;
            }
            return acc;
        }, {});

        const formattedData = {
            ...data,
            type,
            specifications,
            ...(type === 'INVENTORY' && {
                inventory: {
                    minQuantity: data.minQuantity,
                    availableQuantity: data.availableQuantity,
                    warehouse: data.warehouse,
                },
            }),
        };

        onSubmit(formattedData);
    };

    if (categoriesLoading || warehousesLoading) {
        return <div>Loading...</div>;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter code" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories.map((category: any) => (
                                            <SelectItem key={category._id} value={category._id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {type === 'INVENTORY' && (
                        <>
                            <FormField
                                control={form.control}
                                name="warehouse"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Warehouse</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select warehouse" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {warehouses.map((warehouse: any) => (
                                                    <SelectItem key={warehouse._id} value={warehouse._id}>
                                                        {warehouse.name}
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
                                name="minQuantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Minimum Quantity</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number" 
                                                {...field} 
                                                onChange={e => field.onChange(parseInt(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="availableQuantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Available Quantity</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number" 
                                                {...field} 
                                                onChange={e => field.onChange(parseInt(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    )}

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Enter description" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {selectedCategory?.specificationTemplate?.fields?.map((specField: any) => (
                        <FormField
                            key={specField.name}
                            control={form.control}
                            name={`spec_${specField.name}`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{specField.name}</FormLabel>
                                    <FormControl>
                                        {specField.type === 'ENUM' ? (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={`Select ${specField.name}`} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {specField.enumValues?.map((value: string) => (
                                                        <SelectItem key={value} value={value}>
                                                            {value}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : specField.type === 'NUMBER' ? (
                                            <Input 
                                                type="number" 
                                                {...field} 
                                                onChange={e => field.onChange(parseInt(e.target.value))}
                                            />
                                        ) : (
                                            <Input {...field} />
                                        )}
                                    </FormControl>
                                    {specField.unit && (
                                        <FormDescription>Unit: {specField.unit}</FormDescription>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}

                    <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Active</FormLabel>
                                    <FormDescription>
                                        Make this {type === 'INVENTORY' ? 'product' : 'asset'} available in the system
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

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? 'Update' : 'Create'} {type === 'INVENTORY' ? 'Product' : 'Asset'}
                </Button>
            </form>
        </Form>
    );
}