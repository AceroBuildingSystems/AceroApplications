'use client';

import React from 'react';
import FlowDesigner from '@/components/approval-flow/FlowDesigner';
import { Edge, Node } from 'reactflow';
import { ApproverNodeData } from '@/components/approval-flow/FlowDesigner';

interface FlowViewerWrapperProps {
  initialNodes: Node<ApproverNodeData>[];
  initialEdges: Edge[];
  flowTemplate: any;
  entityData: {
    users: { id: string; name: string }[];
    departments: { id: string; name: string }[];
    roles: { id: string; name: string }[];
    entityTypes: { id: string; name: string }[];
  };
}

export default function FlowViewerWrapper({
  initialNodes,
  initialEdges,
  flowTemplate,
  entityData
}: FlowViewerWrapperProps) {
  return (
    <div>
      <FlowDesigner
        initialNodes={initialNodes}
        initialEdges={initialEdges}
        entityTypes={entityData.entityTypes}
        users={entityData.users}
        roles={entityData.roles}
        departments={entityData.departments}
        isReadOnly={true}
        flowName={flowTemplate.name}
        flowDescription={flowTemplate.description}
        entityType={flowTemplate.entityType}
      />
    </div>
  );
} 