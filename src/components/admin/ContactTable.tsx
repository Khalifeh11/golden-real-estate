"use client";

import { useState } from "react";
import type { ContactRequest } from "@/types";

interface ContactTableProps {
  contacts: ContactRequest[];
  onMarkRead: (id: string, isRead: boolean) => Promise<void>;
  onMarkResponded: (id: string, isResponded: boolean) => Promise<void>;
}

export default function ContactTable({ contacts, onMarkRead, onMarkResponded }: ContactTableProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handle(id: string, fn: () => Promise<void>) {
    setLoadingId(id);
    await fn();
    setLoadingId(null);
  }

  return (
    <div className="divide-y divide-gray-100">
      {contacts.map((c) => (
        <div key={c._id} className={`p-4 ${!c.isRead ? "bg-blue-50" : "bg-white"}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-gray-900 text-sm">{c.name}</span>
                {!c.isRead && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                    New
                  </span>
                )}
                {c.isResponded && (
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                    Responded
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {c.email}{c.phone ? ` · ${c.phone}` : ""}
              </p>
              {c.subject && (
                <p className="text-sm text-gray-700 mt-1 font-medium">{c.subject}</p>
              )}
              {c.propertySlug && (
                <p className="text-xs text-gray-400 mt-0.5">Re: {c.propertySlug}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-400">
                {new Date(c.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => setExpanded(expanded === c._id ? null : c._id)}
                className="text-xs text-blue-600 hover:underline"
              >
                {expanded === c._id ? "Hide" : "View"}
              </button>
            </div>
          </div>

          {expanded === c._id && (
            <div className="mt-3 space-y-3">
              {c.message && (
                <p className="text-sm text-gray-700 bg-white rounded border border-gray-100 p-3">
                  {c.message}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  disabled={loadingId === c._id}
                  onClick={() => handle(c._id, () => onMarkRead(c._id, !c.isRead))}
                  className="text-xs px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                >
                  {c.isRead ? "Mark unread" : "Mark read"}
                </button>
                <button
                  disabled={loadingId === c._id}
                  onClick={() => handle(c._id, () => onMarkResponded(c._id, !c.isResponded))}
                  className="text-xs px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                >
                  {c.isResponded ? "Mark not responded" : "Mark responded"}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
      {contacts.length === 0 && (
        <p className="text-center text-gray-400 py-12">No contacts found.</p>
      )}
    </div>
  );
}
