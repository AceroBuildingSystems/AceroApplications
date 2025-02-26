"use client"

import React, { useEffect, useState } from 'react';
import MasterComponent from '@/components/MasterComponent/MasterComponent';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetMasterQuery, useCreateMasterMutation } from '@/services/endpoints/masterApi';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { MONGO_MODELS } from '@/shared/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { validate } from '@/shared/functions';
import useUserAuthorised from '@/hooks/useUserAuthorised';
interface CategoryFormData {
    _id?: string;
    name: string;
    description?: string;
    specsRequired: Record<string, { type: "string" | "number" | "boolean", unit: string }>;
    isActive: string;
}

const SpecificationsComponent = ({ accessData, handleChange }: { accessData: Record<string, { type: "string" | "number" | "boolean", unit: string }>; handleChange: (e: { target: { value: any } }, fieldName: string) => void }) => {
    const [specs, setSpecs] = useState<Record<string, { type: "string" | "number" | "boolean", unit: string }>>(accessData || {});
    const [newSpecName, setNewSpecName] = useState('');
    const [newSpecType, setNewSpecType] = useState<"string" | "number" | "boolean">("string");
    const [unitMeasurement,setUnitMeasurement] = useState<string>('');  
    const { data: unitMeasurementData = [], isLoading:unitMeasurementLoading } = useGetMasterQuery({
        db: MONGO_MODELS.UNIT_MEASUREMENT_MASTER,
        filter: { isActive: true }
    });


    useEffect(() => {
        setSpecs(accessData || {});
    }, [accessData]);
    return (
        <Card>
            <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                    {Object.entries(specs).map(([key, value], index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded">
                            <span className="flex-1 font-medium">{key}</span>
                            <Badge variant="secondary">{String(unitMeasurementData?.data?.find((unit:any) => unit._id === value.unit)?.name)}</Badge>
                            <Badge variant="outline">{String(value.type)}</Badge>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    const newSpecs: Record<string, { type: "string" | "number" | "boolean"; unit: string }> = { ...specs };
                                    delete newSpecs[key];
                                    setSpecs(newSpecs);
                                    handleChange({ target: { value: newSpecs } }, "specsRequired");
                                }}
                            >
                                Remove
                            </Button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Input
                        type="text"
                        value={newSpecName}
                        onChange={(e) => setNewSpecName(e.target.value)}
                        placeholder="Specification name"
                        className="flex-1"
                    />

                    <Select
                        value={unitMeasurement}
                        onValueChange={(value) => setUnitMeasurement(value as any)}
                    >
                        
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="unit" />
                        </SelectTrigger>
                        <SelectContent>
                            {unitMeasurementData && unitMeasurementData?.data?.map(unitData=>{
                                return <SelectItem value={unitData._id}>{unitData.name}</SelectItem>
                            })}
                        </SelectContent>
                    </Select>
                    
                    <Select
                        value={newSpecType}
                        onValueChange={(value) => setNewSpecType(value as "string" | "number" | "boolean")}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="string">Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="boolean">Yes/No</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        type="button"
                        onClick={() => {
                            if (newSpecName.trim()) {
                                const newSpecs: Record<string, { type: "string" | "number" | "boolean"; unit: string }> = {
                                    ...specs,
                                    [newSpecName]: {type:newSpecType, unit:unitMeasurement}
                                };
                                setSpecs(newSpecs);
                                handleChange({ target: { value: newSpecs } }, "specsRequired");
                                setNewSpecName('');
                                setNewSpecType("string");
                                setUnitMeasurement('')
                            }
                        }}
                        disabled={!newSpecName.trim()}
                    >
                        Add
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

const ProductCategoriesPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<"Add" | "Update">("Add");
    const [selectedItem, setSelectedItem] = useState<CategoryFormData | null>(null);
    const { user } = useUserAuthorised();

    // API hooks
    const { data: categoriesResponse, isLoading } = useGetMasterQuery({
        db: MONGO_MODELS.PRODUCT_CATEGORY_MASTER,
        filter: { isActive: true }
    });

    const [createMaster] = useCreateMasterMutation();

    const statusData = [
        { _id: true, name: "True" },
        { _id: false, name: "False" },
      ];

    // Form fields configuration with validation
    const formFields = [
        {
            name: "name",
            label: "Name",
            type: "text",
            required: true,
            placeholder: "Enter category name",
            validate: validate.text
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Enter category description",
            validate: validate.desription
        },
        {
            name: "specsRequired",
            label: "Required Specifications",
            type: "custom",
            CustomComponent: SpecificationsComponent,
            validate: validate.specification
        },
        {
            name: "isActive",
            label: "Status",
            placeholder: "Select the status",
            type: "select",
            data: statusData,
            required: true
        }
    ];

    const editCategories = (data: any) => {
        setSelectedItem(data)
        setDialogAction("Update");
        setIsDialogOpen(true);
    }

    // Configure table columns
    const columns = [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }: any) => (
                <div className='text-red-700' onClick={() => editCategories(row.original)}>
                    {row.original.name}
                </div>
            )
        },

        {
            accessorKey: "description",
            header: "Description",
        },
        {
            accessorKey: "specsRequired",
            header: "Required Specifications",
            cell: ({ row }: any) => {
                const specs = row.original.specsRequired as Record<string, Object>;
                if (!specs) return null;
                return (
                    <div className="flex flex-wrap gap-1 max-w-[300px]">
                        {Object.entries(specs).map(([key, value], index) => (
                            <Badge key={index} variant="outline">
                                {key}: {String((value as any)?.type || "")}
                            </Badge>
                        ))}
                    </div>
                );
            }
        },
       {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }: any) => (
                <div className={`px-2 py-1 rounded-full text-center ${row.original.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {row.original.isActive ? 'Active' : 'Inactive'}
                </div>
            )
        }
    ];

    // Handle dialog save
    const handleSave = async ({ formData, action }: { formData: CategoryFormData; action: string }): Promise<any> => {
        try {
            const response = await createMaster({
                db: MONGO_MODELS.PRODUCT_CATEGORY_MASTER,
                action: action === 'Add' ? 'create' : 'update',
                data: {
                    ...formData,
                    isActive: formData.isActive ?? true
                },
                userId: user._id,
                recordActivity: true
            });
            return response;
        } catch (error) {
            console.error('Error saving category:', error);
        }
    };

    // Configure page layout
    const pageConfig = {
        searchFields: [
            {
                key: "name",
                label: "name",
                type: "text" as const,
                placeholder: "Search by name..."
            }
        ],
        filterFields: [
            {
                key: "isActive",
                label: "Status",
                type: "select" as const,
                placeholder: "Filter by status",
                options: ["Active", "Inactive"]
            }
        ],
        dataTable: {
            columns: columns,
            data: (categoriesResponse?.data || []) as any[],
            onRowClick: (row: any) => {
                setDialogAction("Update");
                setSelectedItem({
                    ...row.original,
                    isActive: row.original.isActive ? "Active" : "Inactive"
                });
                setIsDialogOpen(true);
            }
        },
        buttons: [
            {
                label: "Add New",
                action: () => {
                    setDialogAction("Add");
                    setSelectedItem({
                        name: '',
                        description: '',
                        specsRequired: {},
                        isActive: "Active"
                    });
                    setIsDialogOpen(true);
                },
                icon: Plus,
                className: "bg-primary text-white hover:bg-primary/90"
            }
        ]
    };

    useEffect(() => {
        if (!isLoading) {
            setLoading(false);
        }
    }, [isLoading]);

    return (
        <div className="h-full w-full">
            <MasterComponent config={pageConfig} loadingState={loading} />
            
            <DynamicDialog<CategoryFormData>
                isOpen={isDialogOpen}
                closeDialog={() => setIsDialogOpen(false)}
                selectedMaster="Product Category"
                onSave={handleSave}
                fields={formFields}
                initialData={selectedItem || {}}
                action={dialogAction}
                height="auto"
            />
        </div>
    );
};

export default ProductCategoriesPage;