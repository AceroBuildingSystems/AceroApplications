import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/configs/authOptions";
import ManpowerRequisition from "@/models/hiring/ManpowerRequisition.model";
import { dbConnect } from "@/lib/mongoose";

// Change requisition status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized: You must be logged in to perform this action" },
        { status: 401 }
      );
    }

    const { id } = params;
    const { status, comments } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["Draft", "Pending", "Approved", "Rejected", "Cancelled", "Closed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Find the requisition
    const requisition = await ManpowerRequisition.findById(id);
    if (!requisition) {
      return NextResponse.json(
        { error: "Requisition not found" },
        { status: 404 }
      );
    }

    // Update status and add status history entry
    const updatedRequisition = await ManpowerRequisition.findByIdAndUpdate(
      id,
      {
        status,
        $push: {
          statusHistory: {
            status,
            changedBy: session.user.id,
            changedAt: new Date(),
            comments,
          },
        },
        updatedBy: session.user.id,
      },
      { new: true, runValidators: true }
    ).populate("requestedBy", "firstName lastName displayName email")
     .populate("department", "name");

    return NextResponse.json({
      message: "Requisition status updated successfully",
      data: updatedRequisition,
    });
  } catch (error: any) {
    console.error("Error updating requisition status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update requisition status" },
      { status: 500 }
    );
  }
} 