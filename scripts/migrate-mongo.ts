/**
 * Migration script: ApostropheCMS aposDocs → clean separate collections
 *
 * Run: npx tsx scripts/migrate-mongo.ts
 *
 * Idempotent — drops target collections on each run. Never modifies source collections.
 */

import mongoose from "mongoose";

const MONGODB_URI = "mongodb://localhost:27017/goldenland-real-estate";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ImageLookup {
  attachmentId: string;
  filename: string;
  extension: string;
}

interface ImageRef {
  attachmentId: string;
  filename: string;
  extension: string;
  isThumbnail: boolean;
  order: number;
}

// ---------------------------------------------------------------------------
// Property type classification
// ---------------------------------------------------------------------------

const PROPERTY_TYPE_RULES: {
  keywords: RegExp;
  propertyType: string;
  propertyGroup: string;
}[] = [
  { keywords: /\bapartment|simplex\b/i, propertyType: "Apartment", propertyGroup: "RESIDENTIAL" },
  { keywords: /\bduplex\b/i, propertyType: "Duplex", propertyGroup: "RESIDENTIAL" },
  { keywords: /\bvilla\b/i, propertyType: "Villa", propertyGroup: "RESIDENTIAL" },
  { keywords: /\bchalet\b/i, propertyType: "Chalet", propertyGroup: "RESIDENTIAL" },
  { keywords: /\bstudio\b/i, propertyType: "Studio", propertyGroup: "RESIDENTIAL" },
  { keywords: /\bpenthouse\b/i, propertyType: "Penthouse", propertyGroup: "RESIDENTIAL" },
  { keywords: /\btriplex\b/i, propertyType: "Triplex", propertyGroup: "RESIDENTIAL" },
  { keywords: /\bhouse\b/i, propertyType: "House", propertyGroup: "RESIDENTIAL" },
  { keywords: /\boffice|open\s*space\b/i, propertyType: "Office", propertyGroup: "COMMERCIAL" },
  { keywords: /\bwarehouse\b/i, propertyType: "Warehouse", propertyGroup: "COMMERCIAL" },
  { keywords: /\bshop|store\b/i, propertyType: "Shop", propertyGroup: "COMMERCIAL" },
  { keywords: /\bshowroom\b/i, propertyType: "Showroom", propertyGroup: "COMMERCIAL" },
  { keywords: /\bclinic\b/i, propertyType: "Clinic", propertyGroup: "COMMERCIAL" },
  { keywords: /\bhotel\b/i, propertyType: "Hotel", propertyGroup: "COMMERCIAL" },
  { keywords: /\bindustrial\b/i, propertyType: "Industrial", propertyGroup: "COMMERCIAL" },
  { keywords: /\bbuilding\b/i, propertyType: "Building", propertyGroup: "COMMERCIAL" },
  { keywords: /\bland\b/i, propertyType: "Land", propertyGroup: "LAND" },
  { keywords: /\bfarm\b/i, propertyType: "Farm", propertyGroup: "LAND" },
];

function classifyPropertyType(title: string): { propertyType: string | null; propertyGroup: string | null } {
  for (const rule of PROPERTY_TYPE_RULES) {
    if (rule.keywords.test(title)) {
      return { propertyType: rule.propertyType, propertyGroup: rule.propertyGroup };
    }
  }
  return { propertyType: null, propertyGroup: null };
}

// ---------------------------------------------------------------------------
// Country normalization
// ---------------------------------------------------------------------------

const COUNTRY_MAP: Record<string, string> = {
  "lebanon": "Lebanon",
  "cyprus": "Cyprus",
  "greece": "Greece",
  "montenegro": "Montenegro",
  "portugal": "Portugal",
  "spain": "Spain",
  "united-states": "United States",
};

function normalizeCountry(raw: string | null | undefined): string | null {
  if (!raw || raw === "None") return null;
  const lower = raw.toLowerCase().trim();
  if (!lower) return null;
  return COUNTRY_MAP[lower] ?? raw; // Already correct casing (e.g. "Lebanon")
}

// ---------------------------------------------------------------------------
// Category + status derivation
// ---------------------------------------------------------------------------

