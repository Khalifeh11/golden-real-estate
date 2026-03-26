import mongoose from "mongoose";
import bcrypt from "bcrypt";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/goldenland-real-estate";

async function seedAdmin() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db!;
  const users = db.collection("users");

  const existing = await users.findOne({ email: "admin@goldenland.com" });
  if (existing) {
    console.log("Admin user already exists, skipping.");
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash("admin123", 12);

  await users.insertOne({
    name: "Admin",
    email: "admin@goldenland.com",
    passwordHash,
    role: "ADMIN",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("Admin user created:");
  console.log("  Email: admin@goldenland.com");
  console.log("  Password: admin123");
  console.log("  ⚠️  Change this password after first login!");

  await mongoose.disconnect();
}

seedAdmin().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
