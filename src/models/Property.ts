import mongoose, { Schema, Document } from "mongoose";
import { MIN_LISTING_DATE } from "@/lib/constants";

export interface IImage {
  url: string;
  thumbnailUrl: string;
  altText: string;
  order: number;
}

export interface IProperty extends Document<string> {
  _id: string;
  title: string;
  slug: string;
  referenceNumber?: string;
  description?: string;
  price?: number;
  currency: string;
  category?: string;
  rentPeriod?: string;
  propertyGroup?: string;
  propertyType?: string;
  status: string;
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
  images: IImage[];
  agentId?: string;
  trash: boolean;
  isFeatured: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema = new Schema<IImage>(
  {
    url: String,
    thumbnailUrl: String,
    altText: String,
    order: Number,
  },
  { _id: false }
);

const PropertySchema = new Schema<IProperty>(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    referenceNumber: { type: String },
    description: String,
    price: Number,
    currency: { type: String, default: "USD" },
    category: {
      type: String,
      enum: ["FOR_SALE", "FOR_RENT", null],
    },
    rentPeriod: {
      type: String,
      enum: ["MONTHLY", "YEARLY", null],
    },
    propertyGroup: {
      type: String,
      enum: ["RESIDENTIAL", "COMMERCIAL", "LAND", null],
    },
    propertyType: {
      type: String,
      enum: [
        "Apartment", "Duplex", "Villa", "Chalet", "Studio", "Penthouse",
        "Triplex", "House", "Office", "Warehouse", "Shop", "Showroom",
        "Clinic", "Hotel", "Industrial", "Building", "Land", "Farm", null,
      ],
    },
    status: {
      type: String,
      enum: ["ACTIVE", "PENDING", "SOLD", "UNDER_OFFER", "INACTIVE"],
      default: "ACTIVE",
    },
    country: String,
    city: String,
    district: String,
    latitude: Number,
    longitude: Number,
    bedrooms: Number,
    bathrooms: Number,
    parkings: Number,
    areaSqm: Number,
    yearBuilt: Number,
    commission: String,
    view: String,
    features: [String],
    images: [ImageSchema],
    agentId: { type: String, ref: "Agent" },
    trash: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Reference numbers are entered manually and must be unique — but only for the
// live catalog (listings created on/after MIN_LISTING_DATE). The pre-2022
// archive is full of duplicate documents left by the ApostropheCMS migration;
// a date-scoped partial index excludes them so the index can build, while still
// enforcing uniqueness on everything new. `$gte`/`$exists` are the operators
// MongoDB allows in partialFilterExpression (note: `$ne` is NOT allowed).
// NOTE: the cutoff date is baked into the index — if MIN_LISTING_DATE changes,
// this index must be rebuilt (e.g. via scripts that call syncIndexes()).
PropertySchema.index(
  { referenceNumber: 1 },
  {
    unique: true,
    partialFilterExpression: {
      createdAt: { $gte: MIN_LISTING_DATE },
      referenceNumber: { $exists: true },
    },
  }
);

// NOTE: the former `property_text_search` text index was removed when search
// moved to tokenized regex matching (see src/lib/search.ts). The index is now
// unused; drop it from the live DB via scripts/delete-deduplicate.ts (or a
// manual dropIndex("property_text_search")).

export default mongoose.models.Property ||
  mongoose.model<IProperty>("Property", PropertySchema);
