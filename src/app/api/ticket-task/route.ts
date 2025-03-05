// src/app/api/ticket-task/route.ts
import { ticketTaskManager } from '@/server/managers/ticketTaskManager';
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

  // Get tasks by ticket ID
  const ticketId = searchParams.get('ticketId');
  if (ticketId) {
    const response = await ticketTaskManager.getTicketTasksByTicketId(ticketId);
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

  const body = await request.json();

  if (!body) return NextResponse.json({ status: ERROR, message: INVALID_REQUEST, data: {} }, { status: 400 });

  const { action, data } = body;

  if (!action) return NextResponse.json({ status: ERROR, message: INSUFFIENT_DATA, data: {} }, { status: 400 });

  // Convert string IDs to ObjectIds
  if (data.ticket) data.ticket = createMongooseObjectId(data.ticket);
  if (data.assignee) data.assignee = createMongooseObjectId(data.assignee);
  if (data.addedBy) data.addedBy = createMongooseObjectId(data.addedBy);
  if (data.updatedBy) data.updatedBy = createMongooseObjectId(data.updatedBy);

  console.log("Processed task data:", data);

  let response: any = {};
  
  switch (action) {
    case "create":
      response = await ticketTaskManager.createTicketTask({ data });
      break;
    case "update":
      response = await ticketTaskManager.updateTicketTask({
        filter: { _id: data._id },
        data
      });
      break;
    case "changeStatus":
      response = await ticketTaskManager.changeTaskStatus({
        taskId: data._id,
        status: data.status,
        progress: data.progress,
        updatedBy: data.updatedBy,
        ticketId: data.ticket
      });
      break;
    default:
      response = { status: ERROR, message: INVALID_REQUEST };
  }

  if (response.status === SUCCESS) {
    return NextResponse.json({ status: SUCCESS, message: SUCCESS, data: response.data }, { status: 200 });
  }
  return NextResponse.json(
    { status: 'ERROR', message: response.message, data: {} },
    { status: 500 });
}