/* eslint-disable @next/next/no-page-custom-font, @next/next/no-html-link-for-pages */
"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          background: "#FAFAF5",
          color: "#1A1C19",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 420, padding: "0 16px" }}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 72, color: "#BA1A1A", display: "block", marginBottom: 16 }}
          >
            error_outline
          </span>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#4E6071",
              marginBottom: 12,
            }}
          >
            Something Went Wrong
          </h1>
          <p style={{ color: "#4D4637", marginBottom: 8 }}>
            We&apos;re sorry, an unexpected error occurred.
          </p>
          {error.digest && (
            <p style={{ fontSize: 12, color: "#7E7665", marginBottom: 32 }}>
              Reference: {error.digest}
            </p>
          )}
          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: error.digest ? 0 : 32,
            }}
          >
            <button
              onClick={() => unstable_retry()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#C9A84C",
                color: "#503D00",
                padding: "12px 24px",
                borderRadius: 8,
                border: "none",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
              >
                refresh
              </span>
              Try Again
            </button>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid #7E7665",
                color: "#1A1C19",
                padding: "12px 24px",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
              >
                home
              </span>
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
