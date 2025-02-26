import mongoose from 'mongoose';
import { MenuItemicons } from '../iconMaps';
import { MenuItem } from '../types';
import * as XLSX from "xlsx";
import { toast } from 'react-toastify';
import { SUCCESS } from '@/shared/constants';
import { IndustryType, Quotation, QuoteStatus } from '@/models';


export const createMongooseObjectId = (id: any) => {
    if (mongoose.Types.ObjectId.isValid(id) && new mongoose.Types.ObjectId(id).toString() === id.toString()) {
        return id;
    }
    return new mongoose.Types.ObjectId(id);
}

export const createSidebarMenuData = (data: any) => {
    if (!data) {
        return {
            user: {},
            navMain: [],
        };
    }

    const user = {
        name: data.shortName,
        email: data.email,
        avatar: data.imageUrl || "",
    };

    const { access } = data || [];

    // Filter access items with `isMenuItem` true
    const menuItems = access
        .filter((item: any) => item.accessId.isMenuItem && item.accessId.isActive)
        .map((item: any) => ({
            id: item.accessId._id.toString(),
            name: item.accessId.name,
            url: item.accessId.url,
            category: item.accessId.category,
            parentId: item.accessId.parentId ? item.accessId.parentId.toString() : null,
            hasAccess: item.hasAccess,
        }));

    // Helper to build nested structure
    const buildMenuTree = (items: any[], parentId: string | null = null): MenuItem[] => {
        return items
            .filter(item => item.parentId === parentId && item.hasAccess) // Stop if hasAccess is false
            .map(item => ({
                title: item.name,
                url: item.url,
                icon: MenuItemicons[item.category],
                items: buildMenuTree(items, item.id), // Recursively add children
            }));
    };

    const navMain = buildMenuTree(menuItems);

    return {
        user,
        navMain,
    };
};

export const isObjectEmpty = (obj: any) => {
    return Object.keys(obj).length === 0;
};


export const bulkImport = async ({ roleData, continentData, regionData, countryData, action, user, createUser, db, masterName }) => {

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx, .xls";
    input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement)?.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

            // Transform the sheet data based on the entity
            const formData = mapExcelToEntity(sheetData, masterName);
            const referenceData = {
                roleData: roleData?.data || [],
                continentData: continentData?.data || [],
                regionData: regionData?.data || [],
                countryData: countryData?.data || [],

            };

            const finalData = mapFieldsToIds(formData, masterName, referenceData);

            const enrichedData = finalData.map((item) => ({
                ...item,
                addedBy: user?._id,
                updatedBy: user?._id,
            }));
            // Send the transformed data for bulk insert
            try {

                const formattedData = {
                    action: action === 'Add' ? 'create' : 'update',
                    db: db,
                    bulkInsert: true,
                    data: enrichedData,
                };

                const response = await createUser(formattedData);

                if (response.data?.status === SUCCESS && action === 'Add') {
                    toast.success(`${masterName} imported successfully`);

                }
                else {
                    if (response.data?.status === SUCCESS && action === 'Update') {
                        toast.success(`${masterName} updated successfully`);
                    }
                }

                if (response?.error?.data?.message?.message) {
                    toast.error(`Error encountered: ${response?.error?.data?.message?.message}`);
                }
            } catch (err) {
                toast.error(`Error during import: ${err.message}`);
            }
        };
        reader.readAsBinaryString(file);
    };
    input.click();
};


