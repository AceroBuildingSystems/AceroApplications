// src/server/services/ticketCommentServices/index.ts
import { crudManager } from '@/server/managers/crudManager';
import { catchAsync } from '@/server/shared/catchAsync';
import { createTicketHistory } from '../ticketHistoryServices';
import { SUCCESS } from '@/shared/constants';

export const getTicketComments = catchAsync(async (options) => {
  const result = await crudManager.mongooose.find('TICKET_COMMENT_MASTER', options);
  return result;
});

export const getTicketCommentsByTicketId = catchAsync(async (ticketId) => {
  const result = await crudManager.mongooose.find('TICKET_COMMENT_MASTER', {
    filter: { 
      ticket: ticketId,
      isActive: true
    },
    sort: { createdAt: 1 }
  });
  return result;
});

export const createTicketComment = catchAsync(async (options) => {
  const result = await crudManager.mongooose.create('TICKET_COMMENT_MASTER', options);
  
  // Create ticket history entry for new comment
  if (result.status === SUCCESS) {
    await createTicketHistory({
      data: {
        ticket: options.data.ticket,
        action: 'COMMENT',
        user: options.data.user,
        details: { commentId: result.data._id }
      }
    });
  }
  
  return result;
});

export const updateTicketComment = catchAsync(async (options) => {
  const result = await crudManager.mongooose.update('TICKET_COMMENT_MASTER', options);
  return result;
});