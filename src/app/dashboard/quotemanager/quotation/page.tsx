"use client";

import React from 'react'
import Layout from '../layout'
import MasterComponent from '@/components/MasterComponent/MasterComponent'
import DashboardLoader from '@/components/ui/DashboardLoader'
import { ArrowUpDown, ChevronDown, IdCardIcon, MoreHorizontal } from "lucide-react"
import { DataTable } from '@/components/TableComponent/TableComponent'
import { Plus, Import, Download, Upload } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { useCreateUserMutation, useGetUsersQuery } from '@/services/endpoints/usersApi';
import { organisationTransformData, transformDataForExcel, transformQuoteData, userTransformData } from '@/lib/utils';
import QuotationDialog from '@/components/AQMModelComponent/AQMComponent';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { useCreateMasterMutation, useGetMasterQuery } from '@/services/endpoints/masterApi';
import { MONGO_MODELS, SUCCESS } from '@/shared/constants';
import { toast } from 'react-toastify';
import { RowExpanding } from '@tanstack/react-table';
import { error } from 'console';
import { createMasterData } from '@/server/services/masterDataServices';
import { bulkImport } from '@/shared/functions';
import useUserAuthorised from '@/hooks/useUserAuthorised';
import { useGetApplicationQuery } from "@/services/endpoints/applicationApi";
import * as XLSX from "xlsx";
import { createAction } from '@reduxjs/toolkit';

