import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI not set");

const term = process.argv[2] ?? "Biakout";

async function run() {
  await mongoose.connect(MONGODB_URI!);
  const db = mongoose.connection.db!;
  const properties = db.collection("properties");

  const results = await properties
    .find({ title: { $regex: term, $options: "i" } })
    .project({
      title: 1,
      slug: 1,
      referenceNumber: 1,
      status: 1,
      category: 1,
      propertyType: 1,
      city: 1,
      district: 1,
      price: 1,
      trash: 1,
      createdAt: 1,
    })
    .toArray();

  console.log(`Matches for "${term}": ${results.length}\n`);
  console.log(JSON.stringify(results, null, 2));

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Query failed:", err);
  process.exit(1);
});