export const bulkImportQuotation = async ({ roleData, continentData, regionData, countryData,
    quoteStatusData,
    teamMemberData,
    teamData,
    customerData,
    customerContactData,
    customerTypeData,
    sectorData,
    industryData,
    buildingData,
    stateData,
    approvalAuthorityData,
    projectTypeData,
    paintTypeData,
    currencyData,
    incotermData, quotationData, action, user, createUser, db, masterName }) => {

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx, .xls";
    input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement)?.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

            // Transform the sheet data based on the entity
            const formData = mapExcelToEntity(sheetData, masterName);
            const referenceData = {
                roleData: roleData?.data || [],
                continentData: continentData?.data || [],
                regionData: regionData?.data || [],
                countryData: countryData?.data || [],
                quoteStatusData: quoteStatusData?.data || [],
                teamMemberData: teamMemberData?.data || [],
                teamData: teamData?.data || [],
                customerData: customerData?.data || [],
                customerContactData: customerContactData?.data || [],
                customerTypeData: customerTypeData?.data || [],
                sectorData: sectorData?.data || [],
                industryData: industryData?.data || [],
                buildingData: buildingData?.data || [],
                stateData: stateData?.data || [],
                approvalAuthorityData: approvalAuthorityData?.data || [],
                projectTypeData: projectTypeData?.data || [],
                paintTypeData: paintTypeData?.data || [],
                currencyData: currencyData?.data || [],
                incotermData: incotermData?.data || []
            };
            const finalData = mapFieldsToIds(formData, masterName, referenceData);
            const enrichedData = finalData.map((item) => ({
                ...item,
                addedBy: user?._id,
                updatedBy: user?._id,
            }));
            // Send the transformed data for bulk insert
            try {
                // Step 1: Insert ProposalRevision Entries (Bulk Insert)
                const revisionData = enrichedData.map((item) => [
                    {
                        revNo: item.revNo,
                        sentToEstimation: item.sentToEstimation,
                        receivedFromEstimation: item.receivedFromEstimation,
                        cycleTime: item.cycleTime,
                        sentToCustomer: item.sentToCustomer,
                        addedBy: item.addedBy,
                        updatedBy: item.updatedBy,
                        changes: {}
                    },
                    {
                        revNo: item.revNo,
                        sentToEstimation: item.sentToEstimation,
                        receivedFromEstimation: item.receivedFromEstimation,
                        cycleTime: item.cycleTime,
                        sentToCustomer: item.sentToCustomer,
                        addedBy: item.addedBy,
                        updatedBy: item.updatedBy,
                        changes: {}
                    },
                ]).flat();

                const revisionResponse = await createUser({
                    action: "create",
                    db: "PROPOSAL_REVISION_MASTER",
                    bulkInsert: true,
                    data: revisionData,
                });

                if (revisionResponse.error) {
                    throw new Error(revisionResponse.error.data.message);
                }

                const insertedRevisions = revisionResponse?.data?.data?.map(item => item._id).filter(Boolean);
                if (insertedRevisions.length !== revisionData.length) {
                    throw new Error("Mismatch in inserted ProposalRevision records.");
                }
     
                // Step 2: Insert Proposal Entries
                const proposalData = enrichedData.map((item, index) => [
                    {
                        revisions: [insertedRevisions[index * 2]], // ProposalOffer revision ID
                        type: "ProposalOffer",
                        addedBy: item.addedBy,
                        updatedBy: item.updatedBy,
                    },
                    {
                        revisions: [insertedRevisions[index * 2 + 1]], // ProposalDrawing revision ID
                        type: "ProposalDrawing",
                        addedBy: item.addedBy,
                        updatedBy: item.updatedBy,
                    },
                ]).flat();

                const proposalResponse = await createUser({
                    action: "create",
                    db: "PROPOSAL_MASTER",
                    bulkInsert: true,
                    data: proposalData,
                });

                if (proposalResponse.error) {
                    throw new Error(proposalResponse.error.data.message);
                }
                const insertedProposals = proposalResponse?.data?.data?.map(item => item._id).filter(Boolean);

                if (insertedProposals.length !== proposalData.length) {
                    throw new Error("Mismatch in inserted Proposal records.");
                }

                // Step 3: Insert Quotation Entries
                const quotationDataImport = enrichedData.map((item, index) => ({
                    country: item.country,
                    year: item.year,
                    option: item.option,
                    proposals: [insertedProposals[index * 2], insertedProposals[index * 2 + 1]], // Proposal IDs
                    revNo: item.revNo,
                    quoteNo: item.quoteNo || '',
                    quoteStatus: item.quoteStatus,
                    salesEngineer: item.salesEngineer,
                    salesSupportEngineer: [item.salesSupportEngineer1, item.salesSupportEngineer2, item.salesSupportEngineer3].filter(Boolean),
                    rcvdDateFromCustomer: item.rcvdDateFromCustomer,
                    sellingTeam: item.sellingTeam,
                    responsibleTeam: item.responsibleTeam,
                    forecastMonth: monthMap[item.forecastMonth] ?? null,
                    status: item.status,
                    handleBy: item.handleBy,
                    addedBy: item.addedBy,
                    updatedBy: item.updatedBy,
                }));

                const existingSet = new Set(
                    quotationData?.data?.map(record => `${record.year}-${record.quoteNo}-${record.option}`)
                );

                // Filter out duplicates from dataToImport before inserting
                const filteredDataToImport = quotationDataImport.filter(item =>
                    !existingSet.has(`${item.year}-${item.quoteNo}-${item.option}`)
                );

                const uniqueSet = new Set();
                const uniqueDataToImport = filteredDataToImport?.filter(item => {
                    const key = `${item.year}-${item.quoteNo}-${item.option}`;
                    if (uniqueSet.has(key)) {
                        return false; // Duplicate found, exclude it
                    }
                    uniqueSet.add(key);
                    return true; // Unique entry, keep it
                });
                // Proceed with bulk insert only if there are new records
                if (uniqueDataToImport.length > 0) {

                    const quotationResponse = await createUser({
                        action: "create",
                        db: "QUOTATION_MASTER",
                        bulkInsert: true,
                        data: uniqueDataToImport,
                    });

                    toast.success(`${masterName} imported successfully`);
                } else {
                    toast.error("No data imported. All data already exist.");
                }


            } catch (err) {
                toast.error(`Error during import: ${err.message}`);
            }
        };
        reader.readAsBinaryString(file);
    };
    input.click();
};

