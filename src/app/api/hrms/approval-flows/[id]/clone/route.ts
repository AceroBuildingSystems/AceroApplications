import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/configs/authOptions';
import HRMSApprovalFlowManager from '@/server/managers/hrmsApprovalFlowManager';

// POST /api/hrms/approval-flows/[id]/clone
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { newFlowName } = await request.json();
    
    if (!newFlowName) {
      return NextResponse.json(
        { success: false, message: 'New flow name is required' },
        { status: 400 }
      );
    }

    const result = await HRMSApprovalFlowManager.cloneApprovalFlow(
      params.id,
      newFlowName,
      session.user.id
    );

    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error cloning approval flow:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}