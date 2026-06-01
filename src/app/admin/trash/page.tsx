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

const TAB_TYPE: Record<Tab, string> = {
  properties: "property",
  agents: "agent",
  contacts: "contact",
};

export default function AdminTrashPage() {
  const [tab, setTab] = useState<Tab>("properties");
  const [properties, setProperties] = useState<TrashedProperty[]>([]);
  const [agents, setAgents] = useState<TrashedAgent[]>([]);
  const [contacts, setContacts] = useState<TrashedContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());

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

  // Selection is per-tab — reset it whenever the active tab changes.
  function selectTab(next: Tab) {
    setTab(next);
    setSelected(new Set());
  }

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

  function clearTab(type: string) {
    if (type === "property") setProperties([]);
    if (type === "agent") setAgents([]);
    if (type === "contact") setContacts([]);
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll(ids: string[], checked: boolean) {
    setSelected(checked ? new Set(ids) : new Set());
  }

  async function handleBulkDelete(type: string) {
    if (selected.size === 0) return;
    const ids = [...selected];
    if (!confirm(`Permanently delete ${ids.length} item(s)? This cannot be undone.`)) return;
    const res = await fetch("/api/admin/trash/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, ids }),
    });
    if (res.ok) {
      ids.forEach((id) => removeItem(id, type));
      setSelected(new Set());
      toast.success(`${ids.length} item(s) permanently deleted`);
    } else {
      toast.error("Failed to delete items");
    }
  }

  async function handleEmptyTrash(type: string, count: number) {
    if (count === 0) return;
    if (!confirm(`Permanently delete all ${count} item(s) in this tab? This cannot be undone.`)) return;
    const res = await fetch("/api/admin/trash/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, all: true }),
    });
    if (res.ok) {
      clearTab(type);
      setSelected(new Set());
      toast.success("Trash emptied");
    } else {
      toast.error("Failed to empty trash");
    }
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
            onClick={() => selectTab(t.key)}
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

      {!loading && (
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => handleBulkDelete(TAB_TYPE[tab])}
            disabled={selected.size === 0}
            className="text-xs font-medium px-3 py-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Delete {selected.size} selected
          </button>
          <button
            onClick={() => handleEmptyTrash(TAB_TYPE[tab], tabs.find((t) => t.key === tab)?.count ?? 0)}
            disabled={(tabs.find((t) => t.key === tab)?.count ?? 0) === 0}
            className="text-xs font-medium px-3 py-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Empty trash
          </button>
        </div>
      )}

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
                selected={selected}
                onToggle={toggle}
                onToggleAll={(checked) => toggleAll(properties.map((p) => p._id), checked)}
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
                selected={selected}
                onToggle={toggle}
                onToggleAll={(checked) => toggleAll(agents.map((a) => a._id), checked)}
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
                selected={selected}
                onToggle={toggle}
                onToggleAll={(checked) => toggleAll(contacts.map((c) => c._id), checked)}
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
  selected,
  onToggle,
  onToggleAll,
  emptyMessage,
}: {
  items: T[];
  columns: string[];
  renderRow: (item: T) => string[];
  onRestore: (item: T) => void;
  onDelete: (item: T) => void;
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return <p className="text-center text-gray-400 py-12">{emptyMessage}</p>;
  }

  const allSelected = items.every((item) => selected.has(item._id));

  return (
    <table className="w-full text-sm text-left">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          <th className="px-4 py-3 w-10">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => onToggleAll(e.target.checked)}
              aria-label="Select all"
            />
          </th>
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
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.has(item._id)}
                  onChange={() => onToggle(item._id)}
                  aria-label="Select row"
                />
              </td>
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
