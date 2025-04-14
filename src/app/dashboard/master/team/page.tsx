"use client";

import React from 'react'
import MasterComponent from '@/components/MasterComponent/MasterComponent'
import DashboardLoader from '@/components/ui/DashboardLoader'
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import { DataTable } from '@/components/TableComponent/TableComponent'
import { Plus, Import, Download, Upload } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';
import { useGetUsersQuery } from '@/services/endpoints/usersApi';

import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { useCreateMasterMutation, useGetMasterQuery } from '@/services/endpoints/masterApi';
import { MONGO_MODELS, SUCCESS } from '@/shared/constants';
import { toast } from 'react-toastify';
import { RowExpanding } from '@tanstack/react-table';
import { error } from 'console';
import { createMasterData } from '@/server/services/masterDataServices';
import useUserAuthorised from '@/hooks/useUserAuthorised';
import { bulkImport } from '@/shared/functions';


const page = () => {

    const { user, status, authenticated } = useUserAuthorised();
    const { data: teamData = [], isLoading: teamLoading }:any = useGetMasterQuery({
        db: MONGO_MODELS.TEAM_MASTER,
        sort: { name: 'asc' },
    });
    const { data: userData = [], isLoading: userLoading }:any = useGetMasterQuery({ db: MONGO_MODELS.USER_MASTER,sort: { name: 'asc' }, });

    const { data: departmentData = [], isLoading: departmentLoading }:any = useGetMasterQuery({ db: MONGO_MODELS.DEPARTMENT_MASTER,sort: { name: 'asc' }, });

    const [createMaster, { isLoading: isCreatingMaster }]:any = useCreateMasterMutation();

    const statusData = [{ _id: true, name: 'Active' }, { _id: false, name: 'InActive' }];

    const loading = teamLoading || userLoading || departmentLoading || isCreatingMaster;
    const formattedUserData = userData?.data?.map((option: { shortName: string; _id: any; }) => ({
        label: option?.shortName?.toProperCase(), // Display name
        value: option?._id, // Unique ID as value
      }));

// const formattedData = userData?.data?.map(item => ({
//     _id: item._id,
//     name: `${item?.shortName?.toProperCase()}`
//   }));

  
    interface RowData {
        id: string;
        name: string;
        email: string;
        role: string;
    }

    const fields: Array<{ label: string; name: string; type: string; data?: any; readOnly?: boolean; format?: string; required?: boolean; placeholder?: string }> = [

        { label: 'Team Name', name: "name", type: "text", required: true, placeholder: 'Team Name' },
        { label: 'Team Head', name: "teamHead", type: "multiselect", required: true, placeholder: 'Select Team Head', data: formattedUserData },
        { label: 'Department', name: "department", type: "select", required: true, placeholder: 'Select Department', format: 'ObjectId', data: departmentData?.data },
        { label: 'Status', name: "isActive", type: "select", data: statusData, placeholder: 'Select Status' },

    ]


    const [isDialogOpen, setDialogOpen] = useState(false);
    const [selectedMaster, setSelectedMaster] = useState(""); // This will track the master type (department, role, etc.)
    const [initialData, setInitialData] = useState({});
    const [action, setAction] = useState('Add');

    // Open the dialog and set selected master type
    const openDialog = (masterType: React.SetStateAction<string>) => {
        setSelectedMaster(masterType);

        setDialogOpen(true);
    };

    // Close dialog
    const closeDialog = () => {
        setDialogOpen(false);
        setSelectedMaster("");
    };

    // Save function to send data to an API or database
    const saveData = async ({ formData, action }: { formData: any; action: string }) => {

        const formattedData = {
            db: MONGO_MODELS.TEAM_MASTER,
            action: action === 'Add' ? 'create' : 'update',
            filter: { "_id": formData._id },
            data: formData,
        };



        const response = await createMaster(formattedData);


        if (response.data?.status === SUCCESS && action === 'Add') {
            toast.success('Team added successfully');

        }
        else {
            if (response.data?.status === SUCCESS && action === 'Update') {
                toast.success('Team added updated successfully');
            }
        }

        if (response?.error?.data?.message?.message) {
            toast.error(`Error encountered: ${response?.error?.data?.message?.message}`);
        }

    };


    const editUser = (rowData: any) => {
      
        setAction('Update');
        const transformedData = {
            ...rowData, // Keep the existing fields
            teamHead: rowData?.teamHead.map((team: { _id: any; }) => team._id) // Map `location` to just the `_id`s
          };
  
        setInitialData(transformedData);
       
        openDialog("team");
        // Your add logic for user page
    };

    const handleAdd = () => {
        setInitialData({});
        setAction('Add');
        openDialog("team");

    };

    const handleImport = () => {
        bulkImport({ roleData: [], continentData: [], regionData: [], countryData: [],locationData: [], categoryData: [], vendorData: [], productData: [], warehouseData: [],customerTypeData:[], customerData:[], userData:[], teamData:[], action: "Add", user, createUser: createMaster, db: MONGO_MODELS.TEAM_MASTER, masterName: "Team" });
    };

    const handleExport = () => {
        console.log('UserPage Update button clicked');
        // Your update logic for user page
    };

    const handleDelete = () => {
        console.log('UserPage Delete button clicked');
        // Your delete logic for user page
    };



    const teamColumns = [
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
            accessorKey: "name",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

                >
                    <span>Team Name</span> {/* Label */}
                    <ArrowUpDown size={15} /> {/* Sorting Icon */}
                </button>
            ),
            cell: ({ row }: { row: any }) => <div className='text-blue-500' onClick={() => editUser(row.original)}>{row.getValue("name")}</div>,
        },
        {
            accessorKey: "teamHead",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

                >
                    <span>Team Head</span> {/* Label */}
                    <ArrowUpDown size={15} /> {/* Sorting Icon */}
                </button>
            ),
            cell: ({ row }: { row: any }) => <div className='' >{row.getValue("teamHead")[0]?.shortName?.toProperCase()}</div>,
        },
        {
            accessorKey: "department",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

                >
                    <span>Department</span> {/* Label */}
                    <ArrowUpDown size={15} /> {/* Sorting Icon */}
                </button>
            ),
            cell: ({ row }: { row: any }) => <div className='' >{row.getValue("department")?.name.toProperCase()}</div>,
        },
        {
            accessorKey: "isActive",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

                >
                    <span>Status</span> {/* Label */}
                    <ArrowUpDown size={15} /> {/* Sorting Icon */}
                </button>
            ),
            cell: ({ row }: { row: any }) => <div>{statusData.find(status => status._id === row.getValue("isActive"))?.name}</div>,
        },



    ];

    const teamConfig = {
        searchFields: [
            { key: "name", label: 'name', type: "text" as const, placeholder: 'Search by area' },

        ],
        filterFields: [
            // { key: "role", label: 'roleName', type: "select" as const, options: roleNames },

        ],
        dataTable: {
            columns: teamColumns,
            data: teamData?.data,
        },
        buttons: [

            { label: 'Import', action: handleImport, icon: Import, className: 'bg-blue-600 hover:bg-blue-700 duration-300' },
            { label: 'Export', action: handleExport, icon: Download, className: 'bg-green-600 hover:bg-green-700 duration-300' },
            { label: 'Add', action: handleAdd, icon: Plus, className: 'bg-sky-600 hover:bg-sky-700 duration-300' },
        ]
    };


    return (
        <>

            <MasterComponent config={teamConfig} loadingState={loading} rowClassMap={undefined} summary={false} />
            <DynamicDialog
                isOpen={isDialogOpen}
                closeDialog={closeDialog}
                selectedMaster={selectedMaster}
                onSave={saveData}
                fields={fields}
                initialData={initialData}
                action={action}
                height='auto'
            />
        </>

    )
}

export default page