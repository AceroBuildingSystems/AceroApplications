'use client';

import React from 'react';
import { CheckCircle, XCircle, Clock, User, UserCheck, UserCog } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ApprovalHistoryProps {
  approvalInstance: any;
}

export default function ApprovalHistory({ approvalInstance }: ApprovalHistoryProps) {
  if (!approvalInstance || !approvalInstance.stepHistory) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Approval Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {approvalInstance.stepHistory.map((step: any, index: number) => {
            const isCurrent = index === approvalInstance.currentStep;
            const isPast = index < approvalInstance.currentStep;
            const isFuture = index > approvalInstance.currentStep;
            
            let statusIcon = <Clock className="h-6 w-6 text-amber-500" />;
            let statusColor = 'bg-amber-100 border-amber-300';
            
            if (step.status === 'Approved') {
              statusIcon = <CheckCircle className="h-6 w-6 text-green-500" />;
              statusColor = 'bg-green-100 border-green-300';
            } else if (step.status === 'Rejected') {
              statusIcon = <XCircle className="h-6 w-6 text-red-500" />;
              statusColor = 'bg-red-100 border-red-300';
            } else if (step.status === 'Skipped') {
              statusIcon = <UserCog className="h-6 w-6 text-blue-500" />;
              statusColor = 'bg-blue-100 border-blue-300';
            } else if (isFuture) {
              statusIcon = <User className="h-6 w-6 text-gray-400" />;
              statusColor = 'bg-gray-100 border-gray-300';
            }
            
            return (
              <div key={index} className="relative">
                {/* Timeline connector */}
                {index < approvalInstance.stepHistory.length - 1 && (
                  <div 
                    className={`absolute top-10 bottom-0 left-6 w-0.5 ${
                      isPast ? 'bg-green-300' : 'bg-gray-200'
                    }`}
                  />
                )}
                
                <div className={`pl-14 relative pb-6 ${isCurrent ? 'opacity-100' : 'opacity-80'}`}>
                  {/* Status circle */}
                  <div className={`absolute left-0 top-0 p-2 rounded-full border-2 ${statusColor}`}>
                    {statusIcon}
                  </div>
                  
                  <div className="flex justify-between">
                    <h3 className="text-base font-medium">{step.stepName}</h3>
                    <Badge variant={step.status === 'Approved' ? 'default' : 
                      step.status === 'Rejected' ? 'destructive' : 
                      step.status === 'Skipped' ? 'secondary' : 'outline'}>
                      {step.status}
                    </Badge>
                  </div>
                  
                  {step.status === 'Pending' && (
                    <p className="text-sm text-muted-foreground">Waiting for approval</p>
                  )}
                  
                  {step.approvedBy && (
                    <div className="flex items-center gap-1 mt-1">
                      <UserCheck className="h-4 w-4 text-green-600" />
                      <p className="text-sm">
                        Approved by {step.approvedBy?.fullName || 'Unknown'} on {' '}
                        {format(new Date(step.approvedAt), 'PPP p')}
                      </p>
                    </div>
                  )}
                  
                  {step.rejectedBy && (
                    <div className="flex items-center gap-1 mt-1">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <p className="text-sm">
                        Rejected by {step.rejectedBy?.fullName || 'Unknown'} on {' '}
                        {format(new Date(step.rejectedAt), 'PPP p')}
                      </p>
                    </div>
                  )}
                  
                  {step.delegatedTo && (
                    <div className="flex items-center gap-1 mt-1">
                      <UserCog className="h-4 w-4 text-blue-600" />
                      <p className="text-sm">
                        Delegated to {step.delegatedTo?.fullName || 'Unknown'} by {' '}
                        {step.delegatedBy?.fullName || 'Unknown'} on {' '}
                        {format(new Date(step.delegatedAt), 'PPP p')}
                      </p>
                    </div>
                  )}
                  
                  {(step.approvalComments || step.rejectionReason) && (
                    <div className="mt-2 text-sm p-2 bg-gray-50 rounded-md">
                      <p className="italic">
                        "{step.approvalComments || step.rejectionReason}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Overall approval status */}
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">
                Process initiated by {approvalInstance.initiatedBy?.fullName || 'Unknown'} on{' '}
                {format(new Date(approvalInstance.initiatedAt), 'PPP p')}
              </p>
              
              <Badge variant={
                approvalInstance.status === 'Approved' ? 'default' : 
                approvalInstance.status === 'Rejected' ? 'destructive' : 
                'secondary'
              }>
                {approvalInstance.status}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 