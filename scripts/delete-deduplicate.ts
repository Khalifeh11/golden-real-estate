/**
 * Hard-delete the ApostropheCMS migration trash.
 *
 * The old CMS prefixes the slug of any archived document with `deduplicate-` to
 * release its unique slug. scripts/migrate-mongo.ts copied those archived docs
 * over verbatim, so the live `properties` collection carries ~2,410 of them.
 * They are all non-ACTIVE and already invisible to users. This permanently
 * removes them.
 *
 * Dry-run (default — makes NO writes):
 *   MONGODB_URI="mongodb+srv://..." npx tsx scripts/delete-deduplicate.ts
 * Execute the delete:
 *   MONGODB_URI="mongodb+srv://..." npx tsx scripts/delete-deduplicate.ts --confirm
 *
 * Safety: aborts without deleting if ANY matched doc is status ACTIVE, so a real
 * listing can never be removed even if the data drifts from the 2026-05-29 audit.
 * Also drops the now-unused `property_text_search` index (search moved to
 * tokenized regex — see src/lib/search.ts).
 */

import mongoose from "mongoose";

const DEDUP_SLUG = /^deduplicate-/;
const confirm = process.argv.includes("--confirm");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI not set — pass the DB you want to clean, e.g.\n" +
      '  MONGODB_URI="mongodb+srv://..." npx tsx scripts/delete-deduplicate.ts'
  );
}

async function run() {
  await mongoose.connect(MONGODB_URI!);
  const properties = mongoose.connection.db!.collection("properties");

  const match = { slug: DEDUP_SLUG };
  const matched = await properties.countDocuments(match);
  const active = await properties.countDocuments({ ...match, status: "ACTIVE" });

  console.log("\n══════════════════════════════════════════════");
  console.log(`deduplicate- slug docs matched: ${matched}`);
  console.log(`  of those ACTIVE:              ${active}`);
  console.log("══════════════════════════════════════════════");

  if (active > 0) {
    console.error(
      `\n⛔ ABORT — ${active} matched doc(s) are ACTIVE. Refusing to delete live listings.`
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  if (!confirm) {
    console.log("\nDRY RUN — no changes made. Re-run with --confirm to delete.\n");
    await mongoose.disconnect();
    return;
  }

  const res = await properties.deleteMany(match);
  console.log(`\n🗑️  Deleted ${res.deletedCount} document(s).`);

  // The text index is no longer used by the app; drop it if present.
  try {
    await properties.dropIndex("property_text_search");
    console.log("Dropped unused index: property_text_search");
  } catch {
    console.log("Index property_text_search not present — skipped.");
  }

  const remaining = await properties.countDocuments({});
  console.log(`Remaining documents: ${remaining}\n`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});
