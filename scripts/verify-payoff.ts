import mongoose from "mongoose";
const MONGODB_URI = process.env.MONGODB_URI!;
async function run(){
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db!;
  const agents = db.collection("agents");
  const props = db.collection("properties");
  const MIN = new Date("2022-01-01T00:00:00.000Z");
  const visible = await agents.find({ trash: { $ne: true } }).project({_id:1,firstName:1,lastName:1}).toArray();
  console.log(`Visible agents: ${visible.length}`);
  let empty=0;
  for (const a of visible){
    // mirror getPropertiesByAgentId filters exactly
    const c = await props.countDocuments({ agentId:a._id, status:"ACTIVE", trash:{$ne:true}, createdAt:{ $gte: MIN } });
    if (c===0) empty++;
    console.log(`  ${((a.firstName||"")+" "+(a.lastName||"")).trim().padEnd(24)} ${c}`);
  }
  console.log(`\nVisible agents with 0 active listings (would show empty page): ${empty}`);
  const totalActiveWithAgent = await props.countDocuments({ status:"ACTIVE", trash:{$ne:true}, agentId:{$exists:true,$nin:[null,""]} });
  console.log(`Total active listings now carrying an agentId: ${totalActiveWithAgent}/5062`);
  await mongoose.disconnect();
}
run().catch(e=>{console.error(e);process.exit(1)});
