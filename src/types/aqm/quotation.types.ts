import mongoose, { Date } from "mongoose";
export interface quotation {
    _id?: mongoose.ObjectId,
    country: mongoose.ObjectId,
    year: number,
    option: string,
    proposals: mongoose.ObjectId,
    revNo: number,
    quoteNo: number,
    quoteStatus: mongoose.ObjectId,
    salesEngineer: mongoose.ObjectId,
    salesSupportEngineer: mongoose.ObjectId,
    rcvdDateFromCustomer: Date,
    sellingTeam: mongoose.ObjectId,
    responsibleTeam: mongoose.ObjectId,
    quoteDetailsRemark: string,
    company: mongoose.ObjectId,
    contact: mongoose.ObjectId,
    customerType: mongoose.ObjectId,
    customerDetailsRemark: string,
    projectName: string,
    sector: mongoose.ObjectId,
    industryType: mongoose.ObjectId,
    otherIndustryType: string,
    buildingType: mongoose.ObjectId,
    otherBuildingType: string,
    buildingUsage: string,
    state: mongoose.ObjectId,
    approvalAuthority: mongoose.ObjectId,
    plotNumber: string,
    endClient: string,
    projectManagementOffice: string,
    consultant: string,
    mainContractor: string,
    erector: string,
    projectDetailsRemark: string,
    noOfBuilding: number,
    projectType: mongoose.ObjectId,
    paintType: mongoose.ObjectId,
    otherPaintType: string,
    projectArea: number,
    totalWt: number,
    mezzanineArea: number,
    mezzanineWt: number,
    technicalDetailsRemark: string,
    currency: mongoose.ObjectId,
    totalEstPrice: number,
    q22Value: number,
    spBuyoutPrice: number,
    freightPrice: number,
    incoterm: mongoose.ObjectId,
    incotermDescription: string,
    bookingProbability: string,
    commercialDetailsRemark: string,
    jobNo: string,
    jobDate: Date,
    forecastMonth: number,
    paymentTerm: string,
    remarks: string,
    lostTo: string,
    lostToOthers: string,
    reason: string,
    lostDate: Date,
    initialShipDate: Date,
    finalShipDate: Date,
    isActive: Boolean,
    handleBy: mongoose.ObjectId,
    status:string,
    submitDate: Date,
    rejectReason: string,
    rejectedDate: Date,
    approvalDate: Date,
    addedBy: string,
    updatedBy: string
}
