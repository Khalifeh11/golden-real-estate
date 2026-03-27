import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import ContactRequest from "@/models/ContactRequest";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.role || !["ADMIN", "AGENT"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const skip = (page - 1) * limit;
  const isRead = searchParams.get("isRead");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};
  if (isRead === "true") filter.isRead = true;
  if (isRead === "false") filter.isRead = false;

  const [data, total] = await Promise.all([
    ContactRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ContactRequest.countDocuments(filter),
  ]);

  return NextResponse.json({
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
