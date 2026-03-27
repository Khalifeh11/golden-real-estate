"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import UserTable from "@/components/admin/UserTable";
import type { User } from "@/types";

interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "AGENT";
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateUserForm>({ name: "", email: "", password: "", role: "AGENT" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  async function fetchUsers() {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const json = await res.json();
      setFormError(json.error?.formErrors?.[0] ?? json.error ?? "Failed to create user.");
      setSaving(false);
      return;
    }
    const created = await res.json();
    setUsers((prev) => [created, ...prev]);
    setCreating(false);
    setForm({ name: "", email: "", password: "", role: "AGENT" });
    setSaving(false);
  }

  async function handleRoleChange(id: string, role: "ADMIN" | "AGENT") {
    const res = await fetch(`/api/admin/users/${id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role } : u)));
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete user "${name}"?`)) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u._id !== id));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} total</p>
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="bg-gray-900 text-white text-sm px-4 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            + Add User
          </button>
        )}
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="bg-white rounded-lg border border-gray-200 p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-gray-900">New User</h2>
          {formError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{formError}</p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input
                required
                type="password"
                minLength={8}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as "ADMIN" | "AGENT" }))}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <option value="AGENT">AGENT</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="bg-gray-900 text-white px-5 py-2 rounded text-sm hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Creating..." : "Create User"}
            </button>
            <button
              type="button"
              onClick={() => { setCreating(false); setFormError(""); }}
              className="text-sm text-gray-500 hover:underline"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        {loading ? (
          <p className="text-center text-gray-400 py-12">Loading...</p>
        ) : (
          <UserTable
            users={users}
            currentUserId={session?.user?.id ?? ""}
            onRoleChange={handleRoleChange}
            onDelete={handleDelete}
          />
        )}
        {!loading && users.length === 0 && (
          <p className="text-center text-gray-400 py-12">No users found.</p>
        )}
      </div>
    </div>
  );
}
