"use client"

import React from 'react';
import { Metadata } from 'next';
import CategoryForm from '@/components/InventoryComponent/CategoryForm';

export default function NewCategoryPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">New Product Category</h2>
                    <p className="text-muted-foreground">
                        Create a new product category and define its specification template
                    </p>
                </div>
            </div>
            <div className="grid gap-4">
                <CategoryForm />
            </div>
        </div>
    );
}