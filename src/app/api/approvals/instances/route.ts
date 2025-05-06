import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/configs/authOptions';
import { dbConnect } from '@/lib/mongoose';
import ApprovalFlowTemplate from '@/models/approvals/ApprovalFlowTemplate.model';
import ApprovalInstance from '@/models/approvals/ApprovalInstance.model';
import { Types } from 'mongoose';

// Handler for GET requests - list approval instances
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    // Get query parameters for filtering
    const url = new URL(req.url);
    const entityType = url.searchParams.get('entityType');
    const entityId = url.searchParams.get('entityId');
    const status = url.searchParams.get('status');
    
    // Build query
    const query: any = {};
    if (entityType) query.entityType = entityType;
    if (entityId) query.entityId = entityId;
    if (status) query.status = status;
    
    const approvalInstances = await ApprovalInstance.find(query)
      .populate('approvalFlow', 'name')
      .populate('initiatedBy', 'fullName')
      .populate('lastActionBy', 'fullName')
      .sort({ updatedAt: -1 })
      .lean();
    
    return NextResponse.json({ approvalInstances });
  } catch (error) {
    console.error('Error fetching approval instances:', error);
    return NextResponse.json(
      { message: 'Error fetching approval instances' },
      { status: 500 }
    );
  }
}

// Handler for POST requests - create a new approval instance
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    const data = await req.json();
    
    // Validate required fields
    if (!data.flowId || !data.entityId || !data.entityType) {
      return NextResponse.json(
        { message: 'Flow ID, entity ID, and entity type are required' },
        { status: 400 }
      );
    }
    
    // Check if flow exists and is active
    const flow = await ApprovalFlowTemplate.findById(data.flowId);
    
    if (!flow) {
      return NextResponse.json(
        { message: 'Approval flow not found' },
        { status: 404 }
      );
    }
    
    if (!flow.isActive) {
      return NextResponse.json(
        { message: 'Approval flow is inactive' },
        { status: 400 }
      );
    }
    
    // Check if there's already an active approval instance for this entity
    const existingInstance = await ApprovalInstance.findOne({
      entityId: data.entityId,
      entityType: data.entityType,
      status: { $in: ['Pending', 'Approved'] }
    });
    
    if (existingInstance) {
      return NextResponse.json(
        { message: 'Active approval instance already exists for this entity' },
        { status: 400 }
      );
    }
    
    // Create approval instance with initial step
    const approvalInstance = new ApprovalInstance({
      approvalFlow: data.flowId,
      entityId: data.entityId,
      entityType: data.entityType,
      status: 'Pending',
      currentStep: 0,
      stepHistory: flow.nodes.map((node: any, index: number) => ({
        stepOrder: index,
        stepName: node.label,
        role: node.type === 'role' ? node.entityId : null,
        status: index === 0 ? 'Pending' : 'Pending',
        notifications: []
      })),
      initiatedBy: session.user.id,
      initiatedAt: new Date(),
      lastActionAt: new Date(),
      lastActionBy: session.user.id,
      comments: data.comments
    });
    
    await approvalInstance.save();
    
    return NextResponse.json(
      { message: 'Approval process started', approvalInstance },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating approval instance:', error);
    return NextResponse.json(
      { message: 'Error creating approval instance' },
      { status: 500 }
    );
  }
} 