// src/app/dashboard/master/asset/page.tsx
"use client";
import React, { useState, useMemo } from 'react'
import { useGetMasterQuery, useCreateMasterMutation } from '@/services/endpoints/masterApi';
import { transformData } from '@/lib/utils'; // Import transformData
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { SUCCESS } from '@/shared/constants';
import { toast } from 'react-toastify';
import { Plus, ArrowUpDown, Import, Download } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { bulkImport } from '@/shared/functions';
import useUserAuthorised from '@/hooks/useUserAuthorised';
import MasterComponent from '@/components/MasterComponent/MasterComponent';

interface RowData { // Define a type for the row data
    type: string;
    variantSpecifications:{name: string, value: string}[];
}

const AssetSpecs: React.FC = () => {
 const { user, status, authenticated } = useUserAuthorised();
  const { data: assetData = [], isLoading: assetLoading } = useGetMasterQuery({
      db: 'ASSET_SPEC_MASTER', // Use ASSET_SPEC_MASTER for the db parameter
      sort: { serialNumber: 'asc' }, // Example sorting
  });

  const [createMaster, { isLoading: isCreatingMaster }] = useCreateMasterMutation();

    const [isDialogOpen, setDialogOpen] = useState(false);
    const [selectedMaster, setSelectedMaster] = useState("");
    const [initialData, setInitialData] = useState({});
    const [action, setAction] = useState('Add');

    const openDialog = () => {
        setSelectedMaster("asset");
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setSelectedMaster("");
    };

  const fields: Array<{ label: string; name: string; type: string; data?: any; readOnly?: boolean; format?: string; required?: boolean; placeholder?: string }> = [
        { label: 'type', name: "type", type: "text", required: true, placeholder: 'type' },
        { label: 'specifications', name: "specifications", type: "text", required: true, placeholder: 'specification' },
    ];

    const saveData = async ({ formData, action }: {formData: any, action: string}) => {

        const formattedData = {
            db: 'ASSET_SPEC_MASTER',
            action: action === 'Add' ? 'create' : 'update',
            filter: { "_id": formData._id },
            data: formData,
        };

        const response = await createMaster(formattedData);

        if (response.data && response.data.status === SUCCESS) {
          if (action === 'Add') {
              toast.success('Asset Spec added successfully');
          } else if (action === 'Update') {
              toast.success('Asset Spec updated successfully');
          }
          closeDialog();
        }
        else if (response.error) {
            toast.error(`Error encountered: ${response?.error?.data?.message?.message}`);
        }

    };

    const editAsset = (rowData: RowData) => {
        setAction('Update');
        setInitialData(rowData);
        openDialog();
    };

     const handleAdd = () => {
        setInitialData({});
        setAction('Add');
        openDialog();

    };

     const handleImport = () => {
            // bulkImport({ roleData: [], continentData: [], regionData, action: "Add", user, createUser: createMaster, db: "COUNTRY_MASTER", masterName: "Country" });
        };
    
        const handleExport = () => {
            console.log('UserPage Update button clicked');
            // Your update logic for user page
        };

  // Basic transformData for now, will expand later.  Need to handle nested objects (vendor, location, department, user).
  const fieldsToAdd: { fieldName: string; path: string[] }[] = [
      { fieldName: 'vendorName', path: ['vendor', 'name'] },
      { fieldName: 'locationName', path: ['location', 'name'] },
      { fieldName: 'departmentName', path: ['department', 'name'] },
      { fieldName: 'userName', path: ['assignedUser', 'name'] } // Assuming user has a 'name' field
  ];
  console.log('assetData', assetData);

  const assetColumns = useMemo(() => [
    {
            id: "select",
            header: ({ table }: {table: any}) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }: {row: any}) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value : boolean) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
          {
            id: "serialNumber",
            accessorKey: "serialNumber",
            header: ({ column }: {column: any}) => {
                return (<button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

                >
                    <span>Serial Number</span>
                    <ArrowUpDown size={15} />
                </button>)
            },
            cell: ({ row }: {row: any}) => { return (<div className="lowercase">{row.getValue("serialNumber")}</div>)},
            enableSorting: true,
            enableHiding: false,
          },
          {
            id: "modelNumber",
            accessorKey: 'modelNumber',
            header: ({ column }: {column: any}) => {
                return(
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

                >
                    <span>Model Number</span>
                    <ArrowUpDown size={15} />
                </button>
              )},
            cell: ({ row }: {row: any}) =>  {return (<div className="lowercase">{row.getValue("modelNumber")}</div>)},
            enableSorting: true,
            enableHiding: false,
          },
            {
                id: "status",
                accessorKey: 'status',
                header: ({ column }: { column: any }) => {(
                  <button className="flex items-center space-x-2" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        <span>Status</span>
                        <ArrowUpDown size={15} />
                    </button>)
                },
                cell: ({ row }: {row: any}) => <div>{row.getValue("status")}</div>,
                enableSorting: true,
                enableHiding: false,
              },
        ], []);

        const assetConfig = {
            searchFields: [
                { key: "name", label: 'name', type: "text" as const, placeholder: 'Search by country' },
    
            ],
            dataTable: {
                columns: assetColumns,
                data: assetData?.data,
            },
            buttons: [
    
                { label: 'Import', action: handleImport, icon: Import, className: 'bg-blue-600 hover:bg-blue-700 duration-300' },
                { label: 'Export', action: handleExport, icon: Download, className: 'bg-green-600 hover:bg-green-700 duration-300' },
                { label: 'Add', action: handleAdd, icon: Plus, className: 'bg-sky-600 hover:bg-sky-700 duration-300' },
            ]
        };

  return (
    <>
      <MasterComponent config={assetConfig} loadingState={assetLoading} />
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

export default AssetSpecs;