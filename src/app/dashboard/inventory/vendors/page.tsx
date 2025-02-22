"use client"

import React, { useEffect, useState } from 'react';
import MasterComponent from '@/components/MasterComponent/MasterComponent';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetMasterQuery, useCreateMasterMutation } from '@/services/endpoints/masterApi';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { MONGO_MODELS } from '@/shared/constants';

interface ContactPerson {
    name: string;
    designation: string;
    email: string;
    phone: string;
}

interface PaymentDetails {
    accountName: string;
    accountNumber: string;
    bankName: string;
    swiftCode?: string;
    taxId?: string;
}

interface VendorFormData {
    name: string;
    code: string;
    email: string;
    phone: string;
    website?: string;
    location: string;
    contactPersons: ContactPerson[];
    paymentDetails: PaymentDetails;
    registrationNumber?: string;
    taxRegistrationNumber?: string;
    creditPeriod?: number;
    isActive: string;
}

const VendorsPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<"Add" | "Update">("Add");
    const [selectedItem, setSelectedItem] = useState<VendorFormData | null>(null);

    // API hooks
    const { data: vendorsResponse, isLoading: vendorsLoading } = useGetMasterQuery({
        db: MONGO_MODELS.VENDOR_MASTER,
        filter: { isActive: true }
    });

    const { data: locationsResponse } = useGetMasterQuery({
        db: MONGO_MODELS.LOCATION_MASTER,
        filter: { isActive: true }
    });
    console.log('locationsResponse:', locationsResponse);
    const [createMaster] = useCreateMasterMutation();

    // Form fields configuration
    const formFields = [
        {
            name: "name",
            label: "Name",
            type: "text",
            required: true,
            placeholder: "Enter vendor name"
        },
        {
            name: "code",
            label: "Code",
            type: "text",
            required: true,
            placeholder: "Enter vendor code"
        },
        {
            name: "email",
            label: "Email",
            type: "email",
            required: true,
            placeholder: "Enter email address"
        },
        {
            name: "phone",
            label: "Phone",
            type: "text",
            required: true,
            placeholder: "Enter phone number"
        },
        {
            name: "website",
            label: "Website",
            type: "text",
            placeholder: "Enter website URL"
        },
        {
            name: "location",
            label: "Location",
            type: "select",
            required: true,
            options: locationsResponse?.data?.map((loc: any) => ({
                label: loc.name,
                value: loc._id
            })) || []
        },
        {
            name: "contactPersons",
            label: "Contact Persons",
            type: "custom",
            CustomComponent: ({ value = [], onChange }: any) => (
                <div className="space-y-2">
                    {value.map((contact: ContactPerson, index: number) => (
                        <div key={index} className="p-2 border rounded space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    value={contact.name}
                                    onChange={(e) => {
                                        const newContacts = [...value];
                                        newContacts[index] = { ...contact, name: e.target.value };
                                        onChange(newContacts);
                                    }}
                                    className="px-2 py-1 border rounded"
                                    placeholder="Contact Name"
                                />
                                <input
                                    type="text"
                                    value={contact.designation}
                                    onChange={(e) => {
                                        const newContacts = [...value];
                                        newContacts[index] = { ...contact, designation: e.target.value };
                                        onChange(newContacts);
                                    }}
                                    className="px-2 py-1 border rounded"
                                    placeholder="Designation"
                                />
                                <input
                                    type="email"
                                    value={contact.email}
                                    onChange={(e) => {
                                        const newContacts = [...value];
                                        newContacts[index] = { ...contact, email: e.target.value };
                                        onChange(newContacts);
                                    }}
                                    className="px-2 py-1 border rounded"
                                    placeholder="Email"
                                />
                                <input
                                    type="text"
                                    value={contact.phone}
                                    onChange={(e) => {
                                        const newContacts = [...value];
                                        newContacts[index] = { ...contact, phone: e.target.value };
                                        onChange(newContacts);
                                    }}
                                    className="px-2 py-1 border rounded"
                                    placeholder="Phone"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const newContacts = value.filter((_: any, i: number) => i !== index);
                                    onChange(newContacts);
                                }}
                                className="px-2 py-1 text-red-500 hover:text-red-700"
                            >
                                Remove Contact
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => {
                            onChange([
                                ...value,
                                {
                                    name: '',
                                    designation: '',
                                    email: '',
                                    phone: ''
                                }
                            ]);
                        }}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Add Contact Person
                    </button>
                </div>
            )
        },
        {
            name: "paymentDetails",
            label: "Payment Details",
            type: "custom",
            CustomComponent: ({ value = {}, onChange }: any) => (
                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="text"
                            value={value.accountName || ''}
                            onChange={(e) => onChange({ ...value, accountName: e.target.value })}
                            className="px-2 py-1 border rounded"
                            placeholder="Account Name"
                        />
                        <input
                            type="text"
                            value={value.accountNumber || ''}
                            onChange={(e) => onChange({ ...value, accountNumber: e.target.value })}
                            className="px-2 py-1 border rounded"
                            placeholder="Account Number"
                        />
                        <input
                            type="text"
                            value={value.bankName || ''}
                            onChange={(e) => onChange({ ...value, bankName: e.target.value })}
                            className="px-2 py-1 border rounded"
                            placeholder="Bank Name"
                        />
                        <input
                            type="text"
                            value={value.swiftCode || ''}
                            onChange={(e) => onChange({ ...value, swiftCode: e.target.value })}
                            className="px-2 py-1 border rounded"
                            placeholder="SWIFT Code"
                        />
                        <input
                            type="text"
                            value={value.taxId || ''}
                            onChange={(e) => onChange({ ...value, taxId: e.target.value })}
                            className="px-2 py-1 border rounded"
                            placeholder="Tax ID"
                        />
                    </div>
                </div>
            )
        },
        {
            name: "registrationNumber",
            label: "Registration Number",
            type: "text",
            placeholder: "Enter registration number"
        },
        {
            name: "taxRegistrationNumber",
            label: "Tax Registration Number",
            type: "text",
            placeholder: "Enter tax registration number"
        },
        {
            name: "creditPeriod",
            label: "Credit Period (Days)",
            type: "number",
            placeholder: "Enter credit period"
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
            accessorKey: "name",
            header: "Name",
        },
        {
            accessorKey: "code",
            header: "Code",
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            accessorKey: "phone",
            header: "Phone",
        },
        {
            accessorKey: "location",
            header: "Location",
            cell: ({ row }: any) => row.original.location?.name || ''
        },
        {
            accessorKey: "contactPersons",
            header: "Contact Persons",
            cell: ({ row }: any) => {
                const contacts = row.original.contactPersons || [];
                if (contacts.length === 0) return '-';
                return (
                    <div className="max-w-[300px] overflow-hidden text-ellipsis">
                        {contacts.map((contact: ContactPerson) => 
                            `${contact.name} (${contact.designation})`
                        ).join(", ")}
                    </div>
                );
            }
        },
        {
            accessorKey: "creditPeriod",
            header: "Credit Period",
            cell: ({ row }: any) => row.original.creditPeriod ? `${row.original.creditPeriod} days` : '-'
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
    const handleSave = async ({ formData, action }: { formData: VendorFormData; action: string }) => {
        try {
            await createMaster({
                db: "Vendor",
                action: action.toLowerCase(),
                data: {
                    ...formData,
                    isActive: formData.isActive === "Active"
                }
            }).unwrap();
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Error saving vendor:', error);
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
                key: "location",
                label: "Location",
                type: "select" as const,
                placeholder: "Filter by location",
                options: locationsResponse?.data?.map((loc: any) => loc.name) || []
            },
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
            data: (vendorsResponse?.data || []) as any[]
        },
        buttons: [
            {
                label: "Add New",
                action: () => {
                    setDialogAction("Add");
                    setSelectedItem({
                        name: '',
                        code: '',
                        email: '',
                        phone: '',
                        location: '',
                        contactPersons: [], // Initialize empty array for contact persons
                        paymentDetails: {
                            accountName: '',
                            accountNumber: '',
                            bankName: ''
                        },
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
        if (!vendorsLoading) {
            setLoading(false);
        }
    }, [vendorsLoading]);

    return (
        <div className="h-full">
            <MasterComponent config={pageConfig} loadingState={loading} />
            
            <DynamicDialog
                isOpen={isDialogOpen}
                closeDialog={() => setIsDialogOpen(false)}
                selectedMaster="Vendor"
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

export default VendorsPage;