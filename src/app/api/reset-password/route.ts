import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import { ERROR, SUCCESS } from '@/shared/constants';
import { emailManager } from '@/server/managers/emailManager/emailManager';
import { sendFallbackEmail, generatePasswordResetHtml } from '@/lib/emailFallback';
import { v4 as uuidv4 } from 'uuid';

// Import the User model
import User from '@/models/master/User.model';

export async function POST(request: NextRequest) {
  try {
    // Ensure database connection
    await dbConnect();
    
    const body = await request.json();
    
    if (!body || !body.email) {
      return NextResponse.json({ 
        status: ERROR, 
        message: "Email is required", 
        data: {} 
      }, { status: 400 });
    }
    
    const { email } = body;

    // Check if the user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // If user doesn't exist, still return success for security reasons
    if (!user) {
      console.log('User not found:', email);
      return NextResponse.json({
        status: SUCCESS,
        message: "Password reset instructions sent successfully",
        data: { email }
      }, { status: 200 });
    }
    
    // Generate a reset token
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Update the user with the reset token
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    console.log('Generated reset token for:', email);

    // Create the reset URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

    // Send the password reset email
    try {
      console.log('Attempting to send email to:', email);
      
      let emailSent = false;
      let emailError = null;
      
      try {
        // First try with the email manager
        console.log('Trying primary email service...');
        
        const result = await emailManager.sendEmail(
          email,
          'Reset Your Acero Password',
          {
            name: email.split('@')[0],
            email: email,
            message: `Please click the link below to reset your password: ${resetUrl}`
          },
          'emailTemplate',
          'Acero Team',
          resetUrl,
          '',
          'You requested a password reset'
        );
        
        console.log('Email service response:', JSON.stringify(result));
        
        if (result.status === ERROR) {
          console.error('Error from email service:', result);
          throw new Error(`Email service error: ${result.message}`);
        }
        
        emailSent = true;
        console.log('Email sent successfully with primary service');
      } catch (primaryEmailError: any) {
        emailError = primaryEmailError;
        console.error('Primary email service failed:', primaryEmailError.message);
        
        // Try fallback email service
        try {
          console.log('Trying fallback email service...');
          const userName = email.split('@')[0];
          const htmlContent = generatePasswordResetHtml(userName, resetUrl);
          
          const fallbackResult = await sendFallbackEmail(
            email,
            'Reset Your Acero Password',
            htmlContent
          );
          
          if (fallbackResult.status === SUCCESS) {
            emailSent = true;
            console.log('Email sent successfully with fallback service');
          } else {
            console.error('Fallback email service failed:', fallbackResult.message);
            throw new Error(`Fallback email error: ${fallbackResult.message}`);
          }
        } catch (fallbackError: any) {
          console.error('Both email services failed:', fallbackError.message);
          emailError = fallbackError;
        }
      }
      
      // Check if email was sent successfully by either method
      if (!emailSent) {
        console.error('Failed to send email through both primary and fallback methods');
        return NextResponse.json({
          status: ERROR,
          message: `Failed to send password reset email: ${emailError?.message || 'Unknown error'}`,
          data: { error: emailError }
        }, { status: 500 });
      }
    } catch (emailError) {
      console.error('Exception in email sending:', emailError);
      return NextResponse.json({
        status: ERROR,
        message: "Exception while sending password reset email",
        data: { error: String(emailError) }
      }, { status: 500 });
    }

    console.log('Password reset email sent to:', email);
    
    // Return success response
    return NextResponse.json({ 
      status: SUCCESS, 
      message: "Password reset instructions sent successfully", 
      data: { email } 
    }, { status: 200 });
    
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({
      status: ERROR,
      message: "Failed to process password reset",
      error: String(error)
    }, { status: 500 });
  }
}