const fieldMappingConfig = {
    User: {
        role: { source: "roleData", key: "name", value: "_id" },
    },
    Region: {
        continent: { source: "continentData", key: "name", value: "_id" },
    },
    Country: {
        region: { source: "regionData", key: "name", value: "_id" },
    },
    State: {
        country: { source: "countryData", key: "name", value: "_id" },
    },
    Quotation: {
        country: { source: "countryData", key: "name", value: "_id" },
        quoteStatus: { source: "quoteStatusData", key: "name", value: "_id" },
        salesEngineer: {
            source: "teamMemberData",
            key: "user.shortName", // Accessing shortName from the User table via TeamMember
            value: "_id",
            transform: (name, teamMemberData) => {
                if (!name || !Array.isArray(teamMemberData)) return null;
                const found = teamMemberData.find(member => {
                    return member.user?.shortName?.trim().toLowerCase() === name.trim().toLowerCase();
                });
                return found ? found._id : null;
            }
        },
        salesSupportEngineer1: {
            source: "teamMemberData",
            key: "user.shortName", // Accessing shortName from the User table via TeamMember
            value: "_id",
            transform: (name, teamMemberData) => {
                if (!name || !Array.isArray(teamMemberData)) return null;
                const found = teamMemberData.find(member => {
                    return member.user?.shortName?.trim().toLowerCase() === name.trim().toLowerCase();
                });
                return found ? found._id : null;
            }
        },
        salesSupportEngineer2: {
            source: "teamMemberData",
            key: "user.shortName", // Accessing shortName from the User table via TeamMember
            value: "_id",
            transform: (name, teamMemberData) => {
                if (!name || !Array.isArray(teamMemberData)) return null;
                const found = teamMemberData.find(member => {
                    return member.user?.shortName?.trim().toLowerCase() === name.trim().toLowerCase();
                });
                return found ? found._id : null;
            }
        },
        salesSupportEngineer3: {
            source: "teamMemberData",
            key: "user.shortName", // Accessing shortName from the User table via TeamMember
            value: "_id",
            transform: (name, teamMemberData) => {
                if (!name || !Array.isArray(teamMemberData)) return null;
                const found = teamMemberData.find(member => {
                    return member.user?.shortName?.trim().toLowerCase() === name.trim().toLowerCase();
                });
                return found ? found._id : null;
            }
        },
        sellingTeam: { source: "teamData", key: "name", value: "_id" },
        responsibleTeam: { source: "teamData", key: "name", value: "_id" },
        company: { source: "customerData", key: "name", value: "_id" },
        contact: { source: "customerContactData", key: "name", value: "_id" },
        customerType: { source: "customerTypeData", key: "name", value: "_id" },
        sector: { source: "sectorData", key: "name", value: "_id" },
        industryType: { source: "industryData", key: "name", value: "_id" },
        buildingType: { source: "buildingData", key: "name", value: "_id" },
        state: { source: "stateData", key: "name", value: "_id" },
        approvalAuthority: { source: "approvalAuthorityData", key: "name", value: "_id" },
        projectType: { source: "projectTypeData", key: "name", value: "_id" },
        paintType: { source: "paintTypeData", key: "name", value: "_id" },
        currency: { source: "currencyData", key: "name", value: "_id" },
        incoterm: { source: "incotermData", key: "name", value: "_id" },
        handleBy: {
            source: "teamMemberData",
            key: "user.shortName", // Accessing shortName from the User table via TeamMember
            value: "_id",
            transform: (name, teamMemberData) => {
                if (!name || !Array.isArray(teamMemberData)) return null;
                const found = teamMemberData.find(member => {
                    return member.user?.shortName?.trim().toLowerCase() === name.trim().toLowerCase();
                });
                return found ? found._id : null;
            }
        },
    },
    // Add more entity mappings if needed
};


