/**
 * READ-ONLY investigation: how did the old ApostropheCMS link properties → agents?
 * Inspects the untouched `aposDocs` source collection. Writes nothing.
 */
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI not set");

async function run() {
  await mongoose.connect(MONGODB_URI!);
  const db = mongoose.connection.db!;
  const aposDocs = db.collection("aposDocs");

  const totalProps = await aposDocs.countDocuments({ type: "property" });
  const totalAgents = await aposDocs.countDocuments({ type: "agent" });
  console.log(`Source property docs: ${totalProps}`);
  console.log(`Source agent docs:    ${totalAgents}\n`);

  // 1. Collect every key that mentions "agent" (any case) across all property docs.
  const agentKeyCounts: Record<string, number> = {};
  const sampleByKey: Record<string, unknown> = {};
  const cursor = aposDocs.find({ type: "property" });
  let scanned = 0;
  for await (const doc of cursor) {
    scanned++;
    for (const key of Object.keys(doc)) {
      if (/agent/i.test(key)) {
        agentKeyCounts[key] = (agentKeyCounts[key] || 0) + 1;
        if (!(key in sampleByKey) && doc[key] != null) {
          sampleByKey[key] = doc[key];
        }
      }
    }
  }
  console.log(`Scanned ${scanned} property docs.`);
  console.log("\n=== Property-doc keys matching /agent/i (key → # docs that have it) ===");
  const sorted = Object.entries(agentKeyCounts).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) {
    console.log("  (none — no property field name contains 'agent')");
  }
  for (const [key, count] of sorted) {
    console.log(`  ${key}: ${count}`);
    console.log(`     sample: ${JSON.stringify(sampleByKey[key])?.slice(0, 200)}`);
  }

  // 2. Apostrophe sometimes stores relations as a joinByArray with `<field>Ids`,
  //    or reverse joins on the agent side. Also dump the full key set of one
  //    property doc that DOES have an `agentId`, plus one that does NOT, to compare.
  const withAgentId = await aposDocs.findOne({ type: "property", agentId: { $exists: true, $ne: null } });
  const sampleAny = await aposDocs.findOne({ type: "property" });
  console.log("\n=== All keys on a property doc WITH agentId ===");
  console.log(withAgentId ? Object.keys(withAgentId).sort().join(", ") : "  (none found)");
  console.log("\n=== All keys on an arbitrary property doc ===");
  console.log(sampleAny ? Object.keys(sampleAny).sort().join(", ") : "  (none)");

  // 3. Inspect the agent docs: do they hold a reverse relation to properties?
  console.log("\n=== Keys on agent docs (union across all agents) ===");
  const agentDocs = await aposDocs.find({ type: "agent" }).toArray();
  const agentKeyUnion = new Set<string>();
  for (const a of agentDocs) for (const k of Object.keys(a)) agentKeyUnion.add(k);
  console.log([...agentKeyUnion].sort().join(", "));
  const propRelKeys = [...agentKeyUnion].filter((k) => /propert|listing|_id$Ids/i.test(k));
  console.log("\n  agent keys mentioning property/listing:", propRelKeys.length ? propRelKeys.join(", ") : "(none)");

  // 4. Cross-check: what are the actual agent _id values, and does any property
  //    field anywhere hold one of them (catch relations stored under odd names)?
  const agentIds = new Set(agentDocs.map((a) => String(a._id)));
  console.log(`\nAgent _id count: ${agentIds.size}`);
  // Scan a sample of property docs for ANY string value equal to an agent _id.
  const sampleCursor = aposDocs.find({ type: "property" }).limit(2000);
  const hitFields: Record<string, number> = {};
  for await (const doc of sampleCursor) {
    for (const [key, val] of Object.entries(doc)) {
      const vals = Array.isArray(val) ? val : [val];
      for (const v of vals) {
        if (typeof v === "string" && agentIds.has(v)) {
          hitFields[key] = (hitFields[key] || 0) + 1;
        }
      }
    }
  }
  console.log("\n=== Property fields (first 2000 docs) whose value IS an agent _id ===");
  const hits = Object.entries(hitFields).sort((a, b) => b[1] - a[1]);
  if (hits.length === 0) console.log("  (none — no property field holds a known agent _id)");
  for (const [k, c] of hits) console.log(`  ${k}: ${c}`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Inspection failed:", err);
  process.exit(1);
});
