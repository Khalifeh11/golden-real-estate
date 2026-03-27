"use client";

import { useState } from "react";
import type { User } from "@/types";

interface UserTableProps {
  users: User[];
  currentUserId: string;
  onRoleChange: (id: string, role: "ADMIN" | "AGENT") => Promise<void>;
  onDelete: (id: string, name: string) => Promise<void>;
}

export default function UserTable({ users, currentUserId, onRoleChange, onDelete }: UserTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handle(id: string, fn: () => Promise<void>) {
    setLoadingId(id);
    await fn();
    setLoadingId(null);
  }

  return (
    <table className="w-full text-sm text-left">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          <th className="px-4 py-3 font-medium text-gray-600">Name</th>
          <th className="px-4 py-3 font-medium text-gray-600">Email</th>
          <th className="px-4 py-3 font-medium text-gray-600">Role</th>
          <th className="px-4 py-3 font-medium text-gray-600">Joined</th>
          <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {users.map((u) => {
          const isSelf = u._id === currentUserId;
          return (
            <tr key={u._id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">
                {u.name}
                {isSelf && (
                  <span className="ml-2 text-xs text-gray-400">(you)</span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-600">{u.email}</td>
              <td className="px-4 py-3">
                <select
                  value={u.role}
                  disabled={isSelf || loadingId === u._id}
                  onChange={(e) =>
                    handle(u._id, () => onRoleChange(u._id, e.target.value as "ADMIN" | "AGENT"))
                  }
                  className="text-xs border border-gray-200 rounded px-2 py-1 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="AGENT">AGENT</option>
                </select>
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs">
                {new Date(u.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                {!isSelf && (
                  <button
                    disabled={loadingId === u._id}
                    onClick={() => handle(u._id, () => onDelete(u._id, u.name))}
                    className="text-red-500 hover:underline text-xs disabled:opacity-40"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
