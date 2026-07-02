/**
 * Backfill `properties.agentId` from the intact ApostropheCMS source relation.
 *
 * Root cause: migrate-mongo.ts:381 read `doc.agentId` from source aposDocs, but
 * the CMS stores the property→agent relation in `doc.agent`. So only 6 of 7,955
 * properties ever got an agentId. This restores it for the ACTIVE catalog.
 *
 * Scope: status=ACTIVE, trash != true only (public listings).
 * Idempotent: only writes docs whose agentId differs from source truth.
 * Dry-run by default. Set APPLY=1 to commit.
 *
 * Run (dry-run):  npx tsx scripts/backfill-agent-ids.ts
 * Run (commit):   APPLY=1 npx tsx scripts/backfill-agent-ids.ts
 */
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI not set");
const APPLY = process.env.APPLY === "1";

async function run() {
  await mongoose.connect(MONGODB_URI!);
  const db = mongoose.connection.db!;
  const aposDocs = db.collection("aposDocs");
  const agentsColl = db.collection("agents");
  const props = db.collection("properties");

  // Source truth: property _id -> agent id.
  const propAgent = new Map<string, string>();
  for await (const d of aposDocs.find({ type: "property" }).project({ _id: 1, agent: 1 })) {
    if (typeof d.agent === "string" && d.agent.trim()) propAgent.set(String(d._id), d.agent.trim());
  }
  console.log(`Source property→agent relations: ${propAgent.size}`);

  // Guard: only accept agent ids that exist in the migrated agents collection.
  const validAgentIds = new Set(
    (await agentsColl.find({}).project({ _id: 1 }).toArray()).map((a) => String(a._id)),
  );

  const active = await props
    .find({ status: "ACTIVE", trash: { $ne: true } })
    .project({ _id: 1, agentId: 1 })
    .toArray();

  type BulkOp = { updateOne: { filter: { _id: string }; update: { $set: { agentId: string } } } };
  const ops: BulkOp[] = [];
  let alreadyCorrect = 0;
  let noSource = 0;
  let invalidRef = 0;
  const changingFrom: Record<string, number> = {};

  for (const p of active) {
    const desired = propAgent.get(String(p._id));
    if (!desired) { noSource++; continue; }
    if (!validAgentIds.has(desired)) { invalidRef++; continue; }
    const current = p.agentId ? String(p.agentId) : "";
    if (current === desired) { alreadyCorrect++; continue; }
    changingFrom[current || "(none)"] = (changingFrom[current || "(none)"] || 0) + 1;
    ops.push({ updateOne: { filter: { _id: p._id as string }, update: { $set: { agentId: desired } } } });
  }

  console.log(`\nActive (non-trash) properties:  ${active.length}`);
  console.log(`  already correct:              ${alreadyCorrect}`);
  console.log(`  no source relation:           ${noSource}`);
  console.log(`  source ref not in agents:     ${invalidRef}`);
  console.log(`  WOULD SET agentId:            ${ops.length}`);
  console.log(`    previous value breakdown:   ${JSON.stringify(changingFrom)}`);

  if (!APPLY) {
    console.log(`\n[DRY RUN] no writes. Re-run with APPLY=1 to commit.`);
    await mongoose.disconnect();
    return;
  }

  if (ops.length === 0) {
    console.log(`\nNothing to write.`);
  } else {
    const res = await props.bulkWrite(
      ops as unknown as Parameters<typeof props.bulkWrite>[0],
      { ordered: false },
    );
    console.log(`\n[APPLIED] modifiedCount=${res.modifiedCount}, matchedCount=${res.matchedCount}`);
  }
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
