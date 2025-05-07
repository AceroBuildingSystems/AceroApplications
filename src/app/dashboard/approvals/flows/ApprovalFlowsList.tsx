import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, Eye, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import PageTitle from '@/components/PageTitle';
import { useGetApprovalFlowsQuery, useDeleteApprovalFlowMutation } from '@/services/endpoints/approvalFlowsApi';

export function ApprovalFlowsList() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useGetApprovalFlowsQuery();
  const [deleteApprovalFlow, { isLoading: isDeleting }] = useDeleteApprovalFlowMutation();

  // Handle flow deletion
  const handleDeleteFlow = async (flowId: string) => {
    // Show confirmation dialog
    if (!confirm('Are you sure you want to delete this flow template? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteApprovalFlow(flowId).unwrap();
      
      toast({
        title: 'Flow Deleted',
        description: 'The approval flow template has been deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting flow:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete approval flow',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <PageTitle title="Approval Flow Templates" />
        </div>
        <Card>
          <CardContent className="py-10">
            <div className="flex items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <p className="ml-2">Loading approval flows...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <PageTitle title="Approval Flow Templates" />
        </div>
        <Card>
          <CardContent className="py-10">
            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-red-500 mb-4">Error loading approval flows</p>
              <Button onClick={() => refetch()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const flows = data?.flowTemplates || [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <PageTitle title="Approval Flow Templates" />
        
        <Link href="/dashboard/approvals/flows/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Flow
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Approval Flow Templates</CardTitle>
          <CardDescription>
            Manage approval flow templates that can be applied to various entities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {flows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <h3 className="text-lg font-medium">No approval flows found</h3>
              <p className="text-muted-foreground mt-2">
                Create your first approval flow to get started
              </p>
              <Link href="/dashboard/approvals/flows/new" className="mt-4">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Flow
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flows.map((flow) => (
                  <TableRow key={flow._id}>
                    <TableCell className="font-medium">{flow.name}</TableCell>
                    <TableCell>
                      <Badge variant={flow.isActive ? 'default' : 'secondary'}>
                        {flow.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(flow.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/dashboard/approvals/flows/${flow._id}`}>
                          <Button variant="outline" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/approvals/flows/${flow._id}/edit`}>
                          <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleDeleteFlow(flow._id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 