// app/api/file/route.ts
import { fileManager } from "@/server/managers/smlFileManager";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { promises as fs } from "fs";
import path from "path";
import { createMongooseObjectId } from "@/shared/functions";
import { SUCCESS, ERROR, INSUFFIENT_DATA } from "@/shared/constants";
import { IncomingForm } from 'formidable';
import formidable from 'formidable';
import { Readable } from 'stream';
import { writeFile } from 'fs/promises';
// Removed invalid import as 'fromReadableStream' is not a valid export
// Disable Next.js default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

// Convert Web Request to Node Readable Stream
function getNodeReadableStream(req: Request): Readable {
  const reader = req.body?.getReader();
  return new Readable({
    read() {
      if (!reader) {
        this.push(null);
        return;
      }
      reader.read().then(({ done, value }) => {
        if (done) {
          this.push(null);
        } else {
          this.push(value);
        }
      }).catch(err => {
        this.destroy(err);
      });
    },
  });
}

export async function POST(req: Request) {
  try {
    console.log("here");
    const nodeStream = Readable.from(req.body as any); // Use Readable.from for converting streams
    const form = formidable({ multiples: true });
    console.log("formidable", form);
    const stream = getNodeReadableStream(req);
    console.log("stream", stream);
    const mockReq = new Readable({
      read() {
        stream.on("data", (chunk) => this.push(chunk));
        stream.on("end", () => this.push(null));
        stream.on("error", (err) => this.destroy(err));
      },
    });

    Object.assign(mockReq, {
      headers: req.headers,
      method: req.method,
      url: req.url,
    });

    const { fields, files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      form.parse(mockReq as any, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    console.log("Fields:", fields);
    console.log("Files:", files);

    const db = fields.db?.[0] || fields.db;
    const addedBy = fields.addedBy?.[0] || fields.addedBy;
    const updatedBy = fields.updatedBy?.[0] || fields.updatedBy;

    if (!db || !files?.files) {
      return NextResponse.json({ status: ERROR, message: INSUFFIENT_DATA }, { status: 400 });
    }

    const uploadedFiles = Array.isArray(files.files) ? files.files : [files.files];

    const fileMetas = await Promise.all(
      uploadedFiles.map(async (file: any) => {
        const filePath = path.join(process.cwd(), "public/uploads", file.originalFilename);
        const data = await fs.readFile(file.filepath); // file.filepath is where formidable stores it
        await fs.writeFile(filePath, data); // Optional re-write if you need it elsewhere

        return {
          fileName: file.originalFilename,
          fileSize: file.size,
          description: "",
          revNo: 1,
          subGroup: null,
          fileId: createMongooseObjectId(uuidv4()),
          isActive: true,
          addedBy: createMongooseObjectId(addedBy),
          updatedBy: createMongooseObjectId(updatedBy),
        };
      })
    );

    const options = {
      db,
      action: "create",
      data: fileMetas,
    };

    const response: any = await fileManager.createFileData(options);

    if (response.status === SUCCESS) {
      return NextResponse.json({ status: SUCCESS, data: response.data }, { status: 200 });
    }

    return NextResponse.json({ status: ERROR, message: response.message }, { status: 500 });

  } catch (err) {
    console.error("❌ Upload Error:", err);
    return NextResponse.json({ status: ERROR, message: 'Upload Failed', error: String(err) }, { status: 500 });
  }
}
