import mongoose from "mongoose";
import { readFileSync } from "fs";

// Load MONGODB_URI from .env.local without shell-sourcing (URI contains ?&)
const envLine = readFileSync(".env.local", "utf8")
  .split("\n")
  .find((l) => l.startsWith("MONGODB_URI="));
const MONGODB_URI = process.env.MONGODB_URI ?? envLine?.slice("MONGODB_URI=".length).replace(/^["']|["']$/g, "");
if (!MONGODB_URI) throw new Error("MONGODB_URI not set");

async function main() {
  await mongoose.connect(MONGODB_URI!);
  const db = mongoose.connection;
  console.log("DB name:", db.name);

  const col = db.collection("properties");
  const MIN_LISTING_DATE = new Date("2022-01-01");
  const pubFilter = {
    status: "ACTIVE",
    trash: { $ne: true },
    createdAt: { $gte: MIN_LISTING_DATE },
  };

  const total = await col.countDocuments({});
  const pub = await col.countDocuments(pubFilter);
  console.log(`total docs: ${total}, publicly visible: ${pub}`);

  // How distinct is updatedAt among public docs?
  const distinct = await col
    .aggregate([
      { $match: pubFilter },
      { $group: { _id: "$updatedAt", n: { $sum: 1 } } },
      { $sort: { n: -1 } },
    ])
    .toArray();
  console.log(`distinct updatedAt values (public): ${distinct.length}`);
  console.log("top 5 clusters (same updatedAt):");
  for (const d of distinct.slice(0, 5)) {
    console.log(`  ${d._id?.toISOString?.() ?? d._id}  x${d.n}`);
  }

  // Same-day clustering (more meaningful than exact-ms)
  const byDay = await col
    .aggregate([
      { $match: pubFilter },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } }, n: { $sum: 1 } } },
      { $sort: { n: -1 } },
    ])
    .toArray();
  console.log(`distinct updatedAt DAYS (public): ${byDay.length}`);
  console.log("top 5 days:");
  for (const d of byDay.slice(0, 5)) console.log(`  ${d._id}  x${d.n}`);

  // updatedAt vs createdAt: how many were edited after creation?
  const edited = await col.countDocuments({
    ...pubFilter,
    $expr: { $gt: ["$updatedAt", { $add: ["$createdAt", 1000] }] }, // >1s later
  });
  console.log(`public docs with updatedAt > createdAt (+1s): ${edited}`);

  // Missing updatedAt entirely?
  const missing = await col.countDocuments({ ...pubFilter, updatedAt: { $exists: false } });
  console.log(`public docs missing updatedAt: ${missing}`);

  // Current order comparison: top 10 by createdAt vs by updatedAt
  const proj = { title: 1, referenceNumber: 1, createdAt: 1, updatedAt: 1 };
  const byCreated = await col.find(pubFilter).project(proj).sort({ createdAt: -1 }).limit(10).toArray();
  const byUpdated = await col.find(pubFilter).project(proj).sort({ updatedAt: -1 }).limit(10).toArray();
  const fmt = (r: Record<string, unknown>) =>
    `${(r.referenceNumber as string) ?? "?"} | c:${(r.createdAt as Date)?.toISOString().slice(0, 10)} u:${(r.updatedAt as Date)?.toISOString().slice(0, 10)} | ${(r.title as string)?.slice(0, 45)}`;
  console.log("\ntop 10 by createdAt (current public order):");
  byCreated.forEach((r) => console.log("  " + fmt(r)));
  console.log("\ntop 10 by updatedAt (proposed order):");
  byUpdated.forEach((r) => console.log("  " + fmt(r)));

  // Index check
  const indexes = await col.indexes();
  console.log("\nindexes:", indexes.map((i) => JSON.stringify(i.key)).join(", "));

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
