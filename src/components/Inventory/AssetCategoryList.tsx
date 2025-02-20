"use client";

import React, { useState, useEffect } from 'react';
import MasterComponent from '@/components/MasterComponent/MasterComponent';
import { assetCategoryConfig } from '@/lib/masterConfigs/inventoryConfigs';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { IAssetCategory } from '@/models/master/AssetCategory.model';
import { useCreateMasterMutation, masterApi } from '@/services/endpoints/masterApi';
import { SUCCESS } from '@/shared/constants';
import { toast } from 'react-toastify';
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus, Import, Download, Upload } from 'lucide-react';

const AssetCategoryList: React.FC = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState("");
  const [initialData, setInitialData] = useState({});
  const [action, setAction] = useState('Add');

  const { data, isLoading: assetCategoryLoading, isError, error } = masterApi.endpoints.getMaster.useQuery({
    db: 'ASSET_CATEGORY_MASTER',
    sort: { name: 'asc' },
  });

  // @ts-expect-error
  const assetCategoryData: IAssetCategory[] = isError ? [] : (data?.data as IAssetCategory[]) || [];

  const [createMaster, { isLoading: isCreatingMaster }] = useCreateMasterMutation();

  const handleAdd = () => {
    setInitialData({});
    setAction('Add');
    openDialog("assetCategory");
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
      db: 'ASSET_CATEGORY_MASTER',
      action: formData._id ? 'update' : 'create',
      data: formData,
    };

    const response = await createMaster(formattedData);

    if (response?.data && response.data.status === SUCCESS) {
      toast.success(`Asset Category ${formData._id ? 'updated' : 'added'} successfully`);
    } else {
      toast.error(`Error encountered: ${response?.error?.data?.message}`);
    }
  };

  const editAssetCategory = (rowData: IAssetCategory) => {
    setAction('Update');
    setInitialData(rowData);
    openDialog("assetCategory");
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

  const assetCategoryColumns = [
    { accessorKey: 'name', header: 'Name', cell: ({ row }: { row: any }) => <div className='text-blue-500' onClick={() => editAssetCategory(row.original)}>{row.getValue("name")}</div> },
    { accessorKey: 'description', header: 'Description' },
  ];

  const transformedAssetCategoryData = assetCategoryData.map(assetCategory => ({
    ...assetCategory,
  } as any);

  const assetCategoryConfigUpdated = {
    ...assetCategoryConfig,
    dataTable: {
      columns: assetCategoryColumns,
      // @ts-expect-error
      data: transformedAssetCategoryData,
    },
    buttons: [
      { label: 'Import', action: handleImport, icon: Import, className: 'bg-blue-600 hover:bg-blue-700 duration-300' },
      { label: 'Export', action: handleExport, icon: Download, className: 'bg-green-600 hover:bg-green-700 duration-300' },
      { label: 'Add', action: handleAdd, icon: Plus, className: 'bg-sky-600 hover:bg-sky-700 duration-300' },
    ],
  };

  return (
    <div>
      <MasterComponent config={assetCategoryConfigUpdated} loadingState={assetCategoryLoading} />
      <DynamicDialog
        isOpen={isDialogOpen}
        closeDialog={closeDialog}
        selectedMaster={selectedMaster}
        onSave={saveData}
        fields={assetCategoryConfigUpdated.fields}
        initialData={initialData}
        action={action}
        height='auto'
        width='500px'
      />
    </div>
  );
};

export default AssetCategoryList;