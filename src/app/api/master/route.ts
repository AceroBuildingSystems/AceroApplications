import { masterdataManager } from '@/server/managers/masterDataManager'
import { DB_REQUIRED, ERROR, INSUFFIENT_DATA, INVALID_REQUEST, SUCCESS } from '@/shared/constants'
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

  const {db,action} = body
  if(!db || !action) return NextResponse.json({status:ERROR, message:INSUFFIENT_DATA}, { status: 400 })

    
  body.data.addedBy = createMongooseObjectId(body.addedBy)
  body.data.updatedBy = createMongooseObjectId(body.updatedBy)

  let result:any = {}
  
  switch(action){
    case "create":
      result = await masterdataManager.createMasterData(body)
      break;
    case "update":
      result = await masterdataManager.updateMasterData(body)
      break;
    default:
      result = {status:ERROR, message:INVALID_REQUEST}
  }

  
  if(result.status === SUCCESS) {
    return NextResponse.json(result.data)
  }
  return NextResponse.json(result.message, { status: 500 })
}

