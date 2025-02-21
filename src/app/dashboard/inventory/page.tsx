"use client";

import React from 'react';
import { useGetProductsQuery } from '@/services/endpoints/inventoryApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    Package, 
    Warehouse, 
    Users, 
    AlertTriangle,
    ArrowLeftRight,
    ClipboardCheck,
    UserCheck,
    Wrench,
    BarChart3,
    Plus
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MaintenanceRecord {
    status: 'PENDING' | 'COMPLETED' | 'OVERDUE';
    date: string;
    notes?: string;
}

interface ProductInventory {
    availableQuantity: number;
    minQuantity: number;
    totalQuantity: number;
}

interface Product {
    type: 'INVENTORY' | 'ASSET';
    inventory?: ProductInventory;
    maintenance?: MaintenanceRecord[];
}

export default function InventoryPage() {
    const router = useRouter();
    const { data: products = [], isLoading } = useGetProductsQuery({});

    // Calculate statistics
    const stats = React.useMemo(() => {
        if (!products) return {
            totalProducts: 0,
            totalAssets: 0,
            lowStock: 0,
            pendingMaintenance: 0
        };

        return (products as Product[]).reduce((acc, product) => {
            // Check if product is inventory type and has inventory data
            const isLowStock = product.type === 'INVENTORY' && 
                product.inventory?.availableQuantity !== undefined && 
                product.inventory?.minQuantity !== undefined &&
                product.inventory.availableQuantity < product.inventory.minQuantity;

            return {
                totalProducts: acc.totalProducts + (product.type === 'INVENTORY' ? 1 : 0),
                totalAssets: acc.totalAssets + (product.type === 'ASSET' ? 1 : 0),
                lowStock: acc.lowStock + (isLowStock ? 1 : 0),
                pendingMaintenance: acc.pendingMaintenance + (product.maintenance?.some(m => m.status === 'PENDING') ? 1 : 0)
            };
        }, {
            totalProducts: 0,
            totalAssets: 0,
            lowStock: 0,
            pendingMaintenance: 0
        });
    }, [products]);

    const quickActions = [
        {
            title: "Stock Transfer",
            description: "Transfer stock between warehouses",
            icon: ArrowLeftRight,
            href: "/dashboard/inventory/transfer"
        },
        {
            title: "Stock Reconciliation",
            description: "Reconcile physical and system stock",
            icon: ClipboardCheck,
            href: "/dashboard/inventory/reconciliation"
        },
        {
            title: "Asset Assignment",
            description: "Assign assets to users or departments",
            icon: UserCheck,
            href: "/dashboard/inventory/assignment"
        },
        {
            title: "Maintenance Schedule",
            description: "Schedule and track asset maintenance",
            icon: Wrench,
            href: "/dashboard/inventory/maintenance"
        },
        {
            title: "Reports",
            description: "View inventory and asset reports",
            icon: BarChart3,
            href: "/dashboard/inventory/reports"
        }
    ];

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
                <div className="flex items-center space-x-2">
                    <Button onClick={() => router.push('/dashboard/inventory/products')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                    </Button>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Products
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            Inventory items
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Assets
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalAssets}</div>
                        <p className="text-xs text-muted-foreground">
                            Tracked assets
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Low Stock Alerts
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.lowStock}</div>
                        <p className="text-xs text-muted-foreground">
                            Items below minimum
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pending Maintenance
                        </CardTitle>
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingMaintenance}</div>
                        <p className="text-xs text-muted-foreground">
                            Assets due for maintenance
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {quickActions.map((action, index) => (
                    <Card key={index} className="cursor-pointer hover:bg-accent/50" onClick={() => router.push(action.href)}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-lg font-medium">
                                {action.title}
                            </CardTitle>
                            <action.icon className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <CardDescription>{action.description}</CardDescription>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Alerts Section */}
            {stats.lowStock > 0 && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Low Stock Alert</AlertTitle>
                    <AlertDescription>
                        {stats.lowStock} items are below minimum stock level. Please review and reorder.
                    </AlertDescription>
                </Alert>
            )}

            {stats.pendingMaintenance > 0 && (
                <Alert>
                    <Wrench className="h-4 w-4" />
                    <AlertTitle>Maintenance Due</AlertTitle>
                    <AlertDescription>
                        {stats.pendingMaintenance} assets are due for maintenance. Check maintenance schedule.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}