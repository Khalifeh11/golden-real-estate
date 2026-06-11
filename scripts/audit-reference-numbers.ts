/**
 * Read-only audit: find reference-number problems that would block the
 * unique partial index on the live catalog, and surface where to fix them.
 *
 * Run: MONGODB_URI="<your connection string>" npx tsx scripts/audit-reference-numbers.ts
 *
 * Makes NO writes. Scope matches the index in src/models/Property.ts, which
 * only covers listings created on/after MIN_LISTING_DATE (the pre-2022 archive
 * of migration duplicates is intentionally excluded). The index spans ALL
 * statuses AND trashed docs in that window, so this audit does too:
 *   { referenceNumber: 1 } unique,
 *   partialFilterExpression: { createdAt: { $gte: MIN_LISTING_DATE }, referenceNumber: { $exists: true } }
 *
 * Because of that scope, many flagged rows will NOT appear in the default admin
 * properties search (which hides trashed listings and only shows ACTIVE). Each
 * row therefore prints a direct edit link, and a breakdown explains where the
 * hidden ones live. Sections:
 *   - EXACT DUPLICATES — same raw referenceNumber on 2+ listings. These block
 *     the unique index build. (Includes identical empty/whitespace values,
 *     which DO collide because `$exists` is true for them.)
 *   - MISSING reference numbers — null/undefined. Excluded from the index, so
 *     they don't block the build, but the schema requires a value: data-quality.
 *   - NEAR-DUPLICATES (whitespace/case) — values that are equal once trimmed +
 *     lowercased but differ as stored. NOT index blockers (the index compares
 *     raw values) and an exact-ref search won't reconcile them; clean up by hand.
 *
 * Fix the EXACT DUPLICATES (and ideally the others) by hand, then re-run until
 * it prints "clean" before building the index.
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

// Optional: prefix the printed edit links with your site origin so they're
// click-through (e.g. ADMIN_BASE_URL="https://goldenland.example"). Defaults to
// relative paths.
const ADMIN_BASE_URL = (process.env.ADMIN_BASE_URL ?? process.env.SITE_URL ?? "").replace(/\/$/, "");

interface PropertyRow {
  _id: string;
  title?: string;
  slug?: string;
  referenceNumber?: string | null;
  status?: string;
  trash?: boolean;
  createdAt?: Date;
}

// Missing = the index's partialFilterExpression ({ referenceNumber: { $exists: true } })
// would NOT cover it. Only null/undefined are absent; "" and whitespace-only
// strings still "exist" and so participate in the unique constraint.
function isMissing(ref: string | null | undefined): boolean {
  return ref == null;
}

function label(p: PropertyRow): string {
  const when = p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : "no-date";
  const trashed = p.trash ? "  [TRASHED]" : "";
  const head = `      ${p._id}  ${when}  [${p.status ?? "?"}]${trashed}  "${p.title ?? "(untitled)"}"  /${p.slug ?? ""}`;
  const link = p.trash
    ? `        → trashed; restore or delete at ${ADMIN_BASE_URL}/admin/trash`
    : `        → ${ADMIN_BASE_URL}/admin/properties/${p._id}/edit`;
  return `${head}\n${link}`;
}

async function audit() {
  await mongoose.connect(MONGODB_URI!);
  const db = mongoose.connection.db!;
  const rows = (await db
    .collection("properties")
    .find({ createdAt: { $gte: MIN_LISTING_DATE } })
    .project({ title: 1, slug: 1, referenceNumber: 1, status: 1, trash: 1, createdAt: 1 })
    .toArray()) as PropertyRow[];

  console.log(
    `\nLive listings (created >= ${MIN_LISTING_DATE.toISOString().slice(0, 10)}, all statuses incl. trashed): ${rows.length}\n`
  );

  // 1. Missing — null/undefined reference numbers (not in the index).
  const missing = rows.filter((p) => isMissing(p.referenceNumber));

  // 2. Exact duplicates — same RAW stored value on 2+ listings. This is what the
  //    unique index actually enforces, so group by the exact string (no trim).
  //    Empty/whitespace values are included: "" and "  " exist, so identical
  //    ones collide just like any other value.
  const byExact = new Map<string, PropertyRow[]>();
  for (const p of rows) {
    if (isMissing(p.referenceNumber)) continue;
    const key = p.referenceNumber as string;
    const bucket = byExact.get(key);
    if (bucket) bucket.push(p);
    else byExact.set(key, [p]);
  }
  const exactDupes = [...byExact.entries()].filter(([, rs]) => rs.length > 1);

  // 3. Near-duplicates — distinct raw values that collapse to the same key once
  //    trimmed + lowercased. NOT index blockers; flagged as data-quality only.
  const byNormalized = new Map<string, Set<string>>();
  for (const key of byExact.keys()) {
    const norm = key.trim().toLowerCase();
    const set = byNormalized.get(norm);
    if (set) set.add(key);
    else byNormalized.set(norm, new Set([key]));
  }
  const nearDupes = [...byNormalized.entries()].filter(([, variants]) => variants.size > 1);

  // ── EXACT DUPLICATES (index blockers) ────────────────────────────────────
  const exactDupeListingCount = exactDupes.reduce((n, [, rs]) => n + rs.length, 0);
  console.log("──────────────────────────────────────────────");
  console.log(
    `EXACT DUPLICATE reference numbers (block the unique index): ${exactDupes.length} group(s), ${exactDupeListingCount} listing(s)`
  );
  console.log("──────────────────────────────────────────────");
  for (const [ref, rs] of exactDupes) {
    const shown = ref === "" ? "(empty string)" : ref.trim() === "" ? `(whitespace: ${JSON.stringify(ref)})` : ref;
    console.log(`  "${shown}" — used by ${rs.length} listings:`);
    for (const p of rs) console.log(label(p));
  }

  // ── MISSING (data-quality, not index blockers) ───────────────────────────
  console.log("\n──────────────────────────────────────────────");
  console.log(
    `MISSING reference numbers (null/undefined — not in index, but schema-required): ${missing.length} listing(s)`
  );
  console.log("──────────────────────────────────────────────");
  for (const p of missing) console.log(label(p));

  // ── NEAR-DUPLICATES (data-quality, not index blockers) ───────────────────
  console.log("\n──────────────────────────────────────────────");
  console.log(
    `NEAR-DUPLICATE reference numbers (whitespace/case variants — NOT index blockers): ${nearDupes.length} group(s)`
  );
  console.log("──────────────────────────────────────────────");
  for (const [norm, variants] of nearDupes) {
    console.log(`  normalizes to "${norm}" — ${variants.size} distinct stored values:`);
    for (const v of variants) {
      console.log(`    ${JSON.stringify(v)}`);
      for (const p of byExact.get(v)!) console.log(label(p));
    }
  }

  // ── Why some of these are invisible in the admin search ───────────────────
  const blockers = exactDupes.flatMap(([, rs]) => rs);
  const trashedCount = blockers.filter((p) => p.trash).length;
  const nonActiveCount = blockers.filter((p) => !p.trash && p.status !== "ACTIVE").length;
  const visibleCount = blockers.filter((p) => !p.trash && p.status === "ACTIVE").length;
  if (blockers.length > 0) {
    console.log("\n──────────────────────────────────────────────");
    console.log("Where to find the blocking listings:");
    console.log(`  Of ${blockers.length} listing(s) in exact-duplicate groups —`);
    console.log(`    ${visibleCount} ACTIVE & visible in the admin properties list`);
    console.log(`    ${nonActiveCount} non-ACTIVE — won't show under "All statuses" (that option only`);
    console.log(`        shows ACTIVE today); filter by their exact status, or use the edit link above`);
    console.log(`    ${trashedCount} trashed — only in /admin/trash, never in the properties list`);
    console.log("──────────────────────────────────────────────");
  }

  // ── Verdict ───────────────────────────────────────────────────────────────
  console.log("\n══════════════════════════════════════════════");
  if (exactDupeListingCount === 0) {
    console.log("✅ clean — no exact-duplicate reference numbers. Safe to add the unique index.");
    if (missing.length > 0 || nearDupes.length > 0) {
      console.log(
        `   (Note: ${missing.length} missing and ${nearDupes.length} near-duplicate group(s) remain — data-quality only, won't block the index.)`
      );
    }
  } else {
    console.log(
      `⚠️  ${exactDupeListingCount} listing(s) in ${exactDupes.length} exact-duplicate group(s) must be fixed before the unique index can build.`
    );
    console.log("   Use the edit links above. Re-run this script until it prints \"clean\".");
  }
  console.log("══════════════════════════════════════════════\n");

  await mongoose.disconnect();
}

audit().catch((err) => {
  console.error("Audit failed:", err);
  process.exit(1);
});
