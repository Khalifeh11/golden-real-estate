/**
 * Image migration: upload property images from local ApostropheCMS export to R2
 * and populate the `images[]` array on each property in MongoDB.
 *
 * Run: npx tsx scripts/migrate-images.ts [--dry-run] [--limit N] [--force]
 *
 * Idempotent — skips properties that already have images (unless --force).
 * Re-runnable after interruption.
 */

import { readFileSync, readdirSync } from "fs";
import { readFile } from "fs/promises";
import { resolve } from "path";

// ---------------------------------------------------------------------------
// Load .env.local before anything that reads process.env
// ---------------------------------------------------------------------------
const envPath = resolve(__dirname, "../.env.local");
for (const line of readFileSync(envPath, "utf-8").split("\n")) {
  const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
}

import mongoose from "mongoose";

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FORCE = args.includes("--force");
const limitIdx = args.indexOf("--limit");
const LIMIT = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : 0;

const MONGODB_URI = "mongodb://localhost:27017/goldenland-real-estate";
const ATTACHMENTS_DIR = resolve(__dirname, "../database files/attachments");

// ---------------------------------------------------------------------------
// Content type map
// ---------------------------------------------------------------------------
const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};

// ---------------------------------------------------------------------------
// Resolve local file for an imageRef
// ---------------------------------------------------------------------------
function resolveLocalFile(
  ref: { attachmentId: string; filename: string; extension: string },
  fileIndex: Set<string>
): string | null {
  const base = `${ref.attachmentId}-${ref.filename}`;
  const ext = ref.extension;

  // Priority: original > max > full
  const candidates = [
    `${base}.${ext}`,
    `${base}.max.${ext}`,
    `${base}.full.${ext}`,
  ];

  for (const candidate of candidates) {
    if (fileIndex.has(candidate)) return candidate;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  // Dynamic import — must happen after env vars are loaded (r2.ts creates S3Client at import time)
  const { uploadToR2, getPublicUrl } = await import("../src/lib/r2");

  console.log("=== Image Migration ===");
  console.log(`  Mode:  ${DRY_RUN ? "DRY RUN" : "LIVE"}`);
  console.log(`  Force: ${FORCE}`);
  console.log(`  Limit: ${LIMIT || "none"}`);
  console.log();

  // Phase 1: Build file index
  console.log("Phase 1: Building file index...");
  const files = readdirSync(ATTACHMENTS_DIR);
  const fileIndex = new Set(files);
  console.log(`  ${fileIndex.size} files indexed\n`);

  // Phase 2: Connect and query properties
  console.log("Phase 2: Querying properties...");
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db!;
  const properties = db.collection("properties");

  const filter: Record<string, unknown> = {
    "imageRefs.0": { $exists: true },
  };
  if (!FORCE) {
    filter.$or = [
      { images: { $exists: false } },
      { images: { $size: 0 } },
    ];
  }

  let cursor = properties
    .find(filter)
    .project({ _id: 1, title: 1, slug: 1, imageRefs: 1 })
    .sort({ _id: 1 });

  if (LIMIT) cursor = cursor.limit(LIMIT);

  const props = await cursor.toArray();
  console.log(`  ${props.length} properties to process\n`);

  // Phase 3: Process each property
  console.log("Phase 3: Processing...\n");
  const startTime = Date.now();

  let totalUploaded = 0;
  let totalSkippedNotFound = 0;
  let totalSkippedEmpty = 0;
  let propertiesProcessed = 0;
  let propertiesFailed = 0;
  const notFoundRefs: string[] = [];

  for (const prop of props) {
    const imageRefs = (prop.imageRefs || []) as Array<{
      attachmentId: string;
      filename: string;
      extension: string;
      isThumbnail: boolean;
      order: number;
    }>;

    const images: Array<{
      url: string;
      thumbnailUrl: string;
      altText: string;
      order: number;
    }> = [];

    let propertyFailed = false;

    for (const ref of imageRefs.sort((a, b) => a.order - b.order)) {
      const localFile = resolveLocalFile(ref, fileIndex);

      if (!localFile) {
        totalSkippedNotFound++;
        notFoundRefs.push(`${ref.attachmentId}-${ref.filename}.${ref.extension}`);
        continue;
      }

      const contentType = CONTENT_TYPES[ref.extension] || "application/octet-stream";
      const r2Key = `properties/migrate-${ref.attachmentId}.${ref.extension}`;

      if (DRY_RUN) {
        const url = getPublicUrl(r2Key);
        images.push({
          url,
          thumbnailUrl: url,
          altText: `${prop.title} - Photo ${ref.order + 1}`,
          order: ref.order,
        });
        totalUploaded++;
        continue;
      }

      // Live upload
      try {
        const filePath = resolve(ATTACHMENTS_DIR, localFile);
        const buffer = await readFile(filePath);

        if (buffer.length === 0) {
          totalSkippedEmpty++;
          continue;
        }

        const url = await uploadToR2(buffer, r2Key, contentType);
        images.push({
          url,
          thumbnailUrl: url,
          altText: `${prop.title} - Photo ${ref.order + 1}`,
          order: ref.order,
        });
        totalUploaded++;
      } catch (err) {
        // Retry once
        try {
          await new Promise((r) => setTimeout(r, 2000));
          const filePath = resolve(ATTACHMENTS_DIR, localFile);
          const buffer = await readFile(filePath);
          const url = await uploadToR2(buffer, r2Key, contentType);
          images.push({
            url,
            thumbnailUrl: url,
            altText: `${prop.title} - Photo ${ref.order + 1}`,
            order: ref.order,
          });
          totalUploaded++;
        } catch (retryErr) {
          console.error(`    [FAIL] ${ref.attachmentId}: ${retryErr}`);
          propertyFailed = true;
        }
      }
    }

    // Update MongoDB
    if (images.length > 0 && !DRY_RUN) {
      try {
        await properties.updateOne(
          { _id: prop._id },
          { $set: { images } }
        );
      } catch (err) {
        console.error(`  [DB FAIL] ${prop.slug}: ${err}`);
        propertiesFailed++;
        continue;
      }
    }

    propertiesProcessed++;
    if (propertyFailed) propertiesFailed++;

    const status = DRY_RUN ? "would upload" : "uploaded";
    console.log(`  [${propertiesProcessed}/${props.length}] ${prop.slug}: ${images.length} images ${status}`);
  }

  // Phase 4: Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log("\n========================================");
  console.log("  IMAGE MIGRATION SUMMARY");
  console.log("========================================");
  console.log(`  Mode:                ${DRY_RUN ? "DRY RUN" : "LIVE"}`);
  console.log(`  Properties processed: ${propertiesProcessed}`);
  console.log(`  Properties failed:    ${propertiesFailed}`);
  console.log(`  Images uploaded:      ${totalUploaded}`);
  console.log(`  Images not found:     ${totalSkippedNotFound}`);
  console.log(`  Images empty/corrupt: ${totalSkippedEmpty}`);
  console.log(`  Elapsed:              ${elapsed}s`);

  if (notFoundRefs.length > 0 && notFoundRefs.length <= 50) {
    console.log("\n  Missing files:");
    for (const ref of notFoundRefs) {
      console.log(`    - ${ref}`);
    }
  } else if (notFoundRefs.length > 50) {
    console.log(`\n  Missing files: ${notFoundRefs.length} (too many to list)`);
  }

  console.log("========================================\n");

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
