import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://goldenlandrealestate.net";

export const SITE_NAME = "Golden Land Real Estate";

/**
 * Baseline (non-progressive) 1200x630 JPEG under WhatsApp's ~300KB fetch limit.
 * Dimensions are declared so crawlers don't have to download the file to size it.
 */
export const OG_IMAGE = {
  url: "/og-default.jpg",
  width: 1200,
  height: 630,
  alt: SITE_NAME,
  type: "image/jpeg",
} as const;

/**
 * Next.js *replaces* the whole `openGraph` object when a page declares its own —
 * it does not merge with the layout's. Every page that sets `openGraph` must
 * spread these defaults, otherwise it silently ships without an og:image.
 */
export const OG_DEFAULTS = {
  siteName: SITE_NAME,
  type: "website",
  locale: "en_US",
  images: [OG_IMAGE],
} satisfies Metadata["openGraph"];
