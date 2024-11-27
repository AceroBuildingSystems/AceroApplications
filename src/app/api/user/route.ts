import { dbConnect } from '@/lib/mongoose'
import { userManager } from '@/server/managers/userManager'
import { NextResponse } from 'next/server'



export async function GET() {
  await dbConnect()
  const response:any = await userManager.getUsers()
  if(response.status === 'success') {
    return NextResponse.json(response.data)
  }
  return NextResponse.json(response.message, { status: 500 })
}

