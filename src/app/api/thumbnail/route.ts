import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchFromR2, uploadToR2 } from "@/lib/r2";
import { generateThumbnail } from "@/lib/image";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.role || !["ADMIN", "AGENT"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { key?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const key = body.key;
  if (typeof key !== "string" || !key.startsWith("properties/") || key.includes("..")) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  try {
    const buffer = await fetchFromR2(key);
    const thumbBuffer = await generateThumbnail(buffer);
    const thumbKey = `properties/thumbs/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
    const thumbnailUrl = await uploadToR2(thumbBuffer, thumbKey, "image/webp");
    return NextResponse.json({ thumbnailUrl, thumbnailKey: thumbKey });
  } catch (err) {
    console.error("Thumbnail generation error:", err);
    return NextResponse.json(
      { error: `Thumbnail generation failed: ${err instanceof Error ? err.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
