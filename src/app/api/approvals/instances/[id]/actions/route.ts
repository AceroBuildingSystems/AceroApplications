import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/configs/authOptions';
import { dbConnect } from '@/lib/mongoose';
import ApprovalInstance from '@/models/approvals/ApprovalInstance.model';
import User from '@/models/master/User.model';
import Department from '@/models/master/Department.model';
import { Types } from 'mongoose';

// Handler for POST requests - perform an action on an approval instance
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
    if (!data.action) {
      return NextResponse.json(
        { message: 'Action is required' },
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
    
    // Check if the user has permission to perform the action
    const currentUser = await User.findById(session.user.id).lean();
    
    if (!currentUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get current step
    const currentStepIndex = approvalInstance.currentStep;
    const currentStep = approvalInstance.stepHistory[currentStepIndex];
    
    // Check if the user is authorized for this step
    // For simplicity, we'll check if the user is a manager or admin
    const isAuthorized = await checkUserAuthorization(currentUser, currentStep, approvalInstance);
    
    if (!isAuthorized) {
      return NextResponse.json(
        { message: 'You are not authorized to perform this action' },
        { status: 403 }
      );
    }
    
    // Perform the requested action
    switch (data.action) {
      case 'approve':
        await handleApprove(approvalInstance, currentStepIndex, session.user.id, data.comments);
        break;
      case 'reject':
        await handleReject(approvalInstance, currentStepIndex, session.user.id, data.reason);
        break;
      case 'delegate':
        if (!data.delegateTo) {
          return NextResponse.json(
            { message: 'Delegate user ID is required' },
            { status: 400 }
          );
        }
        await handleDelegate(approvalInstance, currentStepIndex, session.user.id, data.delegateTo, data.comments);
        break;
      default:
        return NextResponse.json(
          { message: 'Invalid action' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      message: `Approval step ${data.action === 'approve' ? 'approved' : data.action === 'reject' ? 'rejected' : 'delegated'} successfully`,
      approvalInstance
    });
  } catch (error) {
    console.error('Error performing approval action:', error);
    return NextResponse.json(
      { message: 'Error performing approval action' },
      { status: 500 }
    );
  }
}

// Helper function to check if a user is authorized for the current step
async function checkUserAuthorization(user: any, step: any, approvalInstance: any) {
  // If this is a delegated approval, check if it was delegated to this user
  if (step.delegatedTo && step.delegatedTo.toString() === user._id.toString()) {
    return true;
  }
  
  // Check based on node type in the approval flow
  const flowNodes = await ApprovalInstance.populate(approvalInstance, {
    path: 'approvalFlow',
    select: 'nodes'
  });
  
  const node = flowNodes.approvalFlow.nodes[step.stepOrder];
  
  if (!node) {
    return false;
  }
  
  // Check based on node type
  switch (node.type) {
    case 'user':
      return node.entityId.toString() === user._id.toString();
    
    case 'role':
      // For simplicity, assume admin/manager roles can approve
      return user.departmentRole === 'admin' || user.departmentRole === 'manager';
    
    case 'department':
      // Check if user is manager of the department
      const department = await Department.findById(node.entityId).lean();
      return department && department.manager && 
             department.manager.toString() === user._id.toString();
    
    default:
      return false;
  }
}

// Handle approve action
async function handleApprove(approvalInstance: any, stepIndex: number, userId: string, comments?: string) {
  // Update current step
  approvalInstance.stepHistory[stepIndex].status = 'Approved';
  approvalInstance.stepHistory[stepIndex].approvedBy = userId;
  approvalInstance.stepHistory[stepIndex].approvedAt = new Date();
  approvalInstance.stepHistory[stepIndex].approvalComments = comments;
  
  // Update overall instance
  approvalInstance.lastActionAt = new Date();
  approvalInstance.lastActionBy = userId;
  
  // Check if this is the last step
  if (stepIndex >= approvalInstance.stepHistory.length - 1) {
    // This was the last step, mark the instance as approved
    approvalInstance.status = 'Approved';
    approvalInstance.completedAt = new Date();
  } else {
    // Move to the next step
    approvalInstance.currentStep = stepIndex + 1;
  }
  
  await approvalInstance.save();
  return approvalInstance;
}

// Handle reject action
async function handleReject(approvalInstance: any, stepIndex: number, userId: string, reason?: string) {
  // Update current step
  approvalInstance.stepHistory[stepIndex].status = 'Rejected';
  approvalInstance.stepHistory[stepIndex].rejectedBy = userId;
  approvalInstance.stepHistory[stepIndex].rejectedAt = new Date();
  approvalInstance.stepHistory[stepIndex].rejectionReason = reason;
  
  // Update overall instance
  approvalInstance.status = 'Rejected';
  approvalInstance.completedAt = new Date();
  approvalInstance.lastActionAt = new Date();
  approvalInstance.lastActionBy = userId;
  
  await approvalInstance.save();
  return approvalInstance;
}

// Handle delegate action
async function handleDelegate(approvalInstance: any, stepIndex: number, userId: string, delegateToUserId: string, comments?: string) {
  // Update current step
  approvalInstance.stepHistory[stepIndex].delegatedBy = userId;
  approvalInstance.stepHistory[stepIndex].delegatedTo = delegateToUserId;
  approvalInstance.stepHistory[stepIndex].delegatedAt = new Date();
  
  // Update overall instance
  approvalInstance.lastActionAt = new Date();
  approvalInstance.lastActionBy = userId;
  approvalInstance.comments = comments || approvalInstance.comments;
  
  await approvalInstance.save();
  return approvalInstance;
} 