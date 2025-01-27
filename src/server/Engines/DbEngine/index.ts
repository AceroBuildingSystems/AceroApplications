//@ts-nocheck
import { MONGO_MODELS } from '@/shared/constants';
import { MongooseAdapter } from './Mongoose.adapter';
import { Access,Department,Designation,EmployeeType,Organisation,Role,User,Category, Region, Area, Country,QuoteStatus,SalesTeam, SalesEngineer, Currency, Customer, CustomerType, CustomerContact, IndustryType } from '@/models';





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
    REGION_MASTER :Region,
    AREA_MASTER :Area,
    COUNTRY_MASTER :Country,
    QUOTE_STATUS_MASTER :QuoteStatus,
    SALES_TEAM_MASTER :SalesTeam,
    SALES_ENGINEER_MASTER :SalesEngineer,
    CURRENCY_MASTER: Currency,
    CUSTOMER_MASTER: Customer,
    CUSTOMER_TYPE_MASTER: CustomerType,
    CUSTOMER_CONTACT_MASTER: CustomerContact,
    INDUSTRY_TYPE_MASTER: IndustryType
    });
  }
  return dbEngineInstance;
}

export const dbEngine = {
    mongooose:getMongooseAdapter()
};
