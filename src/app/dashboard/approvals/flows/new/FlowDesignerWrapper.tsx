'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import FlowDesigner from '@/components/approval-flow/FlowDesigner';
import { Edge, Node } from 'reactflow';
import { ApproverNodeData } from '@/components/approval-flow/FlowDesigner';
import { toast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { useCreateApprovalFlowMutation } from '@/services/endpoints/approvalFlowsApi';

interface FlowDesignerWrapperProps {
  entityData: {
    users: { id: string; name: string }[];
    departments: { id: string; name: string }[];
    roles: { id: string; name: string }[];
    entityTypes: { id: string; name: string }[];
  };
  userId: string;
}

export default function FlowDesignerWrapper({ entityData, userId }: FlowDesignerWrapperProps) {
  const router = useRouter();
  const [createApprovalFlow, { isLoading }] = useCreateApprovalFlowMutation();

  const handleSaveFlow = async (
    nodes: Node<ApproverNodeData>[], 
    edges: Edge[],
    flowData: { name: string; description: string; }
  ) => {
    try {
      // Create the flow template object with the correct data types
      const flowTemplate = {
        name: flowData.name,
        description: flowData.description || '',
        entityType: 'manpowerRequisition', // Default value since we no longer collect it from user
        isActive: true,
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.data.type,
          entityId: node.data.entityId, // This should already be a valid ObjectId string
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
        // These should be valid MongoDB ObjectId strings
        createdBy: userId,
        updatedBy: userId,
      };

      console.log('Saving flow with userId:', userId);
      console.log('Flow template data:', JSON.stringify(flowTemplate, null, 2));

      // Save using RTK Query mutation
      await createApprovalFlow(flowTemplate).unwrap();

      toast({
        title: 'Flow Created',
        description: 'The approval flow template has been created successfully',
      });

      // Redirect to the flows list
      router.push('/dashboard/approvals/flows');
      router.refresh();
    } catch (error) {
      console.error('Error creating flow:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create approval flow',
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
            <p>Saving approval flow...</p>
          </div>
        </Card>
      )}

      <FlowDesigner
        onSave={handleSaveFlow}
        entityTypes={entityData.entityTypes}
        users={entityData.users}
        roles={entityData.roles}
        departments={entityData.departments}
      />
    </div>
  );
} 