import { NextRequest, NextResponse } from "next/server";
import { notificationService } from "@/services/notificationService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/configs/authOptions";
import { dbConnect } from "@/lib/mongoose";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = parseInt(searchParams.get("skip") || "0");
    const status = searchParams.get("status") as "UNREAD" | "READ" | "ALL" || "ALL";

    const { notifications, total } = await notificationService.getUserNotifications(
      session.user._id,
      { limit, skip, status }
    );

    return NextResponse.json({ notifications, total });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const notification = await notificationService.createNotification({
      ...body,
      sender: session.user._id
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { action, notificationId } = body;

    switch (action) {
      case "markAsRead":
        if (notificationId) {
          const notification = await notificationService.markAsRead(notificationId);
          return NextResponse.json(notification);
        } else {
          await notificationService.markAllAsRead(session.user._id);
          return NextResponse.json({ success: true });
        }
      case "delete":
        await notificationService.deleteNotification(notificationId);
        return NextResponse.json({ success: true });
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
} 