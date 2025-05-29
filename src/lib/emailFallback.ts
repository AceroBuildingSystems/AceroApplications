import nodemailer from 'nodemailer';
import { ERROR, SUCCESS } from '@/shared/constants';

/**
 * A direct implementation of email sending using nodemailer, as a fallback
 * for when the primary email service might not work correctly.
 */
export async function sendFallbackEmail(
  to: string,
  subject: string,
  htmlContent: string,
): Promise<any> {
  try {
    console.log(`Attempting fallback email to ${to} with subject: ${subject}`);
    
    // Create transporter instance
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST || "smtp.office365.com",
      port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
      secure: process.env.EMAIL_SERVER_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    
    // Basic validation of email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email credentials missing in environment variables');
    }
    
    // Send mail
    const info = await transporter.sendMail({
      from: `"Acero Support" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent,
    });
    
    console.log(`Fallback email sent: ${info.messageId}`);
    return {
      status: SUCCESS,
      message: "Email sent successfully using fallback system",
      data: info,
      statusCode: 200
    };
  } catch (error: any) {
    console.error("Fallback email error:", error.message);
    return {
      status: ERROR,
      message: `Failed to send email: ${error.message}`,
      data: error,
      statusCode: 500
    };
  }
}

/**
 * Generates a simple HTML password reset email
 */
export function generatePasswordResetHtml(userName: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
        }
        .header {
            text-align: center;
            padding: 20px 0;
        }
        .content {
            padding: 20px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #d55959;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #666;
            margin-top: 20px;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset</h1>
        </div>
        <div class="content">
            <p>Hello ${userName},</p>
            <p>We received a request to reset your password for your Acero account. To complete the password reset process, please click on the button below:</p>
            <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset My Password</a>
            </div>
            <p>If you did not request a password reset, you can safely ignore this email. Your password will not be changed.</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you're having trouble clicking the button, copy and paste the following URL into your web browser:</p>
            <p>${resetUrl}</p>
            <p>Best regards,<br>The Acero Team</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Acero. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `;
}
