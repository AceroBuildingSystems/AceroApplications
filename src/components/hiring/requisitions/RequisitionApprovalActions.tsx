'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle2, 
  XCircle, 
  UserPlus, 
  Clock, 
  AlertCircle,
  ChevronRight,
  User
} from 'lucide-react';

interface RequisitionApprovalActionsProps {
  requisitionId: string;
  status: string;
}

export default function RequisitionApprovalActions({
  requisitionId,
  status,
}: RequisitionApprovalActionsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [approvalFlow, setApprovalFlow] = useState<any>(null);
  const [activeInstance, setActiveInstance] = useState<any>(null);
  const [availableFlows, setAvailableFlows] = useState<any[]>([]);
  const [selectedFlowId, setSelectedFlowId] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedDelegateId, setSelectedDelegateId] = useState('');
  const [comments, setComments] = useState('');
  
  // Get the approval instance if it exists
  useEffect(() => {
    if (requisitionId && session?.user) {
      fetchApprovalInstance();
      fetchAvailableFlows();
      fetchUsers();
    }
  }, [requisitionId, session]);
  
  const fetchApprovalInstance = async () => {
    try {
      const response = await fetch(
        `/api/approvals/instances?entityId=${requisitionId}&entityType=manpowerRequisition`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.approvalInstances && data.approvalInstances.length > 0) {
          setActiveInstance(data.approvalInstances[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching approval instance:', error);
    }
  };
  
  const fetchAvailableFlows = async () => {
    try {
      const response = await fetch(
        `/api/approvals/flows?entityType=manpowerRequisition&isActive=true`
      );
      
      if (response.ok) {
        const data = await response.json();
        setAvailableFlows(data.flowTemplates || []);
      }
    } catch (error) {
      console.error('Error fetching approval flows:', error);
    }
  };
  
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users?isActive=true');
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  
  const handleStartApproval = async () => {
    if (!selectedFlowId) {
      toast({
        title: 'Error',
        description: 'Please select an approval flow',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/approvals/instances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flowId: selectedFlowId,
          entityId: requisitionId,
          entityType: 'manpowerRequisition',
          comments: comments,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start approval process');
      }
      
      const result = await response.json();
      
      toast({
        title: 'Success',
        description: 'Approval process started successfully',
      });
      
      // Update the instance state and refresh the page
      setActiveInstance(result.approvalInstance);
      router.refresh();
    } catch (error) {
      console.error('Error starting approval:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start approval process',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleApprove = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/approvals/instances/${activeInstance._id}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'approve',
          comments: comments,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to approve');
      }
      
      const result = await response.json();
      
      toast({
        title: 'Success',
        description: 'Approved successfully',
      });
      
      // Update the instance state and refresh the page
      setActiveInstance(result.approvalInstance);
      router.refresh();
    } catch (error) {
      console.error('Error approving:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to approve',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleReject = async () => {
    if (!comments) {
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
          action: 'reject',
          reason: comments,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reject');
      }
      
      const result = await response.json();
      
      toast({
        title: 'Rejected',
        description: 'The requisition has been rejected',
      });
      
      // Update the instance state and refresh the page
      setActiveInstance(result.approvalInstance);
      router.refresh();
    } catch (error) {
      console.error('Error rejecting:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reject',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelegate = async () => {
    if (!selectedDelegateId) {
      toast({
        title: 'Selection Required',
        description: 'Please select a user to delegate to',
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
          action: 'delegate',
          delegateTo: selectedDelegateId,
          comments: comments,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delegate');
      }
      
      const result = await response.json();
      
      toast({
        title: 'Delegated',
        description: 'The approval has been delegated successfully',
      });
      
      // Update the instance state and refresh the page
      setActiveInstance(result.approvalInstance);
      router.refresh();
    } catch (error) {
      console.error('Error delegating:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delegate',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Only show if status is not Draft
  if (status === 'Draft') {
    return null;
  }
  
  // Display the approval flow if an instance exists
  if (activeInstance) {
    const currentStep = activeInstance.stepHistory[activeInstance.currentStep];
    
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {activeInstance.status === 'Pending' ? (
              <Clock className="h-5 w-5 text-amber-500" />
            ) : activeInstance.status === 'Approved' ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            Approval Status: {activeInstance.status}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Display approval progress */}
            <div className="flex flex-col gap-2">
              {activeInstance.stepHistory.map((step: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  {index === activeInstance.currentStep && activeInstance.status === 'Pending' ? (
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                  ) : step.status === 'Approved' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : step.status === 'Rejected' ? (
                    <XCircle className="h-4 w-4 text-red-500" />
                  ) : index < activeInstance.currentStep ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-gray-300" />
                  )}
                  <span className={index === activeInstance.currentStep && activeInstance.status === 'Pending' ? 'font-bold' : ''}>
                    {step.stepName}
                  </span>
                  {step.status === 'Approved' && step.approvedBy && (
                    <span className="text-sm text-muted-foreground">
                      Approved by {step.approvedBy.fullName || step.approvedBy}
                    </span>
                  )}
                  {step.status === 'Rejected' && step.rejectedBy && (
                    <span className="text-sm text-muted-foreground">
                      Rejected by {step.rejectedBy.fullName || step.rejectedBy}
                    </span>
                  )}
                </div>
              ))}
            </div>
            
            {/* Show action buttons if approval is pending and user is authorized */}
            {activeInstance.status === 'Pending' && (
              <div className="mt-4 space-y-4">
                <Textarea
                  placeholder="Add comments..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
                
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="default">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Approval</DialogTitle>
                      </DialogHeader>
                      <p>Are you sure you want to approve this requisition?</p>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleApprove} disabled={loading}>
                          {loading ? 'Processing...' : 'Confirm Approval'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Rejection</DialogTitle>
                      </DialogHeader>
                      <p>Are you sure you want to reject this requisition?</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Please provide a reason for rejection in the comments.
                      </p>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={handleReject} disabled={loading || !comments}>
                          {loading ? 'Processing...' : 'Confirm Rejection'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Delegate
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delegate Approval</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <p>Select a user to delegate this approval to:</p>
                          <Select
                            value={selectedDelegateId}
                            onValueChange={setSelectedDelegateId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select user" />
                            </SelectTrigger>
                            <SelectContent>
                              {users.map((user) => (
                                <SelectItem key={user._id} value={user._id}>
                                  <div className="flex items-center">
                                    <User className="mr-2 h-4 w-4" />
                                    {user.fullName}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleDelegate} disabled={loading || !selectedDelegateId}>
                          {loading ? 'Processing...' : 'Delegate'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Show start approval option if no instance exists and not in Draft
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          Start Approval Process
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <p>Select an approval flow:</p>
            <Select
              value={selectedFlowId}
              onValueChange={setSelectedFlowId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select approval flow" />
              </SelectTrigger>
              <SelectContent>
                {availableFlows.map((flow) => (
                  <SelectItem key={flow._id} value={flow._id}>
                    {flow.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Textarea
            placeholder="Add comments (optional)..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
          
          <Button onClick={handleStartApproval} disabled={loading || !selectedFlowId}>
            {loading ? 'Processing...' : 'Start Approval Process'}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 