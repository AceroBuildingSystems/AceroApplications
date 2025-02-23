"use client"

import React, { useEffect, useState } from 'react';
import MasterComponent from '@/components/MasterComponent/MasterComponent';
import { Plus, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetMasterQuery, useCreateMasterMutation } from '@/services/endpoints/masterApi';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { MONGO_MODELS } from '@/shared/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';

interface ContactPerson {
    name: string;
    designation: string;
    email: string;
    phone: string;
}

interface VendorFormData {
    _id?: string;
    name: string;
    code: string;
    email: string;
    phone: string;
    website?: string;
    location: string;
    contactPersons: ContactPerson[];
    isActive: string;
}

const ContactPersonsComponent = ({ accessData, handleChange }: { accessData: ContactPerson[]; handleChange: (e: { target: { value: any } }, fieldName: string) => void }) => {
    const [contacts, setContacts] = useState<ContactPerson[]>(accessData || []);

    useEffect(() => {
        setContacts(accessData || []);
    }, [accessData]);

    const updateContacts = (newContacts: ContactPerson[]) => {
        setContacts(newContacts);
        handleChange({ target: { value: newContacts } }, "contactPersons");
    };

    return (
        <div className="space-y-2">
            {contacts.map((contact, index) => (
                <div key={index} className="p-2 border rounded space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            type="text"
                            value={contact.name}
                            onChange={(e) => {
                                const newContacts = [...contacts];
                                newContacts[index] = { ...contact, name: e.target.value };
                                updateContacts(newContacts);
                            }}
                            placeholder="Contact Name"
                        />
                        <Input
                            type="text"
                            value={contact.designation}
                            onChange={(e) => {
                                const newContacts = [...contacts];
                                newContacts[index] = { ...contact, designation: e.target.value };
                                updateContacts(newContacts);
                            }}
                            placeholder="Designation"
                        />
                        <Input
                            type="email"
                            value={contact.email}
                            onChange={(e) => {
                                const newContacts = [...contacts];
                                newContacts[index] = { ...contact, email: e.target.value };
                                updateContacts(newContacts);
                            }}
                            placeholder="Email"
                        />
                        <Input
                            type="text"
                            value={contact.phone}
                            onChange={(e) => {
                                const newContacts = [...contacts];
                                newContacts[index] = { ...contact, phone: e.target.value };
                                updateContacts(newContacts);
                            }}
                            placeholder="Phone"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                            const newContacts = contacts.filter((_, i) => i !== index);
                            updateContacts(newContacts);
                        }}
                    >
                        Remove Contact
                    </Button>
                </div>
            ))}
            <Button
                type="button"
                onClick={() => {
                    updateContacts([
                        ...contacts,
                        {
                            name: '',
                            designation: '',
                            email: '',
                            phone: ''
                        }
                    ]);
                }}
                className="w-full"
            >
                Add Contact Person
            </Button>
        </div>
    );
};

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

    const [createMaster] = useCreateMasterMutation();

    // Form fields configuration
    const formFields = [
        {
            name: "_id",
            type: "hidden"
        },
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
            data: locationsResponse?.data?.map((loc: any) => ({
                name: loc.name,
                _id: loc._id
            })) || []
        },
        {
            name: "contactPersons",
            label: "Contact Persons",
            type: "custom",
            CustomComponent: ContactPersonsComponent
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
                db: MONGO_MODELS.VENDOR_MASTER,
                action: action === 'Add' ? 'create' : 'update',
                filter: formData._id ? { _id: formData._id } : undefined,
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
            data: (vendorsResponse?.data || []) as any[],
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
                        contactPersons: [],
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
            
            <DynamicDialog<VendorFormData>
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