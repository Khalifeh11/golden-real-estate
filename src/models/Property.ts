import mongoose, { Schema, Document } from "mongoose";

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
    referenceNumber: { type: String, sparse: true },
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

PropertySchema.index(
  {
    title: "text",
    propertyType: "text",
    city: "text",
    district: "text",
    features: "text",
    country: "text",
    description: "text",
  },
  {
    weights: {
      title: 10,
      propertyType: 8,
      city: 6,
      district: 5,
      features: 4,
      country: 3,
      description: 1,
    },
    name: "property_text_search",
  }
);

export default mongoose.models.Property ||
  mongoose.model<IProperty>("Property", PropertySchema);
