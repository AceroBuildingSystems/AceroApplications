import { getUsers } from '@/server/services/userServices'
import { NextResponse } from 'next/server'

export async function GET() {
  const response = await getUsers()
  if(response.status === 'success') {
    return NextResponse.json(response.data)
  }
  return NextResponse.json(response.message, { status: 500 })
}