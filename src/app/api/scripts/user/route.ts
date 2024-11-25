import { dbConnect } from '@/lib/mongoose'
import { userManager } from '@/server/managers/userManager'
import { NextResponse } from 'next/server'
import {User} from "@/models/index"
import mongoose from "mongoose"


export async function POST() {
    try{
        const MONGODB_URI = process.env.NEXT_PUBLIC_DEV_MONGODB_URI

        if(!MONGODB_URI){
            return NextResponse.json({err:"NO MONGO STRING"}, { status: 500 })
        }

        const mongoConnect = mongoose.connect(MONGODB_URI).then(() => {
            return NextResponse.json({err:"Couldnt Connect"}, { status: 500 })

          })
        // const db:any = await dbConnect()
        // console.debug(db)
        // return NextResponse.json(db)
        
        const response = await User.updateMany(
            { "userid": { $exists: true } },  
            { $rename: { "userid": "empId" } }  // Rename 'userid' to 'empId'
        ) 
        
        console.log(response)
        return NextResponse.json(response)
    }catch(err){
        console.debug(err)
        return NextResponse.json(err, { status: 500 })
    }
}

