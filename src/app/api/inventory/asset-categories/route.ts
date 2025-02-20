import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import AssetCategory from '@/models/master/AssetCategory.model';

export async function GET() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const assetCategories = await AssetCategory.find();
    return NextResponse.json({ assetCategories }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching asset categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const { name, description } = await request.json();
    const newAssetCategory = new AssetCategory({ name, description });
    await newAssetCategory.save();
    return NextResponse.json({ message: 'Asset category created successfully' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error creating asset category' }, { status: 500 });
  }
}