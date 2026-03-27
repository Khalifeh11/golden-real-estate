"use client";

import { useEffect, useState } from "react";
import AgentForm from "@/components/admin/AgentForm";
import type { Agent } from "@/types";

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Agent | null>(null);
  const [creating, setCreating] = useState(false);

  async function fetchAgents() {
    const res = await fetch("/api/agents");
    const data = await res.json();
    setAgents(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchAgents();
  }, []);

  async function handleCreate(data: Partial<Agent>) {
    const res = await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed");
    const created = await res.json();
    setAgents((prev) => [created, ...prev]);
    setCreating(false);
  }

  async function handleUpdate(data: Partial<Agent>) {
    if (!editing) return;
    const res = await fetch(`/api/agents/${editing._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed");
    const updated = await res.json();
    setAgents((prev) => prev.map((a) => (a._id === updated._id ? updated : a)));
    setEditing(null);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete agent "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/agents/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAgents((prev) => prev.filter((a) => a._id !== id));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
          <p className="text-sm text-gray-500 mt-0.5">{agents.length} total</p>
        </div>
        {!creating && !editing && (
          <button
            onClick={() => setCreating(true)}
            className="bg-gray-900 text-white text-sm px-4 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            + Add Agent
          </button>
        )}
      </div>

      {(creating || editing) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            {editing ? `Edit ${editing.firstName} ${editing.lastName}` : "New Agent"}
          </h2>
          <AgentForm
            agent={editing ?? undefined}
            onSave={editing ? handleUpdate : handleCreate}
            onCancel={() => {
              setEditing(null);
              setCreating(false);
            }}
          />
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <p className="text-center text-gray-400 py-12">Loading...</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="px-4 py-3 font-medium text-gray-600">Phone</th>
                <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {agents.map((a) => (
                <tr key={a._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {a.firstName} {a.lastName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{a.email ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{a.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setEditing(a); setCreating(false); }}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(a._id, `${a.firstName} ${a.lastName}`)}
                        className="text-red-500 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && agents.length === 0 && (
          <p className="text-center text-gray-400 py-12">No agents yet.</p>
        )}
      </div>
    </div>
  );
}
