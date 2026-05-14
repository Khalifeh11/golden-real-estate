"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import PropertyTable from "@/components/admin/PropertyTable";
import type { Property } from "@/types";
import { useSession } from "next-auth/react";
import { CATEGORIES, PROPERTY_GROUPS } from "@/lib/constants";

export default function AdminPropertiesPage() {
  const { data: session } = useSession();
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [propertyGroup, setPropertyGroup] = useState("");
  const [country, setCountry] = useState("");
  const [scope, setScope] = useState<"recent" | "archived" | "all">("recent");
  const [countries, setCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const limit = 20;

  // Fetch distinct countries for the dropdown
  useEffect(() => {
    fetch("/api/locations")
      .then((res) => res.json())
      .then((data) => setCountries(data.countries ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.set("q", search);
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    if (propertyGroup) params.set("propertyGroup", propertyGroup);
    if (country) params.set("country", country);
    if (scope !== "recent") params.set("scope", scope);

    fetch(`/api/properties?${params}`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) {
          setProperties(json.data ?? []);
          setTotal(json.total ?? 0);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [page, search, status, category, propertyGroup, country, scope]);

  async function handleStatusChange(id: string, newStatus: string) {
    const res = await fetch(`/api/properties/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setProperties((prev) =>
        prev.map((p) => (p._id === id ? { ...p, status: newStatus as Property["status"] } : p))
      );
      toast.success("Status updated");
    } else {
      toast.error("Failed to update status");
    }
  }

  async function handleFeatureToggle(id: string, isFeatured: boolean) {
    const res = await fetch(`/api/properties/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured }),
    });
    if (res.ok) {
      setProperties((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isFeatured } : p))
      );
      toast.success(isFeatured ? "Marked as featured" : "Removed from featured");
    } else {
      toast.error("Failed to update featured status");
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProperties((prev) => prev.filter((p) => p._id !== id));
      setTotal((t) => t - 1);
      toast.success("Property moved to trash");
    } else {
      toast.error("Failed to delete property");
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

      {/* Scope tabs */}
      <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 mb-4">
        {([
          { value: "recent", label: "Recent" },
          { value: "archived", label: "Archived" },
          { value: "all", label: "All" },
        ] as const).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => { setScope(opt.value); setPage(1); }}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
              scope === opt.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search properties..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded px-3 py-2 text-sm flex-1 min-w-[180px] max-w-xs focus:outline-none focus:ring-2 focus:ring-gray-300"
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
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select
          value={propertyGroup}
          onChange={(e) => { setPropertyGroup(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <option value="">All groups</option>
          {PROPERTY_GROUPS.map((g) => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
        <select
          value={country}
          onChange={(e) => { setCountry(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>{c}</option>
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
