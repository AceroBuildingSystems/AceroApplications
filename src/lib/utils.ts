import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import moment from "moment";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const transformData = (data, fieldsToAdd) => {
  const transformedData = data?.map((item) => {
    let transformedItem = { ...item };

    // Iterate over the fieldsToAdd object to add new fields to each item
    fieldsToAdd.forEach((field) => {
      const { fieldName, path } = field;

      // Get the value from the path and add it to the item with the fieldName
      const value = path.reduce((acc, part) => acc?.[part], item);
      transformedItem[fieldName] = value || '';  // Default to empty string if value doesn't exist
    });

    return transformedItem;
  });

  return transformedData;
};


export const organisationTransformData = (data) => {


  const transformedData = data?.map((organisation) => {
    return {
      _id: organisation._id,
      name: organisation.address?.location || '',
    };
  })

  return transformedData
};

export const transformQuoteData = (data, user, teamMemberData) => {
  if (!Array.isArray(data)) {
    return [];
  }
  const userId = user?._id;
  const teamRole = teamMemberData?.find(data => data?.user?._id === userId)?.teamRole[0]?.name;
  return data.filter((quote) => {
    const handledBy = quote?.salesEngineer;

    if (!handledBy || !userId) return false; // Skip if there's no handledBy data or userId

    switch (user?.role?.name) {
      case "Admin":
        return true; // Admin gets all data

      default:

        switch (teamRole) {
          case "Director":
            return (
              handledBy?.user?._id === userId || // Directly handled by the user
              handledBy?.team?.teamHead[0]?._id === userId // User is the team head
            );

          case "Manager":
            return (
              handledBy?.user?._id === userId || // Directly handled by the user
              handledBy?.teamReportingTo?.[0]?._id === userId // Reports to the user
            );

          case "Engineer":
            return handledBy?.user?._id === userId; // Only data handled by the user

          default:
            return false; // Exclude all other roles
        }

    }
  });
};


export const transformDataForExcel = (data) => {
  return data.map((item) => ({
    "Region": item.country?.region?.continent?.name || '',
    "Area": item.country?.region?.name || '',
    "Country": item.country?.name || '',
    "QuoteNo": item.quoteNo && item.country?.countryCode - item.year?.toString().slice(-2) - item.quoteNo || '',
    "Option": item.option || '',
    "SO": item.sellingTeam?.name || '',
    "RO": item.responsibleTeam?.name || '',
    "Quote Rev": item.revNo.toString(),
    "Quote Status": item.quoteStatus?.name || '',
    "Date Received From Customer": item.rcvdDateFromCustomer ? moment(item.rcvdDateFromCustomer).format("DD-MMM-YYYY") : '',
    "Sales Eng/Mng": item.salesEngineer?.user?.shortName?.toProperCase() || '',
    "Sales Support 1": item.salesSupportEngineer?.[0]?.user?.shortName?.toProperCase() || '',
    "Sales Support 2": item.salesSupportEngineer?.[1]?.user?.shortName?.toProperCase() || '',
    "Sales Support 3": item.salesSupportEngineer?.[2]?.user?.shortName?.toProperCase() || '',
    "Customer Name": item.company?.name || '',
    "Contact Name": item.contact?.name || '',
    "Contact Email": item.contact?.email || '',
    "Contact Number": item.contact?.phone || '',
    "Position": item.contact?.position || '',
    "Customer Type": item.customerType?.name || '',
    "End Client": item.endClient || '',
    "Project Management": item.projectManagementOffice || '',
    "Consultant": item.consultant || '',
    "Main Contractor": item.mainContractor || '',
    "Erector": item.erector || '',
    "Project Name": item.projectName || '',
    "Sectors": item.sector?.name || '',
    "Industry Type": item.industryType?.name || '',
    "Other Industry": item.otherIndustryType || '',
    "Building Type": item.buildingType?.name || '',
    "Other Building Type": item.otherBuildingType || '',
    "Building Usage": item.buildingUsage || '',
    "City": item.state?.name || '',
    "Approval Authority": item.approvalAuthority?.name || '',
    "Plot No": item.plotNumber || '',
    "Date Sent To Estimation": item.proposals[0]?.revisions?.at(-1)?.sentToEstimation ? moment(item.proposals[0]?.revisions?.at(-1)?.sentToEstimation).format("DD-MMM-YYYY") : '',
    "Date Received From Estimation": item.proposals[0]?.revisions?.at(-1)?.receivedFromEstimation ? moment(item.proposals[0]?.revisions?.at(-1)?.receivedFromEstimation).format("DD-MMM-YYYY") : '',
    "Cycle Time (Days)": item.cycleTime || '',
    "Date Sent To Customer": item.proposals[0]?.revisions?.at(-1)?.sentToCustomer ? moment(item.proposals[0]?.revisions?.at(-1)?.sentToCustomer).format("DD-MMM-YYYY") : '',
    "No Of Buildings": item.noOfBuilding || '',
    "Project Type": item.projectType?.name || '',
    "Paint Type": item.paintType?.name || '',
    "Other Paint Type": item.otherPaintType || '',
    "Projected Area (Sq. Mtr)": item.projectArea || '',
    "Total Weight (Tons)": item.totalWt || '',
    "Mezzanine Area (Sq. Mtr)": item.mezzanineArea || '',
    "Mezzanine Weight (Tons)": item.mezzanineWt || '',
    "Currency": item.currency?.name || '',
    "Total Estimated Price": item.totalEstPrice || '',
    "Q22 Value (AED)": item.q22Value || '',
    "Sp. BuyOut Price": item.spBuyoutPrice || '',
    "Freight Price": item.freightPrice || '',
    "Incoterm": item.incoterm?.name || '',
    "Incoterm Description": item.incotermDescription || '',
    "Booking Probability": item.bookingProbability || '',
    "Job No": item.jobNo || '',
    "Job Date": item.jobDate ? moment(item.jobDate).format("DD-MMM-YYYY") : '',
    "Forecast Month": item.forecastMonth
      ? new Date(0, item.forecastMonth - 1).toLocaleString('en-US', { month: 'long' })
      : '',
    "Payment Term": item.paymentTerm || '',
    "Remarks": item.remarks || '',
    "Lost To": item.lostTo || '',
    "Lost To Others": item.lostToOthers || '',
    "Reason": item.reason || '',
    "Initial Ship Date": item.initialShipDate ? moment(item.initialShipDate).format("DD-MMM-YYYY") : '',
    "Final Ship Date": item.finalShipDate ? moment(item.finalShipDate).format("DD-MMM-YYYY") : ''
  }));
};


