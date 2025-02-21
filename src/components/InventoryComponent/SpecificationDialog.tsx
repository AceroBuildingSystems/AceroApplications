"use client"

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ProductCategoryDocument } from '@/types';
import { useUpdateProductCategoryMutation } from '@/services/endpoints/inventoryApi';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface SpecificationDialogProps {
    category: ProductCategoryDocument;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function SpecificationDialog({
    category,
    open,
    onOpenChange
}: SpecificationDialogProps) {
    const [activeTab, setActiveTab] = React.useState('current');
    const { toast } = useToast();
    const [updateCategory] = useUpdateProductCategoryMutation();

    const handleVersionRollback = async (version: number) => {
        try {
            const versionData = category.specificationTemplate.previousVersions?.find(
                v => v.version === version
            );

            if (!versionData) {
                throw new Error('Version not found');
            }

            await updateCategory({
                _id: category._id,
                specificationTemplate: {
                    fields: versionData.fields,
                    version: versionData.version
                }
            }).unwrap();

            toast({
                title: 'Template Rolled Back',
                description: `Successfully rolled back to version ${version}`
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to roll back template version',
                variant: 'destructive'
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] h-[600px]">
                <DialogHeader>
                    <DialogTitle>
                        Specification Template - {category.name}
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                    <TabsList>
                        <TabsTrigger value="current">Current Template</TabsTrigger>
                        <TabsTrigger value="history">Version History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="current" className="h-full">
                        <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-4">
                                <div className="text-sm text-muted-foreground">
                                    Version {category.specificationTemplate.version}
                                </div>
                                {category.specificationTemplate.fields.map((field, index) => (
                                    <div key={index} className="border rounded-lg p-4">
                                        <h4 className="font-medium">{field.name}</h4>
                                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                            <div>
                                                <span className="font-medium">Type:</span> {field.type}
                                            </div>
                                            <div>
                                                <span className="font-medium">Required:</span> {field.isRequired ? 'Yes' : 'No'}
                                            </div>
                                            {field.unit && (
                                                <div>
                                                    <span className="font-medium">Unit:</span> {field.unit}
                                                </div>
                                            )}
                                            {field.type === 'NUMBER' && field.validation && (
                                                <>
                                                    {field.validation.min !== undefined && (
                                                        <div>
                                                            <span className="font-medium">Min:</span> {field.validation.min}
                                                        </div>
                                                    )}
                                                    {field.validation.max !== undefined && (
                                                        <div>
                                                            <span className="font-medium">Max:</span> {field.validation.max}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            {field.type === 'ENUM' && field.enumValues && (
                                                <div className="col-span-2">
                                                    <span className="font-medium">Values:</span>{' '}
                                                    {field.enumValues.join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="history" className="h-full">
                        <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-8">
                                {category.specificationTemplate.previousVersions?.map((version) => (
                                    <div key={version.version} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-medium">Version {version.version}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {format(new Date(version.updatedAt), 'PPpp')}
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleVersionRollback(version.version)}
                                            >
                                                Restore Version
                                            </Button>
                                        </div>

                                        <div className="space-y-4">
                                            {version.fields.map((field, index) => (
                                                <div key={index} className="border rounded-lg p-4">
                                                    <h4 className="font-medium">{field.name}</h4>
                                                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                                        <div>
                                                            <span className="font-medium">Type:</span> {field.type}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Required:</span> {field.isRequired ? 'Yes' : 'No'}
                                                        </div>
                                                        {field.unit && (
                                                            <div>
                                                                <span className="font-medium">Unit:</span> {field.unit}
                                                            </div>
                                                        )}
                                                        {field.type === 'NUMBER' && field.validation && (
                                                            <>
                                                                {field.validation.min !== undefined && (
                                                                    <div>
                                                                        <span className="font-medium">Min:</span> {field.validation.min}
                                                                    </div>
                                                                )}
                                                                {field.validation.max !== undefined && (
                                                                    <div>
                                                                        <span className="font-medium">Max:</span> {field.validation.max}
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                        {field.type === 'ENUM' && field.enumValues && (
                                                            <div className="col-span-2">
                                                                <span className="font-medium">Values:</span>{' '}
                                                                {field.enumValues.join(', ')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}