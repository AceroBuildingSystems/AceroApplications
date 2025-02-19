import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Inventory from '@/models/Inventory'; // existing inventory model
import Vendor from '@/models/Vendor';

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const inventories = await Inventory.find().populate('vendor'); // assuming vendor reference
    return NextResponse.json({ inventories });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch inventory records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const body = await request.json();
    let vendor = await Vendor.findOne({ name: body.vendorName });
    if (!vendor) {
      // Create new vendor if not found
      vendor = await Vendor.create({ name: body.vendorName });
    }
    
    // Check for asset existence (assume Asset model logic)
    // ...existing logic to verify or create asset...
    
    const inventoryRecord = await Inventory.create({
      ...body,
      vendor: vendor._id,
    });
    return NextResponse.json({ inventoryRecord });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record inventory' }, { status: 500 });
  }
}
