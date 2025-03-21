"use client"

import React, { useEffect, useState } from 'react';
import MasterComponent from '@/components/MasterComponent/MasterComponent';
import { Download, Import, Plus, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetMasterQuery, useCreateMasterMutation } from '@/services/endpoints/masterApi';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { MONGO_MODELS, SUCCESS } from '@/shared/constants';
import { bulkImport, validate } from '@/shared/functions';
import { transformData } from '@/lib/utils';
import { toast } from 'react-toastify';
import useUserAuthorised from '@/hooks/useUserAuthorised';
import * as XLSX from "xlsx";

interface WarehouseFormData {
    _id?: string;
    name: string;
    location: string;
    contactPerson: string;
    contactNumber: string;
    isActive: boolean;
}

const WarehousesPage = () => {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<"Add" | "Update">("Add");
    const [selectedItem, setSelectedItem] = useState<WarehouseFormData | null>(null);
    const { user, status, authenticated } = useUserAuthorised();
    // API hooks
    const { data: warehousesResponse, isLoading: warehousesLoading } = useGetMasterQuery({
        db: MONGO_MODELS.WAREHOUSE_MASTER,
        filter: { isActive: true }
    });

    const { data: locationsResponse, isLoading: locationLoading } = useGetMasterQuery({
        db: MONGO_MODELS.LOCATION_MASTER,
        filter: { isActive: true }
    });


    const location = locationsResponse?.data?.filter((location: undefined) => location !== undefined)  // Remove undefined entries
        ?.map((location: any) => ({
            _id: location?.name,
            name: location?.name
        }));


    const fieldsToAdd = [
        { fieldName: 'locationName', path: ['location', 'name'] }
    ];
    const transformedData = transformData(warehousesResponse?.data, fieldsToAdd);

    const loading = warehousesLoading || locationLoading;

    const [createMaster] = useCreateMasterMutation();

    const statusData = [
        { _id: true, name: "True" },
        { _id: false, name: "False" },
    ];

    // Form fields configuration
    const formFields = [
        {
            name: "name",
            label: "Name",
            type: "text",
            required: true,
            placeholder: "Enter warehouse name",
            validate: validate.text
        },
        {
            name: "location",
            label: "Location",
            type: "select",
            placeholder: "Select location",
            required: true,
            data: locationsResponse?.data?.map((loc: any) => ({
                name: loc.name,
                _id: loc._id
            })) || []
        },
        {
            name: "contactPerson",
            label: "Contact Person",
            type: "text",
            required: true,
            placeholder: "Enter contact person name"
        },
        {
            name: "contactNumber",
            label: "Contact Number",
            type: "text",
            required: true,
            placeholder: "Enter contact number"
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

    const editWarehouse = (data: any) => {
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
                <div className='text-red-700' onClick={() => editWarehouse(row.original)}>
                    {row.original.name}
                </div>
            )
        },

        {
            accessorKey: "location",
            header: "Location",
            cell: ({ row }: any) => row.original.location?.name || ''
        },
        {
            accessorKey: "contactPerson",
            header: "Contact Person",
        },
        {
            accessorKey: "contactNumber",
            header: "Contact Number",
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
    const handleSave = async ({ formData, action }: { formData: WarehouseFormData; action: string }) => {
        try {
            const response: any = await createMaster({
                db: MONGO_MODELS.WAREHOUSE_MASTER,
                action: action === 'Add' ? 'create' : 'update',
                filter: formData._id ? { _id: formData._id } : undefined,
                data: {
                    ...formData
                }
            });
            // handle the response if needed
            return response;

        } catch (error) {
            console.error('Error saving warehouse:', error);
        }
    };

    const handleImport = () => {
        bulkImport({ roleData: [], continentData: [], regionData: [], countryData: [], locationData: locationsResponse,categoryData:[],vendorData:[], productData:[], warehouseData:[], action: "Add", user, createUser: createMaster, db: "WAREHOUSE_MASTER", masterName: "Warehouse" });
    };

    const handleExport = (type: string) => {
        const formattedData = warehousesResponse?.data.map((data: any) => {
            return {
                name: data.name,
                location: data?.location?.name,
                contactPerson: data?.contactPerson,
                contactNumber: data?.contactNumber
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
                key: "location",
                label: "locationName",
                type: "select" as const,
                placeholder: "Filter by location",
                data: location,
                name: "locationName"
            },

        ],
        dataTable: {
            columns: columns,
            data: transformedData,
            onRowClick: (row: any) => {
                setDialogAction("Update");
                setSelectedItem({
                    ...row.original,
                    location: row.original.location?._id,
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
                        location: '',
                        contactPerson: '',
                        contactNumber: '',
                        isActive: true
                    });
                    setIsDialogOpen(true);
                },
                icon: Plus,

            },

        ],

    };

    return (
        <div className="h-full w-full">
            <MasterComponent config={pageConfig} loadingState={loading} rowClassMap={undefined} summary={false} />

            <DynamicDialog<WarehouseFormData>
                isOpen={isDialogOpen}
                closeDialog={() => {
                    setSelectedItem(null)
                    setIsDialogOpen(false)
                }}
                selectedMaster="Warehouse"
                onSave={handleSave}
                fields={formFields}
                initialData={selectedItem || {}}
                action={dialogAction}
                height="auto"
            />
        </div>
    );
};

export default WarehousesPage;