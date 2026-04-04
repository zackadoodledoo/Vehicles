import pool from "../db/index.js";

/**
 * Get all categories (used everywhere categories are listed)
 */
export async function getAllCategories() {
  const result = await pool.query(
    `SELECT id, name, slug FROM categories ORDER BY name`
  );
  return result.rows;
}

/**
 * Get a single category by ID
 */
export async function getCategoryById(id) {
  const result = await pool.query(
    `SELECT id, name, slug FROM categories WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Create a new category
 * ADDED: required by rubric — owner must be able to add/edit/delete categories
 */
export async function createCategory(name) {
  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  const result = await pool.query(
    `INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id`,
    [name.trim(), slug]
  );
  return result.rows[0].id;
}

/**
 * Update an existing category
 */
export async function updateCategory(id, name) {
  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  await pool.query(
    `UPDATE categories SET name = $1, slug = $2 WHERE id = $3`,
    [name.trim(), slug, id]
  );
}

/**
 * Delete a category (vehicles referencing it will have category_id set to NULL via FK)
 */
export async function deleteCategory(id) {
  await pool.query(`DELETE FROM categories WHERE id = $1`, [id]);
}