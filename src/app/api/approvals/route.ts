// Find the POST or create method and add notification logic

// After successful approval creation
if (response.status === SUCCESS) {
  // Create a notification for the approver
  if (body.approverId) {
    const { createNotification, notificationTemplates } = require('@/utils/notificationUtils');
    
    createNotification(notificationTemplates.approvalRequest({
      userId: body.approverId,
      requestId: response.data._id,
      requestType: body.type || 'document',
      requestTitle: body.title || 'Approval request',
      requestedBy: body.createdBy || body.addedBy,
      requestedByName: body.createdByName || 'A colleague'
    }));
  }
  
  return NextResponse.json({status: SUCCESS, message: SUCCESS, data: response.data}, { status: 200 });
} 