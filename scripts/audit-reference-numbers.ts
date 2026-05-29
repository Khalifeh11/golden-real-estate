/**
 * Read-only audit: find reference-number problems that would block the
 * unique partial index on the live catalog.
 *
 * Run: MONGODB_URI="<your connection string>" npx tsx scripts/audit-reference-numbers.ts
 *
 * Makes NO writes. Scope matches the index in src/models/Property.ts, which
 * only covers listings created on/after MIN_LISTING_DATE (the pre-2022 archive
 * of migration duplicates is intentionally excluded). The index spans ALL
 * statuses in that window, so this audit does too (not just ACTIVE).
 *   { referenceNumber: 1 } unique,
 *   partialFilterExpression: { createdAt: { $gte: MIN_LISTING_DATE }, referenceNumber: { $exists: true } }
 *
 * Fix the listings it reports by hand in the admin UI, then re-run until it
 * prints "clean" before building the index.
 */

import mongoose from "mongoose";

// Keep in sync with MIN_LISTING_DATE in src/lib/constants.ts (and the index).
const MIN_LISTING_DATE = new Date("2022-01-01T00:00:00.000Z");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI not set — pass the DB you want to audit, e.g.\n" +
      '  MONGODB_URI="mongodb+srv://..." npx tsx scripts/audit-reference-numbers.ts'
  );
}

interface PropertyRow {
  _id: string;
  title?: string;
  slug?: string;
  referenceNumber?: string | null;
  status?: string;
  createdAt?: Date;
}

function isBlank(ref: string | null | undefined): boolean {
  return ref == null || ref.trim() === "";
}

function label(p: PropertyRow): string {
  const when = p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : "no-date";
  return `      ${p._id}  ${when}  [${p.status ?? "?"}]  "${p.title ?? "(untitled)"}"  /${p.slug ?? ""}`;
}

async function audit() {
  await mongoose.connect(MONGODB_URI!);
  const db = mongoose.connection.db!;
  const active = (await db
    .collection("properties")
    .find({ createdAt: { $gte: MIN_LISTING_DATE } })
    .project({ title: 1, slug: 1, referenceNumber: 1, status: 1, createdAt: 1 })
    .toArray()) as PropertyRow[];

  console.log(`\nLive listings (created >= ${MIN_LISTING_DATE.toISOString().slice(0, 10)}, all statuses): ${active.length}\n`);

  // 1. Blanks — missing, null, or empty/whitespace reference numbers
  const blanks = active.filter((p) => isBlank(p.referenceNumber));

  // 2. Duplicates — same trimmed reference number shared by 2+ active listings
  const byRef = new Map<string, PropertyRow[]>();
  for (const p of active) {
    if (isBlank(p.referenceNumber)) continue;
    const key = p.referenceNumber!.trim();
    (byRef.get(key) ?? byRef.set(key, []).get(key)!).push(p);
  }
  const dupeGroups = [...byRef.entries()].filter(([, rows]) => rows.length > 1);

  console.log("──────────────────────────────────────────────");
  console.log(`BLANK reference numbers: ${blanks.length} listing(s)`);
  console.log("──────────────────────────────────────────────");
  for (const p of blanks) console.log(label(p));

  console.log("\n──────────────────────────────────────────────");
  const dupeListingCount = dupeGroups.reduce((n, [, rows]) => n + rows.length, 0);
  console.log(
    `DUPLICATE reference numbers: ${dupeGroups.length} group(s), ${dupeListingCount} listing(s)`
  );
  console.log("──────────────────────────────────────────────");
  for (const [ref, rows] of dupeGroups) {
    console.log(`  "${ref}" — used by ${rows.length} listings:`);
    for (const p of rows) console.log(label(p));
  }

  const totalToFix = blanks.length + dupeListingCount;
  console.log("\n══════════════════════════════════════════════");
  if (totalToFix === 0) {
    console.log("✅ clean — no blanks or duplicates. Safe to add the unique index.");
  } else {
    console.log(
      `⚠️  ${totalToFix} listing(s) need attention before the unique index can build.`
    );
    console.log("   Fix them in the admin UI, then re-run this script.");
  }
  console.log("══════════════════════════════════════════════\n");

  await mongoose.disconnect();
}

audit().catch((err) => {
  console.error("Audit failed:", err);
  process.exit(1);
});
