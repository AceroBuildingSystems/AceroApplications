"use client";

import React from 'react'
import MasterComponent from '@/components/MasterComponent/MasterComponent'
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import { Plus, Import, Download, Upload, ChevronsRight, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';
import { useCreateUserMutation, useGetUsersQuery } from '@/services/endpoints/usersApi';
import { organisationTransformData, userTransformData } from '@/lib/utils';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { useCreateMasterMutation, useGetMasterQuery } from '@/services/endpoints/masterApi';
import { MONGO_MODELS, SUCCESS } from '@/shared/constants';
import { toast } from 'react-toastify';
import { RowExpanding } from '@tanstack/react-table';
import { error } from 'console';
import { createMasterData } from '@/server/services/masterDataServices';
import { bulkImport } from '@/shared/functions';
import useUserAuthorised from '@/hooks/useUserAuthorised';
import { useSearchParams } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateApplicationMutation, useLazyGetApplicationQuery } from '@/services/endpoints/applicationApi';
import { useSendEmailMutation } from '@/services/endpoints/emailApi';


const page = () => {

    const [sendEmail, { isLoading: isSendEMail }] = useSendEmailMutation();
    const searchParams = useSearchParams();
    const [createApplication, { isLoading: isCreatingMaster }] = useCreateApplicationMutation();
    const [getQuoteData, { isLoading: isLoadingQuote }] = useLazyGetApplicationQuery();
    const status = searchParams.get('status');
    const id = searchParams.get('_id');
    const name = searchParams.get('name');
    const [quoteNo, setQuoteNo] = useState('');
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (status === 'true' && id && name) {
            const saveData = async () => {

                const formattedData = {
                    db: MONGO_MODELS[name],
                    action: 'update',
                    filter: { "_id": id },
                    data: { status: 'approved' },
                };

                const response = await createApplication(formattedData);

                if (response?.error?.data?.message?.message) {
                    return new Error({ message: "Something went wrong!", data: "" })
                    toast.error(`Error encountered: ${response?.error?.data?.message?.message}`);
                }

                return response;
            };
            saveData();
        }

    }, [status, id, name]);


    const handleReject = async () => {

        if (reason === null || reason === '') {
            toast.error('Please enter reason to reject.')
            return;
        }
        const formattedData = {
            db: MONGO_MODELS[name],
            action: 'update',
            filter: { "_id": id },
            data: { status: 'rejected', rejectReason: reason, rejectedDate: Date.now() },
        };

        const response = await createApplication(formattedData);
        if (response?.error?.data?.message?.message) {
            toast.error(`Error encountered: ${response?.error?.data?.message?.message}`);
            return new Error({ message: "Something went wrong!", data: "" })

        } else {
            const { data } = await getQuoteData({
                db: 'QUOTATION_MASTER',
                filter: { _id: id },
                sort: { name: 'asc' },
            });

            const emailData = { recipient: response?.data?.data?.salesEngineer?.user?.email, subject: `Quote Rejected : ${response?.data?.data?.country?.countryCode}-${response?.data?.data?.year?.toString().slice(-2)}-${response?.data?.data?.quoteNo}`, templateData: '', fileName: "aqmTemplates/quoteRequestRejected", senderName: 'Sales Director', approveUrl: '', rejectUrl: '', reason: reason };
            await sendEmail(emailData);
            toast.success(`Quote approval request rejected successfully.`);

        }
    }

    return (
        <>
            <div className='h-screen flex items-center justify-center text-3xl font-bold'>
                {status === 'true' && <div className='text-green-600'>
                    Approved
                </div>
                }

                {status === 'false' && <div className='text-red-600'>
                    <div>
                        <Input
                            type='text'
                            onChange={(e) => setReason(e.target.value)}
                            value={reason}
                            placeholder='Reason To Reject'
                        />
                        {<Button
                            effect="expandIcon"
                            icon={X}
                            iconPlacement="right"
                            onClick={handleReject}
                            className={`w-full  bg-red-600 hover:bg-red-700 duration-300`}
                        >
                            Reason To Reject
                        </Button>}
                    </div>
                </div>}
            </div>

        </>

    )
}

export default page