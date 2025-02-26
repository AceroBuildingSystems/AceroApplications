"use client";

import MasterComponent from "@/components/MasterComponent/MasterComponent";
import DynamicDialog from "@/components/ModalComponent/ModelComponent";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/ComboBoxWrapper";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useUserAuthorised from "@/hooks/useUserAuthorised";

import {
  useCreateMasterMutation,
  useGetMasterQuery,
} from "@/services/endpoints/masterApi";
import { useGetUsersQuery, useUserOperationsMutation } from "@/services/endpoints/usersApi";
import { SUCCESS } from "@/shared/constants";

import { UpdateIcon } from "@radix-ui/react-icons";
import {
  ArrowUpDown,
  DeleteIcon,
  Download,
  Import,
  Plus,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const Access = () => {
  const { data: accessData = [], isLoading: accessDataLoading } = useGetMasterQuery({ db: "ACCESS_MASTER",sort: { name: 'asc' }, });
  const [updateUser, { isLoading: updateUserAccessLoading }] = useUserOperationsMutation();
  const { data: userData = [], isLoading: userDataLoading,refetch:refetchUsers } = useGetUsersQuery();
  const [distinctParentData, setDistinctParentData] = useState([]);
  const [sanitisedUserData, setSanitisedUserData] = useState([]);
  const [createMaster, { isLoading: isCreatingMaster }] =
    useCreateMasterMutation();
  const { user, status, authenticated } = useUserAuthorised();
  const [loading, setLoading] = useState(true);

  const router = useRouter()

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState("");
  const [initialData, setInitialData] = useState({});
  const [action, setAction] = useState("Add");

  useEffect(() => {
    //sanitise Access to distinct
    if (!accessDataLoading && accessData?.data) {
      const distinctAccess = accessData?.data?.reduce(
        (acc: any[], access: any) => {

            acc.push({
              _id: access._id,
              name: access.name,
              category: access.category,
            });
        
          return acc;
        },
        []
      );
      setDistinctParentData(distinctAccess);
    }

    if (!userDataLoading && userData?.data) {
      const sanitisedUser = userData?.data.map((user) => {
        const accessMap =
          user.access?.map((access) => {
            return {
              name: access?.accessId?.name,
              _id: access?.accessId?._id,
              permissions: access?.permissions,
              hasAccess: access?.hasAccess,
            };
          }) ?? [];
        return {
          firstName: user?.firstName,
          lastName: user?.lastName,
          _id: user?._id,
          access: accessMap,
        };
      });
      setSanitisedUserData(sanitisedUser);
    }

    setLoading(
      (accessDataLoading || userDataLoading || isCreatingMaster) &&
        !authenticated
    );
  }, [accessDataLoading, userDataLoading, authenticated]);

  const openDialog = (masterType: string) => {
    setSelectedMaster(masterType);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setInitialData({});
    setAction("Add");
    openDialog("Access");
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedMaster("");
  };

  const saveData = async ({ formData, action }) => {
    const formattedData = {
      db: "ACCESS_MASTER",
      action: action === "Add" ? "create" : "update",
      filter: { _id: formData._id },
      data: formData,
    };
    const response = await createMaster(formattedData);
    if (response.data?.status === SUCCESS && action === "Add") {
      toast.success("Access added successfully");
    } else {
      if (response.data?.status === SUCCESS && action === "Update") {
        toast.success("Access updated successfully");
      }
    }

    if (response?.error?.data?.message?.message) {
      toast.error(
        `Error encountered: ${response?.error?.data?.message?.message}`
      );
    }
  };

  const editAccess = (rowData) => {
    setAction("Update");
    setInitialData(rowData);
    openDialog("Access");
  };

  const editUserAccess = (rowData) => {
    setAction("Update");
    setInitialData(rowData);
    openDialog("User Access");
  };

  // this is for Access Tab Configuration
  const accessColumn = [
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
      accessorKey: "_id",
      header: ({ column }: { column: any }) => (
        <button
          className="flex items-center space-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Access Id</span> {/* Label */}
          <ArrowUpDown size={15} /> {/* Sorting Icon */}
        </button>
      ),
      cell: ({ row }: { row: any }) => (
        <div className="">{row.getValue("_id")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }: { column: any }) => (
        <button
          className="flex items-center space-x-2 "
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Name</span> {/* Label */}
          <ArrowUpDown size={15} /> {/* Sorting Icon */}
        </button>
      ),
      cell: ({ row }: { row: any }) => (
        <div onClick={() => editAccess(row.original)} className="text-blue-500">
          {row.getValue("name")}
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: ({ column }: { column: any }) => (
        <button
          className="flex items-center space-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Category</span> {/* Label */}
          <ArrowUpDown size={15} /> {/* Sorting Icon */}
        </button>
      ),
      cell: ({ row }: { row: any }) => <div>{row.getValue("category")}</div>,
    },
    {
      accessorKey: "url",
      header: ({ column }: { column: any }) => (
        <button
          className="flex items-center space-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>URL</span> {/* Label */}
          <ArrowUpDown size={15} /> {/* Sorting Icon */}
        </button>
      ),
      cell: ({ row }: { row: any }) => <div>{row.getValue("url")}</div>,
    },
    {
      accessorKey: "isActive",
      header: ({ column }: { column: any }) => (
        <button
          className="flex items-center space-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Active</span> {/* Label */}
          <ArrowUpDown size={15} /> {/* Sorting Icon */}
        </button>
      ),
      cell: ({ row }: { row: any }) => (
        <div>{row.getValue("isActive")?.toString()}</div>
      ),
    },
    {
      accessorKey: "parent",
      header: ({ column }: { column: any }) => (
        <button
          className="flex items-center space-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Parent Id</span> {/* Label */}
          <ArrowUpDown size={15} /> {/* Sorting Icon */}
        </button>
      ),
      cell: ({ row }: { row: any }) => <div>{row.getValue("parent")?._id}</div>,
    },
  ];

  const accessConfig = {
    searchFields: [
      {
        key: "name",
        label: "name",
        type: "text" as const,
        placeholder: "Search by access name",
      },
    ],
    dataTable: {
      columns: accessColumn,
      data: accessData?.data || [],
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

  const statusData = [
    { _id: true, name: "True" },
    { _id: false, name: "False" },
  ];
  const fields: Array<{
    label: string;
    name: string;
    type: string;
    data?: any;
    readOnly?: boolean;
    format?: string;
  }> = [
    { label: "Name", name: "name", type: "text" },
    { label: "Category", name: "category", type: "text" },
    { label: "Status", name: "isActive", type: "select", data: statusData },
    {
      label: "Is this a Menu item?",
      name: "isMenuItem",
      type: "select",
      data: statusData,
    },
    { label: "url", name: "url", type: "text" },
    {
      label: "Parent",
      name: "parent",
      type: "select",
      data: distinctParentData,
      format: "ObjectId",
    },
    { label: "Order", name: "order", type: "number" },
  ];
  // This is for user access tab configuration [the one on the right]
  const userAccessColumn = [
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
      accessorKey: "_id",
      header: ({ column }: { column: any }) => (
        <button
          className="flex items-center space-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>User Id</span> {/* Label */}
          <ArrowUpDown size={15} /> {/* Sorting Icon */}
        </button>
      ),
      cell: ({ row }: { row: any }) => (
        <div className="">{row.getValue("_id")}</div>
      ),
    },
    {
      accessorKey: "firstName",
      header: ({ column }: { column: any }) => (
        <button
          className="flex items-center space-x-2 "
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>First Name</span> {/* Label */}
          <ArrowUpDown size={15} /> {/* Sorting Icon */}
        </button>
      ),
      cell: ({ row }: { row: any }) => (
        <div
          className="text-blue-500"
          onClick={() => {
            editUserAccess(row.original);
          }}
        >
          {row.getValue("firstName")}
        </div>
      ),
    },
    {
      accessorKey: "lastName",
      header: ({ column }: { column: any }) => (
        <button
          className="flex items-center space-x-2 "
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Last Name</span> {/* Label */}
          <ArrowUpDown size={15} /> {/* Sorting Icon */}
        </button>
      ),
      cell: ({ row }: { row: any }) => (
        <div className="text-blue-500">{row.getValue("lastName")}</div>
      ),
    },
    {
      accessorKey: "access",
      header: ({ column }: { column: any }) => (
        <button
          className="flex items-center space-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Accesses</span> {/* Label */}
          <ArrowUpDown size={15} /> {/* Sorting Icon */}
        </button>
      ),
      cell: ({ row }: { row: any }) => (
        <div className="flex gap-2 flex-wrap">
          {row.getValue("access")?.map((data, index) => {
            return (
              <div key={index} className="bg-black rounded-md p-2 text-white">
                {data.name}
              </div>
            );
          })}
        </div>
      ),
    },
  ];

  const userAccessConfig = {
    searchFields: [
      {
        key: "firstName",
        label: "firstName",
        type: "text" as const,
        placeholder: "Search by user name",
      },
    ],
    dataTable: {
      columns: userAccessColumn,
      data: sanitisedUserData || [],
    },
  };


  const AccessComponent = ({ accessData}) => {
    if (!accessData) {
      return <></>;
    }
    const [accessComboBoxData, setAccessComboBoxData] = useState([]);
    const [acessComponentData, setAccessComponentData] = useState(accessData);

    const computedAccessComboBoxData = useMemo(() => {
      return distinctParentData.filter(
        (parent) =>
          !acessComponentData?.find((data) => data._id === parent._id)
      );
    }, [acessComponentData]);

    useEffect(() => {
      setAccessComboBoxData(computedAccessComboBoxData);
    }, [computedAccessComboBoxData]);

    const addAccessComponentData = useCallback((data) => {
      if (!data) {
        return;
      }
      setAccessComponentData((prev) => {
        if (data) {
          
          const findIdx = prev.findIndex((d) => d._id === data._id);

          if (findIdx !== -1) {
            return prev;
          }

          return [
            {
              ...data,
              hasAccess: true,
              permissions: {
                view: true,
                create: true,
                update: true,
                delete: true,
                import: true,
                export: true,
              },
            },
            ...prev,
          ];
        }
        return prev;
      });
    }, []);

    const handleAccessAdd = useCallback((id) => {
      setAccessComboBoxData((prevData) => {
        const foundIndex = prevData.findIndex((data) => data._id === id);
        addAccessComponentData(prevData[foundIndex]);
        return prevData.filter((data) => data._id !== id);
      });
    }, []);

    const handleChecked = (id, key) => {
      setAccessComponentData((prev) => {
        const newState = [...prev];
        const findIdx = newState.findIndex((d) => d._id === id);

        if (findIdx === -1) return prev;

        newState[findIdx] = {
          ...newState[findIdx],
          permissions: {
            ...newState[findIdx].permissions,
            [key]: !newState[findIdx].permissions[key],
          },
        };

        return newState;
      });
     
    };

    const handleDelete = (id) => {
      setAccessComponentData((prev) => {
        const newState = prev.filter((data) => data._id !== id);
        return newState;
      });
    };

    const  updateAcess = async ()=>{
      const updatedAccess = acessComponentData.map(access=>{
        access["accessId"] = access._id
        return {accessId:access._id,hasAccess:access.hasAccess,permissions:access.permissions}
      })
      if(!initialData._id){
        toast.error("User Id is Missing!")
        return
      }

      const resp = await updateUser({
        action:"updateAccess",
        data:{
            id: initialData._id,
            arrayProperty: "access",
            data: updatedAccess,
            replaceAll:true
        }
    })
      router.refresh()
      refetchUsers()
      closeDialog()
    }

    return (
      <div className="w-full h-auto bg-neutral-200/50 rounded-lg p-4">
        <div className="mb-4 w-full flex justify-between">
          <Combobox
            className="mb-10"
            field={{
              label: "access",
              name: "access",
              type: "select",
              data: accessComboBoxData,
              format: "ObjectId",
              
            }}
            handleChange={handleAccessAdd}
            formData={distinctParentData}
            placeholder="Add Access"
          />
          <Button effect="expandIcon" iconPlacement="right" icon={UpdateIcon} onClick={updateAcess}>Update Access</Button>
        </div>
        <div className="w-full flex flex-col gap-4 mb-1">
          {acessComponentData?.map((data, index) => (
            <div
              className="flex w-full gap-2 justify-center items-center"
              key={index}
            >
              <Button
                iconPlacement="left"
                effect="expandIcon"
                icon={Trash2Icon}
                onClick={() => {
                  handleDelete(data._id);
                }}
                className="h-10 p-1"
              />
              <div className="w-full font-bold">{data.name}</div>
              <div className="w-full flex gap-2">
                {Object.entries(data?.permissions).map(([key, value]) => (
                  <div
                    key={`${key}_${data._id}`}
                    className="flex flex-col gap-2 justify-center items-center rounded-sm p-2 min-w-20 bg-neutral-300 h-full"
                  >
                    <Label
                      className="font-bold text-md text-neutral-700"
                      htmlFor={`${key}_${data._id}`}
                    >
                      {key}
                    </Label>
                    <Switch
                      id={`${key}_${data._id}`}
                      onClick={() => {
                        handleChecked(data._id, key);
                      }}
                      checked={Boolean(value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const userAccessFields: Array<{
    label: string;
    name: string;
    type: string;
    data?: any;
    readOnly?: boolean;
    format?: string;
    CustomComponent?: React.FC;
  }> = [
    { label: "firstName", name: "firstName", type: "text", readOnly: true },
    { label: "lastname", name: "lastName", type: "text", readOnly: true },
    {
      label: "access",
      name: "access",
      type: "custom",
      CustomComponent: AccessComponent,
    },
  ];

 
  return (
    <div className="w-full h-full px-4">
      <Tabs  defaultValue="Access" className="h-full">
        <TabsList  width={"full"}>
          <TabsTrigger value="Access" width={"full"}>
            Access
          </TabsTrigger>
          <TabsTrigger value="User" width={"full"}>
            User Access
          </TabsTrigger>
        </TabsList>
        <TabsContent value="Access" className="h-5/6">
          <div className="pt-4 oveflow-auto h-full">
            <MasterComponent
              config={accessConfig}
              loadingState={accessDataLoading && !authenticated}
            />
            <DynamicDialog
              isOpen={isDialogOpen}
              closeDialog={closeDialog}
              selectedMaster={selectedMaster}
              onSave={saveData}
              fields={fields}
              initialData={initialData}
              action={action}
              user={user}
            />
          </div>
        </TabsContent>
        <TabsContent value="User">
          <div className="pt-4 oveflow-auto h-full">
            <MasterComponent config={userAccessConfig} loadingState={loading} />
            <DynamicDialog
              isOpen={isDialogOpen}
              closeDialog={closeDialog}
              selectedMaster={selectedMaster}
              onSave={()=>{toast.success("Plase use the other update button!")}}
              fields={userAccessFields}
              initialData={initialData}
              action={action}
              user={user}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Access;
