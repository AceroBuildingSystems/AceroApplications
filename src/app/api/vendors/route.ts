import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Vendor from '@/models/Vendor'; // existing vendor master model

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const vendors = await Vendor.find();
    return NextResponse.json({ vendors });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const body = await request.json();
    let vendor = await Vendor.findOne({ name: body.name });
    if (!vendor) {
      vendor = await Vendor.create(body);
    }
    return NextResponse.json({ vendor });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process vendor data' }, { status: 500 });
  }
}
