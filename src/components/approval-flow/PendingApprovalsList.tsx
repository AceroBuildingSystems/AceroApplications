'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

interface PendingApprovalsListProps {
  pendingApprovals: any[];
  userId: string;
}

export default function PendingApprovalsList({ pendingApprovals, userId }: PendingApprovalsListProps) {
  const router = useRouter();
  const [activeInstance, setActiveInstance] = useState<any>(null);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  if (!pendingApprovals || pendingApprovals.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No pending approvals for you</p>
      </div>
    );
  }
  
  // Check if the user is authorized for the current step
  const isUserAuthorized = (instance: any) => {
    // For simplicity, we're assuming the user is authorized for any pending approval
    // In a real app, you'd check the user role against the required role for this step
    return true;
  };
  
  const handleAction = async () => {
    if (action === 'reject' && !comments) {
      toast({
        title: 'Comments Required',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`/api/approvals/instances/${activeInstance._id}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          comments,
          reason: action === 'reject' ? comments : undefined,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to ${action}`);
      }
      
      toast({
        title: 'Success',
        description: `The request has been ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      });
      
      // Close dialog and reset form
      setIsDialogOpen(false);
      setComments('');
      
      // Refresh the page to get updated data
      router.refresh();
    } catch (error) {
      console.error(`Error ${action}ing:`, error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : `Failed to ${action}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      {pendingApprovals.map((instance) => {
        const isAuthorized = isUserAuthorized(instance);
        
        return (
          <div 
            key={instance._id}
            className="p-4 border rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-base font-medium">
                  {instance.entityType === 'manpowerRequisition' 
                    ? `Requisition: ${instance.entityId?.requestedPosition || 'Unknown Position'}` 
                    : `${instance.entityType}: ${instance._id}`}
                </h4>
                <p className="text-sm text-muted-foreground">
                  Flow: {instance.approvalFlow?.name || 'Unknown'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Initiated by {instance.initiatedBy?.fullName || 'Unknown'} • {new Date(instance.initiatedAt).toLocaleString()}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {isAuthorized && (
                  <>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => {
                        setActiveInstance(instance);
                        setAction('reject');
                        setIsDialogOpen(true);
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Reject
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => {
                        setActiveInstance(instance);
                        setAction('approve');
                        setIsDialogOpen(true);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Approve
                    </Button>
                  </>
                )}
                
                <Link 
                  href={
                    instance.entityType === 'manpowerRequisition'
                      ? `/dashboard/hiring/requisitions/${instance.entityId}`
                      : `/dashboard/approvals/instances/${instance._id}`
                  }
                >
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" /> 
                Step {instance.currentStep + 1}: {instance.stepHistory?.[instance.currentStep]?.stepName || 'Unknown'}
              </Badge>
            </div>
          </div>
        );
      })}
      
      {/* Action Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'Approve Request' : 'Reject Request'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="mb-4">
              {action === 'approve' 
                ? 'Are you sure you want to approve this request?' 
                : 'Please provide a reason for rejecting this request:'}
            </p>
            <Textarea
              placeholder={action === 'approve' ? 'Add optional comments...' : 'Enter rejection reason (required)...'}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full"
            />
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={loading}>Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleAction} 
              disabled={loading || (action === 'reject' && !comments)}
              variant={action === 'approve' ? 'default' : 'destructive'}
            >
              {loading ? 'Processing...' : action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 