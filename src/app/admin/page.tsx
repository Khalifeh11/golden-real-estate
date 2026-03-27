import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import Agent from "@/models/Agent";
import User from "@/models/User";
import ContactRequest from "@/models/ContactRequest";
import StatsCard from "@/components/admin/StatsCard";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export default async function AdminOverviewPage() {
  const session = await auth();
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

  const isAdmin = session!.user.role === "ADMIN";

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Total Properties" value={totalProperties} sub={`${activeProperties} active`} />
        <StatsCard label="Pending Review" value={pendingProperties} highlight={pendingProperties > 0} />
        <StatsCard label="Unread Contacts" value={unreadContacts} highlight={unreadContacts > 0} sub={`${totalContacts} total`} />
        {isAdmin ? (
          <StatsCard label="Agents" value={totalAgents} sub={`${totalUsers} users`} />
        ) : (
          <StatsCard label="Total Contacts" value={totalContacts} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Properties */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Properties</h2>
            <Link href="/admin/properties" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentProperties.map((p) => (
              <div key={String(p._id)} className="flex items-center justify-between text-sm">
                <div className="min-w-0">
                  <Link
                    href={`/admin/properties?edit=${p._id}`}
                    className="font-medium text-gray-800 hover:underline truncate block max-w-[180px]"
                  >
                    {p.title}
                  </Link>
                  <span className="text-gray-400 text-xs">
                    {p.price ? formatPrice(p.price, p.currency ?? "USD") : "—"}
                  </span>
                </div>
                <span
                  className={`ml-2 shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                    p.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : p.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {p.status}
                </span>
              </div>
            ))}
            {recentProperties.length === 0 && (
              <p className="text-sm text-gray-400">No properties yet.</p>
            )}
          </div>
        </div>

        {/* Recent Contacts */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Contacts</h2>
            <Link href="/admin/contacts" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentContacts.map((c) => (
              <div key={String(c._id)} className="flex items-center justify-between text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 truncate">{c.name}</p>
                  <p className="text-gray-400 text-xs truncate">{c.subject ?? c.email}</p>
                </div>
                {!c.isRead && (
                  <span className="ml-2 shrink-0 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    New
                  </span>
                )}
              </div>
            ))}
            {recentContacts.length === 0 && (
              <p className="text-sm text-gray-400">No contacts yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
