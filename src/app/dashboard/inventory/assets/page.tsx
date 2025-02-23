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
        return <div>Please select a product first</div>;
    }

    return (
        <div className="space-y-2">
            {Object.entries(selectedProduct.category.specsRequired).map(([key, type]) => (
                <div key={key} className="flex gap-2 items-center">
                    <label className="w-1/3">{key}:</label>
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
                            <SelectTrigger>
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
        </div>
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

    // Form fields configuration
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
            placeholder: "Enter serial number"
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
            CustomComponent: (props: any) => <SpecificationsComponent {...props} selectedProduct={selectedProduct} />
        },
        {
            name: "purchaseDate",
            label: "Purchase Date",
            type: "date",
            required: true
        },
        {
            name: "purchasePrice",
            label: "Purchase Price",
            type: "number",
            required: true,
            placeholder: "Enter purchase price"
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
            placeholder: "Enter PO number"
        },
        {
            name: "prNumber",
            label: "PR Number",
            type: "text",
            placeholder: "Enter PR number"
        },
        {
            name: "invoiceNumber",
            label: "Invoice Number",
            type: "text",
            required: true,
            placeholder: "Enter invoice number"
        },
        {
            name: "warrantyStartDate",
            label: "Warranty Start Date",
            type: "date",
            required: true
        },
        {
            name: "warrantyEndDate",
            label: "Warranty End Date",
            type: "date",
            required: true
        },
        {
            name: "warrantyDetails",
            label: "Warranty Details",
            type: "textarea",
            placeholder: "Enter warranty details"
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
            cell: ({ row }: any) => `${row.original.product?.name} (${row.original.product?.code})`
        },
        {
            accessorKey: "warehouse",
            header: "Warehouse",
            cell: ({ row }: any) => row.original.warehouse?.name || ''
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }: any) => (
                <div className={`px-2 py-1 rounded-full text-center ${
                    row.original.status === 'available' ? 'bg-green-100 text-green-800' :
                    row.original.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                    row.original.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                }`}>
                    {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
                </div>
            )
        },
        {
            accessorKey: "vendor",
            header: "Vendor",
            cell: ({ row }: any) => row.original.vendor?.name || ''
        },
        {
            accessorKey: "poNumber",
            header: "PO Number",
        },
        {
            accessorKey: "warrantyEndDate",
            header: "Warranty Until",
            cell: ({ row }: any) => new Date(row.original.warrantyEndDate).toLocaleDateString()
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