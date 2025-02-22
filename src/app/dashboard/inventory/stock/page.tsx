"use client"

import React, { useEffect, useState } from 'react';
import MasterComponent from '@/components/MasterComponent/MasterComponent';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetMasterQuery, useCreateMasterMutation } from '@/services/endpoints/masterApi';
import DynamicDialog from '@/components/ModalComponent/ModelComponent';

interface BatchInfo {
    batchNumber: string;
    manufacturingDate?: string;
    expiryDate?: string;
    quantity: number;
    purchasePrice: number;
    purchaseDate: string;
    invoiceNumber: string;
    poNumber?: string;
    prNumber?: string;
}

interface StockMovement {
    type: "in" | "out";
    quantity: number;
    date: string;
    reference: string;
    remarks?: string;
    batchNumber?: string;
}

interface InventoryFormData {
    product: string;
    warehouse: string;
    totalQuantity: number;
    batches: BatchInfo[];
    movements: StockMovement[];
    lastStockCheck?: string;
    isActive: string;
}

const InventoryPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<"Add" | "Update">("Add");
    const [selectedItem, setSelectedItem] = useState<InventoryFormData | null>(null);

    // API hooks
    const { data: inventoryResponse, isLoading: inventoryLoading } = useGetMasterQuery({
        db: "Inventory",
        filter: { isActive: true }
    });

    const { data: productsResponse } = useGetMasterQuery({
        db: "Product",
        filter: { isActive: true }
    });

    const { data: warehousesResponse } = useGetMasterQuery({
        db: "Warehouse",
        filter: { isActive: true }
    });

    const [createMaster] = useCreateMasterMutation();

    // Form fields configuration
    const formFields = [
        {
            name: "product",
            label: "Product",
            type: "select",
            required: true,
            options: productsResponse?.data?.map((prod: any) => ({
                label: `${prod.name} (${prod.code})`,
                value: prod._id
            })) || []
        },
        {
            name: "warehouse",
            label: "Warehouse",
            type: "select",
            required: true,
            options: warehousesResponse?.data?.map((wh: any) => ({
                label: wh.name,
                value: wh._id
            })) || []
        },
        {
            name: "batches",
            label: "Batches",
            type: "custom",
            CustomComponent: ({ value = [], onChange }: any) => (
                <div className="space-y-2">
                    {value.map((batch: BatchInfo, index: number) => (
                        <div key={index} className="p-2 border rounded space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    value={batch.batchNumber}
                                    onChange={(e) => {
                                        const newBatches = [...value];
                                        newBatches[index] = { ...batch, batchNumber: e.target.value };
                                        onChange(newBatches);
                                    }}
                                    className="px-2 py-1 border rounded"
                                    placeholder="Batch Number"
                                />
                                <input
                                    type="number"
                                    value={batch.quantity}
                                    onChange={(e) => {
                                        const newBatches = [...value];
                                        newBatches[index] = { ...batch, quantity: Number(e.target.value) };
                                        onChange(newBatches);
                                    }}
                                    className="px-2 py-1 border rounded"
                                    placeholder="Quantity"
                                />
                                <input
                                    type="date"
                                    value={batch.manufacturingDate}
                                    onChange={(e) => {
                                        const newBatches = [...value];
                                        newBatches[index] = { ...batch, manufacturingDate: e.target.value };
                                        onChange(newBatches);
                                    }}
                                    className="px-2 py-1 border rounded"
                                />
                                <input
                                    type="date"
                                    value={batch.expiryDate}
                                    onChange={(e) => {
                                        const newBatches = [...value];
                                        newBatches[index] = { ...batch, expiryDate: e.target.value };
                                        onChange(newBatches);
                                    }}
                                    className="px-2 py-1 border rounded"
                                />
                                <input
                                    type="number"
                                    value={batch.purchasePrice}
                                    onChange={(e) => {
                                        const newBatches = [...value];
                                        newBatches[index] = { ...batch, purchasePrice: Number(e.target.value) };
                                        onChange(newBatches);
                                    }}
                                    className="px-2 py-1 border rounded"
                                    placeholder="Purchase Price"
                                />
                                <input
                                    type="date"
                                    value={batch.purchaseDate}
                                    onChange={(e) => {
                                        const newBatches = [...value];
                                        newBatches[index] = { ...batch, purchaseDate: e.target.value };
                                        onChange(newBatches);
                                    }}
                                    className="px-2 py-1 border rounded"
                                />
                                <input
                                    type="text"
                                    value={batch.invoiceNumber}
                                    onChange={(e) => {
                                        const newBatches = [...value];
                                        newBatches[index] = { ...batch, invoiceNumber: e.target.value };
                                        onChange(newBatches);
                                    }}
                                    className="px-2 py-1 border rounded"
                                    placeholder="Invoice Number"
                                />
                                <input
                                    type="text"
                                    value={batch.poNumber || ''}
                                    onChange={(e) => {
                                        const newBatches = [...value];
                                        newBatches[index] = { ...batch, poNumber: e.target.value };
                                        onChange(newBatches);
                                    }}
                                    className="px-2 py-1 border rounded"
                                    placeholder="PO Number"
                                />
                                <input
                                    type="text"
                                    value={batch.prNumber || ''}
                                    onChange={(e) => {
                                        const newBatches = [...value];
                                        newBatches[index] = { ...batch, prNumber: e.target.value };
                                        onChange(newBatches);
                                    }}
                                    className="px-2 py-1 border rounded"
                                    placeholder="PR Number"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    const newBatches = value.filter((_: any, i: number) => i !== index);
                                    onChange(newBatches);
                                }}
                                className="px-2 py-1 text-red-500 hover:text-red-700"
                            >
                                Remove Batch
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => {
                            onChange([
                                ...value,
                                {
                                    batchNumber: '',
                                    quantity: 0,
                                    purchasePrice: 0,
                                    purchaseDate: new Date().toISOString().split('T')[0],
                                    invoiceNumber: ''
                                }
                            ]);
                        }}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Add Batch
                    </button>
                </div>
            )
        },
        {
            name: "movements",
            label: "Stock Movements",
            type: "custom",
            CustomComponent: ({ value = [], onChange }: any) => (
                <div className="space-y-2">
                    {value.map((movement: StockMovement, index: number) => (
                        <div key={index} className="p-2 border rounded space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <select
                                    value={movement.type}
                                    onChange={(e) => {
                                        const newMovements = [...value];
                                        newMovements[index] = { ...movement, type: e.target.value as "in" | "out" };
                                        onChange(newMovements);
                                    }}
                                    className="px-2 py-1 border rounded"
                                >
                                    <option value="in">In</option>
                                    <option value="out">Out</option>
                                </select>
                                <input
                                    type="number"
                                    value={movement.quantity}
                                    onChange={(e) => {
                                        const newMovements = [...value];
                                        newMovements[index] = { ...movement, quantity: Number(e.target.value) };
                                        onChange(newMovements);
                                    }}
                                    className="px-2 py-1 border rounded"
                                    placeholder="Quantity"
                                />
                                <input
                                    type="date"
                                    value={movement.date}
                                    onChange={(e) => {
                                        const newMovements = [...value];
                                        newMovements[index] = { ...movement, date: e.target.value };
                                        onChange(newMovements);
                                    }}
                                    className="px-2 py-1 border rounded"
                                />
                                <input
                                    type="text"
                                    value={movement.reference}
                                    onChange={(e) => {
                                        const newMovements = [...value];
                                        newMovements[index] = { ...movement, reference: e.target.value };
                                        onChange(newMovements);
                                    }}
                                    className="px-2 py-1 border rounded"
                                    placeholder="Reference"
                                />
                                <input
                                    type="text"
                                    value={movement.remarks || ''}
                                    onChange={(e) => {
                                        const newMovements = [...value];
                                        newMovements[index] = { ...movement, remarks: e.target.value };
                                        onChange(newMovements);
                                    }}
                                    className="px-2 py-1 border rounded"
                                    placeholder="Remarks"
                                />
                                <input
                                    type="text"
                                    value={movement.batchNumber || ''}
                                    onChange={(e) => {
                                        const newMovements = [...value];
                                        newMovements[index] = { ...movement, batchNumber: e.target.value };
                                        onChange(newMovements);
                                    }}
                                    className="px-2 py-1 border rounded"
                                    placeholder="Batch Number"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    const newMovements = value.filter((_: any, i: number) => i !== index);
                                    onChange(newMovements);
                                }}
                                className="px-2 py-1 text-red-500 hover:text-red-700"
                            >
                                Remove Movement
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => {
                            onChange([
                                ...value,
                                {
                                    type: "in",
                                    quantity: 0,
                                    date: new Date().toISOString().split('T')[0],
                                    reference: ''
                                }
                            ]);
                        }}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Add Movement
                    </button>
                </div>
            )
        },
        {
            name: "lastStockCheck",
            label: "Last Stock Check",
            type: "date"
        },
        {
            name: "isActive",
            label: "Status",
            type: "select",
            options: ["Active", "Inactive"],
            required: true
        }
    ];

    // Configure table columns
    const columns = [
        {
            accessorKey: "product",
            header: "Product",
            cell: ({ row }: any) => row.original.product?.name || ''
        },
        {
            accessorKey: "warehouse",
            header: "Warehouse",
            cell: ({ row }: any) => row.original.warehouse?.name || ''
        },
        {
            accessorKey: "totalQuantity",
            header: "Total Quantity",
        },
        {
            accessorKey: "batches",
            header: "Batches",
            cell: ({ row }: any) => row.original.batches?.length || 0
        },
        {
            accessorKey: "movements",
            header: "Movements",
            cell: ({ row }: any) => row.original.movements?.length || 0
        },
        {
            accessorKey: "lastStockCheck",
            header: "Last Stock Check",
            cell: ({ row }: any) => row.original.lastStockCheck ? new Date(row.original.lastStockCheck).toLocaleDateString() : ''
        },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }: any) => (
                <div className={`px-2 py-1 rounded-full text-center ${row.original.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {row.original.isActive ? 'Active' : 'Inactive'}
                </div>
            )
        }
    ];

    // Handle dialog save
    const handleSave = async ({ formData, action }: { formData: InventoryFormData; action: string }) => {
        try {
            // Calculate total quantity from batches
            const totalQuantity = formData.batches.reduce((sum, batch) => sum + batch.quantity, 0);

            await createMaster({
                db: "Inventory",
                action: action.toLowerCase(),
                data: {
                    ...formData,
                    totalQuantity,
                    isActive: formData.isActive === "Active"
                }
            }).unwrap();
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Error saving inventory:', error);
        }
    };

    // Configure page layout
    const pageConfig = {
        searchFields: [
            {
                key: "product.name",
                label: "Product",
                type: "text" as const,
                placeholder: "Search by product..."
            }
        ],
        filterFields: [
            {
                key: "warehouse",
                label: "Warehouse",
                type: "select" as const,
                placeholder: "Filter by warehouse",
                options: warehousesResponse?.data?.map((wh: any) => wh.name) || []
            },
            {
                key: "isActive",
                label: "Status",
                type: "select" as const,
                placeholder: "Filter by status",
                options: ["Active", "Inactive"]
            }
        ],
        dataTable: {
            columns: columns,
            data: (inventoryResponse?.data || []) as any[]
        },
        buttons: [
            {
                label: "Add New",
                action: () => {
                    setDialogAction("Add");
                    setSelectedItem({
                        product: '',
                        warehouse: '',
                        totalQuantity: 0,
                        batches: [],
                        movements: [],
                        isActive: "Active"
                    });
                    setIsDialogOpen(true);
                },
                icon: Plus,
                className: "bg-primary text-white hover:bg-primary/90"
            }
        ]
    };

    useEffect(() => {
        if (!inventoryLoading) {
            setLoading(false);
        }
    }, [inventoryLoading]);

    return (
        <div className="h-full">
            <MasterComponent config={pageConfig} loadingState={loading} />
            
            <DynamicDialog
                isOpen={isDialogOpen}
                closeDialog={() => setIsDialogOpen(false)}
                selectedMaster="Inventory"
                onSave={handleSave}
                fields={formFields}
                initialData={selectedItem || {}}
                action={dialogAction}
                height="auto"
                width="full"
            />
        </div>
    );
};

export default InventoryPage;