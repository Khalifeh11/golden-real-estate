"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import PropertyTable from "@/components/admin/PropertyTable";
import type { Property } from "@/types";
import { useSession } from "next-auth/react";

export default function AdminPropertiesPage() {
  const { data: session } = useSession();
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const limit = 20;

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.set("q", search);
    if (status) params.set("status", status);

    const res = await fetch(`/api/properties?${params}`);
    const json = await res.json();
    setProperties(json.data ?? []);
    setTotal(json.total ?? 0);
    setLoading(false);
  }, [page, search, status]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  async function handleStatusChange(id: string, newStatus: string) {
    await fetch(`/api/properties/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setProperties((prev) =>
      prev.map((p) => (p._id === id ? { ...p, status: newStatus as Property["status"] } : p))
    );
  }

  async function handleFeatureToggle(id: string, isFeatured: boolean) {
    await fetch(`/api/properties/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured }),
    });
    setProperties((prev) =>
      prev.map((p) => (p._id === id ? { ...p, isFeatured } : p))
    );
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProperties((prev) => prev.filter((p) => p._id !== id));
      setTotal((t) => t - 1);
    }
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total</p>
        </div>
        <Link
          href="/admin/properties/new"
          className="bg-gray-900 text-white text-sm px-4 py-2 rounded hover:bg-gray-700 transition-colors"
        >
          + Add Property
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search properties..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded px-3 py-2 text-sm flex-1 max-w-xs focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <option value="">All statuses</option>
          {["ACTIVE", "PENDING", "SOLD", "UNDER_OFFER", "INACTIVE"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <p className="text-center text-gray-400 py-12">Loading...</p>
        ) : (
          <PropertyTable
            properties={properties}
            role={session?.user?.role ?? "AGENT"}
            onStatusChange={handleStatusChange}
            onFeatureToggle={handleFeatureToggle}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border rounded disabled:opacity-40 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
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
