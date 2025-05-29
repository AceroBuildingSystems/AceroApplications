import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import { ERROR, SUCCESS } from '@/shared/constants';
import User from '@/models/master/User.model';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    console.log('Connecting to database...');
    await dbConnect();
    console.log('Connected to database');
    
    const testEmail = 'test-reset@example.com';
    
    // Check if test user exists
    let user = await User.findOne({ email: testEmail });
    
    // Create test user if not exists
    if (!user) {
      console.log('Creating test user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      user = new User({
        employeeId: 'TEST001',
        firstName: 'Test',
        lastName: 'User',
        email: testEmail,
        password: hashedPassword,
        isActive: true
      });
      
      await user.save();
      console.log('Test user created');
    } else {
      console.log('Test user already exists');
    }
    
    // Generate and apply reset token
    console.log('Generating reset token...');
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
    
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();
    
    // Create reset URL for testing
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password/${resetToken}`;
    
    return NextResponse.json({
      status: SUCCESS,
      message: 'Test reset password flow created successfully',
      data: {
        resetToken,
        resetUrl,
        tokenExpiry: resetTokenExpiry,
        testEmail
      }
    });
    
  } catch (error: any) {
    console.error('Test setup error:', error);
    return NextResponse.json({
      status: ERROR,
      message: 'Error setting up test',
      error: error.message
    }, { status: 500 });
  }
}
