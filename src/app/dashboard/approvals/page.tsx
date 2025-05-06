import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/configs/authOptions';
import { dbConnect } from '@/lib/mongoose';
import ApprovalInstance from '@/models/approvals/ApprovalInstance.model';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, XCircle, Settings } from 'lucide-react';
import PageTitle from '@/components/PageTitle';
import PendingApprovalsList from '@/components/approval-flow/PendingApprovalsList';
import DashboardStats from '@/components/approval-flow/DashboardStats';

async function getApprovalStats(userId: string) {
  await dbConnect();
  
  // Get pending approvals for the current user
  const pendingInstances = await ApprovalInstance.find({
    status: 'Pending',
  })
    .populate('approvalFlow', 'name')
    .populate('entityId', 'requestedPosition') // For requisitions
    .populate('initiatedBy', 'fullName')
    .sort({ updatedAt: -1 })
    .lean();
  
  // Count approvals by status
  const approvedCount = await ApprovalInstance.countDocuments({ status: 'Approved' });
  const rejectedCount = await ApprovalInstance.countDocuments({ status: 'Rejected' });
  const pendingCount = await ApprovalInstance.countDocuments({ status: 'Pending' });
  
  // Get latest activities
  const recentActivities = await ApprovalInstance.find({})
    .populate('approvalFlow', 'name')
    .populate('entityId', 'requestedPosition') // For requisitions
    .populate('initiatedBy', 'fullName')
    .populate('lastActionBy', 'fullName')
    .sort({ updatedAt: -1 })
    .limit(5)
    .lean();
  
  return {
    pendingInstances: JSON.parse(JSON.stringify(pendingInstances)),
    stats: {
      approved: approvedCount,
      rejected: rejectedCount,
      pending: pendingCount,
      total: approvedCount + rejectedCount + pendingCount
    },
    recentActivities: JSON.parse(JSON.stringify(recentActivities))
  };
}

export default async function ApprovalsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin');
  }
  
  const { pendingInstances, stats, recentActivities } = await getApprovalStats(session.user.id);
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <PageTitle title="Approvals Dashboard" />
        
        <div className="flex space-x-2">
          <Link href="/dashboard/approvals/flows">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Manage Flows
            </Button>
          </Link>
        </div>
      </div>
      
      <DashboardStats stats={stats} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>My Pending Approvals</CardTitle>
            <CardDescription>
              Items waiting for your approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PendingApprovalsList 
              pendingApprovals={pendingInstances} 
              userId={session.user.id} 
            />
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest approval activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activities</p>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity._id} className="flex items-start space-x-3 pb-3 border-b">
                    <div className="flex-shrink-0 mt-1">
                      {activity.status === 'Approved' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : activity.status === 'Rejected' ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {activity.entityType === 'manpowerRequisition' 
                          ? `Requisition: ${activity.entityId?.requestedPosition || 'Unknown Position'}` 
                          : `${activity.entityType}: ${activity._id}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.status === 'Pending' 
                          ? `Initiated by ${activity.initiatedBy?.fullName || 'Unknown'}`
                          : `${activity.status} by ${activity.lastActionBy?.fullName || 'Unknown'}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Link href="/dashboard/approvals/instances">
        <Button variant="link" className="px-0">
          View all approval instances →
        </Button>
      </Link>
    </div>
  );
} 