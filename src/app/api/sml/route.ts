import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import mongoose from 'mongoose';
import SmlFile from '@/models/sml/SMLFile.model';
import { createMongooseObjectId } from '@/shared/functions';
import connectToDatabase from '@/lib/db';
import { applicationdataManager } from '@/server/managers/applicationManager';
import { SUCCESS, ERROR, INVALID_REQUEST } from '@/shared/constants';

const mongoURI = process.env.MONGODB_URI!;
const conn = mongoose.createConnection(mongoURI);

export const POST = async (req: NextRequest) => {
  await dbConnect();

  const formData = await req.formData();
  const subGroup = formData.get('subGroup')?.toString();
  const revNo = parseInt(formData.get('revNo')?.toString() ?? '1');
  const db = formData.get('db')?.toString();
  const addedBy = formData.get('addedBy')?.toString();
  const updatedBy = formData.get('updatedBy')?.toString();

  const files = formData.getAll('files') as File[];

  if (!db || !subGroup || !files.length || !addedBy || !updatedBy) {
    return NextResponse.json({ status: ERROR, message: INVALID_REQUEST, data: {} }, { status: 400 });
  }

  const bucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'smlUploads' });
  const results = [];

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);
    const uploadStream = bucket.openUploadStream(file.name, { contentType: file.type });

    const uploadFinished = new Promise((resolve, reject) => {
      stream.pipe(uploadStream)
        .on('finish', async () => {
          const fileData = {
            fileName: file.name,
            fileSize: file.size,
            revNo,
            subGroup,
            fileId: uploadStream.id,
            addedBy: createMongooseObjectId(addedBy),
            updatedBy: createMongooseObjectId(updatedBy),
          };

          const result = await applicationdataManager.createApplicationData({
            db,
            action: "create",
            data: fileData,
          });

          results.push(result);
          resolve(true);
        })
        .on('error', reject);
    });

    await uploadFinished;
  }

  return NextResponse.json({ status: SUCCESS, message: SUCCESS, data: results }, { status: 200 });
};
