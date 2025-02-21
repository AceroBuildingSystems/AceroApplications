"use client"

import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/components/ui/use-toast';
import { ProductCategoryDocument } from '@/types';
import { useDeleteProductCategoryMutation, useGetProductsQuery } from '@/services/endpoints/inventoryApi';
import { Loader2 } from 'lucide-react';
import { skipToken } from '@reduxjs/toolkit/query';

interface DeleteCategoryDialogProps {
    category: ProductCategoryDocument;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function DeleteCategoryDialog({
    category,
    open,
    onOpenChange
}: DeleteCategoryDialogProps) {
    const { toast } = useToast();
    const [deleteCategory, { isLoading }] = useDeleteProductCategoryMutation();
    
    // Check if any products are using this category
    const { data: products } = useGetProductsQuery(
        category._id ? {
            filter: { category: category._id }
        } : skipToken
    );

    const hasProducts = products && products.length > 0;

    const handleDelete = async () => {
        if (!category._id) {
            toast({
                title: "Error",
                description: "Invalid category ID",
                variant: "destructive"
            });
            onOpenChange(false);
            return;
        }

        if (hasProducts) {
            toast({
                title: "Cannot Delete Category",
                description: "This category has products associated with it. Please reassign or delete the products first.",
                variant: "destructive"
            });
            onOpenChange(false);
            return;
        }

        try {
            await deleteCategory(category._id.toString()).unwrap();
            toast({
                title: "Category Deleted",
                description: "The category has been deleted successfully."
            });
            onOpenChange(false);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete the category. Please try again.",
                variant: "destructive"
            });
        }
    };

    // If no valid category ID, don't show the dialog
    if (!category._id) {
        return null;
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Category</AlertDialogTitle>
                    <AlertDialogDescription>
                        {hasProducts ? (
                            <span className="text-destructive">
                                This category cannot be deleted because it has {products?.length} product(s) associated with it.
                                Please reassign or delete the products first.
                            </span>
                        ) : (
                            `Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isLoading || hasProducts}
                        className={hasProducts ? 'bg-destructive/50' : 'bg-destructive'}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete Category
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}