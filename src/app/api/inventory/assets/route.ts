import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Asset from '@/models/master/Asset.model';

export async function GET() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const assets = await Asset.find();
    return NextResponse.json({ assets }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching assets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const { assetModelId, assetVariationId, serialNumber, departmentId, employeeId, status, locationId, vendorId, purchaseDate } = await request.json();
    const newAsset = new Asset({ assetModelId, assetVariationId, serialNumber, departmentId, employeeId, status, locationId, vendorId, purchaseDate });
    await newAsset.save();
    return NextResponse.json({ message: 'Asset created successfully' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error creating asset' }, { status: 500 });
  }
}