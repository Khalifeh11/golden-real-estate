import mongoose from "mongoose";
const MONGODB_URI = process.env.MONGODB_URI!;
const DUP_ID = "ckww7e5t8jns6pdxy6uqpb4o9";
async function run(){
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db!;
  const agents = db.collection("agents");
  const properties = db.collection("properties");
  // Safety: never trash a doc that actually holds listings.
  const listings = await properties.countDocuments({ agentId: DUP_ID });
  if (listings > 0) { console.error(`ABORT: ${DUP_ID} has ${listings} listings; not an empty dupe.`); process.exit(1); }
  const res = await agents.updateOne({ _id: DUP_ID as unknown as object }, { $set: { trash: true } });
  console.log(`trashed ${DUP_ID}: matched=${res.matchedCount} modified=${res.modifiedCount}`);
  const remaining = await agents.countDocuments({ trash: { $ne: true } });
  console.log(`visible agents remaining: ${remaining}`);
  await mongoose.disconnect();
}
run().catch(e=>{console.error(e);process.exit(1)});
