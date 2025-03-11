// src/app/api/file-download/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get file metadata from your database using this ID
    // This is pseudocode - implement based on your database
    const fileData = await getFileMetadata(id);
    
    if (!fileData) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    const filePath = path.join(process.cwd(), 'public', 'uploads', path.basename(fileData.url));
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found on server' }, { status: 404 });
    }
    
    const fileBuffer = fs.readFileSync(filePath);
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': fileData.fileType,
        'Content-Disposition': `attachment; filename="${fileData.fileName}"`,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}