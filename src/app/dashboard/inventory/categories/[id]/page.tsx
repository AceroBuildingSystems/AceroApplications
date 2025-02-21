"use client"

import React from 'react';
import { Metadata } from 'next';
import CategoryForm from '@/components/InventoryComponent/CategoryForm';
import { useGetProductCategoriesQuery } from '@/services/endpoints/inventoryApi';
import { useParams } from 'next/navigation';
import { DashboardLoader } from '@/components/ui/DashboardLoader';

export const metadata: Metadata = {
    title: 'Edit Product Category',
    description: 'Edit product category and its specification template'
};

export default function EditCategoryPage() {
    const params = useParams();
    const categoryId = params.id as string;
    
    const { data: categories, isLoading } = useGetProductCategoriesQuery({
        filter: { _id: categoryId }
    });

    const category = categories?.[0];

    if (isLoading) {
        return <DashboardLoader loading={true} />;
    }

    if (!category) {
        return (
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-destructive">Category Not Found</h2>
                        <p className="text-muted-foreground">
                            The requested category could not be found
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Edit Product Category</h2>
                    <p className="text-muted-foreground">
                        Edit category details and specification template
                    </p>
                </div>
            </div>
            <div className="grid gap-4">
                <CategoryForm initialData={category} />
            </div>
        </div>
    );
}