import { NextResponse } from 'next/server';
import { notificationManager } from '@/server/managers/notificationManager';
import { dbConnect } from "@/lib/mongoose";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const searchParams = new URL(req.url).searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ status: 'ERROR', message: 'User ID is required' }, { status: 400 });
    }

    const response = await notificationManager.getNotifications(userId);
    if (response.status === 'SUCCESS') {
      return NextResponse.json({ status: 'SUCCESS', message: 'Notifications fetched successfully', data: response.data }, { status: 200 });
    } else {
      return NextResponse.json({ status: 'ERROR', message: response.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to fetch notifications', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { action, userId, message, type, link, id, read,data = {} } = await req.json();

    let response;

    switch (action) {
      case 'create':
        response = await notificationManager.createNotification({ userId, message, type, link,data });
        break;
      case 'update':
        response = await notificationManager.updateNotification(id, { read });
        break;
      default:
        return NextResponse.json({ status: 'ERROR', message: 'Invalid action' }, { status: 400 });
    }

    if (response.status === 'SUCCESS') {
      return NextResponse.json({ status: 'SUCCESS', message: 'Notification operation successful', data: response.data }, { status: 200 });
    } else {
      return NextResponse.json({ status: 'ERROR', message: response.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to perform notification operation', error: error.message }, { status: 500 });
  }
}