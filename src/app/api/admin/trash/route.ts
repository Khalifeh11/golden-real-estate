import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import Agent from "@/models/Agent";
import ContactRequest from "@/models/ContactRequest";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await dbConnect();

  const [properties, agents, contacts] = await Promise.all([
    Property.find({ trash: true })
      .sort({ updatedAt: -1 })
      .select("title slug status category price currency updatedAt")
      .lean(),
    Agent.find({ trash: true })
      .sort({ updatedAt: -1 })
      .select("firstName lastName email updatedAt")
      .lean(),
    ContactRequest.find({ trash: true })
      .sort({ createdAt: -1 })
      .select("name email subject createdAt")
      .lean(),
  ]);

  return NextResponse.json({ properties, agents, contacts });
}
