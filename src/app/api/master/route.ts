import { masterdataManager } from '@/server/managers/masterDataManager'
import { DB_REQUIRED, ERROR, INSUFFIENT_DATA, INVALID_REQUEST, SUCCESS } from '@/shared/constants'
import { createMongooseObjectId } from '@/shared/functions'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'


export async function GET(request:NextRequest,response:NextResponse) {
  const searchParams = new URL(request.url).searchParams;
    const operations: any = {};

    // Extract the database name
    const db = searchParams.get('db');
    if (!db) {
        return NextResponse.json(
            { status: 'ERROR', message: 'DB_REQUIRED' },
            { status: 400 }
        );
    }

    // Extract and parse the filter parameter
    const filterParam = searchParams.get('filter');
    if (filterParam) {
        try {
            operations.filter = JSON.parse(filterParam);
        } catch (error) {
            return NextResponse.json(
                { status: 'ERROR', message: 'INVALID_FILTER_FORMAT' },
                { status: 400 }
            );
        }
    } else {
        operations.filter = {};
    }

    // Extract and parse the sort parameter
    const sortParam = searchParams.get('sort');
    if (sortParam) {
        try {
            operations.sort = JSON.parse(sortParam);
        } catch (error) {
            return NextResponse.json(
                { status: 'ERROR', message: 'INVALID_SORT_FORMAT' },
                { status: 400 }
            );
        }
    }

    // Extract pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Construct the operations object
    operations.pagination = { page, limit };


  const result:any = await masterdataManager.getMasterData({ db,operations })
  
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

