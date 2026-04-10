import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AgentNotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <span className="material-symbols-outlined text-7xl text-outline mb-4 block">
            person_off
          </span>
          <h1 className="font-display text-3xl font-bold text-secondary mb-3">
            Agent Not Found
          </h1>
          <p className="text-on-surface-variant mb-8">
            This advisor profile may have been removed or is no longer
            available.
          </p>
          <Link
            href="/agents"
            className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-6 py-3 rounded-lg font-display font-bold hover:brightness-110 transition-all"
          >
            <span className="material-symbols-outlined text-sm">
              arrow_back
            </span>
            Meet Our Advisors
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
