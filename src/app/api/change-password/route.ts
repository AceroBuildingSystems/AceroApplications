import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import { ERROR, SUCCESS } from '@/shared/constants';
import bcrypt from 'bcrypt';
import { getToken } from 'next-auth/jwt';
import User from '@/models/master/User.model';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get the authenticated user from the session token
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.email) {
      return NextResponse.json({ 
        status: ERROR, 
        message: "Authentication required",
        data: {}
      }, { status: 401 });
    }
    
    const body = await request.json();
    
    if (!body.currentPassword || !body.newPassword) {
      return NextResponse.json({ 
        status: ERROR, 
        message: "Current password and new password are required",
        data: {}
      }, { status: 400 });
    }
    
    const { currentPassword, newPassword } = body;
    
    // Find the user in the database
    const user = await User.findOne({ email: token.email });
    
    if (!user) {
      return NextResponse.json({ 
        status: ERROR, 
        message: "User not found",
        data: {}
      }, { status: 404 });
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json({ 
        status: ERROR, 
        message: "Current password is incorrect",
        data: {}
      }, { status: 400 });
    }
    
    // Hash and set the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    
    await user.save();
    
    return NextResponse.json({
      status: SUCCESS,
      message: "Password has been successfully changed",
      data: {}
    }, { status: 200 });
    
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json({
      status: ERROR,
      message: "Failed to change password",
      data: { error: String(error) }
    }, { status: 500 });
  }
}
