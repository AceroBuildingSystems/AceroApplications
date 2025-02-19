import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Asset from '@/models/Asset'; // existing asset model
// ...import any utility functions or DB connector...

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    // Fetch assets (e.g., filtering by user’s department or location)
    const assets = await Asset.find(); // adjust query as needed
    return NextResponse.json({ assets });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const body = await request.json();
    let asset = await Asset.findOne({ serialNumber: body.serialNumber });
    if (asset) {
      // Update existing asset if found
      asset = await Asset.findByIdAndUpdate(asset._id, body, { new: true });
    } else {
      // Create new asset
      asset = await Asset.create(body);
    }
    return NextResponse.json({ asset });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process asset' }, { status: 500 });
  }
}
