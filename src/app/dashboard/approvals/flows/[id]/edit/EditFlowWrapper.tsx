'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import FlowDesigner from '@/components/approval-flow/FlowDesigner';
import { Edge, Node } from 'reactflow';
import { ApproverNodeData } from '@/components/approval-flow/FlowDesigner';
import { toast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUpdateApprovalFlowMutation, useDeleteApprovalFlowMutation } from '@/services/endpoints/approvalFlowsApi';

interface EditFlowWrapperProps {
  initialNodes: Node<ApproverNodeData>[];
  initialEdges: Edge[];
  flowTemplate: any;
  entityData: {
    users: { id: string; name: string }[];
    departments: { id: string; name: string }[];
    roles: { id: string; name: string }[];
    entityTypes: { id: string; name: string }[];
  };
  userId: string;
}

export default function EditFlowWrapper({
  initialNodes,
  initialEdges,
  flowTemplate,
  entityData,
  userId,
}: EditFlowWrapperProps) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(flowTemplate.isActive);
  
  const [updateApprovalFlow, { isLoading: isUpdating }] = useUpdateApprovalFlowMutation();
  const [deleteApprovalFlow, { isLoading: isDeleting }] = useDeleteApprovalFlowMutation();
  
  const isLoading = isUpdating || isDeleting;

  const handleUpdateFlow = async (
    nodes: Node<ApproverNodeData>[], 
    edges: Edge[],
    flowData: { name: string; description: string; }
  ) => {
    try {
      // Create the updated flow template object
      const updatedFlowTemplate = {
        name: flowData.name,
        description: flowData.description,
        entityType: flowTemplate.entityType || 'manpowerRequisition',
        isActive,
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.data.type,
          entityId: node.data.entityId,
          positionX: node.position.x,
          positionY: node.position.y,
          label: node.data.label,
        })),
        connections: edges.map((edge) => ({
          sourceId: edge.source,
          targetId: edge.target,
          label: edge.label || '',
          condition: '',
        })),
        updatedBy: userId,
      };

      // Update the flow template using RTK Query
      await updateApprovalFlow({
        id: flowTemplate._id,
        data: updatedFlowTemplate
      }).unwrap();

      toast({
        title: 'Flow Updated',
        description: 'The approval flow template has been updated successfully',
      });

      // Redirect back to the flow detail page
      router.push(`/dashboard/approvals/flows/${flowTemplate._id}`);
      router.refresh();
    } catch (error) {
      console.error('Error updating flow:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update approval flow',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteFlow = async () => {
    if (!confirm('Are you sure you want to delete this flow template? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete the flow template using RTK Query
      await deleteApprovalFlow(flowTemplate._id).unwrap();

      toast({
        title: 'Flow Deleted',
        description: 'The approval flow template has been deleted successfully',
      });

      // Redirect to the flows list
      router.push('/dashboard/approvals/flows');
      router.refresh();
    } catch (error) {
      console.error('Error deleting flow:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete approval flow',
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      {isLoading && (
        <Card className="p-4 mb-4 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <p>Processing...</p>
          </div>
        </Card>
      )}

      <div className="mb-4 flex items-center space-x-2">
        <Switch
          id="active-status"
          checked={isActive}
          onCheckedChange={setIsActive}
        />
        <Label htmlFor="active-status">
          {isActive ? 'Active' : 'Inactive'} Flow
        </Label>
      </div>

      <FlowDesigner
        initialNodes={initialNodes}
        initialEdges={initialEdges}
        onSave={handleUpdateFlow}
        entityTypes={entityData.entityTypes}
        users={entityData.users}
        roles={entityData.roles}
        departments={entityData.departments}
        flowName={flowTemplate.name}
        flowDescription={flowTemplate.description}
        entityType={flowTemplate.entityType}
      />

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleDeleteFlow}
          className="px-4 py-2 text-sm font-medium text-red-500 hover:text-red-700 focus:outline-none"
        >
          Delete this flow template
        </button>
      </div>
    </div>
  );
} 