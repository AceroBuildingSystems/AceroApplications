"use client"

import React, { useEffect, useState } from 'react';
import MasterComponent from '@/components/MasterComponent/MasterComponent';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetMasterQuery, useCreateMasterMutation } from '@/services/endpoints/masterApi';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';

interface ServiceRecord {
    date: string;
    type: string;
    description: string;
    cost?: number;
    vendor: string;
    nextServiceDue?: string;
    attachments?: string[];
}

interface AssignmentRecord {
    assignedTo: string;
    assignedBy: string;
    assignedDate: string;
    returnDate?: string;
    location: string;
    department?: string;
    remarks?: string;
}

interface AssetFormData {
    product: string;
    serialNumber: string;
    status: "in-stock" | "assigned" | "under-repair" | "disposed" | "in-transit";
    purchaseInfo: {
        date: string;
        cost: number;
        poNumber: string;
        prNumber?: string;
        invoiceNumber: string;
        vendor: string;
    };
    warranty: {
        startDate: string;
        endDate: string;
        type: string;
        description?: string;
    };
    currentAssignment?: AssignmentRecord;
    assignmentHistory: AssignmentRecord[];
    serviceHistory: ServiceRecord[];
    currentLocation: string;
    isActive: string;
}

const AssetsPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<"Add" | "Update">("Add");
    const [selectedItem, setSelectedItem] = useState<AssetFormData | null>(null);

    // API hooks
    const { data: assetsResponse, isLoading: assetsLoading } = useGetMasterQuery({
        db: "Asset",
        filter: { isActive: true }
    });

    const { data: productsResponse } = useGetMasterQuery({
        db: "Product",
        filter: { isActive: true }
    });

    const { data: vendorsResponse } = useGetMasterQuery({
        db: "Vendor",
        filter: { isActive: true }
    });

    const { data: locationsResponse } = useGetMasterQuery({
        db: "Location",
        filter: { isActive: true }
    });

    const { data: departmentsResponse } = useGetMasterQuery({
        db: "Department",
        filter: { isActive: true }
    });

    const { data: usersResponse } = useGetMasterQuery({
        db: "User",
        filter: { isActive: true }
    });

    const [createMaster] = useCreateMasterMutation();

    // Form fields configuration
    const formFields = [
        {
            name: "product",
            label: "Product",
            type: "select",
            required: true,
            options: productsResponse?.data?.map((prod: any) => ({
                label: `${prod.name} (${prod.code})`,
                value: prod._id
            })) || []
        },
        {
            name: "serialNumber",
            label: "Serial Number",
            type: "text",
            required: true,
            placeholder: "Enter serial number"
        },
        {
            name: "status",
            label: "Status",
            type: "select",
            required: true,
            options: [
                "in-stock",
                "assigned",
                "under-repair",
                "disposed",
                "in-transit"
            ]
        },
        {
            name: "purchaseInfo",
            label: "Purchase Information",
            type: "custom",
            CustomComponent: ({ value = {}, onChange }: any) => (
                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="date"
                            value={value.date || ''}
                            onChange={(e) => onChange({ ...value, date: e.target.value })}
                            className="px-2 py-1 border rounded"
                        />
                        <input
                            type="number"
                            value={value.cost || ''}
                            onChange={(e) => onChange({ ...value, cost: Number(e.target.value) })}
                            className="px-2 py-1 border rounded"
                            placeholder="Cost"
                        />
                        <input
                            type="text"
                            value={value.poNumber || ''}
                            onChange={(e) => onChange({ ...value, poNumber: e.target.value })}
                            className="px-2 py-1 border rounded"
                            placeholder="PO Number"
                        />
                        <input
                            type="text"
                            value={value.prNumber || ''}
                            onChange={(e) => onChange({ ...value, prNumber: e.target.value })}
                            className="px-2 py-1 border rounded"
                            placeholder="PR Number"
                        />
                        <input
                            type="text"
                            value={value.invoiceNumber || ''}
                            onChange={(e) => onChange({ ...value, invoiceNumber: e.target.value })}
                            className="px-2 py-1 border rounded"
                            placeholder="Invoice Number"
                        />
                        <select
                            value={value.vendor || ''}
                            onChange={(e) => onChange({ ...value, vendor: e.target.value })}
                            className="px-2 py-1 border rounded"
                        >
                            <option value="">Select Vendor</option>
                            {vendorsResponse?.data?.map((vendor: any) => (
                                <option key={vendor._id} value={vendor._id}>
                                    {vendor.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )
        },
        {
            name: "warranty",
            label: "Warranty Information",
            type: "custom",
            CustomComponent: ({ value = {}, onChange }: any) => (
                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="date"
                            value={value.startDate || ''}
                            onChange={(e) => onChange({ ...value, startDate: e.target.value })}
                            className="px-2 py-1 border rounded"
                        />
                        <input
                            type="date"
                            value={value.endDate || ''}
                            onChange={(e) => onChange({ ...value, endDate: e.target.value })}
                            className="px-2 py-1 border rounded"
                        />
                        <input
                            type="text"
                            value={value.type || ''}
                            onChange={(e) => onChange({ ...value, type: e.target.value })}
                            className="px-2 py-1 border rounded"
                            placeholder="Warranty Type"
                        />
                        <input
                            type="text"
                            value={value.description || ''}
                            onChange={(e) => onChange({ ...value, description: e.target.value })}
                            className="px-2 py-1 border rounded"
                            placeholder="Description"
                        />
                    </div>
                </div>
            )
        },
        {
            name: "currentAssignment",
            label: "Current Assignment",
            type: "custom",
            CustomComponent: ({ value = {}, onChange }: any) => (
                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <select
                            value={value.assignedTo || ''}
                            onChange={(e) => onChange({ ...value, assignedTo: e.target.value })}
                            className="px-2 py-1 border rounded"
                        >
                            <option value="">Select User</option>
                            {usersResponse?.data?.map((user: any) => (
                                <option key={user._id} value={user._id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="date"
                            value={value.assignedDate || ''}
                            onChange={(e) => onChange({ ...value, assignedDate: e.target.value })}
                            className="px-2 py-1 border rounded"
                        />
                        <input
                            type="date"
                            value={value.returnDate || ''}
                            onChange={(e) => onChange({ ...value, returnDate: e.target.value })}
                            className="px-2 py-1 border rounded"
                        />
                        <select
                            value={value.location || ''}
                            onChange={(e) => onChange({ ...value, location: e.target.value })}
                            className="px-2 py-1 border rounded"
                        >
                            <option value="">Select Location</option>
                            {locationsResponse?.data?.map((loc: any) => (
                                <option key={loc._id} value={loc._id}>
                                    {loc.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={value.department || ''}
                            onChange={(e) => onChange({ ...value, department: e.target.value })}
                            className="px-2 py-1 border rounded"
                        >
                            <option value="">Select Department</option>
                            {departmentsResponse?.data?.map((dept: any) => (
                                <option key={dept._id} value={dept._id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            value={value.remarks || ''}
                            onChange={(e) => onChange({ ...value, remarks: e.target.value })}
                            className="px-2 py-1 border rounded"
                            placeholder="Remarks"
                        />
                    </div>
                </div>
            )
        },
        {
            name: "serviceHistory",
            label: "Service History",
            type: "custom",
            CustomComponent: ({ value = [], onChange }: any) => (
                <div className="space-y-2">
                    {value.map((service: ServiceRecord, index: number) => (
                        <div key={index} className="p-2 border rounded space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="date"
                                    value={service.date}
                                    onChange={(e) => {
                                        const newHistory = [...value];
                                        newHistory[index] = { ...service, date: e.target.value };
                                        onChange(newHistory);
                                    }}
                                    className="px-2 py-1 border rounded"
                                />
                                <input
                                    type="text"
                                    value={service.type}
                                    onChange={(e) => {
                                        const newHistory = [...value];
                                        newHistory[index] = { ...service, type: e.target.value };
                                        onChange(newHistory);
                                    }}
                                    className="px-2 py-1 border rounded"
                                    placeholder="Service Type"
                                />
                                <textarea
                                    value={service.description}
                                    onChange={(e) => {
                                        const newHistory = [...value];
                                        newHistory[index] = { ...service, description: e.target.value };
                                        onChange(newHistory);
                                    }}
                                    className="px-2 py-1 border rounded col-span-2"
                                    placeholder="Description"
                                />
                                <input
                                    type="number"
                                    value={service.cost || ''}
                                    onChange={(e) => {
                                        const newHistory = [...value];
                                        newHistory[index] = { ...service, cost: Number(e.target.value) };
                                        onChange(newHistory);
                                    }}
                                    className="px-2 py-1 border rounded"
                                    placeholder="Cost"
                                />
                                <select
                                    value={service.vendor}
                                    onChange={(e) => {
                                        const newHistory = [...value];
                                        newHistory[index] = { ...service, vendor: e.target.value };
                                        onChange(newHistory);
                                    }}
                                    className="px-2 py-1 border rounded"
                                >
                                    <option value="">Select Vendor</option>
                                    {vendorsResponse?.data?.map((vendor: any) => (
                                        <option key={vendor._id} value={vendor._id}>
                                            {vendor.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={() => {
                                    const newHistory = value.filter((_: any, i: number) => i !== index);
                                    onChange(newHistory);
                                }}
                                className="px-2 py-1 text-red-500 hover:text-red-700"
                            >
                                Remove Service Record
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => {
                            onChange([
                                ...value,
                                {
                                    date: new Date().toISOString().split('T')[0],
                                    type: '',
                                    description: '',
                                    vendor: ''
                                }
                            ]);
                        }}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Add Service Record
                    </button>
                </div>
            )
        },
        {
            name: "currentLocation",
            label: "Current Location",
            type: "select",
            required: true,
            options: locationsResponse?.data?.map((loc: any) => ({
                label: loc.name,
                value: loc._id
            })) || []
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
            accessorKey: "product",
            header: "Product",
            cell: ({ row }: any) => row.original.product?.name || ''
        },
        {
            accessorKey: "serialNumber",
            header: "Serial Number"
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }: any) => (
                <div className={`px-2 py-1 rounded-full text-center ${
                    row.original.status === 'in-stock' ? 'bg-green-100 text-green-800' :
                    row.original.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                    row.original.status === 'under-repair' ? 'bg-yellow-100 text-yellow-800' :
                    row.original.status === 'disposed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                    {row.original.status}
                </div>
            )
        },
        {
            accessorKey: "currentAssignment",
            header: "Assigned To",
            cell: ({ row }: any) => row.original.currentAssignment?.assignedTo?.name || 'Not Assigned'
        },
        {
            accessorKey: "currentLocation",
            header: "Location",
            cell: ({ row }: any) => row.original.currentLocation?.name || ''
        },
        {
            accessorKey: "warranty.endDate",
            header: "Warranty Until",
            cell: ({ row }: any) => row.original.warranty?.endDate ? new Date(row.original.warranty.endDate).toLocaleDateString() : ''
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
                db: "Asset",
                action: action.toLowerCase(),
                data: {
                    ...formData,
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
                label: "Serial Number",
                type: "text" as const,
                placeholder: "Search by serial number..."
            }
        ],
        filterFields: [
            {
                key: "status",
                label: "Status",
                type: "select" as const,
                placeholder: "Filter by status",
                options: ["in-stock", "assigned", "under-repair", "disposed", "in-transit"]
            },
            {
                key: "currentLocation",
                label: "Location",
                type: "select" as const,
                placeholder: "Filter by location",
                options: locationsResponse?.data?.map((loc: any) => loc.name) || []
            }
        ],
        dataTable: {
            columns: columns,
            data: (assetsResponse?.data || []) as any[]
        },
        buttons: [
            {
                label: "Add New",
                action: () => {
                    setDialogAction("Add");
                    setSelectedItem({
                        product: '',
                        serialNumber: '',
                        status: "in-stock",
                        purchaseInfo: {
                            date: new Date().toISOString().split('T')[0],
                            cost: 0,
                            poNumber: '',
                            invoiceNumber: '',
                            vendor: ''
                        },
                        warranty: {
                            startDate: new Date().toISOString().split('T')[0],
                            endDate: new Date().toISOString().split('T')[0],
                            type: ''
                        },
                        assignmentHistory: [],
                        serviceHistory: [],
                        currentLocation: '',
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
            
            <DynamicDialog
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