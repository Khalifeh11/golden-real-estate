"use client";

import { useEffect, useState, useCallback } from "react";
import ContactTable from "@/components/admin/ContactTable";
import type { ContactRequest } from "@/types";

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"" | "true" | "false">("");
  const [loading, setLoading] = useState(true);

  const limit = 20;

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filter !== "") params.set("isRead", filter);

    const res = await fetch(`/api/admin/contacts?${params}`);
    const json = await res.json();
    setContacts(json.data ?? []);
    setTotal(json.total ?? 0);
    setLoading(false);
  }, [page, filter]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  async function handleMarkRead(id: string, isRead: boolean) {
    await fetch(`/api/admin/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead }),
    });
    setContacts((prev) => prev.map((c) => (c._id === id ? { ...c, isRead } : c)));
  }

  async function handleMarkResponded(id: string, isResponded: boolean) {
    await fetch(`/api/admin/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isResponded }),
    });
    setContacts((prev) => prev.map((c) => (c._id === id ? { ...c, isResponded } : c)));
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Submissions</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total</p>
        </div>
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value as typeof filter); setPage(1); }}
          className="border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <option value="">All</option>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <p className="text-center text-gray-400 py-12">Loading...</p>
        ) : (
          <ContactTable
            contacts={contacts}
            onMarkRead={handleMarkRead}
            onMarkResponded={handleMarkResponded}
          />
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border rounded disabled:opacity-40 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm border rounded disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
