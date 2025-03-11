import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import * as fs from 'fs/promises';
import { existsSync } from 'fs';

// Map of file extensions to MIME types
const mimeTypes: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.txt': 'text/plain',
  '.csv': 'text/csv',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
  '.zip': 'application/zip',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
};

export async function GET(request: NextRequest) {
  try {
    // Get the filename from the URL
    const url = new URL(request.url);
    const fileName = url.searchParams.get('file');
    const originalName = url.searchParams.get('originalName');
    
    if (!fileName) {
      return NextResponse.json(
        { status: 'error', message: 'File name is required' },
        { status: 400 }
      );
    }
    
    // Security check to prevent directory traversal
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid file name' },
        { status: 400 }
      );
    }
    
    // Define file path
    const filePath = join(process.cwd(), 'public', 'uploads', fileName);
    
    // Check if the file exists
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { status: 'error', message: 'File not found' },
        { status: 404 }
      );
    }
    
    // Read the file
    const fileBuffer = await fs.readFile(filePath);
    
    // Determine content type based on file extension
    const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    // Create the response
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: new Headers({
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${originalName || fileName}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }),
    });
    
    return response;
  } catch (error) {
    console.error('File download error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'File download failed', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}