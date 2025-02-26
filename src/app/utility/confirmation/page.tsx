"use client";

import React from 'react'
import MasterComponent from '@/components/MasterComponent/MasterComponent'
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import { Plus, Import, Download, Upload } from 'lucide-react';
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

const page = () => {
    const searchParams = useSearchParams();
    const [createMaster, { isLoading: isCreatingMaster }] = useCreateMasterMutation();
    const status = searchParams.get('status');
    const id = searchParams.get('_id');
    const name = searchParams.get('name');

    useEffect(() => {
        if (status && id && name) {
            const saveData = async () => {

                const formattedData = {
                    db: MONGO_MODELS[name],
                    action: 'update',
                    filter: { "_id": id },
                    data: { isActive: status },
                };

                const response = await createMaster(formattedData);

                if (response?.error?.data?.message?.message) {
                    return new Error({ message: "Something went wrong!", data: "" })
                    toast.error(`Error encountered: ${response?.error?.data?.message?.message}`);
                }

                return response;
            };
            saveData();
        }

    }, [status, id, name]);

    return (
        <>
            <div className='h-screen flex items-center justify-center text-3xl font-bold'>
                {status === 'true' ? <div className='text-green-600'>
                    Approved
                </div> : <div className='text-red-600'>
                    Rejected
                </div>}
            </div>

        </>

    )
}

export default page