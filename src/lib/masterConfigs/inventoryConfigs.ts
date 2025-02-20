import { IVendor } from "@/models/master/Vendor.model";
import { IAssetCategory } from "@/models/master/AssetCategory.model";

export const vendorConfig = {
  db: 'VENDOR_MASTER',
  fields: [
    { label: 'Name', name: 'name', type: 'text', required: true, placeholder: 'Vendor Name' },
    { label: 'Contact Person', name: 'contactPerson', type: 'text', required: true, placeholder: 'Contact Person' },
    { label: 'Email', name: 'email', type: 'email', required: true, placeholder: 'Email' },
    { label: 'Phone', name: 'phone', type: 'text', required: true, placeholder: 'Phone' },
    { label: 'Address', name: 'address', type: 'text', required: true, placeholder: 'Address' },
    { label: 'Location', name: 'location', type: 'select', required: true, placeholder: 'Select Location', format: 'ObjectId', data: [] },
  ],
  columns: [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'contactPerson', header: 'Contact Person' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'phone', header: 'Phone' },
    { accessorKey: 'address', header: 'Address' },
    { accessorKey: 'location', header: 'Location' },
  ],
  dataTable: {
    columns: [],
    data: [],
  }
};

export const assetCategoryConfig = {
  db: 'ASSET_CATEGORY_MASTER',
  fields: [
    { label: 'Name', name: 'name', type: 'text', required: true, placeholder: 'Category Name' },
    { label: 'Description', name: 'description', type: 'text', required: true, placeholder: 'Description' },
  ],
  columns: [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'description', header: 'Description' },
  ],
  dataTable: {
    columns: [],
    data: [],
  }
};


export const warehouseConfig = {
  db: 'WAREHOUSE_MASTER',
  fields: [
    { label: 'Name', name: 'name', type: 'text', required: true, placeholder: 'Warehouse Name' },
    { label: 'Location', name: 'location', type: 'select', required: true, placeholder: 'Select Location', format: 'ObjectId', data: [] },
  ],
  columns: [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'location', header: 'Location' },
  ],
  dataTable: {
    columns: [],
    data: [],
  }
};