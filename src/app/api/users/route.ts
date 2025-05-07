import { NextRequest, NextResponse } from "next/server";
import { createUserWithDetails, updateUserWithDetails } from "@/utils/userUtils";
import User from "@/models/master/User.model";
import { dbConnect } from "@/lib/mongoose";

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect();
    
    // Parse query parameters
    const url = new URL(request.url);
    const isActive = url.searchParams.get("isActive");
    
    // Build query based on filters
    const query: any = {};
    if (isActive === "true") query.isActive = true;
    
    // Fetch users
    const users = await User.find(query)
      .select("firstName lastName displayName email employeeId imageUrl isActive")
      .populate({
        path: "employmentDetails",
        select: "department designation role",
        populate: [
          { path: "department", select: "name" },
          { path: "designation", select: "name" },
          { path: "role", select: "name" }
        ]
      })
      .sort({ firstName: 1 });
    
    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    
    // Create new user with all related details
    const createdUser = await createUserWithDetails(userData);
    
    return NextResponse.json(
      { status: "success", data: createdUser },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userData = await request.json();
    const { id, ...data } = userData;
    
    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    
    // Update user and related details
    const updatedUser = await updateUserWithDetails(id, data);
    
    return NextResponse.json(
      { status: "success", data: updatedUser },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
} 