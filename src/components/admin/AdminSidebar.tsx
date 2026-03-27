"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Overview", icon: "⊞", exact: true },
  { href: "/admin/properties", label: "Properties", icon: "🏠" },
  { href: "/admin/agents", label: "Agents", icon: "👤", adminOnly: true },
  { href: "/admin/contacts", label: "Contacts", icon: "✉" },
  { href: "/admin/users", label: "Users", icon: "👥", adminOnly: true },
];

interface AdminSidebarProps {
  role: string;
  userName: string;
}

export default function AdminSidebar({ role, userName }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="px-4 py-5 border-b border-gray-700">
        <p className="text-xs text-gray-400 uppercase tracking-wider">Golden Land</p>
        <p className="font-semibold text-sm mt-0.5 truncate">{userName}</p>
        <span className="inline-block text-xs bg-gray-700 text-gray-300 rounded px-1.5 py-0.5 mt-1">
          {role}
        </span>
      </div>

      <nav className="flex-1 py-4 space-y-0.5 px-2">
        {navItems
          .filter((item) => !item.adminOnly || role === "ADMIN")
          .map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors",
                  active
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
      </nav>

      <div className="px-2 py-4 border-t border-gray-700">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3 py-2 rounded text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <span className="text-base leading-none">←</span>
          Back to site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors mt-0.5"
        >
          <span className="text-base leading-none">⏻</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}
