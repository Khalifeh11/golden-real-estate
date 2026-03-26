// Shared TypeScript types — used by both Person A (public) and Person B (admin)
// These mirror Mongoose model interfaces but without the Document base class,
// making them safe to use in client components and API responses.

export type Category = "FOR_SALE" | "FOR_RENT";
export type PropertyGroup = "RESIDENTIAL" | "COMMERCIAL" | "LAND";
export type PropertyType =
  | "Apartment" | "Duplex" | "Villa" | "Chalet" | "Studio" | "Penthouse"
  | "Triplex" | "House" | "Office" | "Warehouse" | "Shop" | "Showroom"
  | "Clinic" | "Hotel" | "Industrial" | "Building" | "Land" | "Farm";
export type PropertyStatus = "ACTIVE" | "PENDING" | "SOLD" | "UNDER_OFFER" | "INACTIVE";
export type UserRole = "ADMIN" | "AGENT";
export type Currency = "USD" | "EUR";

export interface ImageRef {
  attachmentId: string;
  filename: string;
  extension: string;
  isThumbnail: boolean;
  order: number;
}

export interface PropertyImage {
  url: string;
  thumbnailUrl: string;
  altText: string;
  order: number;
}

export interface Property {
  _id: string;
  title: string;
  slug: string;
  referenceNumber?: string;
  description?: string;
  price?: number;
  currency: Currency;
  category?: Category;
  propertyGroup?: PropertyGroup;
  propertyType?: PropertyType;
  status: PropertyStatus;
  country?: string;
  city?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkings?: number;
  areaSqm?: number;
  yearBuilt?: number;
  commission?: string;
  view?: string;
  features: string[];
  imageRefs: ImageRef[];
  images: PropertyImage[];
  agentId?: string;
  isFeatured: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  bio?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface ContactRequest {
  _id: string;
  subject?: string;
  propertySlug?: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  isRead: boolean;
  isResponded: boolean;
  createdAt: string;
}

/** Minimum data needed to render a property card */
export type PropertyCardData = Pick<
  Property,
  "slug" | "title" | "price" | "currency" | "category" | "areaSqm" | "bedrooms" | "bathrooms" | "referenceNumber"
> & {
  /** Primary display image URL (resolved from images array or provided directly) */
  image: string;
};

/** Extended card data for the listing page — adds location, parkings, and features */
export type PropertyListingCardData = PropertyCardData & {
  country?: string;
  city?: string;
  district?: string;
  parkings?: number;
  features: string[];
};

/** Dynamic filter options returned from DB (or mock data) */
export interface FilterOptions {
  countries: string[];
  cities: string[];
  districts: string[];
  propertyTypes: string[];
  features: string[];
}

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PropertySearchParams {
  q?: string;
  category?: Category;
  propertyGroup?: PropertyGroup;
  propertyType?: PropertyType;
  country?: string;
  city?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  ref?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface LocationTree {
  country: string;
  cities: string[];
}
