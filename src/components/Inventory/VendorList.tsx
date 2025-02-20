"use client";

import React, { useState, useEffect } from 'react';
import MasterComponent from '@/components/MasterComponent/MasterComponent';
import { vendorConfig } from '@/lib/masterConfigs/inventoryConfigs';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { IVendor } from '@/models/master/Vendor.model';
import { useCreateMasterMutation, masterApi } from '@/services/endpoints/masterApi';
import { SUCCESS } from '@/shared/constants';
import { toast } from 'react-toastify';
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus, Import, Download, Upload } from 'lucide-react';
import { Location } from '@/models';

const VendorList: React.FC = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState("");
  const [initialData, setInitialData] = useState({});
  const [action, setAction] = useState('Add');
  const [locationData, setLocationData] = useState<any[]>([]);

  const { data, isLoading: vendorLoading, isError, error } = masterApi.endpoints.getMaster.useQuery({
    db: 'VENDOR_MASTER',
    sort: { name: 'asc' },
  });

  // @ts-expect-error
  const vendorData: IVendor[] = isError ? [] : (data?.data as IVendor[]) || [];

  const [createMaster, { isLoading: isCreatingMaster }] = useCreateMasterMutation();

  useEffect(() => {
    const fetchLocations = async () => {
      // @ts-expect-error
      const locationQuery = masterApi.endpoints.getMaster.useQuery({ db: 'LOCATION_MASTER' });
      // @ts-expect-error
      setLocationData(locationQuery?.data?.data || []);
    };
    fetchLocations();
  }, []);

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

  const saveData = async (formData: any) => {
    const formattedData = {
      db: 'VENDOR_MASTER',
      action: formData._id ? 'update' : 'create',
      data: formData,
    };

    const response = await createMaster(formattedData);

    if (response?.data && response.data.status === SUCCESS) {
      toast.success(`Vendor ${formData._id ? 'updated' : 'added'} successfully`);
    } else {
      toast.error(`Error encountered: ${response?.error?.data?.message}`);
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
    { accessorKey: 'location', header: 'Location' },
  ];

  const transformedVendorData = vendorData.map(vendor => ({
    ...vendor,
    location: "location",
  } as any);

  const vendorConfigUpdated = {
    ...vendorConfig,
    fields: [
      ...vendorConfig.fields.slice(0, 5),
      { label: 'Location', name: "location", type: "select", required: true, placeholder: 'Select Location', format: 'ObjectId', data: locationData },
      ...vendorConfig.fields.slice(6),
    ],
    dataTable: {
      columns: vendorColumns,
      // @ts-expect-error
      data: transformedVendorData,
    },
    buttons: [
      { label: 'Import', action: handleImport, icon: Import, className: 'bg-blue-600 hover:bg-blue-700 duration-300' },
      { label: 'Export', action: handleExport, icon: Download, className: 'bg-green-600 hover:bg-green-700 duration-300' },
      { label: 'Add', action: handleAdd, icon: Plus, className: 'bg-sky-600 hover:bg-sky-700 duration-300' },
      
    ],
  };

  return (
    <div>
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
    </div>
  );
};

export default VendorList;