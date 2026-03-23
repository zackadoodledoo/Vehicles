import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import pool from "../db/index.js";

async function seedUsers() {
  // Hash a test password
  const hashedPassword = await bcrypt.hash("P@ssw0rd!", 10);

  // Insert users with roles
  await pool.query(
    `
    INSERT INTO users (name, email, password, role_id)
    VALUES
      ('Owner User', 'owner@example.com', $1, 1),
      ('Employee User', 'employee@example.com', $1, 2),
      ('Regular User', 'user@example.com', $1, 3)
    ON CONFLICT (email) DO NOTHING;
    `,
    [hashedPassword]
  );

  console.log("Users seeded successfully");
  process.exit();
}

seedUsers().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
