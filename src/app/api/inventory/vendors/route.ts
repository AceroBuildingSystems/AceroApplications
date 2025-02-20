import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Vendor from '@/models/master/Vendor.model';

export async function GET() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const vendors = await Vendor.find();
    return NextResponse.json({ vendors }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching vendors' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const { name, contactPerson, email, phone, address, location } = await request.json();
    const newVendor = new Vendor({ name, contactPerson, email, phone, address, location });
    await newVendor.save();
    return NextResponse.json({ message: 'Vendor created successfully' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error creating vendor' }, { status: 500 });
  }
}