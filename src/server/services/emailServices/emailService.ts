import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import fs from 'fs';
import { ERROR, SUCCESS } from '@/shared/constants';

// Type for email options
interface EmailOptions {
    recipient: string;
    subject: string;
    templateData: any;
    fileName: string;
    senderName: string;
    reason: string,
    recipientName: string,
    position: string,
    viewUrl: string,
    approveUrl: string;
    rejectUrl: string;
    attachment?: any;
    assignee?:string
}

// Create reusable transporter for sending emails


const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587, // Use 465 for SSL
    secure: false, // Set to true if using port 465 for SSL
    auth: {
        user: process.env.EMAIL_USER, // Use environment variables for sensitive data
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false, // Optional, use if you encounter issues with self-signed certificates
    },
});

// Send email function
export const sendEmail = async (
    recipient: string,
    subject: string,
    templateData: any,
    fileName: string,
    senderName: string,
    approveUrl: string,
    rejectUrl: string,
    reason: string,
    recipientName: string,
    position: string,
    attachment: any,
    viewUrl: string,
    assignee?:string
): Promise<any> => {
    try {
        if (!fileName) {
            return { status: ERROR, message: "File Name must be sent!", data: {}, statusCode: 500 }
        }
        const filePath = `src/server/shared/emailTemplates/${fileName}.ejs`
        const templatePath = path.join(process.cwd(), filePath);
        const template = fs.readFileSync(templatePath, 'utf-8');
        const htmlContent = ejs.render(template, { subject, templateData, senderName, approveUrl, rejectUrl, reason, recipientName, position, viewUrl, assignee });
        // console.log("Attachment type:", typeof attachment);
        // console.log("Attachment sample:", attachment?.slice(0, 50));

        // console.log('htmlcontent', fileName)
        // Set up email options
        const mailOptions: any = {
            from: process.env.EMAIL_USER, // Email address
            to: recipient,
            subject: subject,
            html: htmlContent, // Rendered HTML content

        };

        if (attachment && attachment.startsWith("data:application/pdf")) {
            const base64Data = attachment.split(",")[1];
            const fileNameFromData =
                attachment.match(/filename=([^;]+)/)?.[1] || "attachment.pdf";

            mailOptions.attachments = [
                {
                    filename: fileName.split("/")[1],
                    content: base64Data,
                    encoding: "base64",
                    contentType: "application/pdf",
                },
            ];

            console.log("📎 PDF attachment added:", fileNameFromData);
        }

        const info: any = await transporter.sendMail(mailOptions);
        if (info.status === ERROR) {
            return info
        }
        return { status: SUCCESS, message: "Email sent!", data: info, statusCode: 200 }
    } catch (error: any) {
        return { status: ERROR, message: "something went wrong", data: error.message, statusCode: 500 }
    }
};
// D:\\AceroApplications\\src\\server\\shared\\emailTemplates\\newCustomerTemplate.ejs