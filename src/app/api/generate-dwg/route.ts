import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";

export async function POST(req: NextRequest) {
    const body = await req.json(); // Parse JSON body
    const { width, height, depth } = body;

    console.log("Received data:", width, height, depth);
console.log(process.cwd());
    const scriptPath = path.join(process.cwd(), "src", "scripts", "generate_dwg.py");
console.log(scriptPath);
    return new Promise((resolve) => {
        const pythonpath = `"C:\\Users\\iqbal.ansari\\AppData\Local\\Microsoft\\WindowsApps\\python.exe"`
        exec(`python ${scriptPath} ${width} ${height} ${depth}`, (error, stdout, stderr) => {
            if (error) {
                console.error("Error:", stderr);
                resolve(NextResponse.json({ error: "Failed to generate DWG" }, { status: 500 }));
            } else {
                console.log("DWG Generation Output:", stdout);
                resolve(NextResponse.json({ message: "DWG generated successfully!", output: stdout }));
            }
        });
    });
}
