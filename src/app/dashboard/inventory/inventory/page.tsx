"use client"

import React, { useEffect, useState } from 'react';
import MasterComponent from '@/components/MasterComponent/MasterComponent';
import { Box, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetMasterQuery, useCreateMasterMutation } from '@/services/endpoints/masterApi';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { MONGO_MODELS } from '@/shared/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { validate } from '@/shared/functions';
import BulkAddDialog from '@/components/ModalComponent/BulkAddDialog';
import { Input } from '@/components/ui/input';

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
    isActive: boolean;
}

interface SpecificationsComponentProps {
    accessData: Record<string, any>;
    handleChange: (e: { target: { value: any } }, fieldName: string) => void;
    selectedItem: any;
}

const SpecificationsComponent = ({ accessData, handleChange, selectedItem:selectedProduct }: SpecificationsComponentProps) => {
    const [specs, setSpecs] = useState<Record<string, any>>(accessData || {});

    useEffect(() => {
        setSpecs(accessData || {});
    }, [accessData]);

    if (!selectedProduct?.product?.category?.specsRequired) {
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
                {Object.entries(selectedProduct?.product?.category?.specsRequired || {}).map(([key, value]) => (
                    <div key={key} className="flex gap-2 items-center">
                        <label className="w-1/3 font-medium">{key}:</label>
                        {value.type === "boolean" ? (
                            <Select
                                value={String(specs[key]?.value || "false")}
                                onValueChange={(val) => {
                                    const newSpecs = {
                                        ...specs,
                                        [key]: {type:value.type,value:val === "true"}
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
                                type={value.type === "number" ? "number" : "text"}
                                value={String(specs[key]?.value || "")}
                                onChange={(e) => {
                                    const newSpecs = {
                                        ...specs,
                                        [key]: {type:value.type,value:value.type === "number" ? Number(e.target.value) : e.target.value}
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
    const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<"Add" | "Update">("Add");
    const [selectedItem, setSelectedItem] = useState<AssetFormData | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    // API hooks
    const { data: assetsResponse, isLoading: assetsLoading } = useGetMasterQuery({
        db: MONGO_MODELS.ASSET_MASTER,
        filter: { isActive: true },
        populate: ['product', 'warehouse', 'vendor',"product.category"]
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
                    product: product,
                    specifications: {}
                });
            }
        }
    };

    const statusData = [
        { _id: true, name: "True" },
        { _id: false, name: "False" },
      ];

    const formFields = [ 
        {
            name: "product",
            label: "Product",
            type: "select",
            placeholder:"select product",
            required: true,
            data: productsResponse?.data?.map((prod: any) => ({
                name: `${prod.category.name} (${prod.name}-${prod.model})`,
                _id: prod._id
            })) || [],
            onChange: handleProductChange
        },
        {
            name: "serialNumber",
            label: "Serial Number",
            type: "text",
            required: true,
            placeholder: "Enter serial number",
            validate: validate.mixString
        },
       
        {
            name: "warehouse",
            label: "Warehouse",
            type: "select",
            placeholder:"select warehouse",
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
            validate: validate.notFutureDate
        },
        {
            name: "purchasePrice",
            label: "Purchase Price",
            type: "number",
            required: true,
            placeholder: "Enter purchase price",
            validate: validate.greaterThanZero
        },
        {
            name: "vendor",
            label: "Vendor",
            type: "select",
            placeholder:"select vendor",
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
            validate: validate.mixString
        },
        {
            name: "prNumber",
            label: "PR Number",
            type: "text",
            placeholder: "Enter PR number",
            validate:validate.mixString
        },
        {
            name: "invoiceNumber",
            label: "Invoice Number",
            type: "text",
            required: true,
            placeholder: "Enter invoice number",
            validate: validate.mixString
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
            validate: validate.desription
        },
        {
            name: "isActive",
            label: "Status",
            type: "select",
            placeholder: "Select status",
            data: statusData,
            required: true
        }
    ];
    const editAsset = (data: any) => {
        setSelectedItem(data)
        setDialogAction("Update");
        setIsDialogOpen(true);
    }

    

    const columns = [
        {
            accessorKey: "serialNumber",
            header: "serialNumber",
            cell: ({ row }: any) => (
                <div className='text-red-700' onClick={() => editAsset(row.original)}>
                    {row.original.serialNumber}
                </div>
            )
        },
        {
            accessorKey: "product",
            header: "Product",
            cell: ({ row }: any) => (
                <Badge variant="outline">
                    {`${row.original.product?.name}`}
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

    const handleSave = async ({ formData, action }: { formData: AssetFormData; action: string }) => {
        console.log("handle save called with:", action, formData.serialNumber);
        
        try {
            // Wrap in Promise to ensure only one call is made
            return await new Promise(async (resolve, reject) => {
                try {
                    const response = await createMaster({
                        db: MONGO_MODELS.ASSET_MASTER,
                        action: action === 'Add' ? 'create' : 'update',
                        filter: formData._id ? { _id: formData._id } : undefined,
                        data: {
                            ...formData,
                            status: 'available',
                            isActive: formData.isActive ?? true
                        }
                    }).unwrap();
                    
                    console.log("API call successful:", response);
                    resolve(response);
                } catch (error) {
                    console.error('Error saving asset:', error);
                    reject(error);
                }
            });
        } catch (error) {
            console.error('Error in handleSave:', error);
            return { error };
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
                    isActive: row.original.isActive
                });
                setIsDialogOpen(true);
            }
        },
        buttons: [
            {
                label: "Add Product",
                action: () => {
                    setIsBulkDialogOpen(true);
                },
                icon: Box,
                className: "bg-neutral-800 text-white hover:bg-neutral-800/90"
            }
        ]
    };

    useEffect(() => {
        if (!assetsLoading) {
            setLoading(false);
        }
    }, [assetsLoading]);

    return (
        <div className="h-full w-full">
            <MasterComponent config={pageConfig} loadingState={loading} />
            
            {/* <DynamicDialog<AssetFormData>
                isOpen={isDialogOpen}
                closeDialog={() => {
                    setSelectedItem(null)
                    setIsDialogOpen(false)
                }}
                selectedMaster="Asset"
                onSave={handleSave}
                fields={formFields}
                initialData={selectedItem || {}}
                action={dialogAction}
                height="auto"
            /> */}
            
            <BulkAddDialog
                isOpen={isBulkDialogOpen}
                closeDialog={() => setIsBulkDialogOpen(false)}
                onSave={handleSave}
                products={productsResponse?.data || []}
                warehouses={warehousesResponse?.data || []}
                vendors={vendorsResponse?.data || []}
            />
        </div>
    );
};

export default AssetsPage;