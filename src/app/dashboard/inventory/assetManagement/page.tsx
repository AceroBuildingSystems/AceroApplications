"use client"

import React, { useEffect, useState } from 'react';
import MasterComponent from '@/components/MasterComponent/MasterComponent';
import { Plus, UserPlus, RotateCcw, History } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetMasterQuery, useCreateMasterMutation } from '@/services/endpoints/masterApi';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';
import { MONGO_MODELS } from '@/shared/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-toastify';
import useUserAuthorised from '@/hooks/useUserAuthorised';

interface AssignmentFormData {
    _id: string;
    assignedTo: string;
    assignedType: 'User' | 'Department';
    location?: string;
    remarks?: string;
}

interface HistoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    asset: any;
}

const HistoryDialog = ({ isOpen, onClose, asset }: HistoryDialogProps) => {
    if (!asset) return null;
console.log({asset})
    const getAssigneeName = (assignment: any) => {
        if (!assignment) return '';
        const assignee = assignment.assignedTo;
        if (assignment.assignedType === 'User') {
            return `${assignee.firstName} ${assignee.lastName}`;
        }
        return assignee.name;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Assignment History - {asset.serialNumber}</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Current Assignment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {asset.currentAssignment ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="font-medium">Assigned To:</span>
                                        <span>{getAssigneeName(asset.currentAssignment)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Type:</span>
                                        <Badge>{asset.currentAssignment.assignedType}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Date:</span>
                                        <span>{new Date(asset.currentAssignment.assignedDate).toLocaleDateString()}</span>
                                    </div>
                                    {asset.currentAssignment.location && (
                                        <div className="flex justify-between">
                                            <span className="font-medium">Location:</span>
                                            <span>{asset.currentAssignment.location.name}</span>
                                        </div>
                                    )}
                                    {asset.currentAssignment.remarks && (
                                        <div className="flex justify-between">
                                            <span className="font-medium">Remarks:</span>
                                            <span>{asset.currentAssignment.remarks}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground">Not currently assigned</div>
                            )}
                        </CardContent>
                    </Card>

                    <Separator className="my-4" />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Assignment History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[300px] pr-4">
                                <div className="space-y-4">
                                    {asset.assignmentHistory?.length > 0 ? (
                                        asset.assignmentHistory.map((history: any, index: number) => (
                                            <div key={index} className="p-4 border rounded-lg">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Assigned To:</span>
                                                        <span>{getAssigneeName(history)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Type:</span>
                                                        <Badge>{history.assignedType}</Badge>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Assigned Date:</span>
                                                        <span>{new Date(history.assignedDate).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Returned Date:</span>
                                                        <span>{new Date(history.returnedDate).toLocaleDateString()}</span>
                                                    </div>
                                                    {history.location && (
                                                        <div className="flex justify-between">
                                                            <span className="font-medium">Location:</span>
                                                            <span>{history.location.name}</span>
                                                        </div>
                                                    )}
                                                    {history.remarks && (
                                                        <div className="flex justify-between">
                                                            <span className="font-medium">Remarks:</span>
                                                            <span>{history.remarks}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-muted-foreground">No assignment history</div>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const AssetManagementPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<"Assign" | "Return">("Assign");
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [assignmentType, setAssignmentType] = useState<'User' | 'Department'>('User');
    const { user } = useUserAuthorised();

    // API hooks with proper population
    const { data: assetsResponse, isLoading: assetsLoading } = useGetMasterQuery({
        db: MONGO_MODELS.ASSET_MASTER,
        populate: [
            'product',
            'warehouse',
            'vendor',
            {
                path: 'currentAssignment.assignedTo',
                select: 'firstName lastName name'
            },
            {
                path: 'currentAssignment.location',
                select: 'name'
            },
            {
                path: 'assignmentHistory.assignedTo',
                select: 'firstName lastName name'
            },
            {
                path: 'assignmentHistory.location',
                select: 'name'
            }
        ]
    });
    console.log({assetsResponse})
    const { data: locationResponse } = useGetMasterQuery({
        db: MONGO_MODELS.LOCATION_MASTER,
        filter: { isActive: true }
    }); 

    const { data: usersResponse } = useGetMasterQuery({
        db: MONGO_MODELS.USER_MASTER,
        filter: { isActive: true }
    });

    const { data: departmentsResponse } = useGetMasterQuery({
        db: MONGO_MODELS.DEPARTMENT_MASTER,
        filter: { isActive: true }
    });

    const [createMaster] = useCreateMasterMutation();

    // Form fields for assignment
    const formFields = [
        {
            name: "_id",
            type: "hidden"
        },
        {
            name: "assignedType",
            label: "Assign To",
            type: "select",
            required: true,
            data: [
                { _id: "User", name: "User" },
                { _id: "Department", name: "Department" }
            ],
            onChange: (value: string) => setAssignmentType(value as 'User' | 'Department')
        },
        {
            name: "assignedTo",
            label: "Select User/Department",
            type: "select",
            required: true,
            data: assignmentType === 'User' 
                ? usersResponse?.data?.map((user: any) => ({
                    name: `${user.firstName} ${user.lastName}`,
                    _id: user._id
                })) || []
                : departmentsResponse?.data?.map((dept: any) => ({
                    name: dept.name,
                    _id: dept._id
                })) || [],
            validate: (value: string) => {
                if (!value) return `Please select a ${assignmentType}`;
                return undefined;
            }
        },
        {
            name: "location",
            label: "Location",
            type: "select",
            required: true,
            data: locationResponse?.data?.map((location: any) => ({
                name: location.name,
                _id: location._id
            })) || [],
            validate: (value: string) => {
                if (!value) return "Location must be selected";
                return undefined;
            }
        },
        {
            name: "remarks",
            label: "Remarks",
            type: "textarea",
            placeholder: "Enter any remarks",
            validate: (value: string) => {
                if (value && value.length > 500) return "Remarks must be less than 500 characters";
                return undefined;
            }
        }
    ];

    // Configure table columns
    const columns = [
        {
            accessorKey: "serialNumber",
            header: "Serial Number",
        },
        {
            accessorKey: "product",
            header: "Product",
            cell: ({ row }: any) => `${row.original.product?.name} (${row.original.product?.code})`
        },
        {
            accessorKey: "warehouse",
            header: "Warehouse",
            cell: ({ row }: any) => row.original.warehouse?.name || ''
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }: any) => (
                <Badge variant={
                    row.original.status === 'available' ? "default" :
                    row.original.status === 'assigned' ? "secondary" :
                    row.original.status === 'maintenance' ? "outline" :
                    "destructive"
                }>
                    {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
                </Badge>
            )
        },
        {
            accessorKey: "currentAssignment",
            header: "Current Assignment",
            cell: ({ row }: any) => {
                const assignment = row.original.currentAssignment;
                if (!assignment) return '-';
                const assignee = assignment.assignedTo;
                const name = assignment.assignedType === 'User' 
                    ? `${assignee.firstName} ${assignee.lastName}`
                    : assignee.name;
                return (
                    <div>
                        <div>{name}</div>
                        <div className="text-sm text-muted-foreground">
                            {new Date(assignment.assignedDate).toLocaleDateString()}
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: "actions",
            header: "Actions",
            cell: ({ row }: any) => (
                <div className="flex gap-2">
                  
                        <Button
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAssign(row.original);
                            }}
                            disabled={actionLoading}
                        >
                            <UserPlus className="h-4 w-4" />
                        </Button>
                   
                    {/* {row.original.status === 'assigned' && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleReturn(row.original);
                            }}
                            disabled={actionLoading}
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    )} */}
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(row.original);
                            setIsHistoryOpen(true);
                        }}
                    >
                        <History className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];
    const [selectedAsset, setSelectedAsset] = useState<any>(null);

    const handleAssign = (asset: any) => {
        setDialogAction("Assign");
        setSelectedItem({
            _id: asset._id,
            assignedType: 'User'
        });
        console.log({asset})
        setSelectedAsset(asset);
        setIsDialogOpen(true);
    };

    const handleReturn = async (asset: any) => {
        try {
            setActionLoading(true);
            // Add to history before clearing current assignment
            const currentAssignment = { ...asset.currentAssignment };
            await createMaster({
                db: MONGO_MODELS.ASSET_MASTER,
                action: 'update',
                filter: { _id: asset._id },
                data: {
                    status: 'available',
                    currentAssignment: null,
                    $push: {
                        assignmentHistory: {
                            ...currentAssignment,
                            returnedDate: new Date()
                        }
                    }
                }
            }).unwrap();
            toast.success('Asset returned successfully');
        } catch (error) {
            console.error('Error returning asset:', error);
            toast.error('Failed to return asset');
        } finally {
            setActionLoading(false);
        }
    };

    // Handle dialog save
    const handleSave = async ({ formData, action }: { formData: AssignmentFormData; action: string }) => {
        try {
            setActionLoading(true);
            const updatedData = ({
                db: MONGO_MODELS.ASSET_MASTER,
                action: 'update',
                filter: { _id: formData._id },
                data: {
                    status: 'assigned',
                    currentAssignment: {
                        assignedTo: formData.assignedTo,
                        assignedType: formData.assignedType,
                        assignedDate: new Date(),
                        location: formData.location,
                        assignedBy: user._id,
                        remarks: formData.remarks
                    },  
                }
            });

            if(selectedAsset.currentAssignment){
                updatedData.data.$push = {
                    assignmentHistory: {
                        ...selectedAsset.currentAssignment,
                        returnedDate: new Date()
                    }
                }
            }
            await createMaster(updatedData).unwrap();
            setIsDialogOpen(false);
            setSelectedItem(null);
            toast.success('Asset assigned successfully');
        } catch (error) {
            console.error('Error assigning asset:', error);
            toast.error('Failed to assign asset');
        } finally {
            setActionLoading(false);
        }
    };

    // Configure page layout
    const pageConfig = {
        searchFields: [
            {
                key: "serialNumber",
                label: "serialNumber",
                type: "text" as const,
                placeholder: "Search by serial number..."
            }
        ],
        filterFields: [
            {
                key: "product",
                label: "Product",
                type: "select" as const,
                placeholder: "Filter by product",
                options: assetsResponse?.data?.map((asset: any) => asset.product?.name) || []
            },
            {
                key: "status",
                label: "Status",
                type: "select" as const,
                placeholder: "Filter by status",
                options: ["available", "assigned", "maintenance", "retired"]
            }
        ],
        dataTable: {
            columns: columns,
            data: (assetsResponse?.data || []) as any[],
            onRowClick: (row: any) => {
                // Show assignment history or details
                setSelectedItem(row.original);
                setIsHistoryOpen(true);
            }
        }
    };

    useEffect(() => {
        if (!assetsLoading) {
            setLoading(false);
        }
    }, [assetsLoading]);

    return (
        <div className="h-full">
            <MasterComponent config={pageConfig} loadingState={loading} />
            
            <DynamicDialog<AssignmentFormData>
                isOpen={isDialogOpen}
                closeDialog={() => setIsDialogOpen(false)}
                selectedMaster="Asset Assignment"
                onSave={handleSave}
                fields={formFields}
                initialData={selectedItem || {}}
                action={dialogAction}
                isSubmitting={actionLoading}
                height="auto"
                width="full"
            />

            <HistoryDialog
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                asset={selectedItem}
            />
        </div>
    );
};

export default AssetManagementPage;