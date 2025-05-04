import mongoose from "mongoose";
import User from "../models/master/User.model";
import UserPersonalDetails from "../models/master/UserPersonalDetails.model";
import UserEmploymentDetails from "../models/master/UserEmploymentDetails.model";
import UserVisaDetails from "../models/master/UserVisaDetails.model";
import UserIdentification from "../models/master/UserIdentification.model";
import UserBenefits from "../models/master/UserBenefits.model";

// Database connection URI from environment variable
const MONGODB_URI = process.env.MONGODB_URI || "";

async function connectToDatabase() {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log("Already connected to MongoDB");
      return;
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

/**
 * Migrate user data to new schema structure
 * @param dryRun If true, performs a test migration without saving data
 * @returns Migration statistics
 */
async function migrateUserData(dryRun = false) {
  console.log(`Starting user data migration (${dryRun ? 'DRY RUN' : 'LIVE MODE'})`);
  
  // Statistics to track the progress
  const stats = {
    total: 0,
    processed: 0,
    skipped: 0,
    successful: 0,
    failed: 0,
    errors: [] as { userId: string; error: string }[]
  };
  
  let needToDisconnect = false;
  
  try {
    // Connect to database if not already connected
    if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
      needToDisconnect = true;
    }
    
    // Get all users with the old structure
    const users = await mongoose.connection.db.collection("users").find({}).toArray();
    stats.total = users.length;
    console.log(`Found ${users.length} users to migrate`);
    
    // Process each user
    for (const oldUser of users) {
      console.log(`Processing user: ${oldUser.firstName} ${oldUser.lastName} (${oldUser._id})`);
      stats.processed++;
      
      try {
        // Check if user already has related records
        const existingUser = await User.findById(oldUser._id)
          .populate('personalDetails')
          .populate('employmentDetails')
          .populate('visaDetails')
          .populate('identification')
          .populate('benefits');
        
        if (
          existingUser?.personalDetails || 
          existingUser?.employmentDetails || 
          existingUser?.visaDetails || 
          existingUser?.identification || 
          existingUser?.benefits
        ) {
          console.log(`Skipping user ${oldUser._id}: already has related records`);
          stats.skipped++;
          continue;
        }
        
        if (!dryRun) {
          // 1. Create Personal Details record
          const personalDetails = new UserPersonalDetails({
            userId: oldUser._id,
            gender: oldUser.gender,
            dateOfBirth: oldUser.dateOfBirth,
            maritalStatus: oldUser.maritalStatus,
            nationality: oldUser.nationality,
            personalMobileNo: oldUser.personalNumber,
            addedBy: oldUser.addedBy,
            updatedBy: oldUser.updatedBy
          });
          await personalDetails.save();
          
          // 2. Create Employment Details record
          const employmentDetails = new UserEmploymentDetails({
            userId: oldUser._id,
            employeeId: oldUser.empId,
            department: oldUser.department,
            designation: oldUser.designation,
            reportingTo: oldUser.reportingTo,
            employeeType: oldUser.employeeType,
            role: oldUser.role,
            reportingLocation: oldUser.reportingLocation,
            activeLocation: oldUser.activeLocation,
            extension: oldUser.extension,
            workMobile: oldUser.mobile,
            joiningDate: oldUser.joiningDate,
            relievingDate: oldUser.relievingDate,
            organisation: oldUser.organisation,
            personCode: oldUser.personCode,
            status: oldUser.status,
            availability: oldUser.availability,
            addedBy: oldUser.addedBy,
            updatedBy: oldUser.updatedBy
          });
          await employmentDetails.save();
          
          // 3. Create Visa Details record
          const visaDetails = new UserVisaDetails({
            userId: oldUser._id,
            visaType: oldUser.visaType,
            visaIssueDate: oldUser.visaIssueDate,
            visaExpiryDate: oldUser.visaExpiryDate,
            visaFileNo: oldUser.visaFileNo,
            workPermit: oldUser.workPermit,
            labourCardExpiryDate: oldUser.labourCardExpiryDate,
            iloeExpiryDate: oldUser.iloeExpiryDate,
            addedBy: oldUser.addedBy,
            updatedBy: oldUser.updatedBy
          });
          await visaDetails.save();
          
          // 4. Create Identification Documents record
          const identification = new UserIdentification({
            userId: oldUser._id,
            passportNumber: oldUser.passportNumber,
            passportIssueDate: oldUser.passportIssueDate,
            passportExpiryDate: oldUser.passportExpiryDate,
            emiratesId: oldUser.emiratesId,
            emiratesIdIssueDate: oldUser.emiratesIdIssueDate,
            emiratesIdExpiryDate: oldUser.emiratesIdExpiryDate,
            addedBy: oldUser.addedBy,
            updatedBy: oldUser.updatedBy
          });
          await identification.save();
          
          // 5. Create Benefits record
          const benefits = new UserBenefits({
            userId: oldUser._id,
            medicalInsurance: oldUser.medicalInsurance,
            addedBy: oldUser.addedBy,
            updatedBy: oldUser.updatedBy
          });
          await benefits.save();
          
          // 6. Update User record to include references to the new records
          await User.findByIdAndUpdate(oldUser._id, {
            personalDetails: personalDetails._id,
            employmentDetails: employmentDetails._id,
            visaDetails: visaDetails._id,
            identification: identification._id,
            benefits: benefits._id,
            employeeId: oldUser.empId,
            // Keep the existing data for core user fields
          });
        }
        
        console.log(`Successfully ${dryRun ? 'processed' : 'migrated'} user: ${oldUser.firstName} ${oldUser.lastName}`);
        stats.successful++;
      } catch (error: any) {
        const errorMessage = error.message || "Unknown error";
        console.error(`Error migrating user ${oldUser._id}:`, errorMessage);
        stats.failed++;
        stats.errors.push({ userId: oldUser._id.toString(), error: errorMessage });
        // Continue with the next user if one fails
      }
    }
    
    console.log(`User data migration ${dryRun ? 'test' : 'execution'} completed`);
    console.log(`Statistics: Total: ${stats.total}, Processed: ${stats.processed}, Skipped: ${stats.skipped}, Successful: ${stats.successful}, Failed: ${stats.failed}`);
    
    return stats;
  } catch (error: any) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    if (needToDisconnect) {
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB");
    }
  }
}

// Execute the migration if this script is run directly
if (require.main === module) {
  (async () => {
    try {
      await connectToDatabase();
      const dryRun = process.argv.includes('--dry-run');
      const stats = await migrateUserData(dryRun);
      console.log(JSON.stringify(stats, null, 2));
      process.exit(0);
    } catch (error) {
      console.error("Migration script failed:", error);
      process.exit(1);
    }
  })();
}

export default migrateUserData; 