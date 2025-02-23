// This page has been removed as inventory is now managed through assets.
// Please use:
// - /inventory/assets for adding new assets (which automatically updates inventory)
// - /inventory/assetManagement for managing asset allocation

"use client"

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function StockPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard/inventory/assets');
    }, [router]);

    return null;
}