import mongoose from "mongoose";
async function run() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const p = mongoose.connection.db!.collection("properties");
  const doc = await p.findOne(
    { trash: { $ne: true }, status: "ACTIVE", "images.0": { $exists: true } },
    { projection: { images: { $slice: 1 }, title: 1 } }
  );
  console.log("sample image obj:", JSON.stringify(doc?.images?.[0], null, 2));
  const agg = await p
    .aggregate([
      { $match: { trash: { $ne: true }, status: "ACTIVE" } },
      { $unwind: "$images" },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          hasThumb: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ["$images.thumbnailUrl", null] }, { $ne: ["$images.thumbnailUrl", ""] }] },
                1,
                0,
              ],
            },
          },
          thumbEqUrl: { $sum: { $cond: [{ $eq: ["$images.thumbnailUrl", "$images.url"] }, 1, 0] } },
        },
      },
    ])
    .toArray();
  console.log("image url stats:", JSON.stringify(agg[0], null, 2));
  await mongoose.disconnect();
}
run().catch((e) => {
  console.error(e);
  process.exit(1);
});
