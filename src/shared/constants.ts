export const MONGO_MODELS = {
    USER_MASTER: "User",
    ORGANISATION_MASTER: "Organisation",
    EMPLOYEE_TYPE_MASTER: "EmployeeType",
    DEPARTMENT_MASTER: "Department",
    ROLE_MASTER: "Role",
    ACCESS_MASTER: "Access",
    ADDRESS_MASTER: "Address",
    DESIGNATION_MASTER: "Designation",
    TEAM_MASTER: "Team",
    TEAM_MEMBER_MASTER: "TeamMember",
    CONTINENT_MASTER: "Continent",
    REGION_MASTER: "Region",
    COUNTRY_MASTER: "Country",
    STATE_MASTER: "State",
    LOCATION_MASTER: "Location",
    WAREHOUSE_MASTER: "Warehouse",
    PRODUCT_CATEGORY_MASTER: "ProductCategory",
    MODEL_MASTER: "ModelMaster", // Added for model master
    SERIAL_NUMBER_MASTER: "SerialNumber", // Added for serial numbers
    VENDOR_MASTER: "Vendor",
    TRANSACTION_MASTER: "Transaction",
    CUSTOMER_MASTER: "Customer",
    CUSTOMER_CONTACT_MASTER: "CustomerContact",
    CUSTOMER_TYPE_MASTER: "CustomerType",
    INDUSTRY_TYPE_MASTER: "IndustryType",
    BUILDING_TYPE_MASTER: "BuildingType",
    PROJECT_TYPE_MASTER: "ProjectType",
    PAINT_TYPE_MASTER: "PaintType",
    INCOTERM_MASTER: "Incoterm",
    CURRENCY_MASTER: "Currency",
    QUOTE_STATUS_MASTER: "QuoteStatus",
    APPROVAL_AUTHORITY_MASTER: "ApprovalAuthority",
} as const;

// Status Constants
export const SUCCESS = "Success";
export const FAILED = "Failed";
export const PENDING = "Pending";
export const COMPLETED = "Completed";
export const CANCELLED = "Cancelled";
export const REJECTED = "Rejected";
export const APPROVED = "Approved";
export const DRAFT = "Draft";
export const SUBMITTED = "Submitted";
export const ACTIVE = "Active";
export const INACTIVE = "Inactive";

// Error Constants
export const ERROR = "Error";
export const INVALID_REQUEST = "Invalid Request";
export const BODY_REQUIRED = "Request body is required";
export const INSUFFIENT_DATA = "Insufficient data provided";

// Role Constants
export const ROLES = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
    USER: "User",
} as const;

// Permission Constants
export const PERMISSIONS = {
    CREATE: "Create",
    READ: "Read",
    UPDATE: "Update",
    DELETE: "Delete",
} as const;