const mapFieldsToIds = (data, entityType, referenceData) => {

    const mappings = fieldMappingConfig[entityType];

    return data.map((item) => {
        const transformedItem = { ...item };
        if (mappings) {
            Object.entries(mappings).forEach(([field, { source, key, value, transform }]) => {
        
                const referenceArray = referenceData[source]?.data || referenceData[source];
              
                if (!Array.isArray(referenceArray)) {
                    console.error(`Invalid reference data for source: ${source}`, referenceData[source]);
                    transformedItem[field] = undefined; // Default to empty if reference data is invalid
                    return;
                }

                if (transform) {
                    // Apply transform function if defined
          
                    transformedItem[field] = transform(item[field], referenceArray);
                } else {
                    // Default mapping lookup
                    const reference = referenceArray.find((ref) => ref[key] === item[field]);
                    transformedItem[field] = reference ? reference[value] : undefined;
                }

                if (!transformedItem[field]) {
                    console.warn(`No reference found for field: ${field} with value: ${item[field]}`);
                }
            });
        }

        return transformedItem;
    });
};


const monthMap = {
    January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
    July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
};



const entityFieldMappings = {
    User: {
        "Employee ID": "empId",
        "First Name": "firstName",
        "Last Name": "lastName",
        "Email": "email",
        "Role": "role",
        // Add more mappings for users
    },
    Department: {
        "Department Id": "depId",
        "Department": "name",
        // Add more mappings for departments
    },
    Role: {
        "Role": "name",
        // Add more mappings for Role
    },

    EmployeeType: {
        "Employee Type": "name",

        // Add more mappings for EmployeeType
    },
    Designation: {
        "Designation": "name",

        // Add more mappings for Designation
    },
    Continent: {
        "Continent": "name",

        // Add more mappings for Continent
    },
    Region: {
        "Region": "name",
        "Continent": "continent",

        // Add more mappings for Region
    },

    Country: {
        "Country Code": "countryCode",
        "Country": "name",
        "Region": "region",

        // Add more mappings for Country
    },

    State: {
        "State": "name",
        "Country": "country",

        // Add more mappings for State
    },
    Currency: {
        "Currency": "name",

        // Add more mappings for State
    },
    PaintType: {
        "Paint Type": "name",

        // Add more mappings for State
    },
    ProjectType: {
        "Project Type": "name",

        // Add more mappings for State
    },
    BuildingType: {
        "Building Type": "name",

        // Add more mappings for State
    },
    IndustryType: {
        "Industry Type": "name",

        // Add more mappings for State
    },
    QuoteStatus: {
        "Quote Status": "name",

        // Add more mappings for State
    },
    Quotation: {
        "Country": "country",
        "Year": "year",
        "Quote No": "quoteNo",
        "Option": "option",
        "SO": "sellingTeam",
        "RO": "responsibleTeam",
        "Quote Rev": "revNo",
        "Quote Status": "quoteStatus",
        "Date Received From Customer": "rcvdDateFromCustomer",
        "Sales Eng/Mng": "salesEngineer",
        "Sales Support 1": "salesSupportEngineer1",
        "Sales Support 2": "salesSupportEngineer2",
        "Sales Support 3": "salesSupportEngineer3",
        "Customer Name": "company",
        "Contact Name": "contact",
        "Customer Type": "customerType",
        "End Client": "endClient",
        "Project Management": "projectManagementOffice",
        "Consultant": "consultant",
        "Main Contractor": "mainContractor",
        "Erector": "erector",
        "Project Name": "projectName",
        "Sectors": "sector",
        "Industry Type": "industryType",
        "Other Industry": "otherIndustryType",
        "Building Type": "buildingType",
        "Other Building Type": "otherBuildingType",
        "Building Usage": "buildingUsage",
        "City": "state",
        "Approval Authority": "approvalAuthority",
        "Plot No": "plotNumber",
        "Date Sent To Estimation": "sentToEstimation",
        "Date Received From Estimation": "receivedFromEstimation",
        "Cycle Time (Days)": "cycleTime",
        "Date Sent To Customer": "sentToCustomer",
        "No Of Buildings": "noOfBuilding",
        "Project Type": "projectType",
        "Paint Type": "paintType",
        "Other Paint Type": "otherPaintType",
        "Projected Area (Sq. Mtr)": "projectArea",
        "Total Weight (Tons)": "totalWt",
        "Mezzanine Area (Sq. Mtr)": "mezzanineArea",
        "Mezzanine Weight (Tons)": "mezzanineWt",
        "Currency": "currency",
        "Total Estimated Price": "totalEstPrice",
        "Q22 Value (AED)": "q22Value",
        "Sp. BuyOut Price": "spBuyoutPrice",
        "Freight Price": "freightPrice",
        "Incoterm": "incoterm",
        "Incoterm Description": "incotermDescription",
        "Booking Probability": "bookingProbability",
        "Job No": "jobNo",
        "Job Date": "jobDate",
        "Forecast Month": "forecastMonth",
        "Payment Term": "paymentTerm",
        "Remarks": "remarks",
        "Lost To": "lostTo",
        "Lost To Others": "lostToOthers",
        "Reason": "reason",
        "Initial Ship Date": "initialShipDate",
        "Final Ship Date": "finalShipDate",
        "Status": 'status',
        "Handle By": 'handleBy',
    },
    // Add mappings for other entities
};

const mapExcelToEntity = (excelData, entityType) => {

    const mappings = entityFieldMappings[entityType];
    return excelData.map((row) =>
        Object.keys(row).reduce((acc, key) => {
            const mappedKey = mappings[key];
            if (mappedKey) acc[mappedKey] = row[key];
            return acc;
        }, {})
    );
};




