import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <span className="material-symbols-outlined text-7xl text-outline mb-4 block">
            explore_off
          </span>
          <h1 className="font-display text-3xl font-bold text-secondary mb-3">
            Page Not Found
          </h1>
          <p className="text-on-surface-variant mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-6 py-3 rounded-lg font-display font-bold hover:brightness-110 transition-all"
            >
              <span className="material-symbols-outlined text-sm">home</span>
              Back to Home
            </Link>
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 border border-outline text-on-surface px-6 py-3 rounded-lg font-display font-bold hover:bg-surface-container transition-all"
            >
              <span className="material-symbols-outlined text-sm">search</span>
              Browse Properties
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
