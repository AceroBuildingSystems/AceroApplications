// src/server/services/ticketTaskServices/index.ts
import { crudManager } from '@/server/managers/crudManager';
import { catchAsync } from '@/server/shared/catchAsync';
import { createTicketHistory } from '../ticketHistoryServices';
import { calculateTicketProgress } from '../ticketServices';
import { SUCCESS } from '@/shared/constants';

export const getTicketTasks = catchAsync(async (options) => {
  const result = await crudManager.mongooose.find('TICKET_TASK_MASTER', options);
  return result;
});

export const getTicketTasksByTicketId = catchAsync(async (ticketId) => {
  const result = await crudManager.mongooose.find('TICKET_TASK_MASTER', {
    filter: { 
      ticket: ticketId,
      isActive: true
    },
    sort: { createdAt: 1 }
  });
  return result;
});

export const createTicketTask = catchAsync(async (options) => {
  const result = await crudManager.mongooose.create('TICKET_TASK_MASTER', options);
  
  // Create ticket history entry for new task
  if (result.status === SUCCESS) {
    await createTicketHistory({
      data: {
        ticket: options.data.ticket,
        action: 'TASK_CREATE',
        user: options.data.addedBy,
        details: { taskId: result.data._id, title: options.data.title }
      }
    });
    
    // Recalculate ticket progress
    await calculateTicketProgress(options.data.ticket);
  }
  
  return result;
});

export const updateTicketTask = catchAsync(async (options) => {
  const result = await crudManager.mongooose.update('TICKET_TASK_MASTER', options);
  
  // Create ticket history entry for task update
  if (result.status === SUCCESS) {
    await createTicketHistory({
      data: {
        ticket: options.filter.ticket,
        action: 'TASK_UPDATE',
        user: options.data.updatedBy,
        details: { taskId: options.filter._id, updates: options.data }
      }
    });
    
    // Recalculate ticket progress
    await calculateTicketProgress(options.filter.ticket);
  }
  
  return result;
});

export const changeTaskStatus = catchAsync(async (options) => {
  const { taskId, status, progress, updatedBy, ticketId } = options;
  
  const result = await crudManager.mongooose.update('TICKET_TASK_MASTER', {
    filter: { _id: taskId },
    data: { 
      status,
      progress: status === 'COMPLETED' ? 100 : (progress || 0),
      updatedBy
    }
  });
  
  // Create ticket history entry for status change
  if (result.status === SUCCESS) {
    await createTicketHistory({
      data: {
        ticket: ticketId,
        action: 'TASK_STATUS_CHANGE',
        user: updatedBy,
        details: { taskId, status }
      }
    });
    
    // Recalculate ticket progress
    await calculateTicketProgress(ticketId);
  }
  
  return result;
});