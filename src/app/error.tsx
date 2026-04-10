"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex-1 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <span className="material-symbols-outlined text-7xl text-error mb-4 block">
          error_outline
        </span>
        <h1 className="font-display text-3xl font-bold text-secondary mb-3">
          Something Went Wrong
        </h1>
        <p className="text-on-surface-variant mb-2">
          We&apos;re sorry, an unexpected error occurred.
        </p>
        {error.digest && (
          <p className="text-xs text-outline mb-8">
            Reference: {error.digest}
          </p>
        )}
        {!error.digest && <div className="mb-8" />}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => unstable_retry()}
            className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-6 py-3 rounded-lg font-display font-bold hover:brightness-110 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-outline text-on-surface px-6 py-3 rounded-lg font-display font-bold hover:bg-surface-container transition-all"
          >
            <span className="material-symbols-outlined text-sm">home</span>
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
