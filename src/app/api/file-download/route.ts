import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import mime from 'mime-types';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    
    // Security check to prevent directory traversal
    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), 'public', 'uploads', sanitizedFilename);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    const fileBuffer = fs.readFileSync(filePath);
    
    // Determine MIME type from file extension
    const contentType = mime.lookup(filePath) || 'application/octet-stream';
    
    // Get original filename (you might need to fetch this from your database)
    // For now, we'll use the filename from the URL
    const originalFilename = sanitizedFilename;
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${originalFilename}"`,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}