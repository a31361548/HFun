import bcrypt from "bcrypt";
import connectDB from "@/lib/db/connect";
import User from "@/lib/db/models/user";

let seeded = false;
let seeding: Promise<void> | null = null;

export async function seedAdminUser(): Promise<void> {
  // Avoid multiple parallel seeds
  if (seeded) {
    return;
  }

  if (seeding) {
    return await seeding;
  }

  seeding = (async () => {
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
      console.warn("⚠️  ADMIN_USERNAME or ADMIN_PASSWORD not set in .env.local");
      seeded = true;
      return;
    }

    try {
      await connectDB();

      // Check if admin already exists
      const existingAdmin = await User.findOne({ username: ADMIN_USERNAME });

      if (existingAdmin) {
        console.log("✅ Admin user already exists");
        seeded = true;
        return;
      }

      // Create admin user
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

      await User.create({
        username: ADMIN_USERNAME,
        passwordHash,
        name: "Administrator",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${ADMIN_USERNAME}`,
        role: "Admin",
        status: "Active",
      });

      console.log("✅ Admin user created successfully");
      seeded = true;
    } catch (error) {
      // If error is duplicate key, it's okay
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === 11000
      ) {
        console.log("✅ Admin user already exists (race condition)");
        seeded = true;
      } else {
        console.error("❌ Failed to seed admin user:", error);
        throw error;
      }
    } finally {
      seeding = null;
    }
  })();

  return await seeding;
}
