import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/configs/authOptions';
import { dbConnect } from '@/lib/mongoose';
import ApprovalFlowTemplate from '@/models/approvals/ApprovalFlowTemplate.model';
import User from '@/models/master/User.model';
import Department from '@/models/master/Department.model';
import Role from '@/models/master/Role.model';
import PageTitle from '@/components/PageTitle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, ArrowLeft } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import FlowViewerWrapper from './FlowViewerWrapper';

async function getFlowData(id: string) {
  await dbConnect();
  
  const flowTemplate = await ApprovalFlowTemplate.findById(id)
    .populate('createdBy updatedBy', 'fullName')
    .lean();
  
  if (!flowTemplate) {
    return null;
  }
  
  // Get reference data for the flow nodes
  const entityIds = flowTemplate.nodes
    .filter(node => node.entityId)
    .map(node => node.entityId);
  
  const [users, departments, roles] = await Promise.all([
    User.find({ _id: { $in: entityIds } })
      .select('_id fullName')
      .lean(),
    Department.find({ _id: { $in: entityIds } })
      .select('_id name')
      .lean(),
    Role.find({ _id: { $in: entityIds } })
      .select('_id name')
      .lean()
  ]);
  
  // Map to the format needed by the flow designer
  const usersMap = users.reduce((acc, user) => {
    acc[user._id.toString()] = { id: user._id.toString(), name: user.fullName };
    return acc;
  }, {} as Record<string, { id: string; name: string }>);
  
  const departmentsMap = departments.reduce((acc, dept) => {
    acc[dept._id.toString()] = { id: dept._id.toString(), name: dept.name };
    return acc;
  }, {} as Record<string, { id: string; name: string }>);
  
  const rolesMap = roles.reduce((acc, role) => {
    acc[role._id.toString()] = { id: role._id.toString(), name: role.name };
    return acc;
  }, {} as Record<string, { id: string; name: string }>);
  
  // Format the nodes and edges for the flow designer
  const formattedNodes = flowTemplate.nodes.map(node => ({
    id: node.id,
    type: 'approverNode',
    position: { x: node.positionX || 0, y: node.positionY || 0 },
    data: {
      label: node.label || '',
      type: node.type,
      entityId: node.entityId.toString(),
      entityName: 
        node.type === 'user' ? usersMap[node.entityId.toString()]?.name :
        node.type === 'department' ? departmentsMap[node.entityId.toString()]?.name :
        node.type === 'role' ? rolesMap[node.entityId.toString()]?.name : '',
    }
  }));
  
  const formattedEdges = flowTemplate.connections.map(conn => ({
    id: `e${conn.sourceId}-${conn.targetId}`,
    source: conn.sourceId,
    target: conn.targetId,
    label: conn.label || '',
    animated: true,
  }));
  
  return {
    flowTemplate: JSON.parse(JSON.stringify(flowTemplate)),
    nodes: formattedNodes,
    edges: formattedEdges
  };
}

// Add this function to get entity data for the flow viewer
async function getEntityData() {
  await dbConnect();
  
  // Get all users
  const users = await User.find({ isActive: true })
    .sort({ fullName: 1 })
    .select('_id fullName')
    .lean();
  
  // Get all departments
  const departments = await Department.find({ isActive: true })
    .sort({ name: 1 })
    .select('_id name')
    .lean();
  
  // Get all roles
  const roles = await Role.find({ isActive: true })
    .sort({ name: 1 })
    .select('_id name')
    .lean();
  
  return {
    users: users.map(user => ({ id: user._id.toString(), name: user.fullName })),
    departments: departments.map(dept => ({ id: dept._id.toString(), name: dept.name })),
    roles: roles.map(role => ({ id: role._id.toString(), name: role.name })),
    entityTypes: [
      { id: 'manpowerRequisition', name: 'Manpower Requisition' },
      { id: 'leaveRequest', name: 'Leave Request' },
      { id: 'expenseRequest', name: 'Expense Request' }
    ]
  };
}

export default async function FlowDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin');
  }
  
  const flowData = await getFlowData(params.id);
  const entityData = await getEntityData(); // Get entity data for the flow viewer
  
  if (!flowData) {
    notFound();
  }
  
  const { flowTemplate, nodes, edges } = flowData;
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/approvals/flows">Approval Flows</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink>{flowTemplate.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        <div className="flex justify-between items-center">
          <PageTitle title={flowTemplate.name} />
          
          <div className="flex gap-2">
            <Link href="/dashboard/approvals/flows">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Flows
              </Button>
            </Link>
            <Link href={`/dashboard/approvals/flows/${params.id}/edit`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit Flow
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Flow Details</CardTitle>
            <Badge variant={flowTemplate.isActive ? 'default' : 'secondary'}>
              {flowTemplate.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created By</p>
              <p className="text-base">
                {flowTemplate.createdBy && flowTemplate.createdBy.fullName ? 
                  flowTemplate.createdBy.fullName : 
                  'Unknown user'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
              <p className="text-base">{new Date(flowTemplate.updatedAt).toLocaleString()}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-base">{flowTemplate.description || 'No description provided'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Flow Diagram</CardTitle>
        </CardHeader>
        <CardContent>
          <FlowViewerWrapper 
            initialNodes={nodes} 
            initialEdges={edges}
            flowTemplate={flowTemplate}
            entityData={entityData}
          />
        </CardContent>
      </Card>
    </div>
  );
} 