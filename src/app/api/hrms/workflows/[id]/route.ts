import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/configs/authOptions';
import HRMSWorkflowManager from '@/server/managers/hrmsWorkflowManager';

// GET /api/hrms/workflows/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    console.log(`Fetching workflow with ID: ${id}`);
    const result = await HRMSWorkflowManager.getWorkflowInstanceById(id);
    console.log(`Workflow fetch result:`, result);
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 404 });
    }
  } catch (error: any) {
    console.error(`Error fetching workflow:`, error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/hrms/workflows/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    
    const result = await HRMSWorkflowManager.updateWorkflowInstance(
      id,
      body,
      session?.user?._id
    );

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error: any) {
    console.error(`Error updating workflow:`, error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}