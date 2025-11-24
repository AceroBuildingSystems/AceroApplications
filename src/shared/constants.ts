//GENERAL
export const SUCCESS = "Success"
export const ERROR = "Error"
export const SIGNUP = "signup"

//ERROR MESSAGES
export const UNAUTHORIZED_ACCESS = "Unauthorized access";
export const RESOURCE_NOT_FOUND = "Resource not found";
export const USER_NOT_FOUND = "User not found"
export const INVALID_CREDENTIALS = "Invalid credentials"
export const USER_ALREADY_EXISTS = "User already exists"
export const PLEASE_FILL_IN_ALL_FIELDS_CORRECTLY = "Please fill in all fields correctly"
export const PASSWORD_MISMATCH = "Password mismatch"
export const NO_USERS_FOUND = "No users found"
export const INVALID_ACTIONS = "Invalid action"
export const USER_CREATED = "User created successfully"
export const DB_REQUIRED = "Please Specify DB"
export const INVALID_REQUEST = "Invalid request"
export const ACCESS_ID_REQUIRED = "Access Id Required"
export const INSUFFIENT_DATA = "Insufficient data"
export const BODY_REQUIRED = "Body Required"
export const SPECIFY_ACTION = "Please specify action"

//INSERT SCRIPT
export const BULK_INSERT = "bulkInsert"
export const INSERT_ONE = "insertOne"

//MODELS
//////////////////////////
// This is super baddd, please change this
// **NOTE*/ need to modulrise this, for now add do not forget to model to the model apdapter once added her to import it
//////////////////////////
export const MONGO_MODELS = {
    USER_MASTER: "USER_MASTER",
    ORGANISATION_MASTER: "ORGANISATION_MASTER",
    EMPLOYEE_TYPE_MASTER: "EMPLOYEE_TYPE_MASTER",
    DEPARTMENT_MASTER: "DEPARTMENT_MASTER",
    ROLE_MASTER: "ROLE_MASTER",
    ACCESS_MASTER: "ACCESS_MASTER",
    ADDRESS_MASTER: "ADDRESS_MASTER",
    DESIGNATION_MASTER: "DESIGNATION_MASTER",
    CONTINENT_MASTER: "CONTINENT_MASTER",
    REGION_MASTER: "REGION_MASTER",
    AREA_MASTER: "AREA_MASTER",
    COUNTRY_MASTER: "COUNTRY_MASTER",
    QUOTE_STATUS_MASTER: "QUOTE_STATUS_MASTER",
    TEAM_MASTER: "TEAM_MASTER",
    TEAM_MEMBERS_MASTER: "TEAM_MEMBERS_MASTER",
    CURRENCY_MASTER: "CURRENCY_MASTER",
    CUSTOMER_MASTER: "CUSTOMER_MASTER",
    CUSTOMER_TYPE_MASTER: "CUSTOMER_TYPE_MASTER",
    CUSTOMER_CONTACT_MASTER: "CUSTOMER_CONTACT_MASTER",
    INDUSTRY_TYPE_MASTER: "INDUSTRY_TYPE_MASTER",
    BUILDING_TYPE_MASTER: "BUILDING_TYPE_MASTER",
    PROJECT_TYPE_MASTER: "PROJECT_TYPE_MASTER",
    PAINT_TYPE_MASTER: "PAINT_TYPE_MASTER",
    STATE_MASTER: "STATE_MASTER",
    LOCATION_MASTER: "LOCATION_MASTER",
    APPROVAL_AUTHORITY_MASTER: "APPROVAL_AUTHORITY_MASTER",
    INCOTERM_MASTER: "INCOTERM_MASTER",
    SECTOR_MASTER: "SECTOR_MASTER",
    PROPOSAL_MASTER: "PROPOSAL_MASTER",
    PROPOSAL_REVISION_MASTER: "PROPOSAL_REVISION_MASTER",
    QUOTATION_MASTER: "QUOTATION_MASTER",
    OPTION_MASTER: "OPTION_MASTER",
    SALES_ENGINEER_MASTER: "SALES_ENGINEER_MASTER",
    SALES_ENGINEER_TEAM_MASTER: "SALES_ENGINEER_TEAM_MASTER",
    TEAM_ROLE_MASTER: "TEAM_ROLE_MASTER",
    VENDOR_MASTER: "VENDOR_MASTER",
    // Inventory Management Models
    PRODUCT_CATEGORY_MASTER: "PRODUCT_CATEGORY_MASTER",
    PRODUCT_MASTER: "PRODUCT_MASTER",
    WAREHOUSE_MASTER: "WAREHOUSE_MASTER",
    INVENTORY_MASTER: "INVENTORY_MASTER",
    ASSET_MASTER: "ASSET_MASTER",
    UNIT_MEASUREMENT_MASTER: "UNIT_MEASUREMENT_MASTER",

    // Sml Models
    SML_GROUP_MASTER: "SML_GROUP_MASTER",
    SML_SUB_GROUP_MASTER: "SML_SUB_GROUP_MASTER",
    SML_FILE_MASTER: "SML_FILE_MASTER",
    // Employee Extra Details Models
    VISA_TYPE_MASTER: "VISA_TYPE_MASTER",


    PRODUCT_TYPE_MASTER: "PRODUCT_TYPE_MASTER",


    PROVIDER_TYPE_MASTER: "PROVIDER_TYPE_MASTER",
    DEDUCTION_TYPE_MASTER: "DEDUCTION_TYPE_MASTER",
    PACKAGE_MASTER: "PACKAGE_MASTER",
    ACCOUNT_MASTER: "ACCOUNT_MASTER",
    ACCOUNT_HISTORY: "ACCOUNT_HISTORY",
    OTHER_MASTER: "OTHER_MASTER",
    USAGE_DETAIL: "USAGE_DETAIL",
    THRESHOLD_AMOUNT: "THRESHOLD_AMOUNT",
    JOB_ACCOUNT: "JOB_ACCOUNT",
    PRINTER_MASTER: "PRINTER_MASTER",
    PRINTER_USAGE: "PRINTER_USAGE",

    APPROVAL_FLOW_MASTER: "APPROVAL_FLOW_MASTER",
    USER_PERSONAL_DETAILS: "USER_PERSONAL_DETAILS",
    USER_BENEFITS: "USER_BENEFITS",
    USER_EMPLOYMENT_DETAILS: "USER_EMPLOYMENT_DETAILS",
    USER_VISA_DETAILS: "USER_VISA_DETAILS",
    USER_IDENTIFICATION: "USER_IDENTIFICATION",
    RECRUITMENT: "RECRUITMENT",
    CANDIDATE_INFO: "CANDIDATE_INFO",
    INTERVIEW: "INTERVIEW",
    OFFER_ACCEPTANCE: "OFFER_ACCEPTANCE",
    EMPLOYEE_JOINING: "EMPLOYEE_JOINING",
    IT_ASSETS_ACCESS: "IT_ASSETS_ACCESS",
    EMPLOYEE_INFO: "EMPLOYEE_INFO",
    BENEFICIARY_INFO: "BENEFICIARY_INFO",
    CONSENT_INFO: "CONSENT_INFO",
    NDA_INFO: "NDA_INFO",
    ORIENTATION_INFO: "ORIENTATION_INFO",
    VISA_INFO: "VISA_INFO",
    BUSINESS_TRIP: "BUSINESS_TRIP",
    PERFORMANCE_APPRAISAL: "PERFORMANCE_APPRAISAL",
    OFFBOARDING: "OFFBOARDING",
    TASK: "TASK"
}


