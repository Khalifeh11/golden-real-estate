import type { Category, PropertyGroup, PropertyStatus, PropertyType } from "@/types";

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "FOR_SALE", label: "For Sale" },
  { value: "FOR_RENT", label: "For Rent" },
];

export const STATUSES: { value: PropertyStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "PENDING", label: "Pending" },
  { value: "SOLD", label: "Sold" },
  { value: "UNDER_OFFER", label: "Under Offer" },
  { value: "INACTIVE", label: "Inactive" },
];

export const PROPERTY_GROUPS: { value: PropertyGroup; label: string }[] = [
  { value: "RESIDENTIAL", label: "Residential" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "LAND", label: "Land" },
];

export const PROPERTY_TYPES: Record<PropertyGroup, { value: PropertyType; label: string }[]> = {
  RESIDENTIAL: [
    { value: "Apartment", label: "Apartment" },
    { value: "Duplex", label: "Duplex" },
    { value: "Villa", label: "Villa" },
    { value: "Chalet", label: "Chalet" },
    { value: "Studio", label: "Studio" },
    { value: "Penthouse", label: "Penthouse" },
    { value: "Triplex", label: "Triplex" },
    { value: "House", label: "House" },
  ],
  COMMERCIAL: [
    { value: "Office", label: "Office" },
    { value: "Warehouse", label: "Warehouse" },
    { value: "Shop", label: "Shop" },
    { value: "Showroom", label: "Showroom" },
    { value: "Clinic", label: "Clinic" },
    { value: "Hotel", label: "Hotel" },
    { value: "Industrial", label: "Industrial" },
    { value: "Building", label: "Building" },
  ],
  LAND: [
    { value: "Land", label: "Land" },
    { value: "Farm", label: "Farm" },
  ],
};

// All property types flattened
export const ALL_PROPERTY_TYPES = Object.values(PROPERTY_TYPES).flat();

// Countries from existing data
export const COUNTRIES = ["Lebanon", "Cyprus", "Greece"] as const;

export const CURRENCIES = ["USD", "EUR"] as const;

// Search/filter defaults
export const DEFAULT_PAGE_SIZE = 24;

// Slider ranges per category — derived from real listing data
export const SLIDER_CONFIG = {
  FOR_SALE: {
    price: { min: 0, max: 1_500_000, step: 10_000 },
    area: { min: 0, max: 1_000, step: 10 },
  },
  FOR_RENT: {
    price: { min: 0, max: 5_000, step: 50 },
    area: { min: 0, max: 500, step: 5 },
  },
} as const;

export const DEFAULT_SLIDER_CONFIG = SLIDER_CONFIG.FOR_SALE;

export function getSliderConfig(category: string | null) {
  if (category === "FOR_RENT") return SLIDER_CONFIG.FOR_RENT;
  if (category === "FOR_SALE") return SLIDER_CONFIG.FOR_SALE;
  return DEFAULT_SLIDER_CONFIG;
}

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "area_desc", label: "Area: Large to Small" },
] as const;
