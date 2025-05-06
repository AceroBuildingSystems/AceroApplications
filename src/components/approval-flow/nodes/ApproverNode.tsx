import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Badge } from '@/components/ui/badge';
import { User, Users, Building } from 'lucide-react';
import { ApproverNodeData } from '../FlowDesigner';

const ApproverNode: React.FC<NodeProps<ApproverNodeData>> = ({ data }) => {
  // Determine icon based on node type
  const NodeIcon = () => {
    switch (data.type) {
      case 'user':
        return <User className="h-4 w-4 mr-2" />;
      case 'role':
        return <Users className="h-4 w-4 mr-2" />;
      case 'department':
        return <Building className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  };

  // Determine badge color based on node type
  const getBadgeVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    switch (data.type) {
      case 'user':
        return 'default';
      case 'role':
        return 'secondary';
      case 'department':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="bg-card border rounded-lg shadow-sm p-3 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <NodeIcon />
            <span className="font-medium">{data.label}</span>
          </div>
          <Badge variant={getBadgeVariant()} className="capitalize">
            {data.type}
          </Badge>
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};

export default memo(ApproverNode); 