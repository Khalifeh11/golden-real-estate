/**
 * Export the property→agent mapping from a database that still has the links
 * (i.e. LOCAL, where backfill-agent-ids.ts already ran).
 *
 * Emits a JSON array of { _id, agentId } for ACTIVE, non-trash properties that
 * have an agentId. This portable map is applied to prod by apply-agent-map.ts,
 * matched on the stable CMS _id — no dependency on prod having `aposDocs`.
 *
 * Run:  MONGODB_URI="mongodb://localhost:27017/goldenland-real-estate" \
 *       MAP_FILE=/abs/path/agent-map.json npx tsx scripts/export-agent-map.ts
 */
import { writeFileSync } from "node:fs";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI not set");
const MAP_FILE = process.env.MAP_FILE;
if (!MAP_FILE) throw new Error("MAP_FILE not set");

async function run() {
  await mongoose.connect(MONGODB_URI!);
  const props = mongoose.connection.db!.collection("properties");

  const docs = await props
    .find({ status: "ACTIVE", trash: { $ne: true }, agentId: { $exists: true, $ne: null } })
    .project({ _id: 1, agentId: 1 })
    .toArray();

  const map = docs
    .filter((d) => typeof d.agentId === "string" && d.agentId.trim())
    .map((d) => ({ _id: String(d._id), agentId: String(d.agentId).trim() }));

  writeFileSync(MAP_FILE, JSON.stringify(map, null, 0));
  console.log(`Exported ${map.length} property→agent links to ${MAP_FILE}`);
  console.log(`Distinct agents in map: ${new Set(map.map((m) => m.agentId)).size}`);
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