const page = () => {
    const proposalOffer = []
    const proposalDrawing = []
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [year, setYear] = useState(currentYear);
    const [option, setOption] = useState('A');

    const [noOfBldg, setNoOfBldg] = useState(0);

    const [contactData, setContactData] = useState([]);

    const [stateData, setStateData] = useState([]);
    const [approvalAuthData, setApprovalAuthData] = useState([]);
    const [supportTeamMemberData, setSupportTeamMemberData] = useState([]);

    const [revNo, setRevNo] = useState(0);

    const { user, status, authenticated } = useUserAuthorised();

    const { data: quotationData = [], isLoading: quotationLoading } = useGetApplicationQuery({
        db: MONGO_MODELS.QUOTATION_MASTER,
        filter: { isActive: true },
        sort: { name: 'asc' },
    });

    const { data: teamMemberData = [], isLoading: teamMemberLoading } = useGetMasterQuery({
        db: MONGO_MODELS.TEAM_MEMBERS_MASTER,
        filter: { isActive: true },
        sort: { name: 'asc' },
    });

    const quotationDataNew = transformQuoteData(quotationData?.data, user, teamMemberData?.data);

    const { data: countryData = [], isLoading: countryLoading } = useGetMasterQuery({
        db: MONGO_MODELS.COUNTRY_MASTER,
        filter: { isActive: true },
        sort: { name: 'asc' },
    });

    const { data: quoteStatusData = [], isLoading: quoteStatusLoading } = useGetMasterQuery({
        db: MONGO_MODELS.QUOTE_STATUS_MASTER,
        filter: { isActive: true },
        sort: { name: 'asc' },
    });

    const quoteStatus = quoteStatusData?.data?.filter((option) => option?.name === 'A - Active')[0]?._id;



    const { data: teamData = [], isLoading: teamLoading } = useGetMasterQuery({
        db: MONGO_MODELS.TEAM_MASTER,
        filter: { isActive: true },
        sort: { name: 'asc' },
    });

    const { data: customerData = [], isLoading: customerLoading } = useGetMasterQuery({
        db: MONGO_MODELS.CUSTOMER_MASTER,
        filter: { isActive: true },
        sort: { name: 'asc' },
    });

    const { data: customerContactData = [], isLoading: customerContactLoading } = useGetMasterQuery({
        db: MONGO_MODELS.CUSTOMER_CONTACT_MASTER,
        filter: { isActive: true },
        sort: { name: 'asc' },
    });

    const { data: customerTypeData = [], isLoading: customerTypeLoading } = useGetMasterQuery({
        db: MONGO_MODELS.CUSTOMER_TYPE_MASTER,
        filter: { isActive: true },
        sort: { name: 'asc' },
    });

    const { data: sectorData = [], isLoading: sectorLoading } = useGetMasterQuery({
        db: MONGO_MODELS.SECTOR_MASTER,
        filter: { isActive: true },
        sort: { name: 'asc' },
    });
    const { data: industryData = [], isLoading: industryLoading } = useGetMasterQuery({
        db: MONGO_MODELS.INDUSTRY_TYPE_MASTER,
        filter: { isActive: true },
        sort: { name: 'asc' },
    });

    const { data: buildingData = [], isLoading: buildingLoading } = useGetMasterQuery({
        db: MONGO_MODELS.BUILDING_TYPE_MASTER,
        filter: { isActive: true },
        sort: { name: 'asc' },
    });
    const { data: fullstateData = [], isLoading: stateLoading } = useGetMasterQuery({
        db: MONGO_MODELS.STATE_MASTER,
        filter: { isActive: true },
        sort: { name: 'asc' },
    });
    const { data: approvalAuthorityData = [], isLoading: approvalAuthorityLoading } = useGetMasterQuery({
        db: MONGO_MODELS.APPROVAL_AUTHORITY_MASTER,
        filter: { isActive: true },
        sort: { name: 'asc' },
    });
    const { data: locationData = [], isLoading: locationLoading } = useGetMasterQuery({
        db: MONGO_MODELS.LOCATION_MASTER,
        filter: { isActive: true },
        sort: { name: 'asc' },
    });
    const { data: projectTypeData = [], isLoading: projectTypeLoading } = useGetMasterQuery({
        db: MONGO_MODELS.PROJECT_TYPE_MASTER,
        filter: { isActive: true },
        sort: { name: 'asc' },
    });
    const { data: paintTypeData = [], isLoading: paintTypeLoading } = useGetMasterQuery({
        db: MONGO_MODELS.PAINT_TYPE_MASTER,
        filter: { isActive: true },
        sort: { name: 'asc' },
    });

    const { data: currencyData = [], isLoading: currencyLoading } = useGetMasterQuery({
        db: MONGO_MODELS.CURRENCY_MASTER,
        filter: { isActive: true },
        sort: { name: 'asc' },
    });

    const { data: incotermData = [], isLoading: incotermLoading } = useGetMasterQuery({
        db: MONGO_MODELS.INCOTERM_MASTER,
        filter: { isActive: true },
        sort: { name: 'asc' },
    });

    const formattedLocationData = locationData?.data?.map((option) => ({
        label: option.name, // Display name
        value: option._id, // Unique ID as value
    }));

    const teamId = teamMemberData?.data?.filter(data => data?.user?._id === user?._id)?.[0]?.team?._id;
    const teamRole = teamMemberData?.data?.filter(data => data?.user?._id === user?._id)?.[0]?.teamRole[0]?.name;

    let salesEngData = teamMemberData?.data?.filter(data => data?.team?._id === teamId)?.map((option) => ({
        name: option?.user?.shortName?.toProperCase(), // Display name
        _id: option?._id, // Unique ID as value
        team: option?.team?._id,
        teamHead: option?.team?.teamHead[0]?.shortName.toProperCase(),
        email: option?.team?.teamHead[0]?.email
    }));

    if (teamRole === 'Engineer') {
        salesEngData = teamMemberData?.data?.filter(data => data?.user?._id === user?._id)?.map((option) => ({
            name: option?.user?.shortName?.toProperCase(), // Display name
            _id: option?._id, // Unique ID as value
            team: option?.team?._id,
            teamHead: option?.team?.teamHead[0]?.shortName.toProperCase(),
            email: option?.team?.teamHead[0]?.email
        }));
    }

    if (user?.role?.name === 'Admin') {
        salesEngData = teamMemberData?.data?.map((option) => ({
            name: option?.user?.shortName?.toProperCase(), // Display name
            _id: option?._id, // Unique ID as value
            team: option?.team?._id,
            teamHead: option?.team?.teamHead[0]?.shortName.toProperCase(),
            email: option?.team?.teamHead[0]?.email
        }));
    }



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

    const monthsData = [
        { _id: 1, name: "January" },
        { _id: 2, name: "February" },
        { _id: 3, name: "March" },
        { _id: 4, name: "April" },
        { _id: 5, name: "May" },
        { _id: 6, name: "June" },
        { _id: 7, name: "July" },
        { _id: 8, name: "August" },
        { _id: 9, name: "September" },
        { _id: 10, name: "October" },
        { _id: 11, name: "November" },
        { _id: 12, name: "December" }
    ];


    const bookingProbabilityData = [{ _id: 'Low', name: 'Low' }, { _id: 'Medium', name: 'Medium' }, { _id: 'High', name: 'High' }];

    const bldgNoData = Array.from({ length: 100 }, (_, i) => ({
        _id: i + 0,
        name: (i + 0).toString()
    }));

    const [createMaster, { isLoading: isCreatingMaster }] = useCreateMasterMutation();

    const statusData = [{ _id: true, name: 'Active' }, { _id: false, name: 'InActive' }];

    const loading = approvalAuthorityLoading || quotationLoading || countryLoading || customerContactLoading || customerLoading || quoteStatusLoading || countryLoading || stateLoading || teamLoading;





    const onchangeData = async ({ id, fieldName, name, parentId, position, email, phone, location }) => {

        switch (fieldName) {
            case "company":
                const contactData1 = await customerContactData?.data?.filter(contact => contact?.customer?._id === id);

                setContactData(contactData1);
                break;

            case "contact":

                const contactData2 = await customerContactData?.data?.filter(contact => contact?.customer?._id === parentId);
                contactData2.push({ _id: id, name: name, position: position, email: email, phone: phone });

                setContactData(contactData2);

                break;

            case "country":

                const stateData1 = await fullstateData?.data?.filter(state => state?.country?._id === id)?.map(state => ({
                    name: state?.name,
                    _id: state?._id
                }));

                setStateData(stateData1);
                break;

            case "state":
                switch (name) {
                    case 'approvalAuthority':
                        const approvalData = await approvalAuthorityData?.data?.filter(item => item.location.some(loc => loc.state._id === id)
                        )?.map(data => ({
                            name: data?.code,
                            _id: data?._id,
                            location: data?.location
                        }));

                        setApprovalAuthData(approvalData);
                        break;

                    default:
                        const stateData2 = await fullstateData?.data?.filter(state => state?.country?._id === parentId)?.map(state => ({
                            name: state?.name,
                            _id: state?._id,

                        }));
                        stateData2.push({ name: name, _id: id });
                        setStateData(stateData2);

                        break;

                };
                break;

            case "salesEngineer":
                const teamId1 = teamMemberData?.data?.filter(data => data?._id === id)?.[0]?.team?._id;
                const formattedTeamMemberData = teamMemberData?.data?.filter(data => data?.team?._id === teamId1)?.map((option) => ({
                    label: option?.user?.shortName?.toProperCase(), // Display name
                    value: option?._id, // Unique ID as value
                }));


                setSupportTeamMemberData(formattedTeamMemberData);
                break;

            case "approvalAuthority":

                const approvalData = await approvalAuthorityData?.data?.filter(item => item.location.some(loc => loc.state._id === parentId)
                )?.map(data => ({
                    name: data?.code,
                    _id: data?._id,
                    location: data?.location
                }));
                approvalData.push({ name: name, _id: id, location: location });
                setApprovalAuthData(approvalData);

                break;


            default:
                break;
        }


    }

    interface RowData {
        id: string;
        name: string;
        email: string;
        role: string;
    }

    const fields: Array<{ label: string; name: string; type: string; data?: any; readOnly?: boolean; format?: string; required?: boolean; placeholder?: string; section?: string; subSection?: string; elementType?: any[]; addNew?: boolean; addHelp?: boolean; visibility?: boolean; title?: string; onAddMore?: () => void; }> = [
        { label: 'Country', name: "country", type: "select", data: countryData?.data, format: 'ObjectId', required: true, placeholder: 'Select Country', section: 'QuoteDetails', visibility: true },
        { label: 'Year', name: "year", type: "select", data: yearData, required: true, placeholder: 'Select Year', section: 'QuoteDetails', visibility: true },
        { label: 'Quote No', name: "quoteNo", type: "number", required: false, placeholder: 'Quote No', section: 'QuoteDetails', visibility: true },
        { label: 'Option', name: "option", type: "select", data: optionData, required: false, placeholder: 'Select Option', section: 'QuoteDetails', visibility: true },
        { label: 'Quote Status', name: "quoteStatus", type: "select", data: quoteStatusData?.data, format: 'ObjectId', required: true, placeholder: 'Select Quote Status', section: 'QuoteDetails', visibility: true },
        { label: 'Rev No', name: "revNo", type: "select", data: revNoData, required: true, placeholder: 'Select Rev No', section: 'QuoteDetails', visibility: true, readOnly: true },
        { label: 'Sales Engineer/Manager', name: "salesEngineer", type: "select", data: salesEngData, format: 'ObjectId', required: true, placeholder: 'Select Sales Engineer / Manager', section: 'QuoteDetails', visibility: true },
        { label: 'Sales Support Engineer', name: "salesSupportEngineer", type: "multiselect", data: supportTeamMemberData, required: true, placeholder: 'Select Sales Support Engineer', section: 'QuoteDetails', visibility: true },
        { label: 'Received Date From Customer', name: "rcvdDateFromCustomer", type: "date", format: 'Date', required: true, placeholder: 'Select Date', section: 'QuoteDetails', visibility: true },
        { label: 'Selling Team', name: "sellingTeam", type: "select", data: teamData?.data, format: 'ObjectId', required: true, placeholder: 'Select Selling Team', section: 'QuoteDetails', visibility: true },
        { label: 'Responsible Team', name: "responsibleTeam", type: "select", data: teamData?.data, format: 'ObjectId', required: true, placeholder: 'Responsible Team', section: 'QuoteDetails', visibility: true },
        { label: 'Quote Details Remark', name: "quoteDetailsRemark", type: "text", required: false, placeholder: 'Quote Details Remark', section: 'QuoteDetails', visibility: true, },

        { label: 'Company Name', name: "company", type: "select", data: customerData?.data, format: 'ObjectId', required: false, placeholder: 'Select Company', section: 'CustomerDetails', visibility: true, addNew: true },
        { label: 'Contact Name', name: "contact", type: "select", data: contactData, format: 'ObjectId', required: false, placeholder: 'Select Contact', section: 'CustomerDetails', visibility: true, addNew: true },
        { label: 'Contact Email', name: "email", type: "text", required: false, placeholder: 'Contact Email', section: 'CustomerDetails', visibility: true, readOnly: true },
        { label: 'Contact Number', name: "phone", type: "number", required: false, placeholder: 'Contact Number', section: 'CustomerDetails', visibility: true, readOnly: true },
        { label: 'Position', name: "position", type: "text", required: false, placeholder: 'Contact Position', section: 'CustomerDetails', visibility: true, readOnly: true },
        { label: 'Customer Type', name: "customerType", type: "select", data: customerTypeData?.data, format: 'ObjectId', required: false, placeholder: 'Select Customer Type', section: 'CustomerDetails', visibility: true },
        { label: 'Customer Details Remark', name: "customerDetailsRemark", type: "text", required: false, placeholder: 'Customer Details Remark', section: 'CustomerDetails', visibility: true },

        { label: 'Project Name', name: "projectName", type: "text", required: false, placeholder: 'Project Name', section: 'ProjectDetails', visibility: true },
        { label: 'Sector', name: "sector", type: "select", data: sectorData?.data, format: 'ObjectId', required: false, placeholder: 'Select Sector', section: 'ProjectDetails', visibility: true },
        { label: 'Industry Type', name: "industryType", type: "select", data: industryData?.data, format: 'ObjectId', required: false, placeholder: 'Select Industry Type', section: 'ProjectDetails', visibility: true, elementType: { label: '', name: "otherIndustryType", type: "text", required: false, placeholder: 'Other Industry Type', section: 'ProjectDetails', visibility: true }, },

        { label: 'Building Type', name: "buildingType", type: "select", data: buildingData?.data, format: 'ObjectId', required: false, placeholder: 'Select Building Type', section: 'ProjectDetails', visibility: true, elementType: { label: '', name: "otherBuildingType", type: "text", required: false, placeholder: 'Other Building Type', section: 'ProjectDetails', visibility: true } },
        { label: 'Building Usage', name: "buildingUsage", type: "text", data: customerTypeData?.data, format: 'ObjectId', required: false, placeholder: 'Select Customer Type', section: 'ProjectDetails', visibility: true },
        { label: 'City', name: "state", type: "select", data: stateData, format: 'ObjectId', required: false, placeholder: 'Select City', section: 'ProjectDetails', visibility: true, addNew: true },
        { label: 'Approval Authority (GCC Only)', name: "approvalAuthority", type: "select", data: approvalAuthData.length > 0 ? approvalAuthData : approvalAuthorityData?.data, format: 'ObjectId', required: false, placeholder: 'Select Approval Authority', section: 'ProjectDetails', visibility: true, addNew: true, addHelp: true, title: 'Approval Authorities' },
        { label: 'Plot Number (GCC Only)', name: "plotNumber", type: "text", required: false, placeholder: 'Plot Number', section: 'ProjectDetails', visibility: true },
        { label: 'End Client', name: "endClient", type: "text", required: false, placeholder: 'End Client', section: 'ProjectDetails', visibility: true },
        { label: 'Project Management Office', name: "projectManagementOffice", type: "text", required: false, placeholder: 'Project Management Office', section: 'ProjectDetails', visibility: true },
        { label: 'Consultant', name: "consultant", type: "text", required: false, placeholder: 'Consultant', section: 'ProjectDetails', visibility: true },
        { label: 'Main Contractor', name: "mainContractor", type: "text", required: false, placeholder: 'Main Contractor', section: 'ProjectDetails', visibility: true },
        { label: 'Erector', name: "erector", type: "text", required: false, placeholder: 'Erector', section: 'ProjectDetails', visibility: true },
        { label: 'Project Details Remark', name: "projectDetailsRemark", type: "text", required: false, placeholder: 'Project Details Remark', section: 'ProjectDetails', visibility: true },

        { label: 'Sent To Estimation', name: "sentToEstimation", type: "date", format: 'Date', required: false, placeholder: 'Select Date', section: 'CycleTimeDetails', subSection: 'ProposalOffer', visibility: true },
        { label: 'Received From Estimation', name: "receivedFromEstimation", type: "date", format: 'Date', required: false, placeholder: 'Select Date', section: 'CycleTimeDetails', subSection: 'ProposalOffer', visibility: true },
        { label: 'Cycle Time (Days)', name: "cycleTime", type: "number", required: false, placeholder: 'Cycle Time', section: 'CycleTimeDetails', subSection: 'ProposalOffer', visibility: true, readOnly: true },
        { label: 'Sent To Customer', name: "sentToCustomer", type: "date", format: 'Date', required: false, placeholder: 'Select Date', section: 'CycleTimeDetails', subSection: 'ProposalOffer', visibility: true },
        { label: 'Notes', name: "notes", type: "text", required: false, placeholder: 'Notes', section: 'CycleTimeDetails', subSection: 'ProposalOffer', visibility: true },

        { label: 'Sent To Estimation', name: "sentToEstimation", type: "date", format: 'Date', required: false, placeholder: 'Select Date', section: 'CycleTimeDetails', subSection: 'ProposalDrawing', visibility: true },
        { label: 'Received From Estimation', name: "receivedFromEstimation", type: "date", format: 'Date', required: false, placeholder: 'Select Date', section: 'CycleTimeDetails', subSection: 'ProposalDrawing', visibility: true },
        { label: 'Cycle Time (Days)', name: "cycleTime", type: "number", required: false, placeholder: 'Cycle Time', section: 'CycleTimeDetails', subSection: 'ProposalDrawing', visibility: true, readOnly: true },
        { label: 'Sent To Customer', name: "sentToCustomer", type: "date", format: 'Date', required: false, placeholder: 'Select Date', section: 'CycleTimeDetails', subSection: 'ProposalDrawing', visibility: true },
        { label: 'Notes', name: "notes", type: "text", required: false, placeholder: 'Notes', section: 'CycleTimeDetails', subSection: 'ProposalDrawing', visibility: true },

        { label: 'No Of Buildings', name: "noOfBuilding", type: "select", data: bldgNoData, required: false, placeholder: 'Select Building No', section: 'TechnicalDetails', visibility: true },
        { label: 'Project Type', name: "projectType", type: "select", data: projectTypeData?.data, format: 'ObjectId', required: false, placeholder: 'Project Type', section: 'TechnicalDetails', visibility: true },
        { label: 'Paint Type', name: "paintType", type: "select", data: paintTypeData?.data, format: 'ObjectId', required: false, placeholder: 'Paint Type', section: 'TechnicalDetails', visibility: true, elementType: { label: '', name: "otherPaintType", type: "text", required: false, placeholder: 'Other Paint Type', section: 'TechnicalDetails', visibility: true, }, },
        { label: 'Projected Area (Sq Mtr)', name: "projectedArea", type: "number", required: false, placeholder: 'Projected Area', section: 'TechnicalDetails', visibility: true },
        { label: 'Total Weight (Tons)', name: "totalWt", type: "number", required: false, placeholder: 'Total Weight', section: 'TechnicalDetails', visibility: true },
        { label: 'Mezzanine Area (Sq Mtr)', name: "Mezzanine Area", type: "number", required: false, placeholder: 'Erector', section: 'TechnicalDetails', visibility: true },
        { label: 'Mezzanine Weight (Tons)', name: "mezzanineWt", type: "number", required: false, placeholder: 'Mezzanine Weight', section: 'TechnicalDetails', visibility: true },
        { label: 'Technical Details Remark', name: "technicalDetailsRemark", type: "text", required: false, placeholder: 'Technical Details Remark', section: 'TechnicalDetails', visibility: true },

        { label: 'Currency', name: "currency", type: "select", data: currencyData?.data, format: 'ObjectId', required: false, placeholder: 'Select Currency', section: 'CommercialDetails', visibility: true },
        { label: 'Total Estimated Price', name: "totalEstPrice", type: "number", required: false, placeholder: 'Total Estimated Price', section: 'CommercialDetails', visibility: true },
        { label: 'Q22 Value (AED)', name: "q22Value", type: "number", required: false, placeholder: 'Q22 Value (AED)', section: 'CommercialDetails', visibility: true, },
        { label: 'Special BuyOut Price', name: "spBuyoutPrice", type: "number", required: false, placeholder: 'Special BuyOut Price', section: 'CommercialDetails', visibility: true },
        { label: 'Freight Price', name: "freightPrice", type: "number", required: false, placeholder: 'Freight Price', section: 'CommercialDetails', visibility: true },
        { label: 'Incoterm', name: "incoterm", type: "select", data: incotermData?.data, format: 'ObjectId', required: false, placeholder: 'Incoterm', section: 'CommercialDetails', visibility: true, elementType: { label: '', name: "incotermDescription", type: "text", required: false, section: 'TechnicalDetails', visibility: true, }, },
        { label: 'Booking Probability', name: "bookingProbability", type: "select", data: bookingProbabilityData, required: false, placeholder: 'Booking Probability', section: 'CommercialDetails', visibility: true },
        { label: 'Commercial Details Remark', name: "technicalDetailsRemark", type: "text", required: false, placeholder: 'Technical Details Remark', section: 'CommercialDetails', visibility: true },

        { label: 'Job No', name: "jobNo", type: "text", required: false, placeholder: 'Job No', section: 'JobDetails', visibility: true },
        { label: 'Job Date', name: "jobDate", type: "date", format: 'Date', required: false, placeholder: 'Select Date', section: 'JobDetails', visibility: true },
        { label: 'Shipping Forecast Month', name: "forecastMonth", type: "select", data: monthsData, required: false, placeholder: 'Shipping Forecast Month', section: 'JobDetails', visibility: true, elementType: { label: '', name: "incotermDescription", type: "text", required: false, section: 'TechnicalDetails', visibility: true, }, },
        { label: 'Payment Term', name: "paymentTerm", type: "text", required: false, placeholder: 'Payment Term', section: 'JobDetails', visibility: true },
        { label: 'Job Details Remark', name: "remarks", type: "text", required: false, placeholder: 'Job Details Remark', section: 'JobDetails', visibility: true },

    ];

    const statusField: Array<{ label: string; name: string; type: string; data?: any; readOnly?: boolean; format?: string; required?: boolean; placeholder?: string; section?: string[]; subSection?: string; elementType?: any[]; addNew?: boolean; addHelp?: boolean; visibility?: boolean; title?: string; onAddMore?: () => void; }> = [
        { label: 'New Status', name: "quoteStatus", type: "select", data: quoteStatusData?.data, format: 'ObjectId', required: true, placeholder: 'Select Status', visibility: true },
        { label: 'Select Forecast Month', name: "forecastMonth", type: "select", data: monthsData, required: false, placeholder: 'Select Month', section: ['HOT QUOTE'], visibility: false },
        { label: 'Job No', name: "jobNo", type: "text", required: true, placeholder: 'Job No', section: ['J - Job'], visibility: false },
        { label: 'Job Entry Date', name: "jobDate", type: "date", format: 'Date', required: true, placeholder: 'Select Date', section: ['J - Job'], visibility: false },
        { label: 'Shipping Forecast Month', name: "forecastMonth", type: "select", data: monthsData, required: true, placeholder: 'Select Month', section: ['J - Job'], visibility: false },
        { label: 'Payment Terms', name: "paymentTerm", type: "text", required: true, placeholder: 'Payment Term', section: ['J - Job'], visibility: false },
        { label: 'Intial Shipped Date', name: "initialShipDate", type: "date", format: 'Date', required: true, placeholder: 'Select Date', section: ['JOB SHIPPED'], visibility: false },
        { label: 'Final Shipped Date', name: "finalShipDate", type: "date", format: 'Date', required: true, placeholder: 'Select Date', section: ['JOB SHIPPED'], visibility: false },
        { label: 'Lost To', name: "lostTo", type: "text", required: true, placeholder: 'Lost To', section: ['L - Lost'], visibility: false },
        { label: 'Lost To Others', name: "lostToOthers", type: "text", required: true, placeholder: 'Lost To Others', section: ['L - Lost'], visibility: false },
        { label: 'Reason', name: "reason", type: "text", placeholder: 'Reason', section: ['C - Cancel', 'D - Declined', 'H - Hold', 'L - Lost'], visibility: false },
        { label: 'Remarks', name: "remarks", type: "text", required: false, placeholder: 'Remarks', section: ['J - Job', 'JOB SHIPPED', 'HOT QUOTE'], visibility: false },

    ]

    const [isStatusDialogOpen, setStatusDialogOpen] = useState(false);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [selectedMaster, setSelectedMaster] = useState(""); // This will track the master type (department, role, etc.)
    const [initialData, setInitialData] = useState({});
    const [action, setAction] = useState('Add');

    // Open the dialog and set selected master type
    const openDialog = (masterType: React.SetStateAction<string>) => {
        setSelectedMaster(masterType);

        setDialogOpen(true);
    };

    const openStausDialog = (masterType: React.SetStateAction<string>) => {
        setSelectedMaster(masterType);

        setStatusDialogOpen(true);
    };

    // Close dialog
    const closeDialog = () => {
        setInitialData({});
        setContactData([]);
        setDialogOpen(false);
        setSelectedMaster("");
    };

    const closeStatusDialog = () => {
        setInitialData({});
        setContactData([]);
        setStatusDialogOpen(false);
        setSelectedMaster("");
    };

    // Save function to send data to an API or database
    const saveData = async ({ formData, action, master = 'QUOTATION_MASTER' }) => {

        const formattedData = {
            db: MONGO_MODELS[master],
            action: action === 'Add' ? 'create' : 'update',
            filter: { "_id": formData._id },
            data: formData,
        };

        const response = await createMaster(formattedData);


        if (response.data?.status === SUCCESS && action === 'Add') {

            toast.success('data added successfully');

        }
        else {
            if (response.data?.status === SUCCESS && action === 'Update') {

                toast.success('data updated successfully');
            }
        }

        if (response?.error?.data?.message?.message) {
            return new Error({ message: "Something went wrong!", data: "" })
            toast.error(`Error encountered: ${response?.error?.data?.message?.message}`);
        }

        return response;
    };


    const editQuotation = (rowData: RowData) => {
        setAction('Update');
        const transformedData = {
            ...rowData, // Keep the existing fields
            salesSupportEngineer: rowData?.salesSupportEngineer.map(eng => eng._id), // Map `location` to just the `_id`s

        };

        const contactData1 = customerContactData?.data?.filter(contact => contact?.customer?._id === rowData?.company?._id);

        setContactData(contactData1);
        const stateData1 = fullstateData?.data?.filter(state => state?.country?._id === rowData?.country?._id)?.map(state => ({
            name: state?.name,
            _id: state?._id
        }));

        setStateData(stateData1);


        const formattedTeamMemberData = teamMemberData?.data?.filter(data => data?.team?._id === rowData?.sellingTeam?._id)?.map((option) => ({
            label: option?.user?.shortName?.toProperCase(), // Display name
            value: option?._id, // Unique ID as value
        }));


        setSupportTeamMemberData(formattedTeamMemberData);

        setInitialData(transformedData);
        openDialog("update quotation");
        // Your add logic for user page
    };

    const editQuoteStatus = (rowData: RowData) => {
        setAction('Update');
        const transformedData = {
            ...rowData, // Keep the existing fields
            salesSupportEngineer: rowData?.salesSupportEngineer.map(eng => eng._id), // Map `location` to just the `_id`s

        };
        setInitialData(transformedData);
        !['draft', 'quoterequested'].includes(rowData?.status) && openStausDialog("quote status");
        // Your add logic for user page
    };

    const handleAdd = () => {
        setInitialData({ year, option, quoteStatus, revNo, noOfBldg });
        setAction('Add');
        openDialog("new quotation");

    };

    const handleImport = () => {
        bulkImport({ roleData: [], continentData: [], regionData: [], countryData: [], action: "Add", user, createUser: createAction, db: MONGO_MODELS.QUOTATION_MASTER, masterName: "QuotationMaster" });
    };

    const handleExport = (type: string, quotationDataNew: any[]) => {
        if (!quotationDataNew || quotationDataNew.length === 0) {
            toast.error("No data to export");
            return;
        }

        const formattedData = transformDataForExcel(quotationDataNew);

        if (type === 'excel') {
            exportToExcel(formattedData);
        }
    };

    const exportToExcel = (data: any[]) => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        XLSX.writeFile(workbook, 'exported_data.xlsx');
    };

    const handleDelete = () => {
        console.log('UserPage Delete button clicked');
        // Your delete logic for user page
    };

    const quotationColumns = [
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
            accessorKey: "year",
            header: ({ column }: { column: any }) => (
                <button
                    className=" items-center space-x-2 hidden"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

                >
                    <span>year</span>
                    <ArrowUpDown size={15} />
                </button>
            ),
            cell: ({ row }: { row: any }) => <div className='hidden' onClick={() => editQuotation(row.original)}>{row.getValue("year") || "Add Quote No"}</div>,
            enableHiding: true,  // Allows hiding the column
            enableSorting: false, // You can disable sorting here if needed
        },
        {
            accessorKey: "quoteNo",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

                >
                    <span>Quote No</span>
                    <ArrowUpDown size={15} />
                </button>
            ),
            cell: ({ row }: { row: any }) => <div className='text-blue-500' onClick={() => editQuotation(row.original)}>{row.getValue("quoteNo") && `${row.getValue("country")?.countryCode}-${row.getValue("year")?.toString().slice(-2)}-${row.getValue("quoteNo")}` || "Add Quote No"}</div>,
        },
        {
            accessorKey: "revNo",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

                >
                    <span>Rev No</span>
                    <ArrowUpDown size={15} />
                </button>
            ),
            cell: ({ row }: { row: any }) => <div >{row.getValue("revNo")}</div>,
        },
        {
            accessorKey: "option",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

                >
                    <span>Option</span>
                    <ArrowUpDown size={15} />
                </button>
            ),
            cell: ({ row }: { row: any }) => <div>{row.getValue("option")}</div>,
        },
        {
            accessorKey: "quoteStatus",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

                >
                    <span>Quote Status</span> {/* Label */}
                    <ArrowUpDown size={15} /> {/* Sorting Icon */}
                </button>
            ),
            cell: ({ row }: { row: any }) => <div className="w-28 p-2 border rounded-md flex items-center justify-center text-center" onClick={() => editQuoteStatus(row.original)}>
                {quoteStatusData?.data.find(data => data._id === row.getValue("quoteStatus")?._id)?.name}</div>,
        },
        {
            accessorKey: "bookingProbability",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

                >
                    <span>Probability</span> {/* Label */}
                    <ArrowUpDown size={15} /> {/* Sorting Icon */}
                </button>
            ),
            cell: ({ row }: { row: any }) => <div>{row.getValue("bookingProbability")}</div>,
        },
        {
            accessorKey: "region",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

                >
                    <span>Region</span> {/* Label */}
                    <ArrowUpDown size={15} /> {/* Sorting Icon */}
                </button>
            ),
            cell: ({ row }: { row: any }) => <div>{countryData?.data.find(data => data._id === row.getValue("country")?._id)?.region?.name}</div>,
        },
        {
            accessorKey: "country",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

                >
                    <span>Country</span> {/* Label */}
                    <ArrowUpDown size={15} /> {/* Sorting Icon */}
                </button>
            ),
            cell: ({ row }: { row: any }) => <div>{countryData?.data.find(data => data._id === row.getValue("country")?._id)?.name}</div>,
        },

        {
            accessorKey: "salesEngineer",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

                >
                    <span>Sales Engineer</span> {/* Label */}
                    <ArrowUpDown size={15} /> {/* Sorting Icon */}
                </button>
            ),
            cell: ({ row }: { row: any }) => <div>{teamMemberData?.data.find(data => data._id === row.getValue("salesEngineer")?._id)?.user?.shortName.toProperCase()}</div>,
        },
        {
            accessorKey: "company",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

                >
                    <span>Customer Name</span> {/* Label */}
                    <ArrowUpDown size={15} /> {/* Sorting Icon */}
                </button>
            ),
            cell: ({ row }: { row: any }) => <div>{customerData?.data.find(data => data._id === row.getValue("company")?._id)?.name}</div>,
        },
        {
            accessorKey: "projectName",
            header: ({ column }: { column: any }) => (
                <button
                    className="flex items-center space-x-2"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

                >
                    <span>Project Name</span> {/* Label */}
                    <ArrowUpDown size={15} /> {/* Sorting Icon */}
                </button>
            ),
            cell: ({ row }: { row: any }) => <div>{row.getValue("projectName")}</div>,
        },

    ];

    const quotationConfig = {
        searchFields: [
            { key: "name", label: 'name', type: "text" as const, placeholder: 'Search by approval authority' },

        ],
        filterFields: [
            // { key: "role", label: 'roleName', type: "select" as const, options: roleNames },

        ],
        dataTable: {
            columns: quotationColumns,
            data: quotationDataNew,
        },

        buttons: [

            { label: 'Import', action: handleImport, icon: Download, className: 'bg-blue-600 hover:bg-blue-700 duration-300' },
            {
                label: 'Export', action: handleExport, icon: Upload, className: 'bg-green-600 hover:bg-green-700 duration-300', dropdownOptions: [
                    { label: "Export to Excel", value: "excel", action: (type: string) => handleExport(type,quotationDataNew) }
                ]
            },

            { label: 'Add', action: handleAdd, icon: Plus, className: 'bg-sky-600 hover:bg-sky-700 duration-300' },
        ]
    };
    const rowClassMap = {
        draft: "bg-white",
        quoterequested: "bg-yellow-100",
        incomplete: 'bg-blue-100',
        submitted: 'bg-orange-200',
        rejected: 'bg-red-200',
        approved: 'bg-green-100'

    };


    return (
        <>

            <MasterComponent config={quotationConfig} loadingState={loading} rowClassMap={rowClassMap} />
            <QuotationDialog
                isOpen={isDialogOpen}
                closeDialog={closeDialog}
                selectedMaster={selectedMaster}
                onSave={saveData}
                fields={fields}
                initialData={initialData}
                action={action}
                height=''
                width='full'
                customerData={customerData?.data}
                customerTypeData={customerTypeData?.data}
                statusData={statusData}
                onchangeData={onchangeData}
                countryData={countryData?.data}
                proposalOffer={proposalOffer}
                proposalDrawing={proposalDrawing}
                locationData={formattedLocationData}
                stateData={fullstateData?.data}

            />
            <DynamicDialog
                isOpen={isStatusDialogOpen}
                closeDialog={closeStatusDialog}
                selectedMaster={selectedMaster}
                onSave={saveData}
                fields={statusField}
                initialData={initialData}
                action={action}
                height={'auto'}

            />
        </>

    )
}

export default page