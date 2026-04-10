import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import Agent from "@/models/Agent";
import ContactRequest from "@/models/ContactRequest";

// Restore a trashed item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { type } = await request.json();
  await dbConnect();

  const model = getModel(type);
  if (!model) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const doc = await model.findByIdAndUpdate(id, { trash: false }, { new: true });
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

// Permanently delete a trashed item
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const type = new URL(_request.url).searchParams.get("type");
  await dbConnect();

  const model = getModel(type);
  if (!model) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  // Only allow permanent delete on already-trashed items
  const doc = await model.findOneAndDelete({ _id: id, trash: true });
  if (!doc) {
    return NextResponse.json({ error: "Not found or not trashed" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

function getModel(type: string | null) {
  switch (type) {
    case "property": return Property;
    case "agent": return Agent;
    case "contact": return ContactRequest;
    default: return null;
  }
}
