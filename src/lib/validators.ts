import { z } from "zod";

// --- Public forms ---

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  propertySlug: z.string().optional(),
  subject: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// --- Auth ---

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// --- Property search (URL params) ---

export const propertySearchSchema = z.object({
  q: z.string().optional(),
  category: z.enum(["FOR_SALE", "FOR_RENT"]).optional(),
  propertyGroup: z.enum(["RESIDENTIAL", "COMMERCIAL", "LAND"]).optional(),
  propertyType: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minArea: z.coerce.number().min(0).optional(),
  maxArea: z.coerce.number().min(0).optional(),
  bedrooms: z.coerce.number().min(0).optional(),
  bathrooms: z.coerce.number().min(0).optional(),
  ref: z.string().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "area_desc"]).optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(24),
});

export type PropertySearchData = z.infer<typeof propertySearchSchema>;

// --- Property create/update (Person B will use these) ---

export const propertyCreateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive").optional(),
  currency: z.enum(["USD", "EUR"]).default("USD"),
  category: z.enum(["FOR_SALE", "FOR_RENT"]),
  propertyGroup: z.enum(["RESIDENTIAL", "COMMERCIAL", "LAND"]),
  propertyType: z.string().min(1, "Property type is required"),
  status: z.enum(["ACTIVE", "PENDING", "SOLD", "UNDER_OFFER", "INACTIVE"]).default("ACTIVE"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  district: z.string().optional(),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  parkings: z.number().min(0).optional(),
  areaSqm: z.number().min(0).optional(),
  yearBuilt: z.number().min(1800).max(new Date().getFullYear()).optional(),
  view: z.string().optional(),
  features: z.array(z.string()).default([]),
  agentId: z.string().optional(),
  isFeatured: z.boolean().default(false),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        thumbnailUrl: z.string().url(),
        altText: z.string().default(""),
        order: z.number().min(0),
      })
    )
    .default([]),
});

export type PropertyCreateData = z.infer<typeof propertyCreateSchema>;

export const propertyUpdateSchema = propertyCreateSchema.partial();

export type PropertyUpdateData = z.infer<typeof propertyUpdateSchema>;
