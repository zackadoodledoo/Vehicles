import pool from "../db/index.js";

export async function getAllCategories() {
  const result = await pool.query(
    "SELECT id, name FROM categories ORDER BY name"
  );
  return result.rows;
}
