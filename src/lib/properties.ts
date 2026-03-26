import dbConnect from "./mongodb";
import PropertyModel from "@/models/Property";
import { propertySearchSchema } from "./validators";
import { toPropertyListingCardData } from "./utils";
import type {
  Property,
  PaginatedResponse,
  PropertyListingCardData,
  FilterOptions,
} from "@/types";

const USE_MOCK = !process.env.MONGODB_URI;

// ---------------------------------------------------------------------------
// Mock data — realistic properties matching the Stitch design
// ---------------------------------------------------------------------------

const MOCK_PROPERTIES: Property[] = [
  {
    _id: "mock-1",
    title: "Azure Sky Penthouse",
    slug: "azure-sky-penthouse",
    referenceNumber: "225520",
    description: "Breathtaking waterfront penthouse with panoramic sea views.",
    price: 2_450_000,
    currency: "USD",
    category: "FOR_SALE",
    propertyGroup: "RESIDENTIAL",
    propertyType: "Penthouse",
    status: "ACTIVE",
    country: "Lebanon",
    city: "Dbayeh",
    district: "Waterfront",
    bedrooms: 4,
    bathrooms: 5,
    parkings: 3,
    areaSqm: 420,
    features: ["Furnished", "Terrace", "Sea View"],
    imageRefs: [],
    images: [
      {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDl-1DeoHtzSJLWQI82GxPl_n_PqlsdXuYJqFSOA2nHEzjH0x1IALBVGp60jeOXJS00Y9nMHd37tAbvtvzWRt7dhRtUXxbSVUkYHV6qxkHcMoZRuIISTT1Nd2J-pZAlcSNFSCQ-SQa04huCk2-eCOPdiLtlffsd_eRCkJtR96Rb_QFepDCwktHu4t83nDwichpkRjuQGPeOeepttgkj_dbJzZ543juUf0jijEnhohd_RVsiAtlr9nc4dAf5jwdnLJCfyY78IMBaJ1r1",
        thumbnailUrl: "",
        altText: "Modern luxury villa with infinity pool and sunset",
        order: 0,
      },
    ],
    agentId: undefined,
    isFeatured: true,
    views: 0,
    createdAt: "2025-12-01T00:00:00Z",
    updatedAt: "2025-12-01T00:00:00Z",
  },
  {
    _id: "mock-2",
    title: "Urban Loft Retreat",
    slug: "urban-loft-retreat",
    referenceNumber: "226841",
    description: "Chic urban loft in the heart of Achrafieh.",
    price: 2_500,
    currency: "USD",
    category: "FOR_RENT",
    propertyGroup: "RESIDENTIAL",
    propertyType: "Apartment",
    status: "ACTIVE",
    country: "Lebanon",
    city: "Beirut",
    district: "Achrafieh",
    bedrooms: 2,
    bathrooms: 2,
    parkings: 1,
    areaSqm: 180,
    features: ["Concierge", "Balcony"],
    imageRefs: [],
    images: [
      {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0zDixarX0ORlhYypNO3_fuIdM0vEJ2hCoWpIdVl2ML5ZFkHWn0fgaivQOK9TbKGFSOYGfo0ezZkpABrGYeh4BxMwYXw44_hsz5-B_OvVJ-VGbsuqVhzyHEuBas3qJTXhPwCRrLXVkqmgCnDlJQQAen3HoIhPeF80PcPYNMDCcCuPrGgrE9Eqkh7mRYz2rLcJuD6M6LbOqAo_JaFuOy49HZxon8ecyWj7HQemu4WhA4gcAX73MdTHjNW4a0R5GCSGxWCE05rW9h0Og",
        thumbnailUrl: "",
        altText: "High-end apartment interior with floor-to-ceiling windows",
        order: 0,
      },
    ],
    agentId: undefined,
    isFeatured: false,
    views: 0,
    createdAt: "2025-11-15T00:00:00Z",
    updatedAt: "2025-11-15T00:00:00Z",
  },
  {
    _id: "mock-3",
    title: "Cycladic Pearl Villa",
    slug: "cycladic-pearl-villa",
    referenceNumber: "110943",
    description: "Traditional Cycladic villa with private pool in Oia.",
    price: 1_850_000,
    currency: "USD",
    category: "FOR_SALE",
    propertyGroup: "RESIDENTIAL",
    propertyType: "Villa",
    status: "ACTIVE",
    country: "Greece",
    city: "Santorini",
    district: "Oia",
    bedrooms: 3,
    bathrooms: 3,
    parkings: 1,
    areaSqm: 210,
    features: ["Historic", "Smart Home"],
    imageRefs: [],
    images: [
      {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSiPnggIlonLFA-4Njj0j49SjZSbGYPJvJLvXPr113Pfo309AwIp5Ihd5EXQ87b-76nLOlHF6I86LY6Fi8pJxeO1lLbfYPg4zcR_OIBajyZ61krx22X7M-WkhqrUkXrHJQal7niG1DaMzmyXlw98w_YxCBtimepStW3gSP8MSgDH8Keucs5zhEMiH1CiHE2iaMb2QeGT8qqWc-zZzWBiDwgzj4AzCt1IYOk01Xj6KiOguXOfT0gCCHvuFE0t3whJnJk8dlYaMoh9BT",
        thumbnailUrl: "",
        altText: "Traditional cycladic house in Santorini with blue accents",
        order: 0,
      },
    ],
    agentId: undefined,
    isFeatured: true,
    views: 0,
    createdAt: "2025-10-20T00:00:00Z",
    updatedAt: "2025-10-20T00:00:00Z",
  },
  {
    _id: "mock-4",
    title: "Limassol Marina Residence",
    slug: "limassol-marina-residence",
    referenceNumber: "229987",
    description: "Luxurious beachfront residence at Limassol Marina.",
    price: 3_200_000,
    currency: "USD",
    category: "FOR_SALE",
    propertyGroup: "RESIDENTIAL",
    propertyType: "Villa",
    status: "ACTIVE",
    country: "Cyprus",
    city: "Limassol",
    district: "Marina",
    bedrooms: 5,
    bathrooms: 6,
    parkings: 4,
    areaSqm: 550,
    features: ["Beach Front", "Garden"],
    imageRefs: [],
    images: [
      {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDuLNsI0UTdoFFFywdTjoAXw6-x8wGOtaZ98Kkhmp-bgJwDztO7m4ZAouMcguxgbqHUEIaM7qwzFG06UZMux3fbSES-mt86VmLDB0VWelASpbcSydDb0zYsN6nZFYLLhA509dD1qKym3rrsDaOvexDZCpJxmjgfbh_Apbq_CbURMmyQZh1O7uFfKd7tpboDQBS4A-E-xiCuQ7-LnZ2fGBtOaw5v1kPeyrZPjVa9PunB0ktQ7iPUbP54-8-cs9L0lS6HYebqnwfwtls0",
        thumbnailUrl: "",
        altText: "Coastal modern villa in Cyprus",
        order: 0,
      },
    ],
    agentId: undefined,
    isFeatured: false,
    views: 0,
    createdAt: "2025-09-10T00:00:00Z",
    updatedAt: "2025-09-10T00:00:00Z",
  },
  {
    _id: "mock-5",
    title: "The Legacy Manor",
    slug: "the-legacy-manor",
    referenceNumber: "225523",
    description: "Grand estate with lush gardens and classic architecture.",
    price: 5_750_000,
    currency: "USD",
    category: "FOR_SALE",
    propertyGroup: "RESIDENTIAL",
    propertyType: "House",
    status: "ACTIVE",
    country: "Lebanon",
    city: "Rabieh",
    district: "Metn",
    bedrooms: 6,
    bathrooms: 7,
    parkings: 5,
    areaSqm: 950,
    features: ["Garden", "Pool", "Storage"],
    imageRefs: [],
    images: [
      {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAftt3_sTDQOBFAN-JZb_GWPtKKoww84Y9yJgmcliduhiEohnyNySFAGk00rOghGDy1hB6suDATXk_V2x52GYpMRF0Qe42_SCfqi3KFpk2ZXM9BQQJMwYgvdL7eS3ytP0tprZvqhCCkzSqXIhxuStX6Hf_Pp_cAc7FbTXMteShlIUlXUCznFrwTWURqPVyoClGC7JH9nM6kCcbPfFkP8gDpTCsJFhinU6BtYFYjbZH4f5xnSMO07pGRTpuSDXPnAsG2rzlcEfkCpJLR",
        thumbnailUrl: "",
        altText: "Grand estate with lush gardens",
        order: 0,
      },
    ],
    agentId: undefined,
    isFeatured: true,
    views: 0,
    createdAt: "2025-08-05T00:00:00Z",
    updatedAt: "2025-08-05T00:00:00Z",
  },
  {
    _id: "mock-6",
    title: "Paphos Seaview Studio",
    slug: "paphos-seaview-studio",
    referenceNumber: "230112",
    description: "Compact studio with stunning Mediterranean views.",
    price: 1_200,
    currency: "EUR",
    category: "FOR_RENT",
    propertyGroup: "RESIDENTIAL",
    propertyType: "Studio",
    status: "ACTIVE",
    country: "Cyprus",
    city: "Paphos",
    district: "Kato Paphos",
    bedrooms: 0,
    bathrooms: 1,
    parkings: 1,
    areaSqm: 55,
    features: ["Sea View", "Furnished"],
    imageRefs: [],
    images: [
      {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqRRdkdKRwFcCN88n12vM1uLE1HSc5MAxTTCk6UYOuFXqRyViBx_dQaX_nExVpSV13dbSB5-AQuI-xF8Buoy8Yqhvaw85vGyCk2cwtgrvkpVyLuYy2Stjg8A-5xGCh6SQFNWOHpwtT8DT-IPPDs7w7nfcUgiQ619Fzx6Fc0nY3mBIzEaxyAUYAGcbqbRfZtj4M4dPIC5iQk6_KU4irye8W55sFxSMiAZH1ngRYrVv0oZRGxZmchgveTCIbEA4p8CqL9eg56cqGtMpq",
        thumbnailUrl: "",
        altText: "Studio apartment with sea view",
        order: 0,
      },
    ],
    agentId: undefined,
    isFeatured: false,
    views: 0,
    createdAt: "2025-07-22T00:00:00Z",
    updatedAt: "2025-07-22T00:00:00Z",
  },
  {
    _id: "mock-7",
    title: "Athens Central Office",
    slug: "athens-central-office",
    referenceNumber: "231450",
    description: "Modern office space in the commercial heart of Athens.",
    price: 4_800,
    currency: "EUR",
    category: "FOR_RENT",
    propertyGroup: "COMMERCIAL",
    propertyType: "Office",
    status: "ACTIVE",
    country: "Greece",
    city: "Athens",
    district: "Syntagma",
    bedrooms: 0,
    bathrooms: 2,
    parkings: 2,
    areaSqm: 320,
    features: ["Parking", "Storage", "Smart Home"],
    imageRefs: [],
    images: [
      {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDl-1DeoHtzSJLWQI82GxPl_n_PqlsdXuYJqFSOA2nHEzjH0x1IALBVGp60jeOXJS00Y9nMHd37tAbvtvzWRt7dhRtUXxbSVUkYHV6qxkHcMoZRuIISTT1Nd2J-pZAlcSNFSCQ-SQa04huCk2-eCOPdiLtlffsd_eRCkJtR96Rb_QFepDCwktHu4t83nDwichpkRjuQGPeOeepttgkj_dbJzZ543juUf0jijEnhohd_RVsiAtlr9nc4dAf5jwdnLJCfyY78IMBaJ1r1",
        thumbnailUrl: "",
        altText: "Modern office interior",
        order: 0,
      },
    ],
    agentId: undefined,
    isFeatured: false,
    views: 0,
    createdAt: "2025-06-15T00:00:00Z",
    updatedAt: "2025-06-15T00:00:00Z",
  },
  {
    _id: "mock-8",
    title: "Jounieh Heights Duplex",
    slug: "jounieh-heights-duplex",
    referenceNumber: "228001",
    description: "Spacious duplex overlooking the Bay of Jounieh.",
    price: 780_000,
    currency: "USD",
    category: "FOR_SALE",
    propertyGroup: "RESIDENTIAL",
    propertyType: "Duplex",
    status: "ACTIVE",
    country: "Lebanon",
    city: "Jounieh",
    district: "Keserwan",
    bedrooms: 3,
    bathrooms: 3,
    parkings: 2,
    areaSqm: 280,
    features: ["Terrace", "Pool", "Sea View"],
    imageRefs: [],
    images: [
      {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0zDixarX0ORlhYypNO3_fuIdM0vEJ2hCoWpIdVl2ML5ZFkHWn0fgaivQOK9TbKGFSOYGfo0ezZkpABrGYeh4BxMwYXw44_hsz5-B_OvVJ-VGbsuqVhzyHEuBas3qJTXhPwCRrLXVkqmgCnDlJQQAen3HoIhPeF80PcPYNMDCcCuPrGgrE9Eqkh7mRYz2rLcJuD6M6LbOqAo_JaFuOy49HZxon8ecyWj7HQemu4WhA4gcAX73MdTHjNW4a0R5GCSGxWCE05rW9h0Og",
        thumbnailUrl: "",
        altText: "Duplex apartment with bay view",
        order: 0,
      },
    ],
    agentId: undefined,
    isFeatured: false,
    views: 0,
    createdAt: "2025-05-30T00:00:00Z",
    updatedAt: "2025-05-30T00:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// Mock search helpers
// ---------------------------------------------------------------------------

function searchMock(
  params: ReturnType<typeof propertySearchSchema.parse>
): PaginatedResponse<PropertyListingCardData> {
  let results = MOCK_PROPERTIES.filter((p) => p.status === "ACTIVE");

  if (params.category) results = results.filter((p) => p.category === params.category);
  if (params.propertyGroup) results = results.filter((p) => p.propertyGroup === params.propertyGroup);
  if (params.propertyType) results = results.filter((p) => p.propertyType === params.propertyType);
  if (params.country) results = results.filter((p) => p.country === params.country);
  if (params.city) results = results.filter((p) => p.city === params.city);
  if (params.district) results = results.filter((p) => p.district === params.district);
  if (params.ref) results = results.filter((p) => p.referenceNumber === params.ref);
  if (params.minPrice !== undefined) results = results.filter((p) => p.price != null && p.price >= params.minPrice!);
  if (params.maxPrice !== undefined) results = results.filter((p) => p.price != null && p.price <= params.maxPrice!);
  if (params.minArea !== undefined) results = results.filter((p) => p.areaSqm != null && p.areaSqm >= params.minArea!);
  if (params.maxArea !== undefined) results = results.filter((p) => p.areaSqm != null && p.areaSqm <= params.maxArea!);
  if (params.bedrooms) results = results.filter((p) => (p.bedrooms ?? 0) >= params.bedrooms!);
  if (params.bathrooms) results = results.filter((p) => (p.bathrooms ?? 0) >= params.bathrooms!);
  if (params.q) {
    const q = params.q.toLowerCase();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q)
    );
  }
  // Sort
  const sortFns: Record<string, (a: Property, b: Property) => number> = {
    newest: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    price_asc: (a, b) => (a.price ?? 0) - (b.price ?? 0),
    price_desc: (a, b) => (b.price ?? 0) - (a.price ?? 0),
    area_desc: (a, b) => (b.areaSqm ?? 0) - (a.areaSqm ?? 0),
  };
  results.sort(sortFns[params.sort ?? "newest"] ?? sortFns.newest);

  // Paginate
  const total = results.length;
  const start = (params.page - 1) * params.limit;
  const paged = results.slice(start, start + params.limit);

  return {
    data: paged.map(toPropertyListingCardData),
    total,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(total / params.limit) || 1,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function searchProperties(
  rawParams: Record<string, string | string[] | undefined>
): Promise<PaginatedResponse<PropertyListingCardData>> {
  const params = propertySearchSchema.parse(rawParams);

  if (USE_MOCK) return searchMock(params);

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
  if (USE_MOCK) {
    let filtered = MOCK_PROPERTIES.filter((p) => p.status === "ACTIVE");
    if (context?.country) filtered = filtered.filter((p) => p.country === context.country);
    const forDistricts = context?.city ? filtered.filter((p) => p.city === context.city) : filtered;
    return {
      countries: [...new Set(MOCK_PROPERTIES.map((p) => p.country).filter(Boolean))] as string[],
      cities: [...new Set(filtered.map((p) => p.city).filter(Boolean))] as string[],
      districts: [...new Set(forDistricts.map((p) => p.district).filter(Boolean))] as string[],
      propertyTypes: [...new Set(MOCK_PROPERTIES.map((p) => p.propertyType).filter(Boolean))] as string[],
      features: [],
    };
  }

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
