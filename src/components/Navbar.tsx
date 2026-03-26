"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/properties", label: "Properties" },
  { href: "/agents", label: "Agents" },
  { href: "/contact", label: "Contact Us" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-[#3D4F5F] flex justify-between items-center w-full px-8 py-4 sticky top-0 z-50 shadow-lg">
      <Link
        href="/"
        className="text-xl font-bold text-white tracking-tighter font-display"
      >
        Golden Land Real Estate
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-8 font-display font-medium text-sm tracking-wide">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-white opacity-90 hover:opacity-100 transition-opacity hover:text-primary-container"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden text-primary-container"
        aria-label="Toggle navigation menu"
      >
        <span className="material-symbols-outlined">
          {mobileOpen ? "close" : "menu"}
        </span>
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#3D4F5F] shadow-lg md:hidden">
          <div className="flex flex-col px-8 py-4 gap-4 font-display font-medium text-sm tracking-wide">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-white opacity-90 hover:opacity-100 transition-opacity hover:text-primary-container py-2"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
