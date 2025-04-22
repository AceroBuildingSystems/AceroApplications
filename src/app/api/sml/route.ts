// src/app/api/sml/route.ts
import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { basePath } = await req.json();

    const groupDirs = fs.readdirSync(basePath, { withFileTypes: true }).filter(d => d.isDirectory());

    const filesData:any = [];

    groupDirs.forEach(group => {
      const groupPath = path.join(basePath, group.name);
      const subGroupDirs = fs.readdirSync(groupPath, { withFileTypes: true }).filter(d => d.isDirectory());

      subGroupDirs.forEach(subGroup => {
        const subGroupPath = path.join(groupPath, subGroup.name);
        const files = fs.readdirSync(subGroupPath);

        files.forEach(file => {
          const filePath = path.join(subGroupPath, file);
          const stats = fs.statSync(filePath);

          filesData.push({
            fileName: file,
            fileGroup: group.name,
            fileSubGroup: subGroup.name,
            fileSize: stats.size,
            fileDate: stats.mtime,
          });
        });
      });
    });

    return Response.json({ files: filesData });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
