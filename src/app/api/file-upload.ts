// src/pages/api/file-upload.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '@/lib/mongoose';
import nc from 'next-connect';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { NextApiResponseServerIO } from '@/types/next';
import mime from 'mime-types';

// Define the file storage location and naming convention
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Preserve the original extension
    const uniqueId = randomUUID();
    const extension = path.extname(file.originalname) || 
                     `.${mime.extension(file.mimetype) || 'bin'}`;
    cb(null, `${uniqueId}${extension}`);
  }
});

// Define file size limit (10MB)
const fileSize = 10 * 1024 * 1024;

// Configure multer with storage settings and file size limit
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // Accept a wider range of file types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'video/mp4', 'video/webm', 'video/ogg',
      'audio/mpeg', 'audio/ogg', 'audio/wav',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'application/json',
      'application/zip', 'application/x-zip-compressed'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.log(`Rejected file with type: ${file.mimetype}`);
      cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
  }
});

// Create a custom error handler for multer
const onError = (err, req, res, next) => {
  console.error('File upload error:', err);
  res.status(500).json({ 
    status: 'error', 
    message: err.message || 'File upload failed' 
  });
};

// Create API handler using next-connect
const handler = nc({
  onError,
});

// Add middleware for file upload (single file per request)
handler.use(upload.single('file'));

// Handle file upload
handler.post(async (req: NextApiRequest & { file: any }, res: NextApiResponseServerIO) => {
  try {
    // Ensure database connection
    await dbConnect();
    
    // Access the uploaded file
    const file = req.file;
    if (!file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }
    
    // Get ticket ID from request body
    const { ticketId, userId } = req.body;
    if (!ticketId || !userId) {
      return res.status(400).json({ status: 'error', message: 'Ticket ID and User ID are required' });
    }
    
    // Create file metadata
    const fileData = {
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      url: `/uploads/${file.filename}`,
      uploadedAt: new Date(),
    };
    
    // Notify connected clients about the new file upload
    if (res.socket.server.io) {
      const io = res.socket.server.io;
      io.to(`ticket-${ticketId}`).emit('file-upload', {
        userId,
        ticketId,
        file: fileData,
      });
    }
    
    const fileExt = path.extname(file.originalname);
const contentType = mime.lookup(file.originalname) || file.mimetype;

// Return success response with file data
return res.status(200).json({
  status: 'success',
  message: 'File uploaded successfully',
  data: {
    fileName: file.originalname,
    fileType: contentType, // Use correct MIME type
    fileSize: file.size,
    url: `/uploads/${file.filename}`,
    downloadUrl: `/api/file-download/${file.filename}`,
    uploadedAt: new Date(),
  },
});
  } catch (error) {
    console.error('Upload handler error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Something went wrong',
    });
  }
});

// Export the handler
export const config = {
  api: {
    bodyParser: false, // Disable built-in bodyParser to let multer handle form data
  },
};

export default handler;