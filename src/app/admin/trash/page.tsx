"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface TrashedProperty {
  _id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
}

interface TrashedAgent {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  updatedAt: string;
}

interface TrashedContact {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  createdAt: string;
}

type Tab = "properties" | "agents" | "contacts";

export default function AdminTrashPage() {
  const [tab, setTab] = useState<Tab>("properties");
  const [properties, setProperties] = useState<TrashedProperty[]>([]);
  const [agents, setAgents] = useState<TrashedAgent[]>([]);
  const [contacts, setContacts] = useState<TrashedContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/trash")
      .then((res) => res.json())
      .then((data) => {
        setProperties(data.properties ?? []);
        setAgents(data.agents ?? []);
        setContacts(data.contacts ?? []);
        setLoading(false);
      });
  }, []);

  async function handleRestore(id: string, type: string) {
    const res = await fetch(`/api/admin/trash/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    if (res.ok) {
      removeItem(id, type);
      toast.success("Item restored");
    } else {
      toast.error("Failed to restore item");
    }
  }

  async function handleDelete(id: string, type: string, label: string) {
    if (!confirm(`Permanently delete "${label}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/trash/${id}?type=${type}`, {
      method: "DELETE",
    });
    if (res.ok) {
      removeItem(id, type);
      toast.success("Item permanently deleted");
    } else {
      toast.error("Failed to delete item");
    }
  }

  function removeItem(id: string, type: string) {
    if (type === "property") setProperties((prev) => prev.filter((p) => p._id !== id));
    if (type === "agent") setAgents((prev) => prev.filter((a) => a._id !== id));
    if (type === "contact") setContacts((prev) => prev.filter((c) => c._id !== id));
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "properties", label: "Properties", count: properties.length },
    { key: "agents", label: "Agents", count: agents.length },
    { key: "contacts", label: "Contacts", count: contacts.length },
  ];

  const totalCount = properties.length + agents.length + contacts.length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Trash</h1>
        <p className="text-sm text-gray-500 mt-0.5">{totalCount} items</p>
      </div>

      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <p className="text-center text-gray-400 py-12">Loading...</p>
        ) : (
          <>
            {tab === "properties" && (
              <TrashTable
                items={properties}
                columns={["Title", "Status", "Deleted"]}
                renderRow={(p) => [
                  p.title,
                  p.status,
                  new Date(p.updatedAt).toLocaleDateString(),
                ]}
                onRestore={(p) => handleRestore(p._id, "property")}
                onDelete={(p) => handleDelete(p._id, "property", p.title)}
                emptyMessage="No trashed properties."
              />
            )}
            {tab === "agents" && (
              <TrashTable
                items={agents}
                columns={["Name", "Email", "Deleted"]}
                renderRow={(a) => [
                  `${a.firstName} ${a.lastName}`,
                  a.email ?? "—",
                  new Date(a.updatedAt).toLocaleDateString(),
                ]}
                onRestore={(a) => handleRestore(a._id, "agent")}
                onDelete={(a) => handleDelete(a._id, "agent", `${a.firstName} ${a.lastName}`)}
                emptyMessage="No trashed agents."
              />
            )}
            {tab === "contacts" && (
              <TrashTable
                items={contacts}
                columns={["Name", "Subject", "Date"]}
                renderRow={(c) => [
                  c.name,
                  c.subject ?? c.email,
                  new Date(c.createdAt).toLocaleDateString(),
                ]}
                onRestore={(c) => handleRestore(c._id, "contact")}
                onDelete={(c) => handleDelete(c._id, "contact", c.name)}
                emptyMessage="No trashed contacts."
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TrashTable<T extends { _id: string }>({
  items,
  columns,
  renderRow,
  onRestore,
  onDelete,
  emptyMessage,
}: {
  items: T[];
  columns: string[];
  renderRow: (item: T) => string[];
  onRestore: (item: T) => void;
  onDelete: (item: T) => void;
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return <p className="text-center text-gray-400 py-12">{emptyMessage}</p>;
  }

  return (
    <table className="w-full text-sm text-left">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          {columns.map((col) => (
            <th key={col} className="px-4 py-3 font-medium text-gray-600">{col}</th>
          ))}
          <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {items.map((item) => {
          const cells = renderRow(item);
          return (
            <tr key={item._id} className="hover:bg-gray-50">
              {cells.map((cell, i) => (
                <td key={i} className="px-4 py-3 text-gray-700">{cell}</td>
              ))}
              <td className="px-4 py-3">
                <div className="flex gap-3">
                  <button
                    onClick={() => onRestore(item)}
                    className="text-blue-600 hover:underline text-xs"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    className="text-red-500 hover:underline text-xs"
                  >
                    Delete forever
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
