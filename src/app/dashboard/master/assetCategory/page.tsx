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

const AssetCategoryPage = () => {
  const { data: assetCategoryData, isLoading: assetCategoryLoading } =
    useGetMasterQuery({
      db: MONGO_MODELS.ASSET_CATEGORY_MASTER,
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
      db: MONGO_MODELS.ASSET_CATEGORY_MASTER,
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
      accessorKey: "type",
      header: ({ table }: { table: any }) => (
        <button
          className="flex items-center space-x-2"
          onClick={() =>
            table
              .getColumn("type")
              .toggleSorting(table.getColumn("type").getIsSorted() === "asc")
          }
        >
          <span>Type</span>
          <ArrowUpDown size={15} />
        </button>
      ),
      cell: ({ row }: { row: any }) => (
        <div
          onClick={() => {
            editAssetCategory(row.original);
          }}
        >
          {row.getValue("type")}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: ({ table }: { table: any }) => (
        <button
          className="flex items-center space-x-2"
          onClick={() =>
            table
              .getColumn("description")
              .toggleSorting(
                table.getColumn("description").getIsSorted() === "asc"
              )
          }
        >
          <span>Description</span>
          <ArrowUpDown size={15} />
        </button>
      ),
      cell: ({ row }: { row: any }) => <div>{row.getValue("description")}</div>,
    },
    {
      accessorKey: "variationSchema",
      header: ({ table }: { table: any }) => (
        <button
          className="flex items-center space-x-2"
          onClick={() =>
            table
              .getColumn("variationSchema")
              .toggleSorting(
                table.getColumn("variationSchema").getIsSorted() === "asc"
              )
          }
        >
          <span>Specification</span>
          <ArrowUpDown size={15} />
        </button>
      ),
      cell: ({ row }: { row: any }) => (
        <div className="flex gap-2">
          {Object.entries(row.getValue("variationSchema") || {}).map(
            ([key, value]) => {
              return (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">{key as String}</Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{value}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            }
          )}
        </div>
      ),
    },
  ];

  const AssetCategoryComponent = ({
    data: variationSchema,
    action,
    fullData,
  }) => {
    console.log("VARIATION SCHEMA", { action, variationSchema, fullData });
    if (action === "Add") {
      return (
        <div className="bg-black text-white rounded-lg p-2 mt-2 text-center w-1/2">
          Variation schema can only be updated
        </div>
      );
    }

    const [variationSchemaData, setVariationSchemaData] = useState(
      variationSchema
        ? Object.entries(variationSchema).map(([key, type]) => ({
            id: uuidv4(),
            key,
            type,
          }))
        : []
    );
    const variationTypes = ["text", "number", "boolean"];
    const [isEditing, setIsEditing] = useState(false);

    const addSpecification = () => {
      setVariationSchemaData((prev) => [
        ...prev,
        { id: uuidv4(), key: "", type: "text" }, // Empty key for new spec
      ]);
      setIsEditing(true);
    };

    const UpdateData = () => {
      const newSchema = variationSchemaData.reduce((acc, item) => {
        if (item.key.trim()) acc[item.key.trim()] = item.type;
        return acc;
      }, {});
      const newData = { ...fullData, variationSchema: newSchema };
      saveData({ formData: newData, action: "Update" });
    };
    return (
      <div className="w-full h-auto flex flex-col  bg-neutral-200/50 rounded-lg p-4">
        <div>
          {variationSchemaData.map((item) => (
            <div key={item.id} className="flex gap-4 mb-4 items-center">
              <div className="relative">
                <Input
                  type="text"
                  value={item.key}
                  onChange={(e) => {
                    setVariationSchemaData((prev) =>
                      prev.map((spec) =>
                        spec.id === item.id
                          ? { ...spec, key: e.target.value }
                          : spec
                      )
                    );
                    setIsEditing(false);
                  }}
                />
              </div>
              <Select
                value={item.type}
                onValueChange={(value) => {
                  setVariationSchemaData((prev) =>
                    prev.map((spec) =>
                      spec.id === item.id ? { ...spec, type: value } : spec
                    )
                  );
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {variationTypes.map((type, index) => (
                      <SelectItem key={index} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button
                variant="link"
                role="primary"
                effect="expandIcon"
                icon={Trash}
                iconPlacement="right"
                className="text-md"
                onClick={() => {
                  setVariationSchemaData((prev) => {
                    const idx = prev.findIndex((spec) => spec.id === item.id);
                    return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
                  });
                  setIsEditing(false);
                }}
              >
                delete
              </Button>
            </div>
          ))}
          <Button
            variant="link"
            role="primary"
            effect="expandIcon"
            icon={Plus}
            iconPlacement="right"
            className="text-md"
            onClick={addSpecification}
            disabled={isEditing}
          >
            Add a specification
          </Button>
        </div>
        <div className="w-full flex justify-end">
          <Button
            variant="default"
            role="primary"
            onClick={() => {
              UpdateData();
            }}
          >
            Update
          </Button>
        </div>
      </div>
    );
  };

  const fields = [
    {
      label: "Type",
      name: "type",
      type: "text",
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
      CustomComponent: AssetCategoryComponent,
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

export default AssetCategoryPage;
