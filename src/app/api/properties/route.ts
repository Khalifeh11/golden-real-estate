import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import { propertyCreateSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";

function generateReferenceNumber(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `GL-${num}`;
}

export async function GET(request: NextRequest) {
  await dbConnect();

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 24)));
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  const q = searchParams.get("q");
  if (q) filter.$text = { $search: q };

  const category = searchParams.get("category");
  if (category) filter.category = category;

  const propertyGroup = searchParams.get("propertyGroup");
  if (propertyGroup) filter.propertyGroup = propertyGroup;

  const propertyType = searchParams.get("propertyType");
  if (propertyType) filter.propertyType = propertyType;

  const country = searchParams.get("country");
  if (country) filter.country = country;

  const city = searchParams.get("city");
  if (city) filter.city = city;

  const status = searchParams.get("status");
  if (status) filter.status = status;

  const ref = searchParams.get("ref");
  if (ref) filter.referenceNumber = ref;

  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const minArea = searchParams.get("minArea");
  const maxArea = searchParams.get("maxArea");
  if (minArea || maxArea) {
    filter.areaSqm = {};
    if (minArea) filter.areaSqm.$gte = Number(minArea);
    if (maxArea) filter.areaSqm.$lte = Number(maxArea);
  }

  const bedrooms = searchParams.get("bedrooms");
  if (bedrooms) filter.bedrooms = { $gte: Number(bedrooms) };

  const bathrooms = searchParams.get("bathrooms");
  if (bathrooms) filter.bathrooms = { $gte: Number(bathrooms) };

  const sortParam = searchParams.get("sort") ?? "newest";
  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    area_desc: { areaSqm: -1 },
  };
  const sort = sortMap[sortParam] ?? sortMap.newest;

  const [data, total] = await Promise.all([
    Property.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Property.countDocuments(filter),
  ]);

  return NextResponse.json({
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.role || !["ADMIN", "AGENT"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = propertyCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await dbConnect();

  const data = parsed.data;
  const slug = slugify(data.title);
  const referenceNumber = generateReferenceNumber();

  // Ensure slug is unique
  const existing = await Property.findOne({ slug });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  const property = await Property.create({
    _id: crypto.randomUUID(),
    ...data,
    slug: finalSlug,
    referenceNumber,
    imageRefs: [],
  });

  return NextResponse.json(property, { status: 201 });
}
