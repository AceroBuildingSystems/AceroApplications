"use client";

import React from 'react'
import MasterComponent from '@/components/MasterComponent/MasterComponent'
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import { Plus, Import, Download, Upload } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';
import { useGetUsersQuery } from '@/services/endpoints/usersApi';
import { organisationTransformData } from '@/lib/utils';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { useCreateMasterMutation, useGetMasterQuery } from '@/services/endpoints/masterApi';
import { MONGO_MODELS, SUCCESS } from '@/shared/constants';
import { toast } from 'react-toastify';
import { RowExpanding } from '@tanstack/react-table';
import { createMasterData } from '@/server/services/masterDataServices';
import { bulkImport } from '@/shared/functions';
import useUserAuthorised from '@/hooks/useUserAuthorised';
import * as XLSX from "xlsx";
import { useRouter } from 'next/navigation';
import WorkflowNavigation from '@/components/hrms/WorkflowNavigation';
import HRMSFormContainer from '@/components/hrms/HRMSFormContainer';
import { HRMSFormConfig } from '@/types/hrms';
import { getFormConfig } from '@/configs/hrms-forms';
import HRMSFormSection from '@/components/hrms/HRMSFormSection';
import FormContainer from '@/components/hrms/FormContainer';
import HrmsDialog from '@/components/hrms/HrmsComponent';

const page = () => {
    const router = useRouter()
    const [importing, setImporting] = useState(false);
    const { user, status, authenticated } = useUserAuthorised();

    const [formConfig, setFormConfig] = useState<HRMSFormConfig | null>(null);

    const loading = false;

 const [isDialogOpen, setDialogOpen] = useState(false);
    useEffect(() => {
        const config = getFormConfig('manpower_requisition');
        console.log('Form Config:', config);
        setFormConfig(config || null);
    }, []); // ✅ only runs once on mount



    const handleSaveDraft = async (data: any) => {

        try {
            let result;

            console.log('🟡 DRAFT SAVE: Completed successfully', result);

        } catch (error: any) {
            console.error('🔴 DRAFT SAVE: Failed', error);
            throw new Error(error.message || 'Failed to save draft');
        }
    };

      const closeDialog = () => {
        setDialogOpen(false);
        
    };

    const handleSubmit = async (data: any) => {


        try {
            let result;


            console.log('🟢 FORM SUBMIT: API Result', result);


        } catch (error: any) {
            console.error('🔴 FORM SUBMIT: Exception during submission', error);
            throw new Error(error.message || 'Failed to submit form');
        }
    };

    return (
        <>
            
            
        </>
    );


}

export default page

