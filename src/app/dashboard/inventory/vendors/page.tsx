"use client"

import React, { useEffect, useState } from 'react';
import MasterComponent from '@/components/MasterComponent/MasterComponent';
import { Download, Import, Plus, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetMasterQuery, useCreateMasterMutation } from '@/services/endpoints/masterApi';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { MONGO_MODELS } from '@/shared/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';
import { bulkImport, validate } from '@/shared/functions';
import { transformData } from '@/lib/utils';
import * as XLSX from "xlsx";
import useUserAuthorised from '@/hooks/useUserAuthorised';

interface ContactPerson {
    name: string;
    designation: string;
    email: string;
    phone: string;
}

interface VendorFormData {
    _id?: string;
    name: string;
    email: string;
    phone: string;
    website?: string;
    location: string;
    contactPersons: ContactPerson[];
   isActive:boolean
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
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<"Add" | "Update">("Add");
    const [selectedItem, setSelectedItem] = useState<VendorFormData | null>(null);
const { user, status, authenticated } = useUserAuthorised();
    // API hooks
    const { data: vendorsResponse, isLoading: vendorsLoading } = useGetMasterQuery({
        db: MONGO_MODELS.VENDOR_MASTER,
        filter: { isActive: true },
        populate: ['location']
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
    const transformedData = transformData(vendorsResponse?.data, fieldsToAdd);

    const loading = vendorsLoading || locationLoading;

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
            placeholder: "Enter vendor name",
            validate: validate.text
        },
        {
            name: "email",
            label: "Email",
            type: "email",
            required: true,
            placeholder: "Enter email address",
            validate: validate.email
        },
        {
            name: "phone",
            label: "Phone",
            type: "text",
            required: true,
            placeholder: "Enter phone number",
            validate: validate.phone
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
            placeholder: "Select location",
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
            placeholder: "Select Status",
            data: statusData,
            required: true
        }
    ];
    const editVendors = (data: any) => {
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
                <div className='text-red-700' onClick={() => editVendors(row.original)}>
                    {row.original.name}
                </div>
            )
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
    const handleSave = async ({ formData, action }: { formData: VendorFormData; action: string }): Promise<void> => {
        try {
           
            const reponse:any = await createMaster({
                db: MONGO_MODELS.VENDOR_MASTER,
                action: action === 'Add' ? 'create' : 'update',
                filter: formData._id ? { _id: formData._id } : undefined,
                data: formData
            });

            return reponse;

        } catch (error) {
            console.error('Error saving vendor:', error);
        }
    };

    const handleImport = () => {
            bulkImport({ roleData: [], continentData: [], regionData: [], countryData: [], locationData: locationsResponse,categoryData:[],vendorData:[], productData:[], warehouseData:[],customerTypeData:[], customerData:[], userData:[], teamData:[], action: "Add", user, createUser: createMaster, db: "VENDOR_MASTER", masterName: "Vendor" });
        };
    
        const handleExport = (type: string) => {
           
            const formattedData = vendorsResponse?.data.map((data: any) => {
                return {
                    Name: data.name,
                    Email: data?.email,
                    'Contact Number': data?.phone,
                    Location:data?.location?.name,
                    'Contact Person': data?.contactPersons[0]?.name,
                    Designation:data?.contactPersons[0]?.designation,
                    'Contact Email': data?.contactPersons[0]?.email,
                    'Phone':data?.contactPersons[0]?.phone,

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
                        email: '',
                        phone: '',
                        location: '',
                        contactPersons: [],
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

            <DynamicDialog<VendorFormData>
                isOpen={isDialogOpen}
                closeDialog={() => {
                    setSelectedItem(null)
                    setIsDialogOpen(false)
                }}
                selectedMaster="Vendor"
                onSave={handleSave}
                fields={formFields}
                initialData={selectedItem || {}}
                action={dialogAction}
                height="auto"
            />
        </div>
    );
};

export default VendorsPage;