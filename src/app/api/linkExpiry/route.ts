import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "super-secret-key";

// ✅ Generate token with processId
export async function POST(req: NextRequest) {
    try {
        const { processId } = await req.json();

        if (!processId) {
            return NextResponse.json({ error: "Missing processId" }, { status: 400 });
        }

        // Create token with 1h expiry
        const token = jwt.sign({ processId }, SECRET, { expiresIn: "1h" });

        const shareUrl = `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/candidates?token=${token}`;

        return NextResponse.json({ url: shareUrl });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// ✅ Verify token on GET
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json({ valid: false, error: "Missing token" }, { status: 400 });
        }

        try {
            const decoded = jwt.verify(token, SECRET) as { processId: string };
            return NextResponse.json({ valid: true, processId: decoded.processId });
        } catch (err: any) {
            return NextResponse.json({ valid: false, error: "Token expired or invalid" }, { status: 401 });
        }
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
