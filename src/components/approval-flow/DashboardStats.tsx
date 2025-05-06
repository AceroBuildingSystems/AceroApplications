'use client';

import React from 'react';
import { CheckCircle, Clock, XCircle, Activity } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    approved: number;
    rejected: number;
    pending: number;
    total: number;
  };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        title="Total Approvals"
        value={stats.total}
        icon={<Activity className="h-5 w-5" />}
        color="bg-blue-50 text-blue-700 border-blue-200"
      />
      <StatCard
        title="Pending"
        value={stats.pending}
        icon={<Clock className="h-5 w-5" />}
        color="bg-amber-50 text-amber-700 border-amber-200"
      />
      <StatCard
        title="Approved"
        value={stats.approved}
        icon={<CheckCircle className="h-5 w-5" />}
        color="bg-green-50 text-green-700 border-green-200"
      />
      <StatCard
        title="Rejected"
        value={stats.rejected}
        icon={<XCircle className="h-5 w-5" />}
        color="bg-red-50 text-red-700 border-red-200"
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className={`rounded-lg border p-4 ${color}`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="p-2 rounded-full bg-white/80 shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
} 