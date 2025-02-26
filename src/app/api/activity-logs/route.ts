import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongoose";
import { activityLogManager } from '@/server/managers/activityLogManager';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const searchParams = new URL(req.url).searchParams;
    const userId = searchParams.get('userId');

    const response = await activityLogManager.getActivityLogs({ filter: { userId } });
    if (response.status === 'SUCCESS') {
      return NextResponse.json({ status: 'SUCCESS', message: 'Activity logs fetched successfully', data: response.data }, { status: 200 });
    } else {
      return NextResponse.json({ status: 'ERROR', message: response.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to fetch activity logs', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { userId, action, module, recordId, outcome, details } = await req.json();
    const response = await activityLogManager.createActivityLog({ userId, action, module, recordId, outcome, details });
    if (response.status === 'SUCCESS') {
      return NextResponse.json({ status: 'SUCCESS', message: 'Activity log created successfully', data: response.data }, { status: 201 });
    } else {
      return NextResponse.json({ status: 'ERROR', message: response.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to create activity log', error: error.message }, { status: 500 });
  }
}