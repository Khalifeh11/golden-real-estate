import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1A2A35] w-full px-8 py-12 flex flex-col md:flex-row justify-between items-start text-sm leading-relaxed">
      {/* Brand */}
      <div className="max-w-xs mb-10 md:mb-0">
        <div className="text-2xl font-display font-bold text-white mb-2">
          Golden Land Real Estate
        </div>
        <p className="text-slate-300 opacity-80 mb-6">
          Your Golden opportunity in every move — trusted since 2010.
        </p>
        <p className="text-slate-300 opacity-80 text-xs">
          &copy; {new Date().getFullYear()} Golden Land Real Estate. All rights
          reserved.
        </p>
      </div>

      {/* Nav links */}
      <div className="grid grid-cols-2 gap-x-12 gap-y-4">
        <div className="flex flex-col gap-3">
          <span className="text-primary-container font-semibold uppercase tracking-widest text-[10px] mb-2">
            Navigation
          </span>
          <Link
            href="/"
            className="text-slate-300 hover:text-primary-container transition-colors opacity-80 hover:opacity-100"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="text-slate-300 hover:text-primary-container transition-colors opacity-80 hover:opacity-100"
          >
            About Us
          </Link>
          <Link
            href="/properties"
            className="text-slate-300 hover:text-primary-container transition-colors opacity-80 hover:opacity-100"
          >
            Properties
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          <span className="text-primary-container font-semibold uppercase tracking-widest text-[10px] mb-2">
            Connect
          </span>
          <Link
            href="/agents"
            className="text-slate-300 hover:text-primary-container transition-colors opacity-80 hover:opacity-100"
          >
            Agents
          </Link>
          <Link
            href="/contact"
            className="text-slate-300 hover:text-primary-container transition-colors opacity-80 hover:opacity-100"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
