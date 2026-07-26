import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI not set");

async function run() {
  await mongoose.connect(MONGODB_URI!);
  const db = mongoose.connection.db!;
  const properties = db.collection("properties");

  const total = await properties.countDocuments({});
  const withAgent = await properties.countDocuments({
    agentId: { $exists: true, $nin: [null, ""] },
  });
  const active = await properties.countDocuments({ status: "ACTIVE", trash: { $ne: true } });
  const activeWithAgent = await properties.countDocuments({
    status: "ACTIVE",
    trash: { $ne: true },
    agentId: { $exists: true, $nin: [null, ""] },
  });

  console.log("Total properties:           ", total);
  console.log("  with an agentId:          ", withAgent);
  console.log("Active (non-trash):         ", active);
  console.log("  with an agentId:          ", activeWithAgent);

  // Breakdown by agent for assigned ones
  const byAgent = await properties
    .aggregate([
      { $match: { agentId: { $exists: true, $nin: [null, ""] } } },
      { $group: { _id: "$agentId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    .toArray();
  console.log("\nDistinct agents with listings:", byAgent.length);
  console.log(JSON.stringify(byAgent, null, 2));

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Query failed:", err);
  process.exit(1);
});
