"use client"

import React, { useEffect, useState } from 'react';
import MasterComponent from '@/components/MasterComponent/MasterComponent';
import { Download, Import, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetMasterQuery, useCreateMasterMutation } from '@/services/endpoints/masterApi';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { MONGO_MODELS } from '@/shared/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { bulkImport, validate } from '@/shared/functions';
import { transformData } from '@/lib/utils';
import useUserAuthorised from '@/hooks/useUserAuthorised';
import * as XLSX from "xlsx";

interface ProductFormData {
    _id?: string;
    name: string;
    category: string;
    brand: string;
    model: string;
    description?: string;
    unitOfMeasure?: string;
    isActive: boolean;
    vendor?: string;
}

const ProductsPage = () => {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<"Add" | "Update">("Add");
    const [selectedItem, setSelectedItem] = useState<ProductFormData | null>(null);
    const { user, status, authenticated } = useUserAuthorised();
    // API hooks
    const { data: productsResponse, isLoading: productsLoading } = useGetMasterQuery({
        db: MONGO_MODELS.PRODUCT_MASTER,
        filter: { isActive: true },
        populate: ['category']
    });

    const { data: categoriesResponse, isLoading: categoryLoading } = useGetMasterQuery({
        db: MONGO_MODELS.PRODUCT_CATEGORY_MASTER,
        filter: { isActive: true }
    });

    const loading = productsLoading || categoryLoading;

    const fieldsToAdd = [
        { fieldName: 'categoryName', path: ['category', 'name'] }
    ];
    const transformedData = transformData(productsResponse?.data, fieldsToAdd);

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
            placeholder: "Enter product name",
            validate: validate.text
        },

        {
            name: "category",
            label: "Category",
            type: "select",
            placeholder: "Select category",
            required: true,
            data: categoriesResponse?.data?.map((cat: any) => ({
                name: cat.name,
                _id: cat._id
            })) || []
        },
        {
            name: "brand",
            label: "Brand",
            type: "text",
            required: true,
            placeholder: "Enter brand name",
            validate: validate.textSmall
        },
        {
            name: "model",
            label: "Model",
            type: "text",
            required: true,
            placeholder: "Enter model number",
            validate: validate.textSmall
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Enter product description",
            validate: validate.desription
        },
        {
            name: "isActive",
            label: "Status",
            type: "select",
            placeholder: "Enter the status ",
            data: statusData,
            required: true
        }
    ];

    const editProducts = (data: any) => {
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
                <div className='text-red-700' onClick={() => editProducts(row.original)}>
                    {row.original.name}
                </div>
            )
        },
        {
            accessorKey: "description",
            header: "Description",
        },
        {
            accessorKey: "category",
            header: "Category",
            cell: ({ row }: any) => (
                <Badge variant="outline">
                    {row.original.category?.name || ''}
                </Badge>
            )
        },
        {
            accessorKey: "brand",
            header: "Brand",
        },
        {
            accessorKey: "model",
            header: "Model",
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
    const handleSave = async ({ formData, action }: { formData: ProductFormData; action: string }) => {
        try {
            const response = await createMaster({
                db: MONGO_MODELS.PRODUCT_MASTER,
                action: action === 'Add' ? 'create' : 'update',
                filter: formData._id ? { _id: formData._id } : undefined,
                data: {
                    ...formData,
                    isActive: formData.isActive ?? true
                }
            });

            return response;
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const handleImport = () => {
            bulkImport({ roleData: [], continentData: [], regionData: [], countryData: [], locationData: [],categoryData: categoriesResponse,vendorData:[], productData:[], warehouseData:[],customerTypeData:[], customerData:[], userData:[], teamData:[], action: "Add", user, createUser: createMaster, db: "PRODUCT_MASTER", masterName: "Product" });
        };
    
        const handleExport = (type: string) => {
            const formattedData = productsResponse?.data.map((data: any) => {
                return {
                    'Name': data.name,
                    'Description': data?.description,
                    'Category': data?.category?.name,
                    'Brand': data?.brand,
                    'Model': data?.model
                };
            })
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
                key: "name",
                label: "name",
                type: "text" as const,
                placeholder: "Search by name..."
            }
        ],
        filterFields: [
            {
                key: "category",
                label: "categoryName",
                type: "select" as const,
                placeholder: "Filter by category",
                data: categoriesResponse?.data?.map((cat: any) => ({
                    _id: cat?.name,
                    name: cat?.name
                })),
                name: "categoryName",
            },

        ],
        dataTable: {
            columns: columns,
            data: transformedData,
            onRowClick: (row: any) => {
                setDialogAction("Update");
                setSelectedItem({
                    ...row.original,
                    category: row.original.category?._id,
                    vendor: row.original.vendor?._id,
                    alternateVendors: row.original.alternateVendors?.map((v: any) => v._id),
                    isActive: row.original.isActive ? "Active" : "Inactive"
                });
                setIsDialogOpen(true);
            }
        },
        buttons: [
            { label: 'Import', action: handleImport, icon: Import, className: 'bg-blue-600 hover:bg-blue-700 duration-300' },

            {
                label: 'Export', action: handleExport, icon: Download, className: 'bg-green-600 hover:bg-green-700 duration-300', dropdownOptions: [
                    { label: "Export to Excel", value: "excel", action: (type: string) => handleExport(type) },
                    { label: "Export to PDF", value: "pdf", action: (type: string) => handleExport(type) },
                ]
            },
            {
                label: "Add",
                action: () => {
                    setDialogAction("Add");
                    setSelectedItem({
                        name: '',
                        category: '',
                        brand: '',
                        model: '',
                        unitOfMeasure: '',
                        vendor: '',
                        isActive: true
                    });
                    setIsDialogOpen(true);
                },
                icon: Plus,
                className: "bg-primary text-white hover:bg-primary/90"
            }
        ]
    };

    return (
        <div className="h-full w-full">
            <MasterComponent config={pageConfig} loadingState={loading} rowClassMap={undefined} summary={false} />

            <DynamicDialog<ProductFormData>
                isOpen={isDialogOpen}
                closeDialog={() => {
                    setSelectedItem(null)
                    setIsDialogOpen(false)
                }}
                selectedMaster="Product"
                onSave={handleSave}
                fields={formFields}
                initialData={selectedItem || {}}
                action={dialogAction}
                height="auto"
            />
        </div>
    );
};

export default ProductsPage;