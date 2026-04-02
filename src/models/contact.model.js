import pool from "../db/index.js";

/**
 * Get all categories for dashboards and navigation
 */
export async function getAllCategories() {
  const sql = `
    SELECT
      name,
      slug
    FROM categories
    ORDER BY name
  `;

  const result = await pool.query(sql);
  return result.rows;
}
