//@ts-nocheck
import { MONGO_MODELS } from '@/shared/constants';
import { MongooseAdapter } from './Mongoose.adapter';
import { Access,Department,Designation,EmployeeType,Organisation,Role,User,Category, Country,QuoteStatus,SalesTeam, 
  SalesEngineer, Currency, Customer, CustomerType, CustomerContact, IndustryType,BuildingType, 
  ProjectType,
  PaintType,
  Continent,
  Region,
  State,
  Location,
  ApprovalAuthority} from '@/models';





// Singleton instance tracker
let dbEngineInstance: MongooseAdapter | null = null;

function getMongooseAdapter(): MongooseAdapter {
  if (!dbEngineInstance) {
    dbEngineInstance = new MongooseAdapter({
    USER_MASTER : User,
    ORGANISATION_MASTER :Organisation,
    EMPLOYEE_TYPE_MASTER :EmployeeType,
    DEPARTMENT_MASTER : Department,
    ROLE_MASTER :Role,
    ACCESS_MASTER :Access,
    DESIGNATION_MASTER :Designation,
    CONTINENT_MASTER :Continent,
    REGION_MASTER :Region,
    COUNTRY_MASTER :Country,
    QUOTE_STATUS_MASTER :QuoteStatus,
    SALES_TEAM_MASTER :SalesTeam,
    SALES_ENGINEER_MASTER :SalesEngineer,
    CURRENCY_MASTER: Currency,
    CUSTOMER_MASTER: Customer,
    CUSTOMER_TYPE_MASTER: CustomerType,
    CUSTOMER_CONTACT_MASTER: CustomerContact,
    INDUSTRY_TYPE_MASTER: IndustryType,
    BUILDING_TYPE_MASTER: BuildingType,
    PROJECT_TYPE_MASTER: ProjectType,
    PAINT_TYPE_MASTER: PaintType,
    STATE_MASTER: State,
    LOCATION_MASTER: Location,
    APPROVAL_AUTHORITY_MASTER: ApprovalAuthority
    });
  }
  return dbEngineInstance;
}

export const dbEngine = {
    mongooose:getMongooseAdapter()
};
