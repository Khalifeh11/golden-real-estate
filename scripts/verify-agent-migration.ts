/**
 * READ-ONLY: quantify the safe migration of source `agent` → target `agentId`.
 * Joins untouched aposDocs (source `agent` string) against the migrated
 * `agents` and `properties` collections. Writes nothing.
 */
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI not set");

async function run() {
  await mongoose.connect(MONGODB_URI!);
  const db = mongoose.connection.db!;
  const aposDocs = db.collection("aposDocs");
  const agentsColl = db.collection("agents");
  const propsColl = db.collection("properties");

  // Valid agent _ids that actually exist in the migrated agents collection.
  const validAgentIds = new Set((await agentsColl.find({}).project({ _id: 1 }).toArray()).map((a) => String(a._id)));
  console.log(`Migrated agents collection size: ${validAgentIds.size}`);

  // Walk every source property doc, collect its `agent` value.
  let total = 0;
  let withAgent = 0;
  let emptyAgent = 0;
  let validRef = 0;
  let brokenRef = 0;
  const brokenValues: Record<string, number> = {};
  // map source property _id -> agent value, for the target-side active check
  const propAgent = new Map<string, string>();

  for await (const doc of aposDocs.find({ type: "property" }).project({ _id: 1, agent: 1 })) {
    total++;
    const a = doc.agent;
    if (typeof a === "string" && a.trim()) {
      withAgent++;
      propAgent.set(String(doc._id), a);
      if (validAgentIds.has(a)) {
        validRef++;
      } else {
        brokenRef++;
        brokenValues[a] = (brokenValues[a] || 0) + 1;
      }
    } else {
      emptyAgent++;
    }
  }

  console.log(`\nSource property docs:        ${total}`);
  console.log(`  has non-empty 'agent':     ${withAgent}`);
  console.log(`  empty/missing 'agent':     ${emptyAgent}`);
  console.log(`  -> agent ref VALID:        ${validRef}`);
  console.log(`  -> agent ref BROKEN:       ${brokenRef}`);
  if (brokenRef > 0) {
    console.log(`     broken agent values (value: count):`);
    for (const [v, c] of Object.entries(brokenValues)) console.log(`       ${v}: ${c}`);
  }

  // How many DISTINCT agents would actually have at least one valid listing.
  const distinctValid = new Set([...propAgent.values()].filter((v) => validAgentIds.has(v)));
  console.log(`\nDistinct agents referenced (valid): ${distinctValid.size} of ${validAgentIds.size} migrated agents`);

  // The payoff number: among CURRENTLY ACTIVE, non-trash target properties,
  // how many would gain a valid agentId?
  const activeProps = await propsColl
    .find({ status: "ACTIVE", trash: { $ne: true } })
    .project({ _id: 1 })
    .toArray();
  const activeTotal = activeProps.length;
  let activeWouldGetValidAgent = 0;
  for (const p of activeProps) {
    const a = propAgent.get(String(p._id));
    if (a && validAgentIds.has(a)) activeWouldGetValidAgent++;
  }
  console.log(`\nACTIVE (non-trash) target properties: ${activeTotal}`);
  console.log(`  would receive a VALID agentId:      ${activeWouldGetValidAgent}`);

  // Sanity: confirm every source prop _id exists in target (id preserved by migration).
  const targetIds = new Set((await propsColl.find({}).project({ _id: 1 }).toArray()).map((p) => String(p._id)));
  let presentInTarget = 0;
  for (const id of propAgent.keys()) if (targetIds.has(id)) presentInTarget++;
  console.log(`\nSource props with agent that also exist in target by _id: ${presentInTarget}/${propAgent.size}`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
