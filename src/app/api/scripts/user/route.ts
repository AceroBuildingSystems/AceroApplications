import { dbConnect } from '@/lib/mongoose'
import { userManager } from '@/server/managers/userManager'
import { NextRequest, NextResponse } from 'next/server'
import {User} from "@/models/index"
import mongoose from "mongoose"
import { EditUserEmpId } from '@/scripts/updateFieldName'


export async function POST(request:NextRequest,response:NextResponse) {
    try {

        await dbConnect()
        // Perform the update operation
        const response = await User.insertMany(EditUserEmpId())
        console.log(response)
        return NextResponse.json(response)

    } catch(err) {
        // Ensure connection is closed even if error occurs
        try {
            await mongoose.disconnect()
        } catch (disconnectErr) {
            console.error("Error disconnecting:", disconnectErr)
        }

        console.error(err)
        return NextResponse.json({err: "An error occurred"}, { status: 500 })
    }
}
