"use client";

import React, { useState } from "react";
import { ArrowUpDown, ChevronsUpDown, Minus, Plus, Trash } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/TableComponent/TableComponent";
import DynamicDialog from "@/components/ModalComponent/ModelComponent";
import {
  useCreateMasterMutation,
  useGetMasterQuery,
} from "@/services/endpoints/masterApi";
import { MONGO_MODELS, SUCCESS } from "@/shared/constants";
import { toast } from "react-toastify";
import MasterComponent from "@/components/MasterComponent/MasterComponent"; // Import MasterComponent
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { v4 as uuidv4 } from "uuid";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AssetModelPage = () => {
  const { data: assetCategoryData, isLoading: assetCategoryLoading } =
    useGetMasterQuery({
      db: MONGO_MODELS.ASSET_MODEL_MASTER,
      sort: { name: "asc" },
    });

  const [createMaster, { isLoading: isCreatingMaster }] =
    useCreateMasterMutation();

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [initialData, setInitialData] = useState({});
  const [action, setAction] = useState("Add");

  const openDialog = () => {
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const saveData = async ({ formData, action }) => {
    const formattedData = {
      db: MONGO_MODELS.ASSET_MODEL_MASTER,
      action: action === "Add" ? "create" : "update",
      filter: { _id: formData._id },
      data: formData,
    };
    console.log({ formattedData });
    try {
      const response = await createMaster(formattedData);

      if (response.data?.status === SUCCESS) {
        toast.success(
          `Asset category ${
            action === "Add" ? "created" : "updated"
          } successfully`
        );
        closeDialog();
      } else {
        toast.error(`Error encountered: ${response?.error?.data?.message}`);
      }
    } catch (error: any) {
      toast.error(`Error encountered: ${error.message}`);
    }
  };

  const handleAdd = () => {
    setInitialData({});
    setAction("Add");
    openDialog();
  };

  const editAssetCategory = (rowData: any) => {
    setAction("Update");
    setInitialData(rowData);
    openDialog();
  };

  const assetCategoryColumns = [
    {
      id: "select",
      header: ({ table }: { table: any }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }: { row: any }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "category",
      header: ({ table }: { table: any }) => (
        <button
          className="flex items-center space-x-2"
          onClick={() =>
            table
              .getColumn("category")
              .toggleSorting(table.getColumn("category").getIsSorted() === "asc")
          }
        >
          <span>Category</span>
          <ArrowUpDown size={15} />
        </button>
      ),
      cell: ({ row }: { row: any }) => (
        <div
          onClick={() => {
            editAssetCategory(row.original);
          }}
        >
          {row.getValue("category")?.type}
        </div>
      ),
    },
    {
      accessorKey: "modelNumber",
      header: ({ table }: { table: any }) => (
        <button
          className="flex items-center space-x-2"
          onClick={() =>
            table
              .getColumn("modelNumber")
              .toggleSorting(
                table.getColumn("modelNumber").getIsSorted() === "asc"
              )
          }
        >
          <span>Model Number</span>
          <ArrowUpDown size={15} />
        </button>
      ),
      cell: ({ row }: { row: any }) => <div>{row.getValue("modelNumber")}</div>,
    },
    {
      accessorKey: "name",
      header: ({ table }: { table: any }) => (
        <button
          className="flex items-center space-x-2"
          onClick={() =>
            table
              .getColumn("name")
              .toggleSorting(
                table.getColumn("name").getIsSorted() === "asc"
              )
          }
        >
          <span>Name</span>
          <ArrowUpDown size={15} />
        </button>
      ),
      cell: ({ row }: { row: any }) => <div>{row.getValue("name")}</div>,
    },
    {
      accessorKey: "manufacturer",
      header: ({ table }: { table: any }) => (
        <button
          className="flex items-center space-x-2"
          onClick={() =>
            table
              .getColumn("manufacturer")
              .toggleSorting(
                table.getColumn("manufacturer").getIsSorted() === "asc"
              )
          }
        >
          <span>Manufacturer</span>
          <ArrowUpDown size={15} />
        </button>
      ),
      cell: ({ row }: { row: any }) => <div>{row.getValue("manufacturer")}</div>,
    },
  ];

  const fields = [
    {
      label: "Category",
      name: "category",
      type: "select",
      required: true,
      placeholder: "Asset Category Name",
    },
    {
      label: "Description",
      name: "description",
      type: "textarea",
      required: true,
      placeholder: "Asset Category Description",
    },
    {
      label: "Variation Schema (JSON)",
      name: "variationSchema",
      type: "custom",
      required: true,
      placeholder: "Asset Category Description",
    },
  ];

  const assetCategoryConfig = {
    searchFields: [
      {
        key: "name",
        label: "name",
        type: "text" as const,
        placeholder: "Search by name",
      },
    ],
    dataTable: {
      columns: assetCategoryColumns,
      data: assetCategoryData?.data || [],
    },
    buttons: [
      {
        label: "Add",
        action: handleAdd,
        icon: Plus,
        className: "bg-sky-600 hover:bg-sky-700 duration-300",
      },
    ],
  };

  return (
    <>
      <MasterComponent
        config={assetCategoryConfig}
        loadingState={assetCategoryLoading}
      />
      <DynamicDialog
        isOpen={isDialogOpen}
        closeDialog={closeDialog}
        selectedMaster="Asset Category"
        onSave={saveData}
        fields={fields}
        initialData={initialData}
        action={action}
        height="auto"
        customUpdate={true}
      />
    </>
  );
};

export default AssetModelPage;
