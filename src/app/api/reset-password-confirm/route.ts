import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import { ERROR, SUCCESS } from '@/shared/constants';
import bcrypt from 'bcrypt';

// Import User model
import User from '@/models/master/User.model';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    if (!body.token || !body.password) {
      return NextResponse.json({ 
        status: ERROR, 
        message: "Token and password are required",
        data: {}
      }, { status: 400 });
    }
    
    const { token, password } = body;
    
    console.log('Attempting password reset with token:', token);
    
    // Find the user with this reset token
    const user = await User.findOne({ 
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() } // Token must not be expired
    });
    
    // If no user found, check if token exists but expired
    if (!user) {
      const expiredUser = await User.findOne({ resetToken: token });
      
      if (expiredUser) {
        console.log('Found user but token expired. Expiry was:', expiredUser.resetTokenExpiry);
        
        return NextResponse.json({
          status: ERROR,
          message: "Your password reset link has expired. Please request a new one.",
          data: {
            expired: true,
            tokenExpiry: expiredUser.resetTokenExpiry
          }
        }, { status: 400 });
      }
      
      // Check if any tokens exist in system (for debugging)
      const anyUserWithToken = await User.findOne({ resetToken: { $exists: true, $ne: null } });
      console.log('Any users have tokens?', !!anyUserWithToken);
      
      return NextResponse.json({
        status: ERROR,
        message: "Invalid reset token. Please request a new password reset link.",
        data: {}
      }, { status: 400 });
    }
    
    console.log('User found with valid token:', user.email);
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update the user's password and clear the reset token
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    
    console.log('Successfully reset password for user:', user.email);
    
    return NextResponse.json({
      status: SUCCESS,
      message: "Password has been successfully reset",
      data: {}
    }, { status: 200 });
    
  } catch (error) {
    console.error('Password reset confirmation error:', error);
    return NextResponse.json({
      status: ERROR,
      message: "Failed to reset password",
      data: { error: String(error) }
    }, { status: 500 });
  }
}

// Add validation handler
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get token from query parameters
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json({ 
        status: ERROR, 
        message: "Token is required",
      }, { status: 400 });
    }
    
    // Find the user with this token
    const user = await User.findOne({ 
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() } // Token must not be expired
    });
    
    // If no user found, check if token exists but expired
    if (!user) {
      const expiredUser = await User.findOne({ resetToken: token });
      
      if (expiredUser) {
        return NextResponse.json({
          status: ERROR,
          message: "Your password reset link has expired. Please request a new one.",
        }, { status: 400 });
      }
      
      return NextResponse.json({
        status: ERROR,
        message: "Invalid reset token. Please request a new password reset link.",
      }, { status: 400 });
    }
    
    return NextResponse.json({
      status: SUCCESS,
      message: "Valid token",
    });
  } catch (error) {
    console.error("Error validating token:", error);
    return NextResponse.json({ 
      status: ERROR, 
      message: "An error occurred while validating the token" 
    }, { status: 500 });
  }
}
