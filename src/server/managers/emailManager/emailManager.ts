import { sendEmail } from "@/server/services/emailServices/emailService";

export class emailManager {
  static async sendEmail(recipient: string, subject: string, templateData: any): Promise<any> {
    try {
      const result = await sendEmail(recipient, subject, templateData);
      console.log("Email sent successfully:", result);
      return result;
    } catch (error) {
      console.error("Error sending email:", error);
      throw error; // Rethrow the error so the caller knows about it
    }
  }
}
