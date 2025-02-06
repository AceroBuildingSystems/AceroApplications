import mongoose from 'mongoose';
import { MenuItemicons } from '../iconMaps';
import { MenuItem } from '../types';
import * as XLSX from "xlsx";
import { toast } from 'react-toastify';
import { SUCCESS } from '@/shared/constants';
import { IndustryType, QuoteStatus } from '@/models';


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


export const bulkImport = async ({ roleData,continentData,regionData,countryData, action, user, createUser, db, masterName }) => {

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
   
    // Add more entity mappings if needed
};


const mapFieldsToIds = (data, entityType, referenceData) => {

    const mappings = fieldMappingConfig[entityType];

    return data.map((item) => {
        const transformedItem = { ...item };
        if (mappings) {
            Object.entries(mappings).forEach(([field, { source, key, value }]) => {
                const referenceArray = referenceData[source]?.data || referenceData[source];

                if (!Array.isArray(referenceArray)) {
                    console.error(`Invalid reference data for source: ${source}`, referenceData[source]);
                    transformedItem[field] = undefined; // Default to empty if reference data is invalid
                    return;
                }

               
                const reference = referenceArray.find((ref) => ref[key] === item[field]);

                if (reference) {
                    transformedItem[field] = reference[value]; // Replace with corresponding ID
                } else {
                    console.warn(`No reference found for field: ${field} with value: ${item[field]}`);
                    transformedItem[field] = undefined; // Replace unmatched value with empty string
                }
            });
        }

        return transformedItem;
    });
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



  
