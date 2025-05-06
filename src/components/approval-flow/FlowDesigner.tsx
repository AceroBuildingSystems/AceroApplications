import React, { useState, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import ApproverNode from './nodes/ApproverNode';
import { toast } from '@/components/ui/use-toast';

// Custom node types
const nodeTypes: NodeTypes = {
  approverNode: ApproverNode,
};

// Node data type definition
export interface ApproverNodeData {
  label: string;
  type: 'user' | 'role' | 'department';
  entityId: string;
  entityName: string;
}

interface FlowDesignerProps {
  initialNodes?: Node<ApproverNodeData>[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node<ApproverNodeData>[], edges: Edge[], flowData: FlowData) => void;
  entityTypes: { id: string; name: string }[];
  users: { id: string; name: string }[];
  roles: { id: string; name: string }[];
  departments: { id: string; name: string }[];
  isReadOnly?: boolean;
  flowName?: string;
  flowDescription?: string;
  entityType?: string;
}

interface FlowData {
  name: string;
  description: string;
}

const FlowDesigner: React.FC<FlowDesignerProps> = ({
  initialNodes = [],
  initialEdges = [],
  onSave,
  entityTypes,
  users,
  roles,
  departments,
  isReadOnly = false,
  flowName: initialFlowName = '',
  flowDescription: initialFlowDescription = '',
  entityType: initialEntityType = '',
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeType, setSelectedNodeType] = useState<'user' | 'role' | 'department'>('user');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  
  // Form state for save dialog
  const [flowData, setFlowData] = useState<FlowData>({
    name: initialFlowName,
    description: initialFlowDescription,
  });

  // Handle new connections between nodes
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      animated: true,
      type: 'smoothstep',
      markerEnd: {
        type: 'arrowclosed',
        width: 20,
        height: 20,
        color: '#888',
      },
      style: {
        strokeWidth: 2,
        stroke: '#888',
      }
    }, eds)),
    [setEdges]
  );

  // Add a new node to the flow
  const addNode = useCallback(() => {
    if (!selectedEntity) {
      toast({
        title: 'Selection Required',
        description: 'Please select an entity to add as a node',
        variant: 'destructive',
      });
      return;
    }

    // Find the entity name based on the selected ID
    let entityName = '';
    if (selectedNodeType === 'user') {
      entityName = users.find((u) => u.id === selectedEntity)?.name || '';
    } else if (selectedNodeType === 'role') {
      entityName = roles.find((r) => r.id === selectedEntity)?.name || '';
    } else if (selectedNodeType === 'department') {
      entityName = departments.find((d) => d.id === selectedEntity)?.name || '';
    }

    const newNode: Node<ApproverNodeData> = {
      id: `node_${nodes.length + 1}`,
      type: 'approverNode',
      position: {
        x: Math.random() * 300,
        y: Math.random() * 300,
      },
      data: {
        label: entityName,
        type: selectedNodeType,
        entityId: selectedEntity,
        entityName: entityName,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedEntity('');
  }, [selectedNodeType, selectedEntity, nodes, setNodes, users, roles, departments]);

  // Handle save button click
  const handleSaveClick = () => {
    if (nodes.length === 0) {
      toast({
        title: 'Empty Flow',
        description: 'Please add at least one node to the flow',
        variant: 'destructive',
      });
      return;
    }
    
    // Open the save dialog
    setIsSaveDialogOpen(true);
  };
  
  // Handle saving the flow with data from dialog
  const handleSaveFlow = () => {
    if (!flowData.name) {
      toast({
        title: 'Required Field Missing',
        description: 'Please enter a name for this flow',
        variant: 'destructive',
      });
      return;
    }
    
    onSave?.(nodes, edges, flowData);
    setIsSaveDialogOpen(false);
    
    toast({
      title: 'Flow Saved',
      description: 'Your approval flow has been saved successfully',
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {!isReadOnly && (
        <Card>
          <CardHeader>
            <CardTitle>Add Approver</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Tabs
                defaultValue="user"
                value={selectedNodeType}
                onValueChange={(v) => setSelectedNodeType(v as any)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="user">User</TabsTrigger>
                  <TabsTrigger value="role">Role</TabsTrigger>
                  <TabsTrigger value="department">Department</TabsTrigger>
                </TabsList>
                <TabsContent value="user" className="mt-4">
                  <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TabsContent>
                <TabsContent value="role" className="mt-4">
                  <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TabsContent>
                <TabsContent value="department" className="mt-4">
                  <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TabsContent>
              </Tabs>
              <Button onClick={addNode} className="self-end">
                <Plus className="mr-2 h-4 w-4" /> Add
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="h-[500px] border rounded-md">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
          nodesDraggable={!isReadOnly}
          nodesConnectable={!isReadOnly}
          elementsSelectable={!isReadOnly}
        >
          <Controls />
          <MiniMap />
          <Background />
        </ReactFlow>
      </div>

      {/* Save Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Approval Flow</DialogTitle>
            <DialogDescription>
              Enter the details for your approval flow.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="flowName" className="text-right">
                Name
              </Label>
              <Input
                id="flowName"
                value={flowData.name}
                onChange={(e) => setFlowData({...flowData, name: e.target.value})}
                className="col-span-3"
                placeholder="Enter flow name"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={flowData.description}
                onChange={(e) => setFlowData({...flowData, description: e.target.value})}
                className="col-span-3"
                placeholder="Enter flow description (optional)"
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveFlow}>Save Flow</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!isReadOnly && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setNodes([])}>
            <Trash2 className="mr-2 h-4 w-4" /> Clear
          </Button>
          <Button onClick={handleSaveClick}>
            <Save className="mr-2 h-4 w-4" /> Save Flow
          </Button>
        </div>
      )}
    </div>
  );
};

export default FlowDesigner; 