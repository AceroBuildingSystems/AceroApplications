import { masterdataManager } from '@/server/managers/masterDataManager'
import { DB_REQUIRED, ERROR, INVALID_REQUEST, SUCCESS } from '@/shared/constants'
import { createMongooseObjectId } from '@/shared/functions'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'


export async function GET(request:NextRequest,response:NextResponse) {
  const { searchParams } = new URL(request.url)
  const db = searchParams.get('db')
  console.log("db", db)
  if(!db) return NextResponse.json({status:ERROR, message:DB_REQUIRED}, { status: 400 })

  const result:any = await masterdataManager.getMasterData({ db })
  
  if(result.status === SUCCESS) {
    return NextResponse.json(result.data)
  }
  return NextResponse.json(result.message, { status: 500 })
}

export async function POST(request:NextRequest,response:NextResponse) {
  const body = await request.json()

  if(!body) return NextResponse.json({status:ERROR, message:INVALID_REQUEST}, { status: 400 })
  if(!body.db) return NextResponse.json({status:ERROR, message:DB_REQUIRED}, { status: 400 })
    

  body.data.addedBy = createMongooseObjectId(body.addedBy)
  body.data.updatedBy = createMongooseObjectId(body.updatedBy)

  const result:any = await masterdataManager.createMasterData(body)
  
  if(result.status === SUCCESS) {
    return NextResponse.json(result.data)
  }
  return NextResponse.json(result.message, { status: 500 })
}

