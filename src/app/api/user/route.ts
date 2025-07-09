import { userManager } from '@/server/managers/userManager'
import { ERROR, INVALID_REQUEST, SUCCESS, ACCESS_ID_REQUIRED, INSUFFIENT_DATA, BODY_REQUIRED, SPECIFY_ACTION } from '@/shared/constants'
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(request:NextRequest) {
  const filter= {}
  const searchParams = new URL(request.url).searchParams;
  searchParams.forEach((value: string, key: string) => {
    (filter as any)[key] = value;
  });


  const response: any = await userManager.getUsers({ filter });

  if (response.status === SUCCESS) {
    return NextResponse.json({status:SUCCESS, message:SUCCESS, data:response.data}, { status: 200 })
  }

  return NextResponse.json({status:ERROR, message:response.message, data:{}}, { status: 500 })
}

//NextResponse.json({status:ERROR, message:ACCESS_ID_REQUIRED, data:{}}, { status: 400 })
//NextResponse.json({status:SUCCESS, message:SUCCESS, data:response.data}, { status: 200 })

export async function POST(request:NextRequest) {
  try {
    const body = await request.json()
    console.log('POST /api/user received body:', body);
    
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET})
    if(!body) {
      console.log('POST /api/user error: No body provided');
      return NextResponse.json({status:ERROR, message:BODY_REQUIRED,data:{}}, { status: 400 })
    }
    
    if(!body.action) {
      console.log('POST /api/user error: No action provided in body');
      return NextResponse.json({status:ERROR, message:SPECIFY_ACTION, data:{}}, { status: 400 })
    }

    let response:any = {};
    switch(body.action){
      case 'create':
        console.log('Creating user with data:', body);
        // Validate required fields first
        const formData = body.formData || body;
        if (!formData.firstName || !formData.lastName) {
          return NextResponse.json({
            status: ERROR,
            message: {
              errors: {
                firstName: !formData.firstName ? { message: "First name is required" } : undefined,
                lastName: !formData.lastName ? { message: "Last name is required" } : undefined
              },
              _message: "User validation failed"
            },
            data: {}
          }, { status: 400 });
        }
        
        // Format the data properly for the MongoDB adapter
        // The adapter expects { data: { ...userData } }
        const userData = {
          data: formData
        };
        
        // Remove the action field from userData.data if it exists
        if (userData.data && userData.data.action) {
          delete userData.data.action;
        }
        
        console.log('Formatted user data for creation:', JSON.stringify(userData, null, 2));
        try {
          response = await userManager.createUser(userData);
          console.log('Create user response:', response);
        } catch (error) {
          console.error('Error in userManager.createUser:', error);
          return NextResponse.json({
            status: ERROR, 
            message: error instanceof Error ? error.message : 'Failed to create user',
            data: {}
          }, { status: 500 });
        }
      
        break;
      case 'update':
        // Expect filter and data fields for update
        if (!body.filter || !body.data) {
          return NextResponse.json({status:ERROR, message:INSUFFIENT_DATA, data:{}}, { status: 400 })
        }
        response = await userManager.updateUser(body)
        break;
      case 'updateAccess':
        if(!body.data.id) {
          return NextResponse.json({status:ERROR, message:ACCESS_ID_REQUIRED, data:{}}, { status: 400 })
        }
        response = await userManager.updateAccess(body)
        break;
      default:
        return NextResponse.json({status:ERROR, message:SPECIFY_ACTION, data:{}}, { status: 400 })
    }
    
    if(response.status === SUCCESS) {
      console.log('POST /api/user success response:', response.data);
      return NextResponse.json({status:SUCCESS, message:SUCCESS, data:response.data}, { status: 200 })
    }
    console.log('POST /api/user error response:', response.message);
    return NextResponse.json({status:ERROR, message:response.message, data:{}}, { status: 500 })
  } catch (error) {
    console.error('POST /api/user caught error:', error);
    return NextResponse.json({status:ERROR, message:'Server error processing request', data:{}}, { status: 500 })
  }
}


export async function PUT(request:NextRequest) {
  const body = await request.json()
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET})

  let response:any = {}
  
  if(!body) return NextResponse.json({status:ERROR, message:BODY_REQUIRED,data:{}}, { status: 400 })
  if(!body.data.id) {
    return NextResponse.json({status:ERROR, message:ACCESS_ID_REQUIRED, data:{}}, { status: 400 })
  }
  response = await userManager.updateAccess(body)
  
  if(response.status === SUCCESS) {
    return NextResponse.json({status:SUCCESS, message:SUCCESS, data:response.data}, { status: 200 })
  }
  return NextResponse.json({status:ERROR, message:response.message, data:{}}, { status: 500 })

}

