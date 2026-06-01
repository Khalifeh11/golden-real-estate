import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import Agent from "@/models/Agent";
import ContactRequest from "@/models/ContactRequest";

// Bulk permanently delete trashed items (selected ids, or the whole tab)
export async function POST(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { type, ids, all } = await request.json();
  await dbConnect();

  const model = getModel(type);
  if (!model) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  // Only ever delete already-trashed items — never an active doc.
  const filter = all
    ? { trash: true }
    : { _id: { $in: ids }, trash: true };

  if (!all && (!Array.isArray(ids) || ids.length === 0)) {
    return NextResponse.json({ error: "No ids provided" }, { status: 400 });
  }

  const { deletedCount } = await model.deleteMany(filter);

  return NextResponse.json({ success: true, deletedCount });
}

function getModel(type: string | null) {
  switch (type) {
    case "property": return Property;
    case "agent": return Agent;
    case "contact": return ContactRequest;
    default: return null;
  }
}
