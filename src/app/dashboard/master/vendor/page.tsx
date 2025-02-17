// src/app/dashboard/master/vendor/page.tsx
"use client";
import React, { useState, useMemo } from 'react'
import MasterComponent from '@/components/MasterComponent/MasterComponent'
import { useGetMasterQuery, useCreateMasterMutation } from '@/services/endpoints/masterApi';
import { transformData } from '@/lib/utils'; // Import transformData
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { SUCCESS } from '@/shared/constants';
import { toast } from 'react-toastify';
import { Plus, ArrowUpDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface RowData { // Define a type for the row data
    _id: string;
    name: string;
    contactPerson?: string;
    address?: string,
    pincode?: string,
    isActive?: boolean
    email?: string;
    phone?: string
    // Add other properties as needed
}

const VendorPage: React.FC = () => {
  const { data: vendorData = [], isLoading: vendorLoading } = useGetMasterQuery({
      db: 'VENDOR_MASTER',
      sort: { name: 'asc' }, // Example sorting
  });

  const [createMaster, { isLoading: isCreatingMaster }] = useCreateMasterMutation();

    const [isDialogOpen, setDialogOpen] = useState(false);
    const [selectedMaster, setSelectedMaster] = useState("");
    const [initialData, setInitialData] = useState({});
    const [action, setAction] = useState('Add');

    const openDialog = () => {
        setSelectedMaster("vendor");
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setSelectedMaster("");
    };

  const fields: Array<{ label: string; name: string; type: string; data?: any; readOnly?: boolean; format?: string; required?: boolean; placeholder?: string }> = [
        { label: 'Vendor Name', name: "name", type: "text", required: true, placeholder: 'Vendor Name' },
        { label: 'Contact Person', name: "contactPerson", type: "text", placeholder: 'Contact Person' },
        { label: 'Email', name: "email", type: "text", placeholder: 'Email' },
        { label: 'Phone', name: "phone", type: "text", placeholder: 'Phone' },
        { label: 'Address', name: "address", type: "text", placeholder: 'Address' },
        { label: 'Status', name: "isActive", type: "select", required: true, placeholder: 'Select Status', data: [{_id: true, name: 'Active'}, {_id: false, name: 'InActive'}] },
    ];

    const saveData = async ({ formData, action }: {formData: any, action: string}) => {

        const formattedData = {
            db: 'VENDOR_MASTER',
            action: action === 'Add' ? 'create' : 'update',
            filter: { "_id": formData._id },
            data: formData,
        };

        const response = await createMaster(formattedData);

        if (response.data && response.data.status === SUCCESS) {
          if (action === 'Add') {
              toast.success('Vendor added successfully');
          } else if (action === 'Update') {
              toast.success('Vendor updated successfully');
          }
          closeDialog();
        }
        else if (response.error) {
            toast.error(`Error encountered: ${response?.error?.data?.message?.message}`);
        }

    };

    const editVendor = (rowData: RowData) => {
        setAction('Update');
        setInitialData(rowData);
        openDialog();
    };

     const handleAdd = () => {
        setInitialData({});
        setAction('Add');
        openDialog();

    };

  // Basic transformData for now
  const fieldsToAdd: { fieldName: string; path: string[] }[] = [
  ];


  const vendorColumns = useMemo(() => [
    {
            id: "select",
            header: ({ table }: {table: any}) => (
              <React.Fragment>
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
                </React.Fragment>
            ),
            cell: ({ row }: {row: any}) => (
              <React.Fragment>
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value : boolean) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
                </React.Fragment>
            ),
            enableSorting: false,
            enableHiding: false,
        },
          {
            id: "name",
            accessorKey: "name",
            header: ({ column }: {column: any}) => {
                return (<React.Fragment><button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

                >
                    <span>Vendor Name</span>
                    <ArrowUpDown size={15} />
                </button></React.Fragment>)
            },
            cell: ({ row }: {row: any}) =>  {return(<div className="lowercase">{row.getValue("name")}</div>)},
            enableSorting: true,
            enableHiding: false,
          },
          {
            id: "contactPerson",
            accessorKey: "contactPerson",
            header: ({ column }: {column: any}) => {
              return (<React.Fragment><button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

                >
                    <span>Contact Person</span>
                    <ArrowUpDown size={15} />
                </button></React.Fragment>)
            },
            cell: ({ row }: {row: any}) => {return(<div className="lowercase">{row.getValue("contactPerson")}</div>)},
            enableSorting: true,
            enableHiding: false,
          },
            {
                id: "email",
                accessorKey: 'email',
                header: ({ column }: { column: any }) => { return(
                    <React.Fragment><button className="flex items-center space-x-2" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    
                        <span>Email</span>
                        <ArrowUpDown size={15} />
                    </button></React.Fragment>)
                },
                cell: ({ row }: {row: any}) => <div>{row.getValue("email")}</div>,
                enableSorting: true,
                enableHiding: false,
              },
              {
                id: "phone",
                accessorKey: 'phone',
                header: ({ column }: { column: any }) => (
                  <React.Fragment>  <button className="flex items-center space-x-2" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    
                        <span>Phone</span>
                        <ArrowUpDown size={15} />
                    </button></React.Fragment>
                ),
                cell: ({ row }: {row: any}) => <div>{row.getValue("phone")}</div>,
                enableSorting: true,
                enableHiding: false,
              },
        ], []);


  return (
    <>
      <MasterComponent config={{
        searchFields: [],
        filterFields: [],
        dataTable: {columns: vendorColumns, data: vendorData?.data},
        buttons: [{label: 'Add Vendor',action: handleAdd, icon: Plus, className: 'bg-sky-600 hover:bg-sky-700 duration-300'}]
      }} loadingState={vendorLoading} />
      <DynamicDialog
          isOpen={isDialogOpen}
          closeDialog={closeDialog}
          selectedMaster={selectedMaster}
          onSave={saveData}
          fields={fields}
          initialData={initialData}
          action={action}
          height='auto'
          width="400px"
      />
    </>
  );
};

export default VendorPage;