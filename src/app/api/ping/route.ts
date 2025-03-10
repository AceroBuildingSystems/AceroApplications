// src/app/api/ping/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({ timestamp: Date.now() });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ timestamp: Date.now() });
}