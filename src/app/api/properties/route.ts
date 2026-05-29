import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect, { isDuplicateKeyError } from "@/lib/mongodb";
import Property from "@/models/Property";
import { propertyCreateSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";
import { buildSearchFilter } from "@/lib/search";
import { MIN_LISTING_DATE, OTHER_COUNTRY_VALUE, PRIMARY_COUNTRIES } from "@/lib/constants";

export async function GET(request: NextRequest) {
  await dbConnect();

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 24)));
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = { trash: { $ne: true } };

  const q = searchParams.get("q")?.trim();
  if (q) {
    const search = buildSearchFilter(q);
    if (search) Object.assign(filter, search);
  }

  const category = searchParams.get("category");
  if (category) filter.category = category;

  const propertyGroup = searchParams.get("propertyGroup");
  if (propertyGroup) filter.propertyGroup = propertyGroup;

  const propertyType = searchParams.get("propertyType");
  if (propertyType) filter.propertyType = propertyType;

  const country = searchParams.get("country");
  if (country === OTHER_COUNTRY_VALUE) {
    filter.country = { $exists: true, $nin: [...PRIMARY_COUNTRIES, null, ""] };
  } else if (country) {
    filter.country = country;
  }

  const city = searchParams.get("city");
  if (city) filter.city = city;

  const district = searchParams.get("district");
  if (district) filter.district = district;

  const session = await auth();
  const isAdmin = session?.user?.role && ["ADMIN", "AGENT"].includes(session.user.role);
  const status = searchParams.get("status");
  if (isAdmin && status) {
    filter.status = status;
  } else {
    filter.status = "ACTIVE";
  }

  const scopeParam = searchParams.get("scope");
  const scope = isAdmin && scopeParam && ["recent", "archived", "all"].includes(scopeParam)
    ? scopeParam
    : "recent";
  if (scope === "recent") {
    filter.createdAt = { $gte: MIN_LISTING_DATE };
  } else if (scope === "archived") {
    filter.createdAt = { $lt: MIN_LISTING_DATE };
  }

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

  const features = searchParams.getAll("features");
  if (features.length > 0) filter.features = { $all: features };

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

  // Reference numbers are entered manually and must be unique across listings
  const dup = await Property.findOne({
    referenceNumber: data.referenceNumber,
    trash: { $ne: true },
  }).lean();
  if (dup) {
    return NextResponse.json(
      { error: `Reference number "${data.referenceNumber}" is already in use.` },
      { status: 409 }
    );
  }

  // Ensure slug is unique
  const existing = await Property.findOne({ slug });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  try {
    const property = await Property.create({
      _id: crypto.randomUUID(),
      ...data,
      slug: finalSlug,
    });
    return NextResponse.json(property, { status: 201 });
  } catch (err) {
    // Backstop the findOne check above against the check-then-insert race:
    // the unique index rejects the second concurrent insert with code 11000.
    if (isDuplicateKeyError(err)) {
      return NextResponse.json(
        { error: `Reference number "${data.referenceNumber}" is already in use.` },
        { status: 409 }
      );
    }
    throw err;
  }
}
