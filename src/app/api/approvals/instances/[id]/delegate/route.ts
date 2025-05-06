import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/configs/authOptions';
import { dbConnect } from '@/lib/mongoose';
import ApprovalInstance from '@/models/approvals/ApprovalInstance.model';
import User from '@/models/master/User.model';
import { Types } from 'mongoose';

// Handler for POST requests - delegate an approval to another user
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    const instanceId = params.id;
    
    if (!instanceId || !Types.ObjectId.isValid(instanceId)) {
      return NextResponse.json(
        { message: 'Invalid approval instance ID' },
        { status: 400 }
      );
    }
    
    const data = await req.json();
    
    // Validate required fields
    if (!data.delegateToUserId) {
      return NextResponse.json(
        { message: 'User to delegate to is required' },
        { status: 400 }
      );
    }
    
    // Get the approval instance
    const approvalInstance = await ApprovalInstance.findById(instanceId);
    
    if (!approvalInstance) {
      return NextResponse.json(
        { message: 'Approval instance not found' },
        { status: 404 }
      );
    }
    
    // Check if the approval is already completed
    if (approvalInstance.status !== 'Pending') {
      return NextResponse.json(
        { message: `Approval is already ${approvalInstance.status.toLowerCase()}` },
        { status: 400 }
      );
    }
    
    // Check if the delegated user exists
    const delegateUser = await User.findById(data.delegateToUserId);
    if (!delegateUser) {
      return NextResponse.json(
        { message: 'User to delegate to not found' },
        { status: 404 }
      );
    }
    
    // Update the current step with delegation info
    const currentStepIndex = approvalInstance.currentStep;
    if (!approvalInstance.stepHistory[currentStepIndex]) {
      return NextResponse.json(
        { message: 'Invalid current step' },
        { status: 400 }
      );
    }

    // Check if the current step allows delegation
    // This would normally come from the approval flow configuration
    const allowDelegation = true; // For simplicity, we're allowing delegation
    
    if (!allowDelegation) {
      return NextResponse.json(
        { message: 'This step does not allow delegation' },
        { status: 400 }
      );
    }
    
    // Update the step history with delegation info
    approvalInstance.stepHistory[currentStepIndex].delegatedTo = new Types.ObjectId(data.delegateToUserId);
    approvalInstance.stepHistory[currentStepIndex].delegatedBy = new Types.ObjectId(session.user.id);
    approvalInstance.stepHistory[currentStepIndex].delegatedAt = new Date();
    
    // Add notification entry
    approvalInstance.stepHistory[currentStepIndex].notifications.push({
      sentTo: delegateUser.email,
      sentAt: new Date(),
      type: 'Delegation'
    });
    
    // Update last action info
    approvalInstance.lastActionAt = new Date();
    approvalInstance.lastActionBy = new Types.ObjectId(session.user.id);
    approvalInstance.comments = data.comments || 'Task delegated';
    
    await approvalInstance.save();
    
    return NextResponse.json({
      message: 'Approval delegated successfully',
      approvalInstance
    });
  } catch (error) {
    console.error('Error delegating approval:', error);
    return NextResponse.json(
      { message: 'Error delegating approval' },
      { status: 500 }
    );
  }
} 