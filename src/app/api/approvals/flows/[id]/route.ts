import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/configs/authOptions';
import { dbConnect } from '@/lib/mongoose';
import ApprovalFlowTemplate from '@/models/approvals/ApprovalFlowTemplate.model';
import { Types } from 'mongoose';

// Handler for GET requests - get a specific flow template
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    const flowId = params.id;
    
    if (!flowId || !Types.ObjectId.isValid(flowId)) {
      return NextResponse.json(
        { message: 'Invalid flow ID' },
        { status: 400 }
      );
    }
    
    const flowTemplate = await ApprovalFlowTemplate.findById(flowId)
      .populate('createdBy updatedBy', 'fullName')
      .lean();
    
    if (!flowTemplate) {
      return NextResponse.json(
        { message: 'Flow template not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ flowTemplate });
  } catch (error) {
    console.error('Error fetching flow template:', error);
    return NextResponse.json(
      { message: 'Error fetching flow template' },
      { status: 500 }
    );
  }
}

// Handler for PUT requests - update a flow template
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    const flowId = params.id;
    
    if (!flowId || !Types.ObjectId.isValid(flowId)) {
      return NextResponse.json(
        { message: 'Invalid flow ID' },
        { status: 400 }
      );
    }
    
    const flowTemplate = await ApprovalFlowTemplate.findById(flowId);
    
    if (!flowTemplate) {
      return NextResponse.json(
        { message: 'Flow template not found' },
        { status: 404 }
      );
    }
    
    const data = await req.json();
    
    // Validate required fields
    if (!data.name || !data.entityType) {
      return NextResponse.json(
        { message: 'Name and entity type are required' },
        { status: 400 }
      );
    }
    
    // Validate nodes
    if (!data.nodes || !Array.isArray(data.nodes) || data.nodes.length === 0) {
      return NextResponse.json(
        { message: 'At least one node is required' },
        { status: 400 }
      );
    }
    
    // Update flow template
    flowTemplate.name = data.name;
    flowTemplate.description = data.description;
    flowTemplate.entityType = data.entityType;
    flowTemplate.isActive = data.isActive ?? true;
    flowTemplate.nodes = data.nodes;
    flowTemplate.connections = data.connections || [];
    flowTemplate.updatedBy = data.updatedBy || session.user.id;
    
    await flowTemplate.save();
    
    return NextResponse.json(
      { message: 'Flow template updated successfully', flowTemplate },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating flow template:', error);
    return NextResponse.json(
      { message: 'Error updating flow template' },
      { status: 500 }
    );
  }
}

// Handler for DELETE requests - delete a flow template
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    const flowId = params.id;
    
    if (!flowId || !Types.ObjectId.isValid(flowId)) {
      return NextResponse.json(
        { message: 'Invalid flow ID' },
        { status: 400 }
      );
    }
    
    const result = await ApprovalFlowTemplate.findByIdAndDelete(flowId);
    
    if (!result) {
      return NextResponse.json(
        { message: 'Flow template not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Flow template deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting flow template:', error);
    return NextResponse.json(
      { message: 'Error deleting flow template' },
      { status: 500 }
    );
  }
} 