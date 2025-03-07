// src/server/services/ticketCommentServices/index.ts
import { crudManager } from '@/server/managers/crudManager';
import { catchAsync } from '@/server/shared/catchAsync';
import { createTicketHistory } from '../ticketHistoryServices';
import { ERROR, SUCCESS } from '@/shared/constants';
import mongoose from 'mongoose';

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
  // Debug logging
  console.log("Comment create service called with:", JSON.stringify(options, null, 2));
  
  // Ensure we have the expected data structure
  if (!options || !options.data) {
    console.error("Missing data object in comment creation");
    return { status: ERROR, message: "Invalid request format" };
  }
  
  // Validate ticket ID
  if (!options.data.ticket) {
    console.error("Missing ticket ID in comment creation");
    return { status: ERROR, message: "Ticket ID is required" };
  }

  // Ensure ticket ID is a valid ObjectId
  try {
    if (typeof options.data.ticket === 'string') {
      options.data.ticket = new mongoose.Types.ObjectId(options.data.ticket);
    }
  } catch (err) {
    console.error("Invalid ticket ID format:", options.data.ticket);
    return { status: ERROR, message: "Invalid ticket ID format" };
  }
  
  // Validate user ID
  if (!options.data.user) {
    console.error("Missing user ID in comment creation");
    return { status: ERROR, message: "User ID is required" };
  }
  
  // Ensure the data has content
  if (!options.data.content && (!options.data.attachments || options.data.attachments.length === 0)) {
    console.error("Comment must have content or attachments");
    return { status: ERROR, message: "Comment content is required" };
  }
  
  try {
    console.log("Creating comment with final data:", JSON.stringify(options, null, 2));
    
    // Create the comment
    const result = await crudManager.mongooose.create('TICKET_COMMENT_MASTER', options);
    console.log("Comment creation result:", JSON.stringify(result, null, 2));
    
    // Create ticket history entry for new comment
    if (result.status === SUCCESS) {
      await createTicketHistory({
        data: {
          ticket: options.data.ticket,
          action: 'COMMENT',
          user: options.data.user,
          details: { 
            commentId: result.data._id,
            // Include information about mentions and replies if present
            ...(options.data.mentions && { mentions: options.data.mentions }),
            ...(options.data.replyTo && { replyTo: options.data.replyTo })
          }
        }
      });
    }
    
    return result;
  } catch (error) {
    console.error("Error in comment creation:", error);
    return { status: ERROR, message: error.message || "Failed to create comment" };
  }
});

export const updateTicketComment = catchAsync(async (options) => {
  // Validate required fields
  if (!options.filter || !options.filter._id) {
    return { status: ERROR, message: "Comment ID is required for update" };
  }
  
  const result = await crudManager.mongooose.update('TICKET_COMMENT_MASTER', options);
  return result;
});