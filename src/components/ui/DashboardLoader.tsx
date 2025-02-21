"use client"

import React from 'react';
import { Loader2 } from 'lucide-react';

interface DashboardLoaderProps {
    loading: boolean;
    children?: React.ReactNode;
}

const DashboardLoader: React.FC<DashboardLoaderProps> = ({ loading, children }) => {
    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
};

export default DashboardLoader;