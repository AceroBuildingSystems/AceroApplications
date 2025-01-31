"use client";

import React from 'react'
import Layout from '../layout'
import MasterComponent from '@/components/MasterComponent/MasterComponent'
import DashboardLoader from '@/components/ui/DashboardLoader'
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import { DataTable } from '@/components/TableComponent/TableComponent'
import { Plus, Import, Download, Upload } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';
import { useCreateUserMutation, useGetUsersQuery } from '@/services/endpoints/usersApi';
import { organisationTransformData, userTransformData } from '@/lib/utils';
import DynamicDialog from '@/components/AQMModelComponent/AQMComponent';
import { useCreateMasterMutation, useGetMasterQuery } from '@/services/endpoints/masterApi';
import { MONGO_MODELS, SUCCESS } from '@/shared/constants';
import { toast } from 'react-toastify';
import { RowExpanding } from '@tanstack/react-table';
import { error } from 'console';
import { createMasterData } from '@/server/services/masterDataServices';
import { bulkImport } from '@/shared/functions';
import useUserAuthorised from '@/hooks/useUserAuthorised';


const page = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const[year,setYear]=useState(currentYear);
    const[option,setOption]=useState('A');
    
    const[revNo,setRevNo]=useState(0);

    const { user, status, authenticated } = useUserAuthorised();
    const { data: approvalAuthorityData = [], isLoading: approvalAuthorityLoading } = useGetMasterQuery({
        db: MONGO_MODELS.APPROVAL_AUTHORITY_MASTER,
        sort: { name: 'asc' },
    });

    const { data: countryData = [], isLoading: countryLoading } = useGetMasterQuery({
        db: MONGO_MODELS.COUNTRY_MASTER,
        sort: { name: 'asc' },
    });

    const { data: quoteStatusData = [], isLoading: quoteStatusLoading } = useGetMasterQuery({
        db: MONGO_MODELS.QUOTE_STATUS_MASTER,
        sort: { name: 'asc' },
    });

    const quoteStatus=quoteStatusData?.data?.filter((option) => option?.name === 'A - Active')[0]?._id;

    const { data: teamMemberData = [], isLoading: teamMemberLoading } = useGetMasterQuery({
        db: MONGO_MODELS.TEAM_MEMBERS_MASTER,
        sort: { name: 'asc' },
    });

    const salesEngData = teamMemberData?.data?.map((option) => ({
        name: option?.user?.shortName?.toProperCase(), // Display name
        _id: option?.user?._id, // Unique ID as value
    }));
   
    const { data: teamData = [], isLoading: teamLoading } = useGetMasterQuery({
        db: MONGO_MODELS.TEAM_MASTER,
        sort: { name: 'asc' },
    });

    
    const yearData = [];

    if (currentMonth < 12) {
        for (let year = currentYear - 2; year <= currentYear; year++) {
            yearData.push({ _id: year, name: year.toString() });
        }
    }
    else {

        for (let year = currentYear - 2; year <= currentYear + 1; year++) {
            yearData.push({ _id: year, name: year.toString() });
        }
    }

    const optionData = Array.from({ length: 26 }, (_, i) => ({
        _id: String.fromCharCode(65 + i), // ASCII code for 'A' is 65
        name: String.fromCharCode(65 + i),
      }));

      const revNoData = Array.from({ length: 100 }, (_, i) => ({
        _id: i + 0, 
        name: (i + 0).toString()
      }));

    const [createMaster, { isLoading: isCreatingMaster }] = useCreateMasterMutation();

    const statusData = [{ _id: true, name: 'Active' }, { _id: false, name: 'InActive' }];

    const loading = approvalAuthorityLoading;



    const formattedTeamMemberData = teamMemberData?.data?.map((option) => ({
        label: option?.user?.shortName?.toProperCase(), // Display name
        value: option?.user?._id, // Unique ID as value
    }));

    interface RowData {
        id: string;
        name: string;
        email: string;
        role: string;
    }

    // state-1 salesengineer1 hidden
    // state-2 --------------2 hidden
    // visibility
    //pass function the label state1 

    // function
    //     {
    //         state(visible)
    //     }
    const fields: Array<{ label: string; name: string; type: string; data?: any; readOnly?: boolean; format?: string; required?: boolean; placeholder?: string; section?: string; addMore?: boolean; visibility?: boolean; onAddMore?: () => void; }> = [
        { label: 'Country', name: "country", type: "select", data: countryData?.data, format: 'ObjectId', required: true, placeholder: 'Select Country', section: 'QuoteDetails', visibility: true },
        { label: 'Year', name: "year", type: "select", data: yearData, required: true, placeholder: 'Select Year', section: 'QuoteDetails', visibility: true },
        { label: 'Option', name: "option", type: "select", data: optionData, required: false, placeholder: 'Select Option', section: 'QuoteDetails', visibility: true },
        { label: 'Quote Status', name: "quoteStatus", type: "select", data: quoteStatusData?.data, format: 'ObjectId', required: true, placeholder: 'Select Quote Status', section: 'QuoteDetails', visibility: true },
        { label: 'Rev No', name: "revNo", type: "select", data: revNoData, required: true, placeholder: 'Select Rev No', section: 'QuoteDetails', visibility: true },
        { label: 'Sales Engineer/Manager', name: "salesEngineer", type: "select", data: salesEngData, format: 'ObjectId', required: true, placeholder: 'Select Sales Engineer / Manager', section: 'QuoteDetails', visibility: true },
        { label: 'Sales Support Engineer', name: "salesSupportEngineer1", type: "multiselect", data: formattedTeamMemberData, required: true, placeholder: 'Select Sales Support Engineer', section: 'QuoteDetails', visibility: true },
        { label: 'Received Date From Customer', name: "rcvdDateFromCustomer", type: "date", format: 'Date', required: true, placeholder: 'Select Date', section: 'QuoteDetails', visibility: true },
        { label: 'Selling Team', name: "sellingTeam", type: "select", data: teamData?.data, format: 'ObjectId', required: true, placeholder: 'Select Selling Team', section: 'QuoteDetails', visibility: true },
        { label: 'Responsible Team', name: "responsibleTeam", type: "select", data: teamData?.data, format: 'ObjectId', required: true, placeholder: 'Responsible Team', section: 'QuoteDetails', visibility: true },
        { label: 'Quote Details Remark', name: "quoteDetailsRemark", type: "text", required: false, placeholder: 'Quote Details Remark', section: 'QuoteDetails', visibility: true },
        { label: 'Company Name', name: "responsibleTeam", type: "select", data: teamData?.data, format: 'ObjectId', required: true, placeholder: 'Responsible Team', section: 'QuoteDetails', visibility: true },
        { label: 'Contact Name', name: "responsibleTeam", type: "select", data: teamData?.data, format: 'ObjectId', required: true, placeholder: 'Responsible Team', section: 'QuoteDetails', visibility: true },
        { label: 'Contact Email', name: "quoteDetailsRemark", type: "text", required: false, placeholder: 'Quote Details Remark', section: 'QuoteDetails', visibility: true },
        { label: 'Contact Number', name: "quoteDetailsRemark", type: "text", required: false, placeholder: 'Quote Details Remark', section: 'QuoteDetails', visibility: true },
        { label: 'Quote Details Remark', name: "quoteDetailsRemark", type: "text", required: false, placeholder: 'Quote Details Remark', section: 'QuoteDetails', visibility: true },
        { label: 'Quote Details Remark', name: "quoteDetailsRemark", type: "text", required: false, placeholder: 'Quote Details Remark', section: 'QuoteDetails', visibility: true },
       
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
    const saveData = async ({ formData, action }) => {

        const formattedData = {
            db: MONGO_MODELS.APPROVAL_AUTHORITY_MASTER,
            action: action === 'Add' ? 'create' : 'update',
            filter: { "_id": formData._id },
            data: formData,
        };



        const response = await createMaster(formattedData);


        if (response.data?.status === SUCCESS && action === 'Add') {

            toast.success('Approval authority added successfully');

        }
        else {
            if (response.data?.status === SUCCESS && action === 'Update') {

                toast.success('Approval authority updated successfully');
            }
        }

        if (response?.error?.data?.message?.message) {
            toast.error(`Error encountered: ${response?.error?.data?.message?.message}`);
        }

    };


    const editUser = (rowData: RowData) => {
        setAction('Update');
        const transformedData = {
            ...rowData, // Keep the existing fields
            location: rowData.location.map(loc => loc._id) // Map `location` to just the `_id`s
        };

        setInitialData(transformedData);
        openDialog("update quotation");
        // Your add logic for user page
    };

    const handleAdd = () => {
        setInitialData({year,option,quoteStatus,revNo});
        setAction('Add');
        openDialog("new quotation");

    };

    const handleImport = () => {
        bulkImport({ roleData: [], continentData: [], regionData: [], countryData: [], action: "Add", user, createUser: createMaster, db: MONGO_MODELS.APPROVAL_AUTHORITY_MASTER, masterName: "ApprovalAuthority" });
    };

    const handleExport = () => {
        console.log('UserPage Update button clicked');
        // Your update logic for user page
    };

    const handleDelete = () => {
        console.log('UserPage Delete button clicked');
        // Your delete logic for user page
    };



    const approvalAuthorityColumns = [
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
            accessorKey: "code",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

                >
                    <span>Authority Code</span> {/* Label */}
                    <ArrowUpDown size={15} /> {/* Sorting Icon */}
                </button>
            ),
            cell: ({ row }: { row: any }) => <div className='text-blue-500' onClick={() => editUser(row.original)}>{row.getValue("code")}</div>,
        },
        {
            accessorKey: "name",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

                >
                    <span>Approval Authority</span> {/* Label */}
                    <ArrowUpDown size={15} /> {/* Sorting Icon */}
                </button>
            ),
            cell: ({ row }: { row: any }) => <div >{row.getValue("name")}</div>,
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

    const approvalAuthorityConfig = {
        searchFields: [
            { key: "name", label: 'name', type: "text" as const, placeholder: 'Search by approval authority' },

        ],
        filterFields: [
            // { key: "role", label: 'roleName', type: "select" as const, options: roleNames },

        ],
        dataTable: {
            columns: approvalAuthorityColumns,
            data: approvalAuthorityData?.data,
        },

        buttons: [

            { label: 'Import', action: handleImport, icon: Import, className: 'bg-blue-600 hover:bg-blue-700 duration-300' },
            { label: 'Export', action: handleExport, icon: Download, className: 'bg-green-600 hover:bg-green-700 duration-300' },
            { label: 'Add', action: handleAdd, icon: Plus, className: 'bg-sky-600 hover:bg-sky-700 duration-300' },
        ]
    };


    return (
        <>

            <MasterComponent config={approvalAuthorityConfig} loadingState={loading} />
            <DynamicDialog
                isOpen={isDialogOpen}
                closeDialog={closeDialog}
                selectedMaster={selectedMaster}
                onSave={saveData}
                fields={fields}

                initialData={initialData}
                action={action}
                height=''
                width='full'
            />
        </>

    )
}

export default page