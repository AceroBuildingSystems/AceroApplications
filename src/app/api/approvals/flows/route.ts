import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/configs/authOptions';
import { dbConnect } from '@/lib/mongoose';
import ApprovalFlowTemplate from '@/models/approvals/ApprovalFlowTemplate.model';

// Handler for GET requests - list all flow templates
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
    const isActive = url.searchParams.get('isActive');
    
    // Build query
    const query: any = {};
    if (entityType) query.entityType = entityType;
    if (isActive !== null) query.isActive = isActive === 'true';
    
    const flowTemplates = await ApprovalFlowTemplate.find(query)
      .sort({ updatedAt: -1 })
      .lean();
    
    return NextResponse.json({ flowTemplates });
  } catch (error) {
    console.error('Error fetching approval flows:', error);
    return NextResponse.json(
      { message: 'Error fetching approval flows' },
      { status: 500 }
    );
  }
}

// Handler for POST requests - create new flow template
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
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
    
    // Create new flow template
    const newFlowTemplate = new ApprovalFlowTemplate({
      name: data.name,
      description: data.description,
      entityType: data.entityType,
      isActive: data.isActive ?? true,
      nodes: data.nodes,
      connections: data.connections || [],
      createdBy: data.createdBy || session.user.id,
      updatedBy: data.updatedBy || session.user.id,
    });
    
    await newFlowTemplate.save();
    
    return NextResponse.json(
      { message: 'Flow template created successfully', flowTemplate: newFlowTemplate },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating approval flow:', error);
    return NextResponse.json(
      { message: 'Error creating approval flow' },
      { status: 500 }
    );
  }
} 