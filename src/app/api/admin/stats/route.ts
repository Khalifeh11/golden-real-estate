import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import Agent from "@/models/Agent";
import User from "@/models/User";
import ContactRequest from "@/models/ContactRequest";

export async function GET() {
  const session = await auth();
  if (!session?.user?.role || !["ADMIN", "AGENT"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const [
    totalProperties,
    activeProperties,
    pendingProperties,
    totalAgents,
    totalUsers,
    totalContacts,
    unreadContacts,
    recentProperties,
    recentContacts,
  ] = await Promise.all([
    Property.countDocuments(),
    Property.countDocuments({ status: "ACTIVE" }),
    Property.countDocuments({ status: "PENDING" }),
    Agent.countDocuments(),
    User.countDocuments(),
    ContactRequest.countDocuments(),
    ContactRequest.countDocuments({ isRead: false }),
    Property.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title slug status category price currency createdAt")
      .lean(),
    ContactRequest.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email subject isRead createdAt")
      .lean(),
  ]);

  return NextResponse.json({
    properties: { total: totalProperties, active: activeProperties, pending: pendingProperties },
    agents: { total: totalAgents },
    users: { total: totalUsers },
    contacts: { total: totalContacts, unread: unreadContacts },
    recentProperties,
    recentContacts,
  });
}
