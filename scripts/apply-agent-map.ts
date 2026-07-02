/**
 * Apply the exported property→agent map (from export-agent-map.ts) to the DB in
 * MONGODB_URI (prod). Matches on the stable CMS _id.
 *
 * SAFETY — fill-blanks-only: a property is updated ONLY when its current agentId
 * is empty/missing. Existing links (e.g. admin reassignments made on prod) are
 * NEVER overwritten. A mapped agent is only applied if it exists in prod agents.
 *
 * Idempotent. Dry-run by default; set APPLY=1 to commit.
 *
 * Run (dry-run):  MAP_FILE=/abs/path/agent-map.json \
 *                 npx tsx --env-file=.env.local scripts/apply-agent-map.ts
 * Run (commit):   APPLY=1 MAP_FILE=/abs/path/agent-map.json \
 *                 npx tsx --env-file=.env.local scripts/apply-agent-map.ts
 */
import { readFileSync } from "node:fs";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI not set");
const MAP_FILE = process.env.MAP_FILE;
if (!MAP_FILE) throw new Error("MAP_FILE not set");
const APPLY = process.env.APPLY === "1";

type MapEntry = { _id: string; agentId: string };
type BulkOp = { updateOne: { filter: { _id: string }; update: { $set: { agentId: string } } } };

// Duplicate-agent survivor differs between local and prod. Michel Boutros is the
// same person (michel@goldenlandrealestate.net) under two ids: local kept
// `ckww4ow…` as canonical (holds his 1,757 CMS listings), but on prod the live
// record is `ckww7e5…` (the other is already trashed). Translate so his CMS
// listings attach to his VISIBLE prod record instead of the hidden one.
const AGENT_REMAP: Record<string, string> = {
  ckww4ow4mjm2tpdxyb71og8zo: "ckww7e5t8jns6pdxy6uqpb4o9",
};

async function run() {
  const map: MapEntry[] = JSON.parse(readFileSync(MAP_FILE!, "utf8"));
  console.log(`Loaded ${map.length} mapped links from ${MAP_FILE}`);

  await mongoose.connect(MONGODB_URI!);
  const db = mongoose.connection.db!;
  const agentsColl = db.collection("agents");
  const props = db.collection("properties");

  const validAgentIds = new Set(
    (await agentsColl.find({}).project({ _id: 1 }).toArray()).map((a) => String(a._id)),
  );

  // Current prod state for active, non-trash props: _id -> current agentId ("" if none).
  const prodActive = await props
    .find({ status: "ACTIVE", trash: { $ne: true } })
    .project({ _id: 1, agentId: 1 })
    .toArray();
  const prodAgentId = new Map<string, string>();
  for (const p of prodActive) prodAgentId.set(String(p._id), p.agentId ? String(p.agentId) : "");

  const ops: BulkOp[] = [];
  let propNotOnProd = 0;   // mapped id absent from prod's active set
  let alreadyLinked = 0;   // prod already has an agentId -> left untouched
  let agentMissing = 0;    // mapped agent doesn't exist in prod agents

  let remapped = 0;
  for (const m of map) {
    const target = AGENT_REMAP[m.agentId] ?? m.agentId;
    if (target !== m.agentId) remapped++;
    if (!prodAgentId.has(m._id)) { propNotOnProd++; continue; }
    const current = prodAgentId.get(m._id)!;
    if (current) { alreadyLinked++; continue; }        // fill-blanks-only
    if (!validAgentIds.has(target)) { agentMissing++; continue; }
    ops.push({ updateOne: { filter: { _id: m._id }, update: { $set: { agentId: target } } } });
  }

  const prodActiveTotal = prodActive.length;
  const prodAlreadyLinkedTotal = [...prodAgentId.values()].filter(Boolean).length;
  const unmappedBlanks = prodActiveTotal - prodAlreadyLinkedTotal - ops.length;

  console.log(`\nProd active (non-trash) props:     ${prodActiveTotal}`);
  console.log(`  already linked (untouched):      ${prodAlreadyLinkedTotal}`);
  console.log(`\nFrom the map:`);
  console.log(`  WOULD FILL blank agentId:        ${ops.length}`);
  console.log(`  skipped, already linked on prod: ${alreadyLinked}`);
  console.log(`  skipped, mapped id not on prod:  ${propNotOnProd}`);
  console.log(`  skipped, agent missing on prod:  ${agentMissing}`);
  console.log(`  (of which agent-id remapped:     ${remapped})`);
  console.log(`\nAfter apply, prod active props still with NO agentId: ${unmappedBlanks}`);

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
