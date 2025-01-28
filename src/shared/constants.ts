//GENERAL
export const SUCCESS = "Success"
export const ERROR = "Error"
export const SIGNUP = "signup"

//ERROR MESSAGES
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
    USER_MASTER :"USER_MASTER",
    ORGANISATION_MASTER :"ORGANISATION_MASTER",
    EMPLOYEE_TYPE_MASTER :"EMPLOYEE_TYPE_MASTER",
    DEPARTMENT_MASTER :"DEPARTMENT_MASTER",
    ROLE_MASTER :"ROLE_MASTER",
    ACCESS_MASTER :"ACCESS_MASTER",
    ADDRESS_MASTER :"ADDRESS_MASTER",
    DESIGNATION_MASTER :"DESIGNATION_MASTER",
    REGION_MASTER :"REGION_MASTER",
    AREA_MASTER :"AREA_MASTER",
    COUNTRY_MASTER :"COUNTRY_MASTER",
    QUOTE_STATUS_MASTER :"QUOTE_STATUS_MASTER",
    TEAM_MASTER :"TEAM_MASTER",
    TEAM_MEMBERS_MASTER :"TEAM_MEMBERS_MASTER",
    CURRENCY_MASTER : "CURRENCY_MASTER",
    CUSTOMER_MASTER : "CUSTOMER_MASTER",
    CUSTOMER_TYPE_MASTER: "CUSTOMER_TYPE_MASTER",
    CUSTOMER_CONTACT_MASTER: "CUSTOMER_CONTACT_MASTER",
    INDUSTRY_TYPE_MASTER: "INDUSTRY_TYPE_MASTER"
}


//MASTER DATA
export const MASTER_DATA = {
    GLOBAL_ADMIN:{
        MANAGE_ACCESS:{
            name:"manage access",
            category:"Global Admin",
        }
    }
}
