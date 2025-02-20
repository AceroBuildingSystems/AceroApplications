"use client";

import React from 'react';
import Layout from '@/app/dashboard/layout';
import MasterComponent from '@/components/MasterComponent/MasterComponent';
import { vendorConfig } from '@/lib/masterConfigs/inventoryConfigs';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { IVendor } from '@/models/master/Vendor.model';
import { useCreateMasterMutation, masterApi, useGetMasterQuery } from '@/services/endpoints/masterApi';
import { MONGO_MODELS, SUCCESS } from '@/shared/constants';
import { toast } from 'react-toastify';
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus, Import, Download, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';

const VendorPage = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState("");
  const [initialData, setInitialData] = useState({});
  const [action, setAction] = useState('Add');

  const { data:vendorData = [], isLoading: vendorLoading, isError, error } = useGetMasterQuery({
    db: MONGO_MODELS.VENDOR_MASTER,
    sort: { name: 'asc' },
  });

  const { data: locationData = [], isLoading: locationLoading } = useGetMasterQuery({
      db: MONGO_MODELS.LOCATION_MASTER,
      sort: { name: -1 },
    });


  const [createMaster, { isLoading: isCreatingMaster }] = useCreateMasterMutation();
    console.log({vendorData})
  const handleAdd = () => {
    setInitialData({});
    setAction('Add');
    openDialog("vendor");
  };

  const openDialog = (masterType: string) => {
    setSelectedMaster(masterType);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedMaster("");
  };

    const saveData = async ({ formData, action }) => {

        const formattedData = {
            db: MONGO_MODELS.VENDOR_MASTER,
            action: action === 'Add' ? 'create' : 'update',
            filter: { "_id": formData._id },
            data: formData,
        };



        const response = await createMaster(formattedData);


        if (response.data?.status === SUCCESS && action === 'Add') {
            toast.success('Vendor added successfully');

        }
        else {
            if (response.data?.status === SUCCESS && action === 'Update') {
                toast.success('Vendor added updated successfully');
            }
        }

        if (response?.error?.data?.message?.message) {
            toast.error(`Error encountered: ${response?.error?.data?.message?.message}`);
        }

    };

  const editVendor = (rowData: IVendor) => {
    setAction('Update');
    setInitialData(rowData);
    openDialog("vendor");
  };

  const handleImport = () => {
    console.log('Import button clicked');
  };

  const handleExport = () => {
    console.log('Export button clicked');
  };

  const handleDelete = () => {
    console.log('Delete button clicked');
  };

  const vendorColumns = [
    { accessorKey: 'name', header: 'Name', cell: ({ row }: { row: any }) => <div className='text-blue-500' onClick={() => editVendor(row.original)}>{row.getValue("name")}</div> },
    { accessorKey: 'contactPerson', header: 'Contact Person' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'phone', header: 'Phone' },
    { accessorKey: 'address', header: 'Address' },
    { accessorKey: 'location', header: 'Location',cell: ({ row }: { row: any }) => <div>{row.getValue("location")?.name}</div>  },
  ];



  const vendorConfigUpdated = {
    ...vendorConfig,
    fields: [
      ...vendorConfig.fields.slice(0, 5),
      { label: 'Location', name: "location", type: "select", required: true, placeholder: 'Select Location', format: 'ObjectId', data: locationData?.data },
      ...vendorConfig.fields.slice(6),
    ],
    dataTable: {
      columns: vendorColumns,
      // @ts-expect-error
      data: vendorData?.data,
    },
    buttons: [
      { label: 'Import', action: handleImport, icon: Import, className: 'bg-blue-600 hover:bg-blue-700 duration-300' },
      { label: 'Export', action: handleExport, icon: Download, className: 'bg-green-600 hover:bg-green-700 duration-300' },
      { label: 'Add', action: handleAdd, icon: Plus, className: 'bg-sky-600 hover:bg-sky-700 duration-300' },
    ],
  };

  return (
 <>
      <MasterComponent config={vendorConfigUpdated} loadingState={vendorLoading} />
      <DynamicDialog
        isOpen={isDialogOpen}
        closeDialog={closeDialog}
        selectedMaster={selectedMaster}
        onSave={saveData}
        fields={vendorConfigUpdated.fields}
        initialData={initialData}
        action={action}
        height='auto'
        width='500px'
        />

        </>
  );
};

export default VendorPage;