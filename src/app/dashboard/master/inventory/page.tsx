// src/app/dashboard/master/inventory/page.tsx
"use client";
import React, { useState, useMemo } from 'react'
import MasterComponent from '@/components/MasterComponent/MasterComponent'
import { useGetMasterQuery, useCreateMasterMutation } from '@/services/endpoints/masterApi';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { SUCCESS } from '@/shared/constants';
import { toast } from 'react-toastify';
import { Plus, ArrowUpDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface RowData {
    _id: string;
    name: string;
    description?: string;
    vendor?: any;
    asset?: any;
    quantity?: number;
    location?: any;
}

const InventoryPage: React.FC = () => {
  const { data: vendorResponse } = useGetMasterQuery({ db: 'VENDOR_MASTER' });
  const vendorData = vendorResponse?.data;
  const { data: assetResponse } = useGetMasterQuery({ db: 'ASSET_MASTER' });
  const assetData = assetResponse?.data;
  const { data: locationResponse } = useGetMasterQuery({ db: 'LOCATION_MASTER' });
  const locationData = locationResponse?.data;

  const { data: inventoryData = [], isLoading: inventoryLoading } = useGetMasterQuery({
      db: 'INVENTORY_MASTER',
      sort: { name: 'asc' },
  });

  const [createMaster, { isLoading: isCreatingMaster }] = useCreateMasterMutation();

    const [isDialogOpen, setDialogOpen] = useState(false);
    const [selectedMaster, setSelectedMaster] = useState("");
    const [initialData, setInitialData] = useState({});
    const [action, setAction] = useState('Add');

    const openDialog = () => {
        setSelectedMaster("inventory");
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setSelectedMaster("");
    };

  const fields: Array<{ label: string; name: string; type: string; data?: any; readOnly?: boolean; format?: string; required?: boolean; placeholder?: string }> = [
        { label: 'Inventory Name', name: "name", type: "text", required: true, placeholder: 'Inventory Name' },
        { label: 'Description', name: "description", type: "text", placeholder: 'Description' },
        { label: 'Vendor', name: "vendor", type: "custom", placeholder: 'Select Vendor', data: vendorData?.data },
        { label: 'Asset', name: "asset", type: "custom", placeholder: 'Select Asset', data: assetData?.data },
        { label: 'Quantity', name: "quantity", type: "number", placeholder: 'Quantity' },
        { label: 'Location', name: "location", type: "custom", placeholder: 'Select Location', data: locationData?.data },
    ];

    const saveData = async ({ formData, action }: {formData: any, action: string}) => {

        const formattedData = {
            db: 'INVENTORY_MASTER',
            action: action === 'Add' ? 'create' : 'update',
            filter: { "_id": formData._id },
            data: formData,
        };

        const response = await createMaster(formattedData);

        if (response?.data?.status === SUCCESS) {
          if (action === 'Add') {
              toast.success('Inventory added successfully');
          } else if (action === 'Update') {
              toast.success('Inventory updated successfully');
          }
          closeDialog();
        }
        else if (response.error) {
            toast.error(`Error encountered: ${response?.error?.data?.message}`);
        }

    };

    const editInventory = (rowData: RowData) => {
        setAction('Update');
        setInitialData(rowData);
        openDialog();
    };

     const handleAdd = () => {
        setInitialData({});
        setAction('Add');
        openDialog();
    };


  const inventoryColumns = useMemo(() => [
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
                    <span>Inventory Name</span>
                    <ArrowUpDown size={15} />
                </button></React.Fragment>)
            },
            cell: ({ row }: {row: any}) =>  {return(<div className="lowercase">{row.getValue("name")}</div>)},
            enableSorting: true,
            enableHiding: false,
          },
          {
            id: "description",
            accessorKey: "description",
            header: ({ column }: {column: any}) => {
              return (<React.Fragment><button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

                >
                    <span>Description</span>
                    <ArrowUpDown size={15} />
                </button></React.Fragment>)
            },
            cell: ({ row }: {row: any}) => {return(<div className="lowercase">{row.getValue("description")}</div>)},
            enableSorting: true,
            enableHiding: false,
          },
            {
                id: "quantity",
                accessorKey: 'quantity',
                header: ({ column }: { column: any }) => { return(
                    <React.Fragment><button className="flex items-center space-x-2" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>

                        <span>Quantity</span>
                        <ArrowUpDown size={15} />
                    </button></React.Fragment>)
                },
                cell: ({ row }: {row: any}) => <div>{row.getValue("quantity")}</div>,
                enableSorting: true,
                enableHiding: false,
              },
        ], []);


  return (
    <>
      <MasterComponent config={{
        searchFields: [],
        filterFields: [],
        dataTable: {columns: inventoryColumns, data: inventoryData?.data},
        buttons: [{label: 'Add Inventory',action: handleAdd, icon: Plus, className: 'bg-sky-600 hover:bg-sky-700 duration-300'}]
      }} loadingState={inventoryLoading} />
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

export default InventoryPage;