import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { presignPut, getPublicUrl } from "@/lib/r2";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB — generous; original-resolution camera photos

interface FileSpec {
  name: string;
  type: string;
  size: number;
  kind?: "thumbnail";
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.role || !["ADMIN", "AGENT"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { files?: FileSpec[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const files = body.files;
  if (!Array.isArray(files) || files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  for (const f of files) {
    if (!f || typeof f.name !== "string" || typeof f.type !== "string" || typeof f.size !== "number") {
      return NextResponse.json({ error: "Each file needs name, type, size" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(f.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${f.type}. Allowed: jpg, png, webp` },
        { status: 400 }
      );
    }
    if (f.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File "${f.name}" exceeds ${MAX_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }
  }

  const uploads = await Promise.all(
    files.map(async (f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const prefix = f.kind === "thumbnail" ? "properties/thumbs/" : "properties/";
      const key = `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const uploadUrl = await presignPut(key, f.type);
      return { key, uploadUrl, publicUrl: getPublicUrl(key) };
    })
  );

  return NextResponse.json({ uploads });
}
