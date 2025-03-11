import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join, extname } from 'path';
import { mkdir } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    // Parse the form data
    const formData = await request.formData();
    console.log('FormData received:', Array.from(formData.entries()).map(([key, value]) => 
      `${key}: ${value instanceof Blob ? `${value.type}, ${value.size} bytes` : value}`
    ).join(', '));
    
    // Get file, ticketId and userId from FormData
    const file = formData.get('file');
    const ticketId = formData.get('ticketId');
    const userId = formData.get('userId');
    
    if (!ticketId || !userId) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Missing ticketId or userId in form data' 
        },
        { status: 400 }
      );
    }

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { status: 'error', message: 'No file provided or invalid file' },
        { status: 400 }
      );
    }
    
    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.log('Upload directory already exists');
    }
    
    // Get file details
    const fileName = 'name' in file ? file.name : 'file-' + uuidv4();
    const fileType = file.type || 'application/octet-stream';
    const fileSize = file.size || 0;
    
    console.log('File details:', {
      name: fileName,
      type: fileType,
      size: fileSize
    });
    
    // Get file extension
    let fileExt = extname(fileName) || '';
    const baseFileName = fileName.replace(fileExt, '');
    
    // Ensure we have a file extension based on MIME type if none is provided
    if (!fileExt && fileType) {
      fileExt = getExtensionFromMimeType(fileType);
    }
    
    // Create a unique filename that preserves the original extension
    const uniqueFileName = `${Date.now()}-${uuidv4()}${fileExt || ''}`;
    const filePath = join(uploadDir, uniqueFileName);
    
    // Convert file to buffer and save it
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, fileBuffer);
    
    // Create file info object
    const fileInfo = {
      fileName,
      originalName: fileName,
      storedFileName: uniqueFileName,
      fileType,
      fileSize,
      url: `/uploads/${uniqueFileName}`,
      uploadedAt: new Date()
    };
    
    // Return success response
    return NextResponse.json({
      status: 'success',
      message: 'File uploaded successfully',
      data: {
        ...fileInfo,
        ticketId: ticketId.toString(),
        userId: userId.toString()
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'File upload failed', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

// Helper function to get file extension from MIME type
function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'text/plain': '.txt',
    'text/csv': '.csv',
    'application/json': '.json',
    'application/javascript': '.js',
    'text/html': '.html',
    'text/css': '.css',
    'video/mp4': '.mp4',
    'audio/mpeg': '.mp3',
    'application/zip': '.zip',
    'application/x-rar-compressed': '.rar'
  };
  
  return mimeToExt[mimeType] || '';
}