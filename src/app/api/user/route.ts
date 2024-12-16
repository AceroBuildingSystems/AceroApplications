import { dbConnect } from '@/lib/mongoose'
import { userManager } from '@/server/managers/userManager'
import { SUCCESS } from '@/shared/constants'
import { NextResponse } from 'next/server'


export async function GET() {
  const response:any = await userManager.getUsers()
  
  if(response.status === SUCCESS) {
    return NextResponse.json(response.data)
  }
  return NextResponse.json(response.message, { status: 500 })
}

