import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Property, PropertyCardData } from "@/types";

/** Tailwind class merge — combines clsx + tailwind-merge */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format price with currency symbol and commas: 1250000 → "$1,250,000" */
export function formatPrice(price: number, currency: string = "USD", category?: string): string {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
  return category === "FOR_RENT" ? `${formatted} / mo` : formatted;
}

/** Slugify text: "Modern Penthouse in Achrafieh" → "modern-penthouse-in-achrafieh" */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

/** Format area with unit: 350 → "350 sqm" */
export function formatArea(areaSqm: number): string {
  return `${areaSqm.toLocaleString("en-US")} sqm`;
}

/** Full agent name from first + last */
export function agentFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

/** Category label: "FOR_SALE" → "For Sale" */
export function categoryLabel(category: string): string {
  return category
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

/** Map a full Property (DB shape) to the minimal data a PropertyCard needs */
export function toPropertyCardData(property: Property): PropertyCardData {
  const primaryImage = [...property.images]
    .sort((a, b) => a.order - b.order)[0];
  return {
    slug: property.slug,
    title: property.title,
    price: property.price,
    currency: property.currency,
    category: property.category,
    areaSqm: property.areaSqm,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    referenceNumber: property.referenceNumber,
    image: primaryImage?.url ?? "/placeholder-property.svg",
  };
}
