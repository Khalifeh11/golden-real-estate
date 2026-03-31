import { cache } from "react";
import dbConnect from "./mongodb";
import PropertyModel from "@/models/Property";
import AgentModel from "@/models/Agent";
import { propertySearchSchema } from "./validators";
import { toPropertyCardData, toPropertyListingCardData } from "./utils";
import type {
  Property,
  Agent,
  PaginatedResponse,
  PropertyListingCardData,
  PropertyCardData,
  FilterOptions,
} from "@/types";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function searchProperties(
  rawParams: Record<string, string | string[] | undefined>
): Promise<PaginatedResponse<PropertyListingCardData>> {
  const params = propertySearchSchema.parse(rawParams);

  await dbConnect();

  const filter: Record<string, unknown> = { status: "ACTIVE" };

  if (params.category) filter.category = params.category;
  if (params.propertyGroup) filter.propertyGroup = params.propertyGroup;
  if (params.propertyType) filter.propertyType = params.propertyType;
  if (params.country) filter.country = params.country;
  if (params.city) filter.city = params.city;
  if (params.district) filter.district = params.district;
  if (params.ref) filter.referenceNumber = params.ref;
  if (params.bedrooms) filter.bedrooms = { $gte: params.bedrooms };
  if (params.bathrooms) filter.bathrooms = { $gte: params.bathrooms };

  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    const priceFilter: Record<string, unknown> = { $ne: null };
    if (params.minPrice !== undefined) priceFilter.$gte = params.minPrice;
    if (params.maxPrice !== undefined) priceFilter.$lte = params.maxPrice;
    filter.price = priceFilter;
  }

  if (params.minArea !== undefined || params.maxArea !== undefined) {
    const areaFilter: Record<string, unknown> = { $ne: null };
    if (params.minArea !== undefined) areaFilter.$gte = params.minArea;
    if (params.maxArea !== undefined) areaFilter.$lte = params.maxArea;
    filter.areaSqm = areaFilter;
  }

  if (params.q) {
    filter.$or = [
      { title: { $regex: params.q, $options: "i" } },
      { description: { $regex: params.q, $options: "i" } },
    ];
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    area_desc: { areaSqm: -1 },
  };
  const sort = sortMap[params.sort ?? "newest"] ?? sortMap.newest;

  const skip = (params.page - 1) * params.limit;

  const [docs, total] = await Promise.all([
    PropertyModel.find(filter).sort(sort).skip(skip).limit(params.limit).lean(),
    PropertyModel.countDocuments(filter),
  ]);

  return {
    data: (docs as unknown as Property[]).map(toPropertyListingCardData),
    total,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(total / params.limit) || 1,
  };
}

export async function getFilterOptions(context?: {
  country?: string;
  city?: string;
}): Promise<FilterOptions> {
  await dbConnect();

  const activeFilter: Record<string, string> = { status: "ACTIVE" };
  const cityFilter = { ...activeFilter };
  const districtFilter = { ...activeFilter };

  if (context?.country) {
    cityFilter.country = context.country;
    districtFilter.country = context.country;
  }
  if (context?.city) {
    districtFilter.city = context.city;
  }

  const [countries, cities, districts, propertyTypes] = await Promise.all([
    PropertyModel.distinct("country", activeFilter),
    PropertyModel.distinct("city", cityFilter),
    PropertyModel.distinct("district", districtFilter),
    PropertyModel.distinct("propertyType", activeFilter),
  ]);

  return { countries, cities, districts, propertyTypes, features: [] };
}

// ---------------------------------------------------------------------------
// Property detail helpers
// ---------------------------------------------------------------------------

async function _getPropertyBySlug(slug: string): Promise<Property | null> {
  await dbConnect();
  const doc = await PropertyModel.findOne({ slug, status: "ACTIVE" }).lean();
  return (doc as unknown as Property) ?? null;
}

/** Request-level cached version — safe to call from generateMetadata + page */
export const getPropertyBySlug = cache(_getPropertyBySlug);

export async function getAgents(): Promise<Agent[]> {
  await dbConnect();
  const docs = await AgentModel.find({ trash: { $ne: true } }).lean();
  return docs as unknown as Agent[];
}

export async function getAgentById(agentId: string): Promise<Agent | null> {
  await dbConnect();
  const doc = await AgentModel.findById(agentId).lean();
  return (doc as unknown as Agent) ?? null;
}

export async function getSimilarProperties(
  property: Property,
  limit: number = 3,
): Promise<PropertyCardData[]> {
  await dbConnect();

  const baseFilter = { status: "ACTIVE", _id: { $ne: property._id } };
  const results: Property[] = [];

  // Step 1: same district + category
  if (property.district && property.category) {
    const docs = await PropertyModel.find({
      ...baseFilter,
      district: property.district,
      category: property.category,
    })
      .limit(limit)
      .lean();
    results.push(...(docs as unknown as Property[]));
  }

  // Step 2: fallback to same city + category
  if (results.length < limit && property.city && property.category) {
    const excludeIds = [property._id, ...results.map((p) => p._id)];
    const docs = await PropertyModel.find({
      ...baseFilter,
      _id: { $nin: excludeIds },
      city: property.city,
      category: property.category,
    })
      .limit(limit - results.length)
      .lean();
    results.push(...(docs as unknown as Property[]));
  }

  return results.slice(0, limit).map(toPropertyCardData);
}
