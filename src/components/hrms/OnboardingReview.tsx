import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import mongoose from "mongoose";
import { Combobox } from "../ui/ComboBoxWrapper";
import { DatePicker } from "../ui/date-picker";
import useUserAuthorised from "@/hooks/useUserAuthorised";
import MultipleSelector from "../ui/multiple-selector";
import { toast } from "react-toastify";
import { FocusScope } from '@radix-ui/react-focus-scope';
import { DismissableLayer } from '@radix-ui/react-dismissable-layer'
import { ERROR } from "@/shared/constants";
import moment from "moment";

interface Field {
    name: string;
    label?: string;
    type: string;
    required?: boolean;
    placeholder?: string;
    readOnly?: boolean;
    format?: string;
    visibility?: boolean;
    section?: string[];
    data?: any[];
    options?: string[];
    onChange?: (value: string) => void;
    validate?: (value: any, formData?: any) => string | undefined;
    CustomComponent?: React.ComponentType<{
        accessData: any;
        handleChange: (e: { target: { value: any } }, fieldName: string) => void;
        selectedItem?: any;
    }>;
}

interface BaseFormData {
    isActive: boolean;
    addedBy?: string;
    updatedBy?: string;
    [key: string]: any;
}

interface DynamicDialogProps<T extends BaseFormData> {
    isOpen: boolean;
    closeDialog: () => void;
    selectedMaster: string;
    onSave: (data: { formData: T; action: string }) => Promise<any>;
    initialData: Partial<T>;
    action: string;
    height?: string;
}