function deriveStatus(oldStatus: string | null | undefined, trash: boolean): { category: string | null; status: string } {
  if (trash) {
    // Derive category from old status even for trashed, but override status
    const cat = deriveCategoryOnly(oldStatus);
    return { category: cat, status: "INACTIVE" };
  }

  switch (oldStatus) {
    case "forSale":
      return { category: "FOR_SALE", status: "ACTIVE" };
    case "forRent":
      return { category: "FOR_RENT", status: "ACTIVE" };
    case "sold":
      return { category: "FOR_SALE", status: "SOLD" };
    case "underOffer":
      return { category: "FOR_SALE", status: "UNDER_OFFER" };
    default:
      return { category: null, status: "INACTIVE" };
  }
}

function deriveCategoryOnly(oldStatus: string | null | undefined): string | null {
  switch (oldStatus) {
    case "forSale":
    case "sold":
    case "underOffer":
      return "FOR_SALE";
    case "forRent":
      return "FOR_RENT";
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Numeric extraction
// ---------------------------------------------------------------------------

function extractNumber(val: unknown): number | undefined {
  if (val === null || val === undefined || val === "") return undefined;
  if (typeof val === "number") return val;
  if (typeof val === "object" && val !== null && "$numberInt" in val) {
    return parseInt((val as { $numberInt: string }).$numberInt, 10);
  }
  const n = Number(val);
  return isNaN(n) ? undefined : n;
}

function extractFloat(val: unknown): number | undefined {
  if (val === null || val === undefined || val === "") return undefined;
  if (typeof val === "number") return val;
  const n = parseFloat(String(val));
  return isNaN(n) ? undefined : n;
}

// ---------------------------------------------------------------------------
// Description extraction
// ---------------------------------------------------------------------------

function extractDescription(descArea: unknown): string | undefined {
  if (!descArea || typeof descArea !== "object") return undefined;
  const area = descArea as { items?: Array<{ type?: string; content?: string }> };
  if (!area.items || !Array.isArray(area.items)) return undefined;

  const htmlParts = area.items
    .filter((item) => item.type === "apostrophe-rich-text" && item.content)
    .map((item) => item.content!.trim());

  const html = htmlParts.join("\n");
  return html || undefined;
}

// ---------------------------------------------------------------------------
// Image reference resolution
// ---------------------------------------------------------------------------

function resolveImageRefs(
  doc: Record<string, unknown>,
  imageLookup: Map<string, ImageLookup>
): ImageRef[] {
  const refs: ImageRef[] = [];
  let order = 0;

  // Thumbnail
  const thumbnail = doc.thumbnail as { items?: Array<{ pieceIds?: string[] }> } | undefined;
  if (thumbnail?.items?.[0]?.pieceIds) {
    for (const pieceId of thumbnail.items[0].pieceIds) {
      const img = imageLookup.get(pieceId);
      if (img) {
        refs.push({ ...img, isThumbnail: order === 0, order });
        order++;
      }
    }
  }

  // Gallery / images area
  const images = doc.images as { items?: Array<{ pieceIds?: string[] }> } | undefined;
  if (images?.items) {
    for (const item of images.items) {
      if (item.pieceIds) {
        for (const pieceId of item.pieceIds) {
          // Skip if already added from thumbnail
          if (refs.some((r) => r.attachmentId === imageLookup.get(pieceId)?.attachmentId)) continue;
          const img = imageLookup.get(pieceId);
          if (img) {
            refs.push({ ...img, isThumbnail: false, order });
            order++;
          }
        }
      }
    }
  }

  return refs;
}

// ---------------------------------------------------------------------------
// Main migration
// ---------------------------------------------------------------------------

async function main() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db!;

  // -----------------------------------------------------------------------
  // Phase A: Build image lookup map
  // -----------------------------------------------------------------------
  console.log("\n--- Phase A: Building image lookup map ---");
  const aposDocs = db.collection("aposDocs");

  const imageDocs = await aposDocs
    .find({ type: "apostrophe-image" })
    .project({ _id: 1, attachment: 1 })
    .toArray();

  const imageLookup = new Map<string, ImageLookup>();
  let orphanCount = 0;

  for (const doc of imageDocs) {
    if (!doc.attachment || !doc.attachment._id) {
      orphanCount++;
      continue;
    }
    imageLookup.set(doc._id as string, {
      attachmentId: doc.attachment._id,
      filename: doc.attachment.name,
      extension: doc.attachment.extension,
    });
  }

  console.log(`  Image docs total: ${imageDocs.length}`);
  console.log(`  Mapped: ${imageLookup.size}`);
  console.log(`  Orphans (no attachment): ${orphanCount}`);

  // -----------------------------------------------------------------------
  // Phase B: Agent migration
  // -----------------------------------------------------------------------
  console.log("\n--- Phase B: Agent migration ---");

  // Drop target collection
  try {
    await db.collection("agents").drop();
  } catch {
    // Collection doesn't exist yet
  }

  const agentDocs = await aposDocs.find({ type: "agent" }).toArray();
  console.log(`  Source agent docs: ${agentDocs.length}`);

  const agents = agentDocs.map((doc) => ({
    _id: doc._id,
    firstName: doc.firstName || "",
    lastName: doc.lastName || "",
    email: doc.email || undefined,
    phone: doc.phoneNumber || undefined, // Rename: phoneNumber → phone
    bio: doc.brief || undefined, // Rename: brief → bio
    photoUrl: undefined, // Will be populated after R2 upload
    createdAt: doc.createdAt || new Date(),
    updatedAt: doc.updatedAt || new Date(),
  }));

  if (agents.length > 0) {
    await db.collection("agents").insertMany(agents);
  }
  console.log(`  Inserted: ${agents.length} agents`);

  // -----------------------------------------------------------------------
  // Phase C: Property migration
  // -----------------------------------------------------------------------
  console.log("\n--- Phase C: Property migration ---");

  try {
    await db.collection("properties").drop();
  } catch {
    // Collection doesn't exist yet
  }

  const propertyCursor = aposDocs.find({ type: "property" });
  const totalProperties = await aposDocs.countDocuments({ type: "property" });
  console.log(`  Source property docs: ${totalProperties}`);

  const BATCH_SIZE = 1000;
  let batch: Record<string, unknown>[] = [];
  let insertedCount = 0;
  let unclassifiedTitles: string[] = [];
  let nullCountryCount = 0;
  let statusDistribution: Record<string, number> = {};

  for await (const doc of propertyCursor) {
    // Derive category + status
    const { category, status } = deriveStatus(doc.status as string | null, !!doc.trash);
    statusDistribution[status] = (statusDistribution[status] || 0) + 1;

    // Classify property type from title
    const { propertyType, propertyGroup } = classifyPropertyType(doc.title || "");
    if (!propertyType) {
      unclassifiedTitles.push(doc.title || "(no title)");
    }

    // Normalize country
    const country = normalizeCountry(doc.country as string | null);
    if (!country) nullCountryCount++;

    // Extract numbers
    const bedrooms = extractNumber(doc.numberOfRooms);
    const bathrooms = extractNumber(doc.numberOfBathrooms);
    const parkings = extractNumber(doc.numberOfParkings);
    const areaSqm = extractNumber(doc.area); // Use `area` not `space` per corrections
    const price = extractNumber(doc.price);
    const latitude = extractFloat(doc.mapLatitude);
    const longitude = extractFloat(doc.mapLongitude);
    const yearBuilt = doc.builtIn ? extractNumber(doc.builtIn) : undefined;

    // Commission stays as string
    const commission = doc.commission && String(doc.commission).trim()
      ? String(doc.commission).trim()
      : undefined;

    // Extract description HTML
    const description = extractDescription(doc.description);

    // Resolve image references
    const imageRefs = resolveImageRefs(doc as Record<string, unknown>, imageLookup);

    // Features array — filter out empty strings
    const features = Array.isArray(doc.features)
      ? (doc.features as string[]).filter((f) => f && f.trim())
      : [];

    // Build clean property document
    const property: Record<string, unknown> = {
      _id: doc._id,
      title: doc.title,
      slug: doc.slug,
      description,
      price,
      currency: "USD",
      category,
      propertyGroup,
      propertyType,
      status,
      country,
      city: doc.city || undefined,
      district: doc.district || undefined,
      latitude,
      longitude,
      isFeatured: false,
      views: 0,
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
    };

    // Only include optional fields if they have values (sparse documents)
    if (doc.reference) property.referenceNumber = doc.reference;
    if (bedrooms !== undefined) property.bedrooms = bedrooms;
    if (bathrooms !== undefined) property.bathrooms = bathrooms;
    if (parkings !== undefined) property.parkings = parkings;
    if (areaSqm !== undefined) property.areaSqm = areaSqm;
    if (yearBuilt !== undefined) property.yearBuilt = yearBuilt;
    if (commission !== undefined) property.commission = commission;
    if (doc.view && String(doc.view).trim()) property.view = String(doc.view).trim();
    if (features.length > 0) property.features = features;
    if (imageRefs.length > 0) property.imageRefs = imageRefs;
    if (doc.agentId) property.agentId = doc.agentId;

    // Remove undefined values
    for (const key of Object.keys(property)) {
      if (property[key] === undefined) delete property[key];
    }

    batch.push(property);

    if (batch.length >= BATCH_SIZE) {
      await db.collection("properties").insertMany(batch, { ordered: false });
      insertedCount += batch.length;
      console.log(`  Progress: ${insertedCount}/${totalProperties}`);
      batch = [];
    }
  }

  // Insert remaining
  if (batch.length > 0) {
    await db.collection("properties").insertMany(batch, { ordered: false });
    insertedCount += batch.length;
  }
  console.log(`  Inserted: ${insertedCount} properties`);

  // -----------------------------------------------------------------------
  // Phase D: ContactRequest migration
  // -----------------------------------------------------------------------
  console.log("\n--- Phase D: ContactRequest migration ---");

  try {
    await db.collection("contactrequests").drop();
  } catch {
    // Collection doesn't exist yet
  }

  const contactDocs = await aposDocs.find({ type: "contact-form" }).toArray();
  console.log(`  Source contact docs: ${contactDocs.length}`);

  const contacts = contactDocs.map((doc) => {
    // Concatenate name
    const firstName = (doc.firstName || "").trim();
    const lastName = (doc.lastName || "").trim();
    const name = [firstName, lastName].filter(Boolean).join(" ") || "Unknown";

    // Strip /properties/ prefix from property slug
    let propertySlug: string | undefined;
    if (doc.property && typeof doc.property === "string") {
      propertySlug = doc.property.replace(/^\/properties\//, "");
    }

    return {
      _id: doc._id,
      subject: doc.title || undefined,
      propertySlug,
      name,
      email: doc.email || "",
      phone: doc.phone || undefined,
      message: doc.message || undefined,
      isRead: false,
      isResponded: false,
      createdAt: doc.createdAt || new Date(),
    };
  });

  if (contacts.length > 0) {
    await db.collection("contactrequests").insertMany(contacts);
  }
  console.log(`  Inserted: ${contacts.length} contact requests`);

  // -----------------------------------------------------------------------
  // Phase E: Create indexes
  // -----------------------------------------------------------------------
  console.log("\n--- Phase E: Creating indexes ---");

  const properties = db.collection("properties");
  await properties.createIndex({ slug: 1 }, { unique: true });
  await properties.createIndex({ category: 1, status: 1, country: 1, city: 1 });
  await properties.createIndex({ propertyGroup: 1, propertyType: 1 });
  await properties.createIndex({ price: 1 });
  await properties.createIndex({ areaSqm: 1 });
  await properties.createIndex({ agentId: 1 });
  await properties.createIndex({ title: "text", description: "text" });

  const contactsColl = db.collection("contactrequests");
  await contactsColl.createIndex({ createdAt: -1 });

  const users = db.collection("users");
  await users.createIndex({ email: 1 }, { unique: true });

  console.log("  Indexes created.");

  // -----------------------------------------------------------------------
  // Phase F: Summary report
  // -----------------------------------------------------------------------
  console.log("\n========================================");
  console.log("  MIGRATION SUMMARY");
  console.log("========================================");
  console.log(`  Agents:           ${agents.length}`);
  console.log(`  Properties:       ${insertedCount}`);
  console.log(`  Contact Requests: ${contacts.length}`);
  console.log("");
  console.log("  Status distribution:");
  for (const [s, count] of Object.entries(statusDistribution).sort()) {
    console.log(`    ${s}: ${count}`);
  }
  console.log("");
  console.log(`  Null countries:   ${nullCountryCount}`);
  console.log(`  Unclassified property types: ${unclassifiedTitles.length}`);
  if (unclassifiedTitles.length > 0 && unclassifiedTitles.length <= 200) {
    console.log("  Unclassified titles:");
    for (const t of unclassifiedTitles) {
      console.log(`    - ${t}`);
    }
  }
  console.log(`  Orphan image docs: ${orphanCount}`);
  console.log(`  Image lookup size: ${imageLookup.size}`);
  console.log("========================================\n");

  await mongoose.disconnect();
  console.log("Done. Disconnected.");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
