import mongoose from 'mongoose';
import { MenuItemicons } from '../iconMaps';
import { MenuItem } from '../types';
import * as XLSX from "xlsx";
import { toast } from 'react-toastify';
import { SUCCESS } from '@/shared/constants';


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


interface BulkImportParams {
    roleData: any;
    continentData: any;
    regionData: any;
    countryData: any;
    action: string;
    user: any;
    createUser: (data: any) => Promise<any>;
    db: string;
    masterName: string;
}

export const bulkImport = async ({ roleData, continentData, regionData, countryData, action, user, createUser, db, masterName }: BulkImportParams) => {

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
            const formData = mapExcelToEntity(sheetData, masterName as keyof typeof entityFieldMappings);
            const referenceData = {
                roleData: roleData?.data || [],
                continentData: continentData?.data || [],
                regionData: regionData?.data || [],
                countryData: countryData?.data || [],

            };

            const finalData = mapFieldsToIds(formData, masterName, referenceData);

            const enrichedData = finalData.map((item: any) => ({
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
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                toast.error(`Error during import: ${errorMessage}`);
            }
        };
        reader.readAsBinaryString(file);
    };
    input.click();
};


interface BulkImportQuotationParams {
    roleData: any;
    continentData: any;
    regionData: any;
    countryData: any;
    quoteStatusData: any;
    teamMemberData: any;
    teamData: any;
    customerData: any;
    customerContactData: any;
    customerTypeData: any;
    sectorData: any;
    industryData: any;
    buildingData: any;
    stateData: any;
    approvalAuthorityData: any;
    projectTypeData: any;
    paintTypeData: any;
    currencyData: any;
    incotermData: any;
    quotationData: any;
    action: string;
    user: any;
    createUser: (data: any) => Promise<any>;
    db: string;
    masterName: string;
}

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
    incotermData, quotationData, action, user, createUser, db, masterName }: BulkImportQuotationParams) => {

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
            const formData = mapExcelToEntity(sheetData, masterName as keyof typeof entityFieldMappings);
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
            const enrichedData = finalData.map((item: any) => ({
                ...item,
                addedBy: user?._id,
                updatedBy: user?._id,
            }));
            // Send the transformed data for bulk insert
            try {
                // Step 1: Insert ProposalRevision Entries (Bulk Insert)
                const revisionData = enrichedData.map((item: { revNo: any; sentToEstimation: any; receivedFromEstimation: any; cycleTime: any; sentToCustomer: any; addedBy: any; updatedBy: any; }) => [
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

                const insertedRevisions = revisionResponse?.data?.data?.map((item: { _id: any; }) => item._id).filter(Boolean);
                if (insertedRevisions.length !== revisionData.length) {
                    throw new Error("Mismatch in inserted ProposalRevision records.");
                }

                // Step 2: Insert Proposal Entries
                const proposalData = enrichedData.map((item: { addedBy: any; updatedBy: any; }, index: number) => [
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
                const insertedProposals = proposalResponse?.data?.data?.map((item: { _id: any; }) => item._id).filter(Boolean);

                if (insertedProposals.length !== proposalData.length) {
                    throw new Error("Mismatch in inserted Proposal records.");
                }

                // Step 3: Insert Quotation Entries
                const quotationDataImport = enrichedData.map((item: { country: any; year: any; option: any; revNo: any; quoteNo: any; quoteStatus: any; salesEngineer: any; salesSupportEngineer1: any; salesSupportEngineer2: any; salesSupportEngineer3: any; rcvdDateFromCustomer: any; sellingTeam: any; responsibleTeam: any; forecastMonth: string | number; status: any; handleBy: any; addedBy: any; updatedBy: any; }, index: number) => ({
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
                    forecastMonth: monthMap[item?.forecastMonth as keyof typeof monthMap] ?? null,
                    status: item.status,
                    handleBy: item.handleBy,
                    addedBy: item.addedBy,
                    updatedBy: item.updatedBy,
                }));

                const existingSet = new Set(
                    quotationData?.data?.map((record: { year: any; quoteNo: any; option: any; }) => `${record.year}-${record.quoteNo}-${record.option}`)
                );

                // Filter out duplicates from dataToImport before inserting
                const filteredDataToImport = quotationDataImport.filter((item: { year: any; quoteNo: any; option: any; }) =>
                    !existingSet.has(`${item.year}-${item.quoteNo}-${item.option}`)
                );

                const uniqueSet = new Set();
                const uniqueDataToImport = filteredDataToImport?.filter((item: { year: any; quoteNo: any; option: any; }) => {
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
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                toast.error(`Error during import: ${errorMessage}`);
            }
        };
        reader.readAsBinaryString(file);
    };
    input.click();
};

const fieldMappingConfig: { [key: string]: any } = {
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
            transform: (name: string, teamMemberData: any[]) => {
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
            transform: (name: string, teamMemberData: any[]) => {
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
            transform: (name: string, teamMemberData: any[]) => {
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
            transform: (name: string, teamMemberData: any[]) => {
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
            transform: (name: string, teamMemberData: any[]) => {
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


const mapFieldsToIds = (data: any[], entityType: string, referenceData: { [x: string]: any; roleData?: any; continentData?: any; regionData?: any; countryData?: any; quoteStatusData?: any; teamMemberData?: any; teamData?: any; customerData?: any; customerContactData?: any; customerTypeData?: any; sectorData?: any; industryData?: any; buildingData?: any; stateData?: any; approvalAuthorityData?: any; projectTypeData?: any; paintTypeData?: any; currencyData?: any; incotermData?: any; }) => {

    const mappings = fieldMappingConfig[entityType as keyof typeof fieldMappingConfig];

    return data.map((item) => {
        const transformedItem = { ...item };
        if (mappings) {
            Object.entries(mappings).forEach(([field, mapping]) => {
                const { source, key, value, transform } = mapping as { source: string, key: string, value: string, transform?: Function };

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
export const validate = {
    required: (value: string) => (value ? undefined : "Required"),
    text: (value: string) => {
        if (value.length < 3) return "Must be at least 3 characters";
        if (value.length > 100) return "Must be less than 100 characters";
        return undefined;
    },
    textSmall: (value: string) => {
        if (value.length < 2) return "Must be at least 2 characters";
        if (value.length > 50) return "Must be less than 50 characters";
        return undefined;
    },
    number: (value: string) => {
        if (isNaN(Number(value))) return "Invalid number";
        return undefined;
    },
    greaterThanZero: (value: string) => {
        if (isNaN(Number(value)) || Number(value) <= 0) return "Must be greater than 0";
        return undefined;
    },
    phone: (value: string) => {
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(value) ? undefined : "Invalid phone number";
    },
    email: (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Invalid email address";
        if (value.length < 5) return "Email must be at least 5 characters";
        if (value.length > 100) return "Email must be less than 100 characters";
        return undefined;
    },
    desription: (value: string) => {
        if (value && value.length > 500) return "Description must be less than 500 characters";
        return undefined;
    },
    specification: (value: Record<string, string>) => {
        if (Object.keys(value).length === 0) return "At least one specification is required";
        return undefined;
    },
    mixString: (value: string) => {
        if (!/^[A-Z0-9-]+$/.test(value)) {
            return "Must contain only uppercase letters, numbers, and hyphens";
        }
        if (value.length < 4) {
            return "Must be at least 4 characters";
        }
        if (value.length > 50) {
            return "Must be less than 50 characters";
        }
        return undefined;
    },
    notFutureDate: (value: string) => {
        const purchaseDate = new Date(value);
        if (purchaseDate > new Date()) {
            return "Dateate cannot be in the future";
        }
        return undefined;
    },
    locationSelected: (value: string) => {
        if (!value) return "Location must be selected";
        return undefined;
    }
}



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

const mapExcelToEntity = (excelData: any[], entityType: keyof typeof entityFieldMappings) => {

    const mappings = entityFieldMappings[entityType];
    return excelData.map((row) =>
        Object.keys(row).reduce((acc: Record<string, any>, key) => {
            const mappedKey = (mappings as Record<string, string>)[key];
            if (mappedKey) acc[mappedKey] = row[key];
            return acc;
        }, {} as Record<string, any>)
    );
};






