import { access } from "./master/access.types";
import { address } from "./master/address.types";
import { UserDocument } from "./master/user.types";
import { department } from "./master/department.types";
import { organisation } from "./master/organisation.types";
import { designation } from "./master/designation.types";
import { emailData } from "./master/emailData";
import { role } from "./master/role.types";
import { employeeType } from "./master/employeeType.types";
import { team } from "./master/team.types";
import { teamMember } from "./master/teamMember.types";
import { unitMeasurement } from "./master/unitMeasurement.types";
import { group } from "./sml/group.types";
import { smlsubgroup } from "./sml/subgroup.types";
import { smlfile } from "./sml/smlfile.types";
import { paintType } from "./master/paintType.types";
import { productType } from "./master/productType.types";

export interface UserDocument extends Document {
  // Core user information
  employeeId?: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  displayName?: string;
  email?: string;
  password?: string;
  imageUrl?: string;
  isActive?: boolean;
  
  // References to related user data categories
  personalDetails?: mongoose.Types.ObjectId;
  employmentDetails?: mongoose.Types.ObjectId;
  visaDetails?: mongoose.Types.ObjectId;
  identification?: mongoose.Types.ObjectId;
  benefits?: mongoose.Types.ObjectId;
  
  // Access and security
  access?: {
    accessId: mongoose.Types.ObjectId;
    hasAccess: boolean;
    permissions: {
      view: boolean;
      create: boolean;
      update: boolean;
      delete: boolean;
      import: boolean;
      export: boolean;
    };
  }[];
  
  // Audit fields
  addedBy?: string;
  updatedBy?: string;
  
  // Department role
  departmentRole?: 'admin' | 'manager' | 'normal';
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export type {
  UserDocument,
  access,
  address,
  department,
  organisation,
  designation,
  emailData,
  role,
  employeeType,
  team,
  teamMember,
  unitMeasurement,
  group,
  smlsubgroup,
  smlfile,
  paintType,
  productType
};
