// src/app/api/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import mime from 'mime-types';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters from the URL
    const searchParams = new URL(request.url).searchParams;
    const file = searchParams.get('file');
    const originalName = searchParams.get('originalName');
    
    if (!file) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }
    
    // Security check to prevent directory traversal
    const sanitizedFilename = path.basename(file);
    console.log({ sanitizedFilename });
    
    const filePath = path.join(process.cwd(), 'public', 'uploads', sanitizedFilename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      console.error(`File not found: ${filePath}`);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    // Determine MIME type from file extension
    const contentType = mime.lookup(filePath) || 'application/octet-stream';
    
    // Read the file
    const fileBuffer = await fs.readFile(filePath);
    
    // Create and return the response with appropriate headers
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(originalName || sanitizedFilename)}"`,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
    
    return response;
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}