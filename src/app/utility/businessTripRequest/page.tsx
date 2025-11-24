"use client";

import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCheck, ChevronsRight, X } from 'lucide-react';
import { useCreateApplicationMutation, useLazyGetApplicationQuery } from '@/services/endpoints/applicationApi';
import { useSendEmailMutation } from '@/services/endpoints/emailApi';
import { MONGO_MODELS } from '@/shared/constants';
import useUserAuthorised from '@/hooks/useUserAuthorised';
import { useCreateMasterMutation, useGetMasterQuery } from '@/services/endpoints/masterApi';
import moment from 'moment';


const ApprovalPage = () => {
    const { user } = useUserAuthorised();
    const [getApplication, { data: applicationData, isLoading, error }] = useLazyGetApplicationQuery();
    const searchParams = useSearchParams();
    const [sendEmail] = useSendEmailMutation();
    const [createApplication]: any = useCreateApplicationMutation();
    const [createMasterData]: any = useCreateMasterMutation();
    const [getQuoteData] = useLazyGetApplicationQuery();

    const status = searchParams.get('status');
    const id = searchParams.get('_id');
    const step = searchParams.get('step');
    const name = searchParams.get('name') as keyof typeof MONGO_MODELS;
    const year = searchParams.get('year');
    const option = searchParams.get('option');
    const [quoteNo, setQuoteNo] = useState('');
    const [reason, setReason] = useState('');

    let approvalStatus = ['pending_hr', 'pending_coo_cfo', 'pending_ceo', 'approved'];

    const { data: businessTripData = [], isLoading: businessTripLoading, refetch } = useGetMasterQuery({
        db: MONGO_MODELS.BUSINESS_TRIP,
        filter: { _id: id },

    });

    const loading = businessTripLoading;

    const currentFlow = businessTripData?.data?.[0]?.approvalFlow || [];
    if (currentFlow?.length < 4) {
        approvalStatus = ['pending_hr', 'pending_ceo', 'approved'];
    }
    console.log('recruitmentData', businessTripData, currentFlow);
    const handleApprove = async () => {

        try {
            console.log('recruitmentData', businessTripData, currentFlow);
            const stepIndex = Number(step ?? 0);
            const updatedFlow = currentFlow.map((item, index) => {
                if (index === stepIndex) {
                    return {
                        ...item,
                        status: 'Approved',
                        date: new Date(),

                    };
                }
                return item;
            });

            console.log('updated flow', updatedFlow);

            if (updatedFlow.length === 0) {
                toast.error('No approval flow found. Please refresh the page and try again.');
                return;
            }

            const formattedData: any = {
                db: MONGO_MODELS.BUSINESS_TRIP,
                action: 'update',
                filter: { "_id": id },
                data: {
                    approvalFlow: updatedFlow,
                    currentApprovalStep: stepIndex + 1,
                    approvalStatus: user?.designation?.name === "CEO" ? 'approved' : approvalStatus[stepIndex]
                },
            };
            console.log('data', formattedData)

            const response: any = await createMasterData(formattedData);


            console.log('response', response);
            if (response?.error?.data?.message?.message) {
                toast.error(`Error encountered: ${response.error.data.message.message}`);
                throw new Error("Something went wrong!");
            }


            toast.success(`Business trip request approved successfully.`);
            let emailData = {};

            if (response.data.data.approvalStatus !== 'approved') {
                const approver = response.data.data?.approvalFlow?.[stepIndex + 1];
                console.log('approval flow', response);
                const requestData = { 'requested By': response.data.data?.requestedBy?.displayName?.toProperCase(), 'requested Date': response.data.data?.createdAt ? moment(response.data.data?.createdAt).format("DD-MMM-yyyy hh:mm A") : "-", 'Department': response.data.data?.requestedDepartment?.name || user?.department?.name, 'Traveller': response.data.data?.travellerType?.toProperCase() };
                emailData = { recipient: 'iqbal.ansari@acero.ae', subject: 'Business Trip Request', templateData: requestData, fileName: "hrmsTemplates/businessTripRequest", senderName: user?.displayName?.toProperCase(), approveUrl: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/utility/businessTripRequest?status=true&_id=${response?.data?.data?._id}&step=${response?.data?.data?.currentApprovalStep}`, rejectUrl: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/utility/businessTripRequest?status=false&_id=${response?.data?.data?._id}&step=${response?.data?.data?.currentApprovalStep}` };

                await sendEmail(emailData);
            }


        } catch (error) {
            console.error(error);
        }
    };

    const handleReject = async () => {
        if (!reason) {
            toast.error('Please enter a reason to reject.');
            return null;
        }

        try {
            const stepIndex = Number(step ?? 0);
            const updatedFlow = currentFlow.map((item, index) => {
                if (index === stepIndex) {
                    return {
                        ...item,
                        status: 'Rejected',
                        date: new Date(),
                        remarks: reason
                    };
                }
                return item;
            });
            const formattedData: any = {
                db: MONGO_MODELS.RECRUITMENT,
                action: 'update',
                filter: { "_id": id },
                data: {
                    approvalFlow: updatedFlow,
                    currentApprovalStep: stepIndex,
                    approvalStatus: 'rejected'
                },
            };
            console.log('data', formattedData)

            const response: any = await createMasterData(formattedData);


            console.log('response', response);
            if (response?.error?.data?.message?.message) {
                toast.error(`Error encountered: ${response.error.data.message.message}`);
                throw new Error("Something went wrong!");
            }
            toast.success('Requisition rejected successfully.');
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="h-screen flex items-center justify-center mx-2">
            <div className="w-[550px] bg-white shadow-lg rounded-lg p-6">
                {/* Details Section */}
                <p className='font-bold text-lg pb-4 flex justify-center items-center'>Business Trip Request Details</p>
                <table className="w-full border border-gray-300 rounded-md text-sm mb-6 border-separate border-spacing-0">
                    <tbody>
                        <tr>
                            <td className="font-semibold px-3 py-4  border-r border-gray-300 rounded-bl-md">
                                Traveller Name
                            </td>
                            <td className="px-3 py-4  border-gray-300 rounded-br-md">
                                {businessTripData?.data?.[0]?.travellerName?.toProperCase() || "—"}
                            </td>
                        </tr>
                        <tr>
                            <td className="font-semibold px-3 border-t py-4 border-r  border-gray-300 ">
                                Department
                            </td>
                            <td className="px-3 py-4 border-t border-gray-300 ">
                                {businessTripData?.data?.[0]?.requestedDepartment?.name || "—"}
                            </td>
                        </tr>
                        <tr>
                            <td className="font-semibold px-3 py-4  border-t border-b border-r border-gray-300">
                                Requested Date
                            </td>
                            <td className="px-3 py-4 border-t border-b   border-gray-300">
                                {businessTripData?.data?.[0]?.createdAt ? moment(businessTripData?.data?.[0]?.createdAt).format("DD-MMM-yyyy hh:mm A") : '—'}
                            </td>
                        </tr>

                        <tr>
                            <td className="font-semibold px-3 py-4   border-b border-r border-gray-300">
                                Travel From / To Date
                            </td>
                            <td className="px-3 py-4  border-b   border-gray-300">
                                {businessTripData?.data?.[0]?.periodFrom ? moment(businessTripData?.data?.[0]?.periodFrom).format("DD-MMM-yyyy") : '—'} To {businessTripData?.data?.[0]?.periodTo ? moment(businessTripData?.data?.[0]?.periodTo).format("DD-MMM-yyyy") : '—'}
                            </td>
                        </tr>

                        <tr>
                            <td className="font-semibold px-3 py-4 border-r border-gray-300">
                                Travel To
                            </td>
                            <td className="px-3 py-4  border-gray-300">
                                {businessTripData?.data?.[0]?.placeOfVisit ? businessTripData?.data?.[0]?.placeOfVisit : '—'} 
                            </td>
                        </tr>

                       
                    </tbody>
                </table>


                {/* Actions */}
                {status === "true" ? (
                    <Button
                        effect="expandIcon"
                        icon={CheckCheck}
                        iconPlacement="right"
                        onClick={handleApprove}
                        className="w-full bg-green-600 hover:bg-green-700 duration-300"
                    >
                        Approve Request
                    </Button>
                ) : (
                    <div className="space-y-3">
                        <Input
                            type="text"
                            onChange={(e) => setReason(e.target.value)}
                            value={reason}
                            placeholder="Remarks If Any"
                            className="w-full"
                        />
                        <Button
                            effect="expandIcon"
                            icon={X}
                            iconPlacement="right"
                            onClick={handleReject}
                            className="w-full bg-red-600 hover:bg-red-700 duration-300"
                        >
                            Reject Request
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );


};

const Page = () => (
    <Suspense fallback={<div>Loading...</div>}>
        <ApprovalPage />
    </Suspense>
);

export default Page;
