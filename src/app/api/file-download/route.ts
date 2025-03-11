import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join, extname } from 'path';
import { stat } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Get the filename from the URL
    const url = new URL(request.url);
    const filename = url.searchParams.get('filename');
    const originalName = url.searchParams.get('originalName');
    
    if (!filename) {
      return NextResponse.json(
        { status: 'error', message: 'Missing filename parameter' },
        { status: 400 }
      );
    }
    
    // Sanitize the filename to prevent directory traversal attacks
    const sanitizedFilename = path.basename(filename);
    
    // Get the file path
    const filePath = join(process.cwd(), 'public', 'uploads', sanitizedFilename);
    
    try {
      // Check if the file exists
      const fileStat = await stat(filePath);
      
      if (!fileStat.isFile()) {
        return NextResponse.json(
          { status: 'error', message: 'File not found' },
          { status: 404 }
        );
      }
      
      // Read the file
      const fileBuffer = await readFile(filePath);
      
      // Determine the content type based on file extension or original name
      let fileExt = '';
      
      // First try to get extension from original name if provided
      if (originalName) {
        fileExt = extname(originalName).toLowerCase();
      }
      
      // If no extension from original name, try from the stored filename
      if (!fileExt) {
        fileExt = extname(sanitizedFilename).toLowerCase();
      }
      
      let contentType = 'application/octet-stream'; // Default content type
      
      // Map common extensions to MIME types
      const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.txt': 'text/plain',
        '.csv': 'text/csv',
        '.json': 'application/json',
        '.js': 'application/javascript',
        '.html': 'text/html',
        '.css': 'text/css',
        '.mp4': 'video/mp4',
        '.mp3': 'audio/mpeg',
        '.zip': 'application/zip',
        '.rar': 'application/x-rar-compressed'
      };
      
      if (fileExt in mimeTypes) {
        contentType = mimeTypes[fileExt];
      }
      
      // Set the download filename - ensure it has the correct extension
      let downloadFilename = originalName || sanitizedFilename;
      
      // If the original name doesn't have an extension but we know the content type,
      // add the appropriate extension
      if (originalName && !extname(originalName) && contentType !== 'application/octet-stream') {
        // Find extension for this content type
        for (const [ext, mime] of Object.entries(mimeTypes)) {
          if (mime === contentType) {
            downloadFilename += ext;
            break;
          }
        }
      }
      
      console.log('Downloading file:', {
        originalName,
        sanitizedFilename,
        contentType,
        downloadFilename,
        size: fileStat.size
      });
      
      // Create the response with the file content
      const response = new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${downloadFilename}"`,
          'Content-Length': fileStat.size.toString(),
        },
      });
      
      return response;
    } catch (error) {
      console.error('File read error:', error);
      return NextResponse.json(
        { status: 'error', message: 'File not found' },
        { status: 404 }
      );
    }
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