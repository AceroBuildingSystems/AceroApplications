// src/app/api/ticket-comment/route.ts
import { ticketCommentManager } from '@/server/managers/ticketCommentManager';
import { BODY_REQUIRED, ERROR, INSUFFIENT_DATA, INVALID_REQUEST, SUCCESS } from '@/shared/constants';
import { createMongooseObjectId } from '@/shared/functions';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import * as models from '@/models';
import mongoose from 'mongoose';

// Initialize models
Object.values(models).forEach(model => {
  const modelName = (model as any).modelName;
  if (modelName && !mongoose.models[modelName]) {
    ;(model as any).init();
  }
});

export async function GET(request: NextRequest) {
  // Ensure database connection and models are initialized
  await dbConnect();

  const searchParams = new URL(request.url).searchParams;

  // Get comments by ticket ID
  const ticketId = searchParams.get('ticketId');
  if (ticketId) {
    const response = await ticketCommentManager.getTicketCommentsByTicketId(ticketId);
    if (response.status === SUCCESS) {
      return NextResponse.json({ status: SUCCESS, message: SUCCESS, data: response.data }, { status: 200 });
    }
    return NextResponse.json(
      { status: 'ERROR', message: response.message, data: {} },
      { status: 500 }
    );
  }

  // If no ticketId provided, return error
  return NextResponse.json(
    { status: 'ERROR', message: 'Ticket ID is required', data: {} },
    { status: 400 }
  );
}

export async function POST(request: NextRequest) {
  // Ensure database connection and models are initialized
  await dbConnect();

  // Log the request body for debugging
  const rawBody = await request.text();
  console.log("Raw request body:", rawBody);
  
  let body;
  try {
    // Parse the body
    body = JSON.parse(rawBody);
    console.log("Parsed request body:", JSON.stringify(body, null, 2));
  } catch (e) {
    console.error("Failed to parse request body:", e);
    return NextResponse.json({ 
      status: ERROR, 
      message: "Invalid JSON in request body", 
      data: {} 
    }, { status: 400 });
  }

  if (!body) {
    return NextResponse.json({ status: ERROR, message: INVALID_REQUEST, data: {} }, { status: 400 });
  }

  const { action, data } = body;
  
  console.log("Extracted action:", action);
  console.log("Extracted data:", JSON.stringify(data, null, 2));

  if (!action) {
    return NextResponse.json({ status: ERROR, message: INSUFFIENT_DATA, data: {} }, { status: 400 });
  }

  // Validate required fields
  if (!data) {
    return NextResponse.json({ 
      status: ERROR, 
      message: "Data object is required", 
      data: {} 
    }, { status: 400 });
  }

  if (!data.ticket) {
    return NextResponse.json({ 
      status: ERROR, 
      message: "Ticket ID is required", 
      data: {} 
    }, { status: 400 });
  }
  
  if (!data.user) {
    return NextResponse.json({ 
      status: ERROR, 
      message: "User ID is required", 
      data: {} 
    }, { status: 400 });
  }

  if (!data.content && (!data.attachments || data.attachments.length === 0)) {
    return NextResponse.json({ 
      status: ERROR, 
      message: "Comment must contain content or attachments", 
      data: {} 
    }, { status: 400 });
  }

  try {
    // Convert string IDs to ObjectIds
    if (typeof data.ticket === 'string') {
      data.ticket = createMongooseObjectId(data.ticket);
    }
    
    if (typeof data.user === 'string') {
      data.user = createMongooseObjectId(data.user);
    }
    
    if (data.addedBy && typeof data.addedBy === 'string') {
      data.addedBy = createMongooseObjectId(data.addedBy);
    }
    
    if (data.updatedBy && typeof data.updatedBy === 'string') {
      data.updatedBy = createMongooseObjectId(data.updatedBy);
    }
    
    // Handle mentions and reply references
    if (data.mentions && Array.isArray(data.mentions)) {
      data.mentions = data.mentions.map(id => 
        typeof id === 'string' ? createMongooseObjectId(id) : id
      );
    }
    
    if (data.replyTo && typeof data.replyTo === 'string') {
      data.replyTo = createMongooseObjectId(data.replyTo);
    }

    console.log("Processed data for service:", JSON.stringify(data, null, 2));
    
    let response;
    switch (action) {
      case "create":
        response = await ticketCommentManager.createTicketComment({ data });
        break;
      case "update":
        if (!data._id) {
          return NextResponse.json({ 
            status: ERROR, 
            message: "Comment ID is required for updates", 
            data: {} 
          }, { status: 400 });
        }
        response = await ticketCommentManager.updateTicketComment({
          filter: { _id: data._id },
          data
        });
        break;
      default:
        response = { status: ERROR, message: INVALID_REQUEST };
    }

    console.log("Service response:", JSON.stringify(response, null, 2));

    if (response.status === SUCCESS) {
      return NextResponse.json({ status: SUCCESS, message: SUCCESS, data: response.data }, { status: 200 });
    }
    
    return NextResponse.json({ status: 'ERROR', message: response.message, data: {} }, { status: 500 });
  } catch (error) {
    console.error("Error in ticket-comment route:", error);
    return NextResponse.json({ 
      status: 'ERROR', 
      message: error.message || "Failed to process comment", 
      data: {} 
    }, { status: 500 });
  }
}