function DialogReviewOnboarding<T extends BaseFormData>({
    isOpen,
    closeDialog,
    selectedMaster,
    onSave,
    initialData,
    action,
    height
}: DynamicDialogProps<T>) {
    const { user }: any = useUserAuthorised();

    console.log("Initial Data 1:", initialData);

    const handleClose = () => {
        closeDialog();
    };

    // Handle form submission
    const handleSubmit = async (status: string) => {

        try {

            handleClose();
        } catch (error) {
            console.error("Error saving data:", error);
            toast.error(`Error while reviewing the details. Please try again later.`);
        }
    };

    const itHardWares = [
        { value: 'laptop', label: 'Laptop' },
        { value: 'desktop', label: 'Desktop' },
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

    const itSoftwares = [
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

    const workplaceApps = [
        { value: 'accurest', label: 'Accurest' },
        { value: 'inhouseApps', label: 'Inhouse Apps' },
        { value: 'aceroApps', label: 'Acero Applications' },
        { value: 'hrms', label: 'HRMS' },
        { value: 'e-invoice', label: 'E-Invoicing' },

    ];

    const accessToBeProvided = [
        { value: 'fullAccessInternet', label: 'Full Access Internet' },
        { value: 'limitedAccessInternet', label: 'Limited Access Internet' },
        { value: 'colorPrinter', label: 'Color Printer' },
        { value: 'blackWhitePrinter', label: 'Black And White Printer' },
        { value: 'networkDriveAccess', label: 'Network Drive Access' },
        { value: 'usb', label: 'USB' },
        { value: 'whatsapp', label: 'Whatsapp' },
        { value: 'emailGroups', label: 'Email Groups' },
    ];

    const otherAccess = [
        { value: 'stationarySet', label: 'Stationary Set' },
        { value: 'tools', label: 'Tools & Equipments' },
        { value: 'vehicle', label: 'Vehicle' },

    ]

    return (

        <Dialog open={isOpen} onOpenChange={closeDialog}>
            <DialogContent
                className="bg-white max-w-full pointer-events-auto mx-2 max-h-[90vh] w-[75%] h-[90vh] flex flex-col"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogTitle className="sticky top-0 bg-white border-b border-gray-200 py-2 mx-2 text-2xl">
                    Review Onboarding Details
                </DialogTitle>

                {/* Scrollable List */}
                <div className=" max-h-[80vh] overflow-y-auto gap-1 grid grid-cols-1 pb-2">

                    <Label className="font-bold text-lg px-2">Employee Joining Details</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 mx-2 mb-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-2">
                            <Label className="text-base font-medium mb-1">Employee Name</Label>
                            <Label className="text-base font-medium mb-1 text-blue-800">{initialData?.fullName}</Label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                            <Label className="text-base font-medium mb-1">Designation</Label>
                            <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.designationName}</Label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-2">
                            <Label className="text-base font-medium mb-1">Department / Section</Label>
                            <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.departmentName}</Label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                            <Label className="text-base font-medium mb-1">Location</Label>
                            <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.workLocationName}</Label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-2">
                            <Label className="text-base font-medium mb-1">Reporting To</Label>
                            <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.reportingToName?.toProperCase()}</Label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                            <Label className="text-base font-medium mb-1">Date Of Reporting</Label>
                            <Label className="text-base font-medium mb-1  text-blue-800">{moment(initialData?.dateOfReporting).format("DD-MMM-YYYY")}</Label>
                        </div>

                    </div>

                    <Label className="font-bold text-lg px-2">Assets & IT - Access Details</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 mx-2 mb-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-2">
                            <Label className="text-base font-medium mb-1">Date Of Request</Label>
                            <Label className="text-base font-medium mb-1  text-blue-800">{moment(initialData?.itAccess?.dateOfRequest).format("DD-MMM-YYYY")}</Label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                            <Label className="text-base font-medium mb-1">Email ID</Label>
                            <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.itAccess?.email}</Label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-2">
                            <Label className="text-base font-medium mb-1">Preferred Display Name</Label>
                            <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.itAccess?.displayName}</Label>
                        </div>
                        <Label className="text-base font-medium mb-1 pl-2"></Label>
                        <div className="pr-2">
                            <Label className="text-base font-medium mb-1">IT Hardware Assets To Be Provided</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-2 border border-gray-300 rounded-md p-2">
                                {initialData?.itAccess?.itHardwareAssets?.map((asset: string, idx: number) => {
                                    const matched = itHardWares.find(hw => hw.value === asset);
                                    return (
                                        <div key={idx} className=" text-blue-800">

                                            {matched?.label || asset}
                                        </div>
                                    )
                                })}

                            </div>
                        </div>

                        <div className="pl-2">
                            <Label className="text-base font-medium mb-1">IT Software Assets To Be Provided</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-2 border border-gray-300 rounded-md p-2">
                                {initialData?.itAccess?.itSoftwareAssets?.map((asset: string, idx: number) => {
                                    const matched = itSoftwares.find(hw => hw.value === asset);
                                    return (
                                        <div key={idx} className=" text-blue-800">

                                            {matched?.label || asset}
                                        </div>
                                    )
                                })}

                            </div>
                        </div>

                        <div className="pr-2">
                            <Label className="text-base font-medium mb-1">Workplace Apps Access</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-2 border border-gray-300 rounded-md p-2">
                                {initialData?.itAccess?.workplaceApps?.map((asset: string, idx: number) => {
                                    const matched = workplaceApps.find(hw => hw.value === asset);
                                    return (
                                        <div key={idx} className=" text-blue-800">

                                            {matched?.label || asset}
                                        </div>
                                    )
                                })}

                            </div>
                        </div>

                        <div className="pl-2">
                            <Label className="text-base font-medium mb-1">Access To Be Provided</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-2 border border-gray-300 rounded-md p-2">
                                {initialData?.itAccess?.accessToProvide?.map((asset: string, idx: number) => {
                                    const matched = accessToBeProvided.find(hw => hw.value === asset);
                                    return (
                                        <div key={idx} className=" text-blue-800">

                                            {matched?.label || asset}
                                        </div>
                                    )
                                })}

                            </div>
                        </div>

                        <div className="pr-2">
                            <Label className="text-base font-medium mb-1">Other Access</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-2 border border-gray-300 rounded-md p-2">
                                {initialData?.itAccess?.othersAccess?.map((asset: string, idx: number) => {
                                    const matched = otherAccess.find(hw => hw.value === asset);
                                    return (
                                        <div key={idx} className=" text-blue-800">

                                            {matched?.label || asset}
                                        </div>
                                    )
                                })}

                            </div>
                        </div>



                    </div>


                    <Label className="font-bold text-lg px-2">Employee Details</Label>
                    <div className="gap-2 p-4 mx-2 mb-4 border border-gray-200 rounded-lg  bg-gray-50">
                        <Label className="text-base font-medium mb-1">Basic Details</Label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 mb-4 border border-gray-200 rounded-lg  bg-gray-50">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-2">
                                <Label className="text-base font-medium mb-1">Employee Name</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.fullName?.toProperCase()}</Label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                                <Label className="text-base font-medium mb-1">Employee ID</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.empId}</Label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-2">
                                <Label className="text-base font-medium mb-1">Grade</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.grade}</Label>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                                <Label className="text-base font-medium mb-1">Category</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.categoryName?.toProperCase()}</Label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-2">
                                <Label className="text-base font-medium mb-1">Date Of Joining</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{moment(initialData?.employeeInfo?.dateOfJoining).format("DD-MMM-YYYY")}</Label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                                <Label className="text-base font-medium mb-1">Date Of Birth</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{moment(initialData?.dateOfBirth).format("DD-MMM-YYYY")}</Label>
                            </div>
                           
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-2">
                                <Label className="text-base font-medium mb-1">Gender</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.gender?.toProperCase()}</Label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                                <Label className="text-base font-medium mb-1">Nationality</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.nationalityName?.toProperCase()}</Label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-2">
                                <Label className="text-base font-medium mb-1">Religion</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.religion}</Label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                                <Label className="text-base font-medium mb-1">Blood Group</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.bloodGroup}</Label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-2">
                                <Label className="text-base font-medium mb-1">Marital Status</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.maritalStatus?.toProperCase()}</Label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                                <Label className="text-base font-medium mb-1">Home Town Airport</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.homeTownAirport?.toProperCase()}</Label>
                            </div>



                        </div>

                        <Label className="text-base font-medium mb-1">Family Details</Label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 mb-4 border border-gray-200 rounded-lg  bg-gray-50">


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-2">
                                <Label className="text-base font-medium mb-1">Father's Name</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.familyDetails?.fatherName?.toProperCase()}</Label>

                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                                <Label className="text-base font-medium mb-1">Father's Nationality</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.familyDetails?.fatherNationality?.name?.toProperCase()}</Label>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-2">
                                <Label className="text-base font-medium mb-1">Mother's Name</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.familyDetails?.motherName?.toProperCase()}</Label>

                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                                <Label className="text-base font-medium mb-1">Mother's Nationality</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.familyDetails?.motherNationality?.name?.toProperCase()}</Label>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-2">
                                <Label className="text-base font-medium mb-1">Spouse's Name</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.familyDetails?.spouseName?.toProperCase()}</Label>

                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                                <Label className="text-base font-medium mb-1">Spouse's Nationality</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.familyDetails?.spouseNationality?.name?.toProperCase()}</Label>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-2">
                                <Label className="text-base font-medium mb-1">First Child's Name</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.familyDetails?.child1Name?.toProperCase()}</Label>

                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                                <Label className="text-base font-medium mb-1">First Child's Nationality</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.familyDetails?.child1Nationality?.name?.toProperCase()}</Label>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-2">
                                <Label className="text-base font-medium mb-1">Second Child's Name</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.familyDetails?.child2Name?.toProperCase()}</Label>

                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                                <Label className="text-base font-medium mb-1">Second Child's Nationality</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.familyDetails?.child2Nationality?.name?.toProperCase()}</Label>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-2">
                                <Label className="text-base font-medium mb-1">Third Child's Name</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.familyDetails?.child3Name?.toProperCase()}</Label>

                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                                <Label className="text-base font-medium mb-1">Third Child's Nationality</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.familyDetails?.child3Nationality?.name?.toProperCase()}</Label>

                            </div>


                        </div>

                        <Label className="text-base font-medium mb-1">Contact Details</Label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 mb-4 border border-gray-200 rounded-lg  bg-gray-50">



                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-2">
                                <Label className="text-base font-medium mb-1">Contact Address (UAE)</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.contacts?.contactAddressUAE?.toProperCase()}</Label>

                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                                <Label className="text-base font-medium mb-1">Contact Number (UAE)</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.contacts?.phoneNumberUAE?.toProperCase()}</Label>

                            </div>



                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-2">
                                <Label className="text-base font-medium mb-1">Contact Address (Home Country)</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.contacts?.contactAddressHomeCountry?.toProperCase()}</Label>

                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                                <Label className="text-base font-medium mb-1">Contact Number (Home Country)</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.contacts?.phoneNumberHomeCountry?.toProperCase()}</Label>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-2">
                                <Label className="text-base font-medium mb-1">Personal Email ID</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.contacts?.emailId}</Label>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                                <Label className="text-base font-medium mb-1">Emergency Contact Number</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.contacts?.emergencyContactNumber}</Label>

                            </div>



                        </div>

                        <Label className="text-base font-medium mb-1">Passport Details</Label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 border border-gray-200 rounded-lg  bg-gray-50">



                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-2">
                                <Label className="text-base font-medium mb-1">Passport Number</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.passport?.passportNo}</Label>

                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                                <Label className="text-base font-medium mb-1">Passport Issue Date</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{moment(initialData?.employeeInfo?.passport?.issueDate).format("DD-MMM-YYYY")}</Label>

                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-2">
                                <Label className="text-base font-medium mb-1">Passport Expiry Date</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{moment(initialData?.employeeInfo?.passport?.expiryDate).format("DD-MMM-YYYY")}</Label>

                            </div>


                        </div>
                    </div>

                    <Label className="font-bold text-lg px-2">Beneficiary Details</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 p-4 mx-2 mb-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-2">
                            <Label className="text-base font-medium mb-1">Beneficiary Name</Label>
                            <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.beneficiaryInfo?.name}</Label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                            <Label className="text-base font-medium mb-1">Relationship</Label>
                            <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.beneficiaryInfo?.relation}</Label>
                        </div>

                        <Label className="text-base font-medium pt-1">Address & Contact Number Of The Beneficiary</Label>
                        <Label className="text-base font-medium  text-blue-800"></Label>
                        <Label className="text-base font-medium  text-blue-800 pr-2">{initialData?.employeeInfo?.beneficiaryInfo?.addressAndContact}</Label>



                    </div>

                    <Label className="font-bold text-lg px-2">Consent (Accomodation & Transportation)</Label>
                    <div className="gap-2 p-4 mx-2 mb-4 border border-gray-200 rounded-lg  bg-gray-50">
                        <Label className="text-base font-medium mb-1">Transportation Details</Label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 mb-4 border border-gray-200 rounded-lg  bg-gray-50">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-2">
                                <Label className="text-base font-medium mb-1">Company Provided Transport</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.consentInfo?.transportationPreference === 'company_provided' ? 'Yes' : 'No'}</Label>
                            </div>
                            <div className={`grid grid-cols-1 md:grid-cols-2 gap-2 pl-2 ${initialData?.employeeInfo?.consentInfo?.transportationPreference !== 'company_provided' && 'hidden'}`}>
                                <Label className="text-base font-medium mb-1">Place / Pickup Point</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.consentInfo?.pickUpPoint?.toProperCase()}</Label>
                            </div>
                            <div className={`grid grid-cols-1 md:grid-cols-2 gap-2 pr-2 ${initialData?.employeeInfo?.consentInfo?.transportationPreference !== 'company_provided' && 'hidden'}`}>
                                <Label className="text-base font-medium mb-1">City</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.consentInfo?.pickUpCity?.toProperCase()}</Label>
                            </div>
                            <div className={`grid grid-cols-1 md:grid-cols-2 gap-2 pl-2 ${initialData?.employeeInfo?.consentInfo?.transportationPreference !== 'company_provided' && 'hidden'}`}>
                                <Label className="text-base font-medium mb-1">Amount To Be Duducted For Transport</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.consentInfo?.deductionAmountTransportation}</Label>
                            </div>


                        </div>

                        <Label className="text-base font-medium mb-1">Accomodation Details</Label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 border border-gray-200 rounded-lg  bg-gray-50">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-2">
                                <Label className="text-base font-medium mb-1">Company Provided Accomodation</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.consentInfo?.accomodationPreference === 'own_accomodation' ? 'No' : 'Yes'}</Label>
                            </div>
                            <div className={`grid grid-cols-1 md:grid-cols-2 gap-2 pl-2 ${initialData?.employeeInfo?.consentInfo?.accomodationPreference === 'own_accomodation' && 'hidden'}`}>
                                <Label className="text-base font-medium mb-1">Flat / Room No</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.consentInfo?.flatRoomNo}</Label>
                            </div>
                            <div className={`grid grid-cols-1 md:grid-cols-2 gap-2 pr-2 ${initialData?.employeeInfo?.consentInfo?.accomodationPreference === 'own_accomodation' && 'hidden'}`}>
                                <Label className="text-base font-medium mb-1">Accomodated Date</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{moment(initialData?.employeeInfo?.consentInfo?.accomodatedDate).format("DD-MMM-YYYY")}</Label>
                            </div>
                            <div className={`grid grid-cols-1 md:grid-cols-2 gap-2 pl-2 ${initialData?.employeeInfo?.consentInfo?.accomodationPreference === 'own_accomodation' && 'hidden'}`}>
                                <Label className="text-base font-medium mb-1">Location</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.consentInfo?.location?.toProperCase()}</Label>
                            </div>
                            <div className={`grid grid-cols-1 md:grid-cols-2 gap-2 pr-2 ${initialData?.employeeInfo?.consentInfo?.accomodationPreference === 'own_accomodation' && 'hidden'}`}>
                                <Label className="text-base font-medium mb-1">Amount To Be Duducted For Transport</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.employeeInfo?.consentInfo?.deductionAmountAccomodation}</Label>
                            </div>


                        </div>




                    </div>

                    <Label className="font-bold text-lg px-2">Nondisclosure Agreement Details</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4 mx-2 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-2">
                            <Label className="text-base font-medium mb-1">Employee Name</Label>
                            <Label className="text-base font-medium mb-1  text-blue-800">{initialData?.fullName?.toProperCase()}</Label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                                <Label className="text-base font-medium mb-1">Agreement Date</Label>
                                <Label className="text-base font-medium mb-1  text-blue-800">{moment(initialData?.employeeInfo?.ndaInfo?.aggrementDate).format("DD-MMM-YYYY")}</Label>
                            </div>
                    </div>


                </div>
                <div className='flex gap-1 justify-end items-end px-4'>
                    <Button className="px-4" variant="secondary" onClick={handleClose} disabled={false}>
                        Cancel
                    </Button>
                    <Button onClick={() => handleSubmit('update')} disabled={false} className={`bg-green-700 hover:bg-green-600 duration-300 px-4`}>
                        Reviewed
                    </Button>
                </div>

            </DialogContent>


        </Dialog>
    );
}

export default DialogReviewOnboarding;
