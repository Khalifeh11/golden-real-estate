"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import type { Agent } from "@/types";

interface AgentFormProps {
  agent?: Agent;
  onSave: (data: Partial<Agent>) => Promise<void>;
  onCancel: () => void;
}

export default function AgentForm({ agent, onSave, onCancel }: AgentFormProps) {
  const [form, setForm] = useState({
    firstName: agent?.firstName ?? "",
    lastName: agent?.lastName ?? "",
    email: agent?.email ?? "",
    phone: agent?.phone ?? "",
    photoUrl: agent?.photoUrl ?? "",
    bio: agent?.bio ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const urlRes = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: [{ name: file.name, type: file.type, size: file.size }],
        }),
      });
      if (!urlRes.ok) {
        const body = await urlRes.json().catch(() => null);
        if (body?.error) throw new Error(body.error);
        if (urlRes.status === 401 || urlRes.status === 403) {
          throw new Error("Your session expired. Please sign in and try again.");
        }
        throw new Error("Upload failed. Please try again.");
      }
      const { uploads } = (await urlRes.json()) as {
        uploads: { key: string; uploadUrl: string; publicUrl: string }[];
      };
      const upload = uploads[0];

      const putRes = await fetch(upload.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) {
        throw new Error("Upload to storage failed. Please try again.");
      }

      set("photoUrl", upload.publicUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } catch {
      toast.error("Failed to save agent.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
          <input
            required
            value={form.firstName || ""}
            onChange={(e) => set("firstName", e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
          <input
            required
            value={form.lastName || ""}
            onChange={(e) => set("lastName", e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={form.email || ""}
            onChange={(e) => set("email", e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            value={form.phone || ""}
            onChange={(e) => set("phone", e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
        {form.photoUrl ? (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.photoUrl}
              alt="Agent photo"
              className="w-16 h-16 rounded-full object-cover border border-gray-200"
            />
            <div className="flex gap-2">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => set("photoUrl", "")}
                className="text-sm text-red-500 hover:text-red-700 underline"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg px-4 py-6 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
          >
            {uploading ? "Uploading..." : "Click to upload photo"}
          </button>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
        <textarea
          rows={3}
          value={form.bio || ""}
          onChange={(e) => set("bio", e.target.value)}
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y"
        />
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-gray-900 text-white px-5 py-2 rounded text-sm hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : agent ? "Update" : "Create Agent"}
        </button>
        <button type="button" onClick={onCancel} className="text-sm text-gray-500 hover:underline">
          Cancel
        </button>
      </div>
    </form>
  );
}
