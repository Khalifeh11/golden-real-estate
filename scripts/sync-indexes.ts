/**
 * TARGETED reference-number index migration.
 *
 * Swaps ONLY the `referenceNumber_1` index: drops the old plain/broken one and
 * builds the new date-scoped partial UNIQUE index. Every other index on the
 * collection is left completely untouched.
 *
 * Why not Mongoose `syncIndexes()`? The Property schema only declares the
 * referenceNumber index, but the live collection has 8 others (slug-unique, the
 * main compound query index, price/area/agent, etc.) that aren't in code.
 * `syncIndexes()` would DROP all of those. This script never does — it operates
 * on `referenceNumber_1` and nothing else (see SAFETY guard below).
 *
 * DRY RUN by default — prints the plan and writes nothing:
 *   MONGODB_URI="mongodb+srv://..." npx tsx scripts/sync-indexes.ts
 *
 * To actually apply it, add APPLY=1:
 *   APPLY=1 MONGODB_URI="mongodb+srv://..." npx tsx scripts/sync-indexes.ts
 *
 * Pre-req: scripts/audit-reference-numbers.ts must print "clean" first, or the
 * unique index build will fail on existing duplicates.
 */

import mongoose from "mongoose";
import { MIN_LISTING_DATE } from "@/lib/constants";

const INDEX_NAME = "referenceNumber_1";

// The single index this script is allowed to touch. Anything else is off-limits.
const DESIRED_KEY = { referenceNumber: 1 } as const;
const DESIRED_OPTIONS = {
  name: INDEX_NAME,
  unique: true,
  partialFilterExpression: {
    createdAt: { $gte: MIN_LISTING_DATE },
    referenceNumber: { $exists: true },
  },
} as const;

const MONGODB_URI = process.env.MONGODB_URI;
const APPLY = process.env.APPLY === "1";

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI not set — pass the DB to migrate, e.g.\n" +
      '  MONGODB_URI="mongodb+srv://..." npx tsx scripts/sync-indexes.ts   (dry run)\n' +
      '  APPLY=1 MONGODB_URI="mongodb+srv://..." npx tsx scripts/sync-indexes.ts   (apply)'
  );
}

// Does the live index already match what we want? If so, nothing to do.
function isAlreadyDesired(ix: { unique?: boolean; partialFilterExpression?: unknown }): boolean {
  if (!ix.unique) return false;
  const want = JSON.stringify(DESIRED_OPTIONS.partialFilterExpression);
  const have = JSON.stringify(ix.partialFilterExpression ?? null);
  return want === have;
}

async function main() {
  await mongoose.connect(MONGODB_URI!);
  const coll = mongoose.connection.db!.collection("properties");

  const before = await coll.indexes();
  const existing = before.find((ix) => ix.name === INDEX_NAME);

  console.log(`\nMode: ${APPLY ? "APPLY (will write)" : "DRY RUN (no writes)"}`);
  console.log("──────────────────────────────────────────────");
  console.log(`Current "${INDEX_NAME}":`);
  if (!existing) {
    console.log("  (none — will be created fresh)");
  } else {
    const flags: string[] = [];
    if (existing.unique) flags.push("unique");
    if (existing.partialFilterExpression) {
      flags.push(`partial=${JSON.stringify(existing.partialFilterExpression)}`);
    }
    console.log(`  ${JSON.stringify(existing.key)}${flags.length ? "  [" + flags.join(", ") + "]" : "  [plain, NON-unique]"}`);
  }
  console.log(`Desired "${INDEX_NAME}":`);
  console.log(`  ${JSON.stringify(DESIRED_KEY)}  [unique, partial=${JSON.stringify(DESIRED_OPTIONS.partialFilterExpression)}]`);
  console.log("──────────────────────────────────────────────");

  if (existing && isAlreadyDesired(existing)) {
    console.log("\n✅ Already correct — no migration needed. Nothing to do.\n");
    await mongoose.disconnect();
    return;
  }

  // Plan: drop the old one (if present), then create the new one.
  const steps: string[] = [];
  if (existing) steps.push(`dropIndex("${INDEX_NAME}")`);
  steps.push(`createIndex(${JSON.stringify(DESIRED_KEY)}, ${JSON.stringify(DESIRED_OPTIONS)})`);

  console.log("\nPlan (this script touches ONLY referenceNumber_1):");
  for (const s of steps) console.log(`  • ${s}`);

  if (!APPLY) {
    console.log("\n══════════════════════════════════════════════");
    console.log("DRY RUN — nothing was changed. Re-run with APPLY=1 to execute.");
    console.log("══════════════════════════════════════════════\n");
    await mongoose.disconnect();
    return;
  }

  // SAFETY: never drop anything that isn't exactly referenceNumber_1.
  if (existing && existing.name !== INDEX_NAME) {
    throw new Error(`Refusing to proceed: resolved index name "${existing.name}" is not "${INDEX_NAME}".`);
  }

  console.log("\nApplying…");
  if (existing) {
    await coll.dropIndex(INDEX_NAME);
    console.log(`  dropped ${INDEX_NAME}`);
  }
  await coll.createIndex(DESIRED_KEY, DESIRED_OPTIONS);
  console.log(`  created ${INDEX_NAME} (unique, date-scoped partial)`);

  const after = await coll.indexes();
  const now = after.find((ix) => ix.name === INDEX_NAME);
  console.log("\n──────────────────────────────────────────────");
  console.log(`Result "${INDEX_NAME}": ${JSON.stringify(now?.key)}  [${now?.unique ? "unique" : "NOT unique"}, partial=${JSON.stringify(now?.partialFilterExpression)}]`);
  console.log(`Total indexes: ${before.length} → ${after.length} (other indexes untouched)`);
  console.log("══════════════════════════════════════════════\n");

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
