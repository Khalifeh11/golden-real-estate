import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI not set");

async function run() {
  await mongoose.connect(MONGODB_URI!);
  const db = mongoose.connection.db!;
  const properties = db.collection("properties");

  // The "live" catalog = what actually renders on the site.
  // Adjust filters here if the site shows more than ACTIVE/non-trash.
  const liveFilter = { trash: { $ne: true }, status: "ACTIVE" };

  const totalDocs = await properties.countDocuments({});
  const liveDocs = await properties.countDocuments(liveFilter);

  const agg = await properties
    .aggregate([
      { $match: liveFilter },
      {
        $project: {
          imgCount: { $size: { $ifNull: ["$images", []] } },
        },
      },
      {
        $group: {
          _id: null,
          properties: { $sum: 1 },
          totalImages: { $sum: "$imgCount" },
          withImages: { $sum: { $cond: [{ $gt: ["$imgCount", 0] }, 1, 0] } },
          maxImages: { $max: "$imgCount" },
        },
      },
    ])
    .toArray();

  const a = agg[0] ?? { properties: 0, totalImages: 0, withImages: 0, maxImages: 0 };

  console.log("--- Property catalog ---");
  console.log("total documents (incl. trash/inactive):", totalDocs);
  console.log("LIVE docs (ACTIVE, not trash):        ", liveDocs);
  console.log("live docs with >=1 image:             ", a.withImages);
  console.log("total distinct source images (live):  ", a.totalImages);
  console.log("max images on one property:           ", a.maxImages);
  console.log();

  // Transformation math.
  // Cards use sizes that resolve to a handful of widths; galleries similar.
  // next/image picks widths from deviceSizes. Assume ~4 distinct widths
  // actually requested across breakpoints in real traffic (conservative).
  const WIDTHS = 4;
  const distinct = a.totalImages;
  console.log("--- Transformation estimate (rough) ---");
  console.log(`assuming ~${WIDTHS} widths requested per image:`);
  console.log("  Cloudflare (format=auto = 1):", distinct * WIDTHS, "unique transforms");
  console.log("  Vercel (webp+avif = 2 fmts): ", distinct * WIDTHS * 2, "unique transforms");
  console.log("(free cap on both = 5,000 / month)");

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
