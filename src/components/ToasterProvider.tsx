"use client";

import { Toaster } from "sonner";

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "var(--surface-container-lowest)",
          border: "1px solid var(--outline-variant)",
          color: "var(--on-surface)",
        },
      }}
    />
  );
}
