// src/lib/masterConfigs/vendorConfig.ts
import { Plus, ArrowUpDown } from 'lucide-react';
import { ObjectId } from 'mongoose';

interface FieldConfig {
    key: string
    label: string;
    type: 'text' | 'email' | 'select';
    placeholder?: string;
    options?: string[];
}

interface ButtonConfig {
    label: string;
    action: () => void;
    icon?: React.ElementType;
    className?: string;
    dropdownOptions?: { label: string; action: (value?: any) => void; value?: any }[];
}

interface ColumnConfig {
  id: string;
  accessorKey?: string;
  header: (props: { column: any, table: any }) =>  string;
  cell: (props: { row: any, column: any }) => string;
  enableSorting: boolean;
  enableHiding: boolean;
}

interface DataTableConfig {
    columns: ColumnConfig[];
    data: Record<string, string | number | object | Date | ObjectId>[];
}

interface PageConfig {
    searchFields?: FieldConfig[];
    filterFields?: FieldConfig[];
    dataTable: DataTableConfig;
    buttons?: ButtonConfig[];
}

const vendorConfig: PageConfig = {
    searchFields: [
        { key: 'name', label: 'Vendor Name', type: 'text', placeholder: 'Search by Vendor Name' },
        { key: 'contactPerson', label: 'Contact Person', type: 'text', placeholder: 'Search by Contact Person' },
    ],
    filterFields: [
        // Add filters later (e.g., for status)
    ],
    dataTable: {
        columns: [
          {
            id: "select",
            header: ({ table }) => (
                `Select All`
            ),
            cell: ({ row }) => (
                `Select`
            ),
            enableSorting: false,
            enableHiding: false,
        },
          {
            id: "name",
            accessorKey: "name",
            header: ({ column }) => (
                `<button
                    className="flex items-center space-x-2"

                >
                    <span>Vendor Name</span>
                    <ArrowUpDown size={15} />
                </button>`
            ),
            cell: ({ row }) => row.getValue("name") as string,
            enableSorting: true,
            enableHiding: false,
          },
          {
            id: "contactPerson",
            accessorKey: "contactPerson",
            header: ({ column }) => (
              `<button
                    className="flex items-center space-x-2"

                >
                    <span>Contact Person</span>
                    <ArrowUpDown size={15} />
                </button>`
            ),
            cell: ({ row }) => row.getValue("contactPerson") as string,
            enableSorting: true,
            enableHiding: false,
          },
          {
            id: "email",
            accessorKey: "email",
            header: ({ column }) => (
              `<button
                    className="flex items-center space-x-2"

                >
                    <span>Email</span>
                    <ArrowUpDown size={15} />
                </button>`
            ),
            cell: ({ row }) => row.getValue("email") as string,
            enableSorting: true,
            enableHiding: false,
          },
          {
            id: "phone",
            accessorKey: "phone",
            header: ({ column }) => (
                `Phone`
            ),
            cell: ({ row }) => row.getValue("phone") as string,
            enableSorting: false,
            enableHiding: false,
          },
        ],
        data: [], // Will be populated by the API call
    },
    buttons: [
        {
            label: 'Add Vendor',
            action: () => {
                // Implement vendor creation logic here (e.g., open a modal)
                console.log('Add Vendor clicked');
            },
            icon: Plus,
        },
    ],
};

export default vendorConfig;