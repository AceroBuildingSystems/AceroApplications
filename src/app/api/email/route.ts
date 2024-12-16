import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server'
import { emailManager } from '@/server/managers/emailManager/emailManager';
import { emailData } from '@/types/emailData';

export async function POST(req: NextApiRequest, res: NextApiResponse) {
    const { recipient= 'iqbal.ansari@acero.ae', subject='Test Email' }: { recipient: string, subject: string } = req.body;
    try {
        const templateData:emailData = {name:"Iqbal",email:"iqbal.ansari@acero.ae",subject,message:"Hello"}
        const result = await emailManager.sendEmail(recipient, subject, templateData);
        return NextResponse.json({status:"SUCCESS",message:"email sent",data:{},statusCode:200})
    } catch (error:any) {
        console.error("Error:", error);
        return NextResponse.json({status:"Error",message:error.message || "something went wrong",data:{},statusCode:500})
    }
}