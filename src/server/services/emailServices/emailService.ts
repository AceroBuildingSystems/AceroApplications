import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import fs from 'fs';

// Type for email options
interface EmailOptions {
    recipient: string;
    subject: string;
    templateData: any;
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
    templateName: string,
    templateData: any
): Promise<any> => {
    try {
        const templatePath = path.join(process.cwd(), `src/server/shared/emailTemplates/${templateName}.ejs`);
        const template = fs.readFileSync(templatePath, 'utf-8');
        const htmlContent = ejs.render(template, templateData);

        // Set up email options
        const mailOptions = {
            from: process.env.EMAIL_USER, // Email address
            to: recipient,
            subject: subject,
            html: htmlContent, // Rendered HTML content
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        return info; // Return email info (e.g., message ID)
    } catch (error) {
        console.error("Error sending email:", error);
        throw error; // Throw the error so it can be handled by the caller
    }
};
