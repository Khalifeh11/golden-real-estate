import Link from "next/link";

export default function PropertyNotFound() {
  return (
    <main className="flex-1 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <span className="material-symbols-outlined text-7xl text-outline mb-4 block">
          home_work
        </span>
        <h1 className="font-display text-3xl font-bold text-secondary mb-3">
          Property Not Found
        </h1>
        <p className="text-on-surface-variant mb-8">
          The property you&apos;re looking for may have been removed or is no longer available.
        </p>
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-6 py-3 rounded-lg font-display font-bold hover:brightness-110 transition-all"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Browse Properties
        </Link>
      </div>
    </main>
  );
}
