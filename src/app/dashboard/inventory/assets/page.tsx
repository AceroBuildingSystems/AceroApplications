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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface AssetFormData {
    _id?: string;
    serialNumber: string;
    product: string;
    warehouse: string;
    status: 'available' | 'assigned' | 'maintenance' | 'retired';
    purchaseDate: string;
    purchasePrice: number;
    vendor: string;
    poNumber: string;
    prNumber?: string;
    invoiceNumber: string;
    warrantyStartDate: string;
    warrantyEndDate: string;
    warrantyDetails?: string;
    specifications: Record<string, any>;
    isActive: string;
}

interface SpecificationsComponentProps {
    accessData: Record<string, any>;
    handleChange: (e: { target: { value: any } }, fieldName: string) => void;
    selectedProduct: any;
}

const SpecificationsComponent = ({ accessData, handleChange, selectedProduct }: SpecificationsComponentProps) => {
    const [specs, setSpecs] = useState<Record<string, any>>(accessData || {});

    useEffect(() => {
        setSpecs(accessData || {});
    }, [accessData]);

    if (!selectedProduct?.category?.specsRequired) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                        Please select a product first
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="pt-6 space-y-4">
                {Object.entries(selectedProduct.category.specsRequired).map(([key, type]) => (
                    <div key={key} className="flex gap-2 items-center">
                        <label className="w-1/3 font-medium">{key}:</label>
                        {type === "boolean" ? (
                            <Select
                                value={String(specs[key] || "false")}
                                onValueChange={(val) => {
                                    const newSpecs = {
                                        ...specs,
                                        [key]: val === "true"
                                    };
                                    setSpecs(newSpecs);
                                    handleChange({ target: { value: newSpecs } }, "specifications");
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select value" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Yes</SelectItem>
                                    <SelectItem value="false">No</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <Input
                                type={type === "number" ? "number" : "text"}
                                value={String(specs[key] || "")}
                                onChange={(e) => {
                                    const newSpecs = {
                                        ...specs,
                                        [key]: type === "number" ? Number(e.target.value) : e.target.value
                                    };
                                    setSpecs(newSpecs);
                                    handleChange({ target: { value: newSpecs } }, "specifications");
                                }}
                                className="flex-1"
                            />
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

const AssetsPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<"Add" | "Update">("Add");
    const [selectedItem, setSelectedItem] = useState<AssetFormData | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    // API hooks
    const { data: assetsResponse, isLoading: assetsLoading } = useGetMasterQuery({
        db: MONGO_MODELS.ASSET_MASTER,
        filter: { isActive: true },
        populate: ['product', 'warehouse', 'vendor']
    });

    const { data: productsResponse } = useGetMasterQuery({
        db: MONGO_MODELS.PRODUCT_MASTER,
        filter: { isActive: true },
        populate: ['category']
    });

    const { data: warehousesResponse } = useGetMasterQuery({
        db: MONGO_MODELS.WAREHOUSE_MASTER,
        filter: { isActive: true }
    });

    const { data: vendorsResponse } = useGetMasterQuery({
        db: MONGO_MODELS.VENDOR_MASTER,
        filter: { isActive: true }
    });

    const [createMaster] = useCreateMasterMutation();

    const handleProductChange = (productId: string) => {
        const product = productsResponse?.data?.find((p: any) => p._id === productId);
        if (product) {
            setSelectedProduct(product);
            // Reset specifications when product changes
            if (selectedItem) {
                setSelectedItem({
                    ...selectedItem,
                    product: productId,
                    specifications: {}
                });
            }
        }
    };

    // Form fields configuration with validation
    const formFields = [
        {
            name: "_id",
            type: "hidden"
        },
        {
            name: "serialNumber",
            label: "Serial Number",
            type: "text",
            required: true,
            placeholder: "Enter serial number",
            validate: (value: string) => {
                if (!/^[A-Z0-9-]+$/.test(value)) {
                    return "Serial number must contain only uppercase letters, numbers, and hyphens";
                }
                if (value.length < 4) {
                    return "Serial number must be at least 4 characters";
                }
                if (value.length > 50) {
                    return "Serial number must be less than 50 characters";
                }
                return undefined;
            }
        },
        {
            name: "product",
            label: "Product",
            type: "select",
            required: true,
            data: productsResponse?.data?.map((prod: any) => ({
                name: `${prod.name} (${prod.code})`,
                _id: prod._id
            })) || [],
            onChange: handleProductChange
        },
        {
            name: "warehouse",
            label: "Warehouse",
            type: "select",
            required: true,
            data: warehousesResponse?.data?.map((wh: any) => ({
                name: wh.name,
                _id: wh._id
            })) || []
        },
        {
            name: "specifications",
            label: "Specifications",
            type: "custom",
            CustomComponent: (props: any) => <SpecificationsComponent {...props} selectedProduct={selectedProduct} />,
            validate: (value: Record<string, any>, formData: AssetFormData) => {
                if (!selectedProduct?.category?.specsRequired) return undefined;
                
                const missingSpecs = Object.keys(selectedProduct.category.specsRequired)
                    .filter(key => !value[key] && value[key] !== false && value[key] !== 0);
                
                if (missingSpecs.length > 0) {
                    return `Missing specifications: ${missingSpecs.join(", ")}`;
                }
                return undefined;
            }
        },
        {
            name: "purchaseDate",
            label: "Purchase Date",
            type: "date",
            required: true,
            validate: (value: string) => {
                const purchaseDate = new Date(value);
                if (purchaseDate > new Date()) {
                    return "Purchase date cannot be in the future";
                }
                return undefined;
            }
        },
        {
            name: "purchasePrice",
            label: "Purchase Price",
            type: "number",
            required: true,
            placeholder: "Enter purchase price",
            validate: (value: number) => {
                if (value <= 0) {
                    return "Purchase price must be greater than 0";
                }
                if (value > 999999999) {
                    return "Purchase price is too high";
                }
                return undefined;
            }
        },
        {
            name: "vendor",
            label: "Vendor",
            type: "select",
            required: true,
            data: vendorsResponse?.data?.map((vendor: any) => ({
                name: vendor.name,
                _id: vendor._id
            })) || []
        },
        {
            name: "poNumber",
            label: "PO Number",
            type: "text",
            required: true,
            placeholder: "Enter PO number",
            validate: (value: string) => {
                if (!/^[A-Z0-9-]+$/.test(value)) {
                    return "PO number must contain only uppercase letters, numbers, and hyphens";
                }
                if (value.length < 3) {
                    return "PO number must be at least 3 characters";
                }
                if (value.length > 20) {
                    return "PO number must be less than 20 characters";
                }
                return undefined;
            }
        },
        {
            name: "prNumber",
            label: "PR Number",
            type: "text",
            placeholder: "Enter PR number",
            validate: (value: string) => {
                if (value && !/^[A-Z0-9-]+$/.test(value)) {
                    return "PR number must contain only uppercase letters, numbers, and hyphens";
                }
                if (value && value.length > 20) {
                    return "PR number must be less than 20 characters";
                }
                return undefined;
            }
        },
        {
            name: "invoiceNumber",
            label: "Invoice Number",
            type: "text",
            required: true,
            placeholder: "Enter invoice number",
            validate: (value: string) => {
                if (!/^[A-Z0-9-]+$/.test(value)) {
                    return "Invoice number must contain only uppercase letters, numbers, and hyphens";
                }
                if (value.length < 3) {
                    return "Invoice number must be at least 3 characters";
                }
                if (value.length > 20) {
                    return "Invoice number must be less than 20 characters";
                }
                return undefined;
            }
        },
        {
            name: "warrantyStartDate",
            label: "Warranty Start Date",
            type: "date",
            required: true,
            validate: (value: string, formData: AssetFormData) => {
                const startDate = new Date(value);
                const purchaseDate = new Date(formData.purchaseDate);
                if (startDate < purchaseDate) {
                    return "Warranty start date cannot be before purchase date";
                }
                return undefined;
            }
        },
        {
            name: "warrantyEndDate",
            label: "Warranty End Date",
            type: "date",
            required: true,
            validate: (value: string, formData: AssetFormData) => {
                const endDate = new Date(value);
                const startDate = new Date(formData.warrantyStartDate);
                if (endDate <= startDate) {
                    return "Warranty end date must be after warranty start date";
                }
                return undefined;
            }
        },
        {
            name: "warrantyDetails",
            label: "Warranty Details",
            type: "textarea",
            placeholder: "Enter warranty details",
            validate: (value: string) => {
                if (value && value.length > 1000) {
                    return "Warranty details must be less than 1000 characters";
                }
                return undefined;
            }
        },
        {
            name: "isActive",
            label: "Status",
            type: "select",
            options: ["Active", "Inactive"],
            required: true
        }
    ];

    // Configure table columns
    const columns = [
        {
            accessorKey: "serialNumber",
            header: "Serial Number",
        },
        {
            accessorKey: "product",
            header: "Product",
            cell: ({ row }: any) => (
                <Badge variant="outline">
                    {`${row.original.product?.name} (${row.original.product?.code})`}
                </Badge>
            )
        },
        {
            accessorKey: "warehouse",
            header: "Warehouse",
            cell: ({ row }: any) => (
                <Badge variant="secondary">
                    {row.original.warehouse?.name || ''}
                </Badge>
            )
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }: any) => {
                const status = row.original.status;
                const variant = 
                    status === 'available' ? "default" :
                    status === 'assigned' ? "secondary" :
                    status === 'maintenance' ? "outline" :
                    "destructive";
                
                return (
                    <Badge variant={variant}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                );
            }
        },
        {
            accessorKey: "vendor",
            header: "Vendor",
            cell: ({ row }: any) => (
                <Badge variant="outline">
                    {row.original.vendor?.name || ''}
                </Badge>
            )
        },
        {
            accessorKey: "poNumber",
            header: "PO Number",
        },
        {
            accessorKey: "warrantyEndDate",
            header: "Warranty Until",
            cell: ({ row }: any) => {
                const endDate = new Date(row.original.warrantyEndDate);
                const today = new Date();
                const variant = endDate < today ? "destructive" : "default";
                
                return (
                    <Badge variant={variant}>
                        {endDate.toLocaleDateString()}
                    </Badge>
                );
            }
        },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }: any) => (
                <Badge variant={row.original.isActive ? "default" : "destructive"}>
                    {row.original.isActive ? 'Active' : 'Inactive'}
                </Badge>
            )
        }
    ];

    // Handle dialog save
    const handleSave = async ({ formData, action }: { formData: AssetFormData; action: string }) => {
        try {
            await createMaster({
                db: MONGO_MODELS.ASSET_MASTER,
                action: action === 'Add' ? 'create' : 'update',
                filter: formData._id ? { _id: formData._id } : undefined,
                data: {
                    ...formData,
                    status: 'available',
                    isActive: formData.isActive === "Active"
                }
            }).unwrap();
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Error saving asset:', error);
        }
    };

    // Configure page layout
    const pageConfig = {
        searchFields: [
            {
                key: "serialNumber",
                label: "serialNumber",
                type: "text" as const,
                placeholder: "Search by serial number..."
            }
        ],
        filterFields: [
            {
                key: "product",
                label: "Product",
                type: "select" as const,
                placeholder: "Filter by product",
                options: productsResponse?.data?.map((prod: any) => prod.name) || []
            },
            {
                key: "warehouse",
                label: "Warehouse",
                type: "select" as const,
                placeholder: "Filter by warehouse",
                options: warehousesResponse?.data?.map((wh: any) => wh.name) || []
            },
            {
                key: "status",
                label: "Status",
                type: "select" as const,
                placeholder: "Filter by status",
                options: ["available", "assigned", "maintenance", "retired"]
            }
        ],
        dataTable: {
            columns: columns,
            data: (assetsResponse?.data || []) as any[],
            onRowClick: (row: any) => {
                setDialogAction("Update");
                const product = productsResponse?.data?.find((p: any) => p._id === row.original.product?._id);
                setSelectedProduct(product);
                setSelectedItem({
                    ...row.original,
                    product: row.original.product?._id,
                    warehouse: row.original.warehouse?._id,
                    vendor: row.original.vendor?._id,
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
                    setSelectedProduct(null);
                    setSelectedItem({
                        serialNumber: '',
                        product: '',
                        warehouse: '',
                        status: 'available',
                        purchaseDate: new Date().toISOString().split('T')[0],
                        purchasePrice: 0,
                        vendor: '',
                        poNumber: '',
                        invoiceNumber: '',
                        warrantyStartDate: new Date().toISOString().split('T')[0],
                        warrantyEndDate: new Date().toISOString().split('T')[0],
                        specifications: {},
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
        if (!assetsLoading) {
            setLoading(false);
        }
    }, [assetsLoading]);

    return (
        <div className="h-full">
            <MasterComponent config={pageConfig} loadingState={loading} />
            
            <DynamicDialog<AssetFormData>
                isOpen={isDialogOpen}
                closeDialog={() => setIsDialogOpen(false)}
                selectedMaster="Asset"
                onSave={handleSave}
                fields={formFields}
                initialData={selectedItem || {}}
                action={dialogAction}
                height="auto"
                width="full"
            />
        </div>
    );
};

export default AssetsPage;