import { dbConnect } from '@/lib/mongoose'
import { userManager } from '@/server/managers/userManager'
import { NextResponse } from 'next/server'
import {User} from "@/models/index"
import mongoose from "mongoose"


export async function POST() {
    try {

        await dbConnect()
        // Perform the update operation
        const response = await User.updateMany(
            { "userid": { $exists: true } },
            { $rename: { "userid": "empId" } }
        ).exec() || await User.create({
            empId: "EMP001",
            firstName: "Admin",
            lastName: "User", 
            email: "admin@acero.com",
            password: "admin123",
            role: "admin",
            designation: "Administrator",
            employeeType: "Full Time",
            department: "Administration",
            location: "HQ",
            reportingTo: "None",
            isActive: true,
            status: "Active",
            availability: "Available",
            extension: "001",
            mobile: "1234567890",
            joiningDate: new Date(),
            relievingDate: new Date(),
            access: {}
        })
        
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
