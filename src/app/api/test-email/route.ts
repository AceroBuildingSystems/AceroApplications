import { NextRequest, NextResponse } from 'next/server';
import { emailManager } from '@/server/managers/emailManager/emailManager';
import { ERROR, SUCCESS } from '@/shared/constants';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    // Check if email is provided correctly
    if (!email) {
      console.log('Email parameter missing or invalid');
      return NextResponse.json({
        status: ERROR,
        message: 'Email parameter is required. Use format: /api/test-email?email=your-email@example.com',
        example: `${request.url.split('?')[0]}?email=test@example.com`
      }, { status: 400 });
    }
    
    console.log('Testing email send to:', email);
    
    // Send a test email
    const result = await emailManager.sendEmail(
      email,
      'Test Email from Acero',
      {
        name: 'Test User', // Fixed: Changed userName to name as required by the template
        email: email,
        userName: 'Test User',
        logoUrl: '/logo/logo-big.png',
        year: new Date().getFullYear(),
        message: 'This is a test email message.'
      },
      'emailTemplate', // Using a simpler template that should exist
      'Acero Test',
      'https://example.com/approve',
      'https://example.com/reject',
      'This is a test email'
    );
    
    console.log('Email test result:', result);
    
    if (result.status === ERROR) {
      return NextResponse.json({
        status: ERROR,
        message: 'Failed to send test email',
        error: result.message,
        data: result.data
      }, { status: 500 });
    }
    
    return NextResponse.json({
      status: SUCCESS,
      message: 'Test email sent successfully',
      data: result
    });
    
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({
      status: ERROR,
      message: 'Exception while sending test email',
      error: error.message
    }, { status: 500 });
  }
}
