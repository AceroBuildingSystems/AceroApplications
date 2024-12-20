import { dbConnect } from '@/lib/mongoose'
import { NextRequest, NextResponse } from 'next/server'
import { Department, User } from "@/models/index"
import mongoose from "mongoose"
import { SUCCESS, ERROR, BULK_INSERT, INSERT_ONE } from '@/shared/constants'
import { userManager } from '@/server/managers/userManager'
import { bulkDepartmentInsertSanitization } from '@/server/services/migrationServices'


export async function GET(request:NextRequest,response:NextResponse) {
    try {
        const users = await userManager.getUsers();
       
        return NextResponse.json({data:users})

    } catch(err) {
        console.error(err)
        return NextResponse.json({type: ERROR,message:err,data: null}, { status: 500 })
    }
}

export async function POST(request: NextRequest, response: NextResponse) {
    try {
        await dbConnect()
        const { data } = await request.json()

        if (!data) {
            return NextResponse.json({ type: ERROR, message: "Action and data is required", data: null }, { status: 400 })
        };


        let response;


        response = await Department.insertMany(bulkDepartmentInsertSanitization(data))
        return NextResponse.json({ type: SUCCESS, message: "Bulk insert success", data: response }, { status: 200 })

        // return NextResponse.json({type: ERROR,message: "Invalid action",data: null}, { status: 400 })
    

    } catch (err) {
    // Ensure connection is closed even if error occurs
    try {
        await mongoose.disconnect()
    } catch (disconnectErr) {
        console.error("Error disconnecting:", disconnectErr)
    }

    console.error(err)
    return NextResponse.json({ type: ERROR, message: err, data: null }, { status: 500 })
}
}
