"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import type { Property } from "@/types";

interface PropertyTableProps {
  properties: Property[];
  role: string;
  onStatusChange: (id: string, status: string) => Promise<void>;
  onFeatureToggle: (id: string, isFeatured: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  SOLD: "bg-purple-100 text-purple-700",
  UNDER_OFFER: "bg-blue-100 text-blue-700",
  INACTIVE: "bg-gray-100 text-gray-600",
};

export default function PropertyTable({
  properties,
  role,
  onStatusChange,
  onFeatureToggle,
  onDelete,
}: PropertyTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handle<T>(id: string, fn: () => Promise<T>) {
    setLoadingId(id);
    try {
      await fn();
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 border-y border-gray-200">
          <tr>
            <th className="px-4 py-3 font-medium text-gray-600">Property</th>
            <th className="px-4 py-3 font-medium text-gray-600">Ref</th>
            <th className="px-4 py-3 font-medium text-gray-600">Price</th>
            <th className="px-4 py-3 font-medium text-gray-600">Status</th>
            <th className="px-4 py-3 font-medium text-gray-600">Featured</th>
            <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {properties.map((p) => (
            <tr key={p._id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div>
                  <Link
                    href={`/properties/${p.slug}`}
                    target="_blank"
                    className="font-medium text-gray-900 hover:underline line-clamp-1 max-w-[260px] block"
                  >
                    {p.title}
                  </Link>
                  <span className="text-xs text-gray-400">
                    {p.propertyType} · {p.city ?? "—"}, {p.country ?? "—"}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                {p.referenceNumber ?? "—"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {p.price ? formatPrice(p.price, p.currency, p.category) : "—"}
              </td>
              <td className="px-4 py-3">
                <select
                  value={p.status}
                  disabled={loadingId === p._id}
                  onChange={(e) =>
                    handle(p._id, () => onStatusChange(p._id, e.target.value))
                  }
                  className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600"}`}
                >
                  {["ACTIVE", "PENDING", "SOLD", "UNDER_OFFER", "INACTIVE"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() =>
                    handle(p._id, () => onFeatureToggle(p._id, !p.isFeatured))
                  }
                  disabled={loadingId === p._id}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    p.isFeatured
                      ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  }`}
                >
                  {p.isFeatured ? "★ Featured" : "☆ Feature"}
                </button>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/properties/${p._id}/edit`}
                    className="text-blue-600 hover:underline text-xs"
                  >
                    Edit
                  </Link>
                  {role === "ADMIN" && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${p.title}"?`)) {
                          handle(p._id, () => onDelete(p._id));
                        }
                      }}
                      disabled={loadingId === p._id}
                      className="text-red-500 hover:underline text-xs disabled:opacity-40"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {properties.length === 0 && (
        <p className="text-center text-gray-400 py-12">No properties found.</p>
      )}
    </div>
  );
}
