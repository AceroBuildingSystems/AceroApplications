import { NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function parseForm(req: Request) {
  const form = formidable({
    multiples: false,
    keepExtensions: true,
    maxFileSize: 20 * 1024 * 1024, // 20 MB max
  });

  // Convert Web Request body to Node.js Readable stream
  const buffer = await req.arrayBuffer();
  const readable = Readable.from(Buffer.from(buffer));

  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    form.parse(readable as any, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export async function POST(req: Request) {
  try {
    const { fields, files } = await parseForm(req);

    const fullNameRaw = fields.fullName as string;
    const contactNumber = fields.contactNumber as string;

    if (!fullNameRaw || !contactNumber) {
      return NextResponse.json({ error: "Missing fullName or contactNumber" }, { status: 400 });
    }

    const folderName = `${fullNameRaw}_${contactNumber}`
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_\-]/g, "");

    const uploadDir = path.join(process.cwd(), "public", "uploads", "candidates", folderName);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file || !file.originalFilename || !file.filepath) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const newFilePath = path.join(uploadDir, file.originalFilename);

    fs.renameSync(file.filepath, newFilePath);

    const fileUrl = `/uploads/candidates/${folderName}/${file.originalFilename}`;

    return NextResponse.json({
      message: "File uploaded successfully",
      url: fileUrl,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
