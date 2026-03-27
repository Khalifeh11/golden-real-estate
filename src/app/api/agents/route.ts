import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Agent from "@/models/Agent";
import { z } from "zod";

const agentSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  photoUrl: z.string().optional(),
});

export async function GET() {
  await dbConnect();
  const agents = await Agent.find().sort({ firstName: 1 }).lean();
  return NextResponse.json(agents);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = agentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await dbConnect();
  const agent = await Agent.create({ _id: crypto.randomUUID(), ...parsed.data });
  return NextResponse.json(agent, { status: 201 });
}
