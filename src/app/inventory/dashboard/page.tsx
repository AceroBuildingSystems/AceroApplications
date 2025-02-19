'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function InventoryDashboard() {
  const { data: session } = useSession();

  if (!session) {
    return <p>Please sign in to access the dashboard.</p>;
  }

  return (
    <div>
      <h1>Inventory Management Dashboard</h1>
      <nav>
        <ul>
          <li><Link href="/inventory/assets">Manage Assets</Link></li>
          <li><Link href="/inventory/vendors">Manage Vendors</Link></li>
          <li><Link href="/inventory/transactions">Inventory Transactions</Link></li>
        </ul>
      </nav>
      // ...existing dashboard code...
    </div>
  );
}