//MASTER DATA
export const MASTER_DATA = {
    GLOBAL_ADMIN: {
        MANAGE_ACCESS: {
            name: "manage access",
            category: "Global Admin",
        }
    }
}

// Notification Constants
export const NOTIFICATION_MASTER = 'NOTIFICATION_MASTER';


export const itHardWares = [
    { value: 'laptop', label: 'Laptop' },
    { value: 'cpu', label: 'CPU' },
    { value: 'monitor', label: 'Monitor' },
    {
        value: 'telephone-extension',
        label: 'Telephone Extension',

    },
    { value: 'mobile-phone', label: 'Mobile Phone' },
    { value: 'sim-card', label: 'Sim Card' },
    { value: 'keyboard-mouse', label: 'Wireless Keyboard Mouse' },
    { value: 'wireless-mouse', label: 'Wireless Mouse' },
    { value: 'headphone', label: 'Headphone' }
];

export const itSoftwares = [
    { value: 'oracle', label: 'Oracle Fusion' },
    { value: 'acrobat-pro', label: 'Acrobat Pro' },
    { value: 'tally', label: 'Tally' },
    { value: 'zw-cad', label: 'ZW CAD' },
    { value: 'autodesk', label: 'Autodesk' },
    { value: 'dwg-reader', label: 'DWG Reader' },
    { value: 'mbs', label: 'MBS' },
    { value: 'staad-pro', label: 'STAAD Pro' },
    { value: 'ram-connect', label: 'RAM Connect' },
    { value: 'idea-statica', label: 'IDEA StatiCa' },
    { value: 'sap-2000', label: 'SAP 2000' },
    { value: 'etabs', label: 'ETABS' },
    { value: 'cfs', label: 'CFS' },
    { value: 'tekla', label: 'Tekla' },
    { value: 'trimble-connect', label: 'Trimble Connect' }
];

export const workplaceApps = [
    { value: 'accurest', label: 'Accurest' },
    { value: 'inhouseApps', label: 'Inhouse Apps' },
    { value: 'aceroApps', label: 'Acero Applications' },
    { value: 'hrms', label: 'HRMS' },
    { value: 'e-invoice', label: 'E-Invoicing' },

];

export const accessToBeProvided = [
    { value: 'fullAccessInternet', label: 'Full Access Internet' },
    { value: 'limitedAccessInternet', label: 'Limited Access Internet' },
    { value: 'colorPrinter', label: 'Color Printer' },
    { value: 'blackWhitePrinter', label: 'Black And White Printer' },
    { value: 'networkDriveAccess', label: 'Network Drive Access' },
    { value: 'usb', label: 'USB' },
    { value: 'whatsapp', label: 'Whatsapp' },
    { value: 'emailGroups', label: 'Email Groups' },
];

export const otherAccess = [
    { value: 'stationarySet', label: 'Stationary Set' },
    { value: 'tools', label: 'Tools & Equipments' },
    { value: 'vehicle', label: 'Vehicle' },

]


import { DocumentItem } from "@/components/DMSComponent/FileExplorer";

export const documents: DocumentItem[] = [
  {
    id: "1",
    name: "HR Department",
    type: "folder",
    children: [
      {
        id: "1-1",
        name: "Policies",
        type: "folder",
        children: [
          {
            id: "1-1-1",
            name: "LeavePolicy.pdf",
            type: "file",
            sharedWith: [{ userId: "user1", permissions: ["view"] }],
          },
          {
            id: "1-1-2",
            name: "DressCode.docx",
            type: "file",
            sharedWith: [{ userId: "user2", permissions: ["edit"] }],
          },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Finance",
    type: "folder",
    children: [
      {
        id: "2-1",
        name: "Budget2025.xlsx",
        type: "file",
        sharedWith: [{ userId: "user1", permissions: ["view"] }],
      },
    ],
  },
];



