"use client"

import React, { useEffect, useState } from 'react';
import MasterComponent from '@/components/MasterComponent/MasterComponent';
import { Box, ChevronsUpDown, Download, Import, Plus, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetMasterQuery, useCreateMasterMutation } from '@/services/endpoints/masterApi';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { MONGO_MODELS } from '@/shared/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { bulkImport, validate } from '@/shared/functions';
import BulkAddDialog from '@/components/ModalComponent/BulkAddDialog';
import { Input } from '@/components/ui/input';
import { transformData } from '@/lib/utils';
import * as XLSX from "xlsx";
import useUserAuthorised from '@/hooks/useUserAuthorised';
import moment from 'moment';

interface AssetFormData {
    _id?: string;
    serialNumber: string;
    product: string;
    warehouse: string;
    status: 'available' | 'assigned' | 'maintenance' | 'retired';
    purchaseDate: string;
    // purchasePrice: number;
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
    handleChange: (e: { target: { value: Record<string, any> } }, fieldName: string) => void;
    selectedItem: any;
}

const SpecificationsComponent = ({ accessData, handleChange, selectedItem: selectedProduct }: SpecificationsComponentProps) => {
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
                        {(value as { type: string }).type === "boolean" ? (
                            <Select
                                value={String(specs[key]?.value || "false")}
                                onValueChange={(val) => {
                                    const newSpecs = {
                                        ...specs,
                                        [key]: { type: (value as { type: string }).type, value: val === "true" }
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
                                type={(value as { type: string }).type === "number" ? "number" : "text"}
                                value={String(specs[key]?.value || "")}
                                onChange={(e) => {
                                    const newSpecs = {
                                        ...specs,
                                        [key]: { type: (value as { type: string }).type, value: (value as { type: string }).type === "number" ? Number(e.target.value) : e.target.value }
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
    const [importing, setImporting] = useState(false);
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<"Add" | "Update">("Add");
    const [selectedItem, setSelectedItem] = useState<AssetFormData | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const { user, status, authenticated } = useUserAuthorised();
    // API hooks
    const { data: assetsResponse, isLoading: assetsLoading } = useGetMasterQuery({
        db: MONGO_MODELS.ASSET_MASTER,
        filter: { isActive: true },
        populate: ['product', 'warehouse', 'vendor', "product.category"]
    });

    const { data: productsResponse, isLoading: productLoading } = useGetMasterQuery({
        db: MONGO_MODELS.PRODUCT_MASTER,
        filter: { isActive: true },
        populate: ['category']
    });

    const { data: warehousesResponse, isLoading: warehouseLoading } = useGetMasterQuery({
        db: MONGO_MODELS.WAREHOUSE_MASTER,
        filter: { isActive: true }
    });

    const { data: vendorsResponse, isLoading: vendorLoading } = useGetMasterQuery({
        db: MONGO_MODELS.VENDOR_MASTER,
        filter: { isActive: true }
    });
//  `${prod.category.name} (${prod.model})`
    const fieldsToAdd = [
        { fieldName: 'productName', path: ['product', ''] },
        { fieldName: 'warehouseName', path: ['warehouse', 'name'] }
    ];
    const transformedData = transformData(assetsResponse?.data, fieldsToAdd);
console.log(transformedData)
    const loading = productLoading || assetsLoading || warehouseLoading || vendorLoading;

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
console.log(productsResponse)
    const formFields = [
        {
            name: "product",
            label: "Product",
            type: "select",
            placeholder: "select product",
            required: true,
            data: productsResponse?.data?.map((prod: any) => ({
                name: `${prod.category.name} (${prod.model})`,
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
            placeholder: "select warehouse",
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
        // {
        //     name: "purchasePrice",
        //     label: "Purchase Price",
        //     type: "number",
        //     placeholder: "Enter purchase price",

        // },
        {
            name: "vendor",
            label: "Vendor",
            type: "select",
            placeholder: "select vendor",
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
            validate: validate.mixString
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
        setIsBulkDialogOpen(true);
    };

    const columns = [
        {
            accessorKey: "serialNumber",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Serial No</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: any) => (
                <div className='text-red-700' onClick={() => editAsset(row.original)}>
                    {row.original.serialNumber}
                </div>
            )
        },
        {
            accessorKey: "product",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Product</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: any) => (
                <Badge variant="outline">
                    {`${row?.original?.product?.category?.name} (${row?.original?.product?.model})`}
                </Badge>
            )
        },
        {
            accessorKey: "warehouse",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Warehouse</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: any) => (
                <Badge variant="secondary">
                    {row.original.warehouse?.name || ''}
                </Badge>
            )
        },
        {
            accessorKey: "status",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Status</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
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
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Vendor</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: any) => (
                <Badge variant="outline">
                    {row.original.vendor?.name || ''}
                </Badge>
            )
        },
        {
            accessorKey: "poNumber",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>PO Number</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
        },
        {
            accessorKey: "warrantyEndDate",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();

                return (
                    <button
                        className="group  flex items-center space-x-2"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        <span>Warranty Untill</span>
                        <ChevronsUpDown
                            size={15}
                            className={`transition-opacity duration-150 ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                        />
                    </button>
                );
            },
            cell: ({ row }: any) => {
                const endDate = new Date(row.original.warrantyEndDate);
                const today = new Date();
                const variant = endDate < today ? "destructive" : "default";

                return (
                    <Badge variant={variant}>
                        {moment(endDate).format("DD-MMM-YYYY")}
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

    const handleImport = async () => {
        await bulkImport({
            roleData: [], continentData: [], regionData: [], countryData: [], locationData: [], categoryData: [], vendorData: vendorsResponse, productData: productsResponse, warehouseData: warehousesResponse, customerTypeData: [], customerData: [], userData: [], teamData: [], designationData: [], departmentData: [], employeeTypeData: [], organisationData: [], action: "Add", user, createUser: createMaster, db: MONGO_MODELS.ASSET_MASTER, masterName: "Asset", onStart: () => setImporting(true),
            onFinish: () => setImporting(false)
        });
    };

    const handleExport = (type: string, data: any) => {
        let formattedData: any[] = [];

        if (data?.length > 0) {
            formattedData = data?.map((data: any) => ({
                'Vendor Name': data.vendor?.name,
                'Invoice No': data?.invoiceNumber,
                'PO Number': data?.poNumber,
                'PR Number': data?.prNumber,
                'Purchase Date': moment(data?.purchaseDate).format("DD-MM-YYYY"),
                'Warehouse': data?.warehouse?.name,
                'Product Name': data?.product?.name,
                'Serial No': data?.serialNumber,
                'Specifications': JSON.stringify(data.specifications),
                'Status': data?.status,
                'Warranty Details': data?.warrantyDetails,
                'Warranty Start Date': moment(data?.warrantyStartDate).format("DD-MM-YYYY"),
                'Warranty End Date': moment(data?.warrnatyEndDate).format("DD-MM-YYYY")
            }));
        } else {
            // Create a single empty row with keys only (for header export)
            formattedData = [{
                'Vendor Name': data.vendor?.name,
                'Invoice No': data?.invoiceNumber,
                'PO Number': data?.poNumber,
                'PR Number': data?.prNumber,
                'Purchase Date': moment(data?.purchaseDate).format("DD-MM-YYYY"),
                'Warehouse': data?.warehouse?.name,
                'Product Name': data?.product?.name,
                'Serial No': data?.serialNumber,
                'Specifications': JSON.stringify(data.specifications),
                'Status': data?.status,
                'Warranty Details': data?.warrantyDetails,
                'Warranty Start Date': moment(data?.warrantyStartDate).format("DD-MM-YYYY"),
                'Warranty End Date': moment(data?.warrnatyEndDate).format("DD-MM-YYYY")
            }];
        }

        type === 'excel' && exportToExcel(formattedData);

    };

    const exportToExcel = (data: any[]) => {
        // Convert JSON data to a worksheet
        const worksheet = XLSX.utils.json_to_sheet(data);
        // Create a new workbook
        const workbook = XLSX.utils.book_new();
        // Append the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        // Write the workbook and trigger a download
        XLSX.writeFile(workbook, 'exported_data.xlsx');
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
                label: "productName",
                type: "select" as const,
                placeholder: "Filter by product",
                data: productsResponse?.data?.map((prod: any) => ({
                    _id: `${prod.category.name} (${prod.model})`,
                    name:  `${prod.category.name} (${prod.model})`
                })),
                name: "productName",
            },
            {
                key: "warehouse",
                label: "warehouseName",
                type: "select" as const,
                placeholder: "Filter by warehouse",
                data: warehousesResponse?.data?.map((wr: any) => ({
                    _id: wr?.name,
                    name: wr?.name
                })),
                name: "warehouseName",
            },

        ],
        dataTable: {
            columns: columns,
            data: transformedData,
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
            { label: importing ? 'Importing...' : 'Import', action: handleImport, icon: Download, className: 'bg-blue-600 hover:bg-blue-700 duration-300' },
            {
                label: 'Export', action: handleExport, icon: Upload, className: 'bg-green-600 hover:bg-green-700 duration-300', dropdownOptions: [
                    { label: "Export to Excel", value: "excel", action: (type: string, data: any) => handleExport(type, data) },

                ]
            },
            {
                label: "Add",
                action: () => {
                    setIsBulkDialogOpen(true);
                },
                icon: Plus,

            }
        ]
    };
    console.log({selectedItem,selectedProduct})
    return (
        <div className="h-full w-full">
            <MasterComponent config={pageConfig} loadingState={loading} rowClassMap={undefined} summary={false} />

            <BulkAddDialog
                isOpen={isBulkDialogOpen}
                closeDialog={() => setIsBulkDialogOpen(false)}
                onSave={handleSave}
                products={productsResponse?.data || []}
                warehouses={warehousesResponse?.data || []}
                vendors={vendorsResponse?.data || []}
                initialData={selectedItem}
            />
        </div>
    );
};

export default AssetsPage;