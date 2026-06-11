/**
 * Read-only dry run for the reference-number index migration.
 *
 * Run: MONGODB_URI="<your connection string>" npx tsx scripts/diff-indexes.ts
 *
 * Makes ZERO writes. It imports the real Property model and asks Mongoose what
 * `syncIndexes()` WOULD do — without doing it. `diffIndexes()` is the planning
 * half of `syncIndexes()`; this script runs only that half and prints:
 *   1. the indexes currently in the live collection, and
 *   2. the plan: { toDrop, toCreate }.
 *
 * Expect toDrop to include the old `referenceNumber_1` (and any stale index like
 * `property_text_search` that's no longer in the schema), and toCreate to include
 * the new date-scoped partial unique index. Review this output BEFORE running the
 * real migration (scripts/sync-indexes.ts).
 */

import mongoose from "mongoose";
import Property from "@/models/Property";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI not set — pass the DB you want to inspect, e.g.\n" +
      '  MONGODB_URI="mongodb+srv://..." npx tsx scripts/diff-indexes.ts'
  );
}

async function main() {
  await mongoose.connect(MONGODB_URI!);

  // 1. What's actually in the collection right now.
  const current = await Property.collection.indexes();
  console.log("\n──────────────────────────────────────────────");
  console.log(`CURRENT indexes in the live collection (${current.length}):`);
  console.log("──────────────────────────────────────────────");
  for (const ix of current) {
    const extra: string[] = [];
    if (ix.unique) extra.push("unique");
    if (ix.partialFilterExpression) {
      extra.push(`partial=${JSON.stringify(ix.partialFilterExpression)}`);
    }
    console.log(`  ${ix.name}  ${JSON.stringify(ix.key)}${extra.length ? "  [" + extra.join(", ") + "]" : ""}`);
  }

  // 2. The plan — pure read, no mutation. This is exactly what syncIndexes()
  //    would execute.
  const { toDrop, toCreate } = await Property.diffIndexes();

  console.log("\n──────────────────────────────────────────────");
  console.log("DRY-RUN PLAN (what syncIndexes() WOULD do — nothing is changed):");
  console.log("──────────────────────────────────────────────");
  console.log(`  toDrop   (${toDrop.length}): ${toDrop.length ? toDrop.join(", ") : "(none)"}`);
  console.log(`  toCreate (${toCreate.length}):`);
  if (toCreate.length === 0) {
    console.log("    (none)");
  } else {
    for (const spec of toCreate) console.log(`    ${JSON.stringify(spec)}`);
  }

  console.log("\n══════════════════════════════════════════════");
  if (toDrop.length === 0 && toCreate.length === 0) {
    console.log("✅ In sync — the live indexes already match the schema. No migration needed.");
  } else {
    console.log("ℹ️  Indexes differ from the schema. Review the plan above, then run");
    console.log("   scripts/sync-indexes.ts to apply it. NOTHING was changed by this script.");
  }
  console.log("══════════════════════════════════════════════\n");

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
