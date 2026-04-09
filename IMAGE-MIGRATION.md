# Image Migration — Remaining Batches

Karim already ran the first batch. This guide covers uploading the remaining tar archives to R2.

---

## Prerequisites

1. **Node.js + tsx** — install globally if not present: `npm i -g tsx`
2. **`.env.local`** — copy from Karim. Contains R2 credentials (bucket, endpoint, keys)
3. **MongoDB access** — the script connects to `mongodb://localhost:27017/goldenland-real-estate` (edit line 35 in `scripts/migrate-images.ts` if your DB is elsewhere)
4. **Disk space** — each tar archive extracts to several GB

---

## Steps (repeat per batch)

### 1. Extract the tar archive

Extract into the existing `database files/attachments/` directory:

```bash
tar -xf batch-N.tar -C "database files/attachments/"
```

All files should land flat in that folder (no subdirectories). After extraction you should see `.jpg`, `.png`, etc. files directly inside `database files/attachments/`.

### 2. Dry run (verify)

```bash
npx tsx scripts/migrate-images.ts --dry-run
```

This shows how many properties would be processed and how many images would be uploaded — without actually uploading anything. Check the output makes sense before proceeding.

### 3. Live run

```bash
npx tsx scripts/migrate-images.ts
```

The script will:
- Find all properties that have `imageRefs` but no `images[]` yet
- Match each `imageRef` to a local file in `database files/attachments/`
- Upload each file to R2 at `properties/migrate-{attachmentId}.{ext}`
- Write the `images[]` array back to the property in MongoDB
- Print progress: `[N/total] property-slug: X images uploaded`

**If interrupted**, just re-run — it skips properties that already have images.

### 4. Repeat for each remaining tar archive

Extract next tar → run the script again. Order doesn't matter.

### 5. Final pass (after all tars extracted)

```bash
npx tsx scripts/migrate-images.ts --force
```

The `--force` flag re-processes ALL properties (even those with existing images). This catches any properties that were partially processed in earlier runs because some of their images were in a different tar archive.

---

## Verification

After all batches are done:

1. **Check counts** — the script prints a summary with total uploaded / not found / failed
2. **Spot-check in MongoDB:**
   ```js
   // Properties with images
   db.properties.countDocuments({ "images.0": { $exists: true } })
   // Properties still missing images
   db.properties.countDocuments({ "imageRefs.0": { $exists: true }, $or: [{ images: { $exists: false } }, { images: { $size: 0 } }] })
   ```
3. **Spot-check in browser** — open a few properties on the site and confirm images load

---

## Troubleshooting

- **"Missing files" in summary** — normal if that image's tar hasn't been extracted yet. Will resolve after extracting remaining batches.
- **Upload failures** — the script retries once per image. Persistent failures are logged with `[FAIL]`. Re-run the script to retry.
- **Wrong DB connection** — edit line 35 in `scripts/migrate-images.ts` to point to your MongoDB instance.

---

## After Migration (not blocking)

These are future improvements, not required now:
- **Thumbnail generation** — currently `thumbnailUrl` equals `url` (full-size). Could add sharp-based resizing later.
- **WebP conversion** — would reduce storage/bandwidth.
- **`imageRefs` cleanup** — the field is dead code after migration. Can be removed from the model and unset in MongoDB.
