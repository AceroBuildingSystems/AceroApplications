// src/scripts/test-reset-password.ts
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/master/User.model';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

/**
 * Test script to verify password reset functionality
 * - Creates a test user if it doesn't exist
 * - Generates a reset token
 * - Simulates token verification
 * - Updates the password
 */
async function testResetPassword() {
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
    
    console.log('Reset token generated:', resetToken);
    console.log('Token expiry:', resetTokenExpiry);
    
    // Simulate verifying token and updating password
    console.log('Verifying token...');
    const verifiedUser = await User.findOne({
      resetToken,
      resetTokenExpiry: { $gt: new Date() }
    });
    
    if (verifiedUser) {
      console.log('Token valid, updating password...');
      const newHashedPassword = await bcrypt.hash('newPassword456', 10);
      
      verifiedUser.password = newHashedPassword;
      verifiedUser.resetToken = undefined;
      verifiedUser.resetTokenExpiry = undefined;
      await verifiedUser.save();
      
      console.log('Password updated successfully');
    } else {
      console.error('Token verification failed');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error in test script:', error);
    process.exit(1);
  }
}

testResetPassword();
