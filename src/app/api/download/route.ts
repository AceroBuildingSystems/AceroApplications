import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';
import mime from 'mime-types';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { filename, originalName } = req.query;
    
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }
    
    // Security check to prevent directory traversal
    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), 'public', 'uploads', sanitizedFilename);
    
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Determine MIME type from file extension
    const contentType = mime.lookup(filePath) || 'application/octet-stream';
    
    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(originalName || sanitizedFilename)}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    return res.status(500).json({ error: 'Download failed' });
  }
}