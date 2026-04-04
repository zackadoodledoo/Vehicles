import pool from "../db/index.js";

/**
 * Get paginated vehicles (optionally filtered by category)
 */
export async function getVehicles({ categorySlug = null, limit = 24, offset = 0 } = {}) {
  const sql = `
    SELECT
      v.id,
      v.title,
      v.price,
      v.year,
      v.mileage,
      v.image_url,
      c.slug AS category_slug
    FROM vehicles v
    LEFT JOIN categories c ON v.category_id = c.id
    WHERE ($1::text IS NULL OR c.slug = $1::text)
    ORDER BY v.id DESC
    LIMIT $2 OFFSET $3
  `;

  const result = await pool.query(sql, [categorySlug, limit, offset]);
  return result.rows;
}

/**
 * Get a single vehicle by ID
 */
export async function getVehicleById(id) {
  const sql = `
    SELECT
      v.id,
      v.title,
      v.price,
      v.year,
      v.mileage,
      v.image_url,
      v.description,
      v.category_id,
      c.slug AS category_slug
    FROM vehicles v
    LEFT JOIN categories c ON v.category_id = c.id
    WHERE v.id = $1
    LIMIT 1
  `;

  const result = await pool.query(sql, [id]);
  return result.rows[0] || null;
}

/**
 * Get latest vehicles for home page
 */
export async function getLatestVehicles(limit = 12) {
  const sql = `
    SELECT
      id,
      title,
      year,
      price
    FROM vehicles
    ORDER BY id DESC
    LIMIT $1
  `;

  const result = await pool.query(sql, [limit]);
  return result.rows;
}

/**
 * Create a new vehicle
 */
export async function createVehicle(data) {
  const {
    title,
    year,
    price = null,
    mileage = null,
    image_url = null,
    category_id = null,
    description = null
  } = data;

  const sql = `
    INSERT INTO vehicles (
      title,
      year,
      price,
      mileage,
      image_url,
      category_id,
      description
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING id
  `;

  const result = await pool.query(sql, [
    title,
    year,
    price,
    mileage,
    image_url,
    category_id,
    description
  ]);

  return result.rows[0].id;
}

/**
 * Update an existing vehicle
 */
export async function updateVehicle(id, data) {
  const {
    title,
    price,
    year,
    mileage,
    image_url = null,
    description = null,
    category_id = null
  } = data;

  const sql = `
    UPDATE vehicles
    SET
      title = $1,
      price = $2,
      year = $3,
      mileage = $4,
      image_url = $5,
      description = $6,
      category_id = $7
    WHERE id = $8
  `;

  await pool.query(sql, [
    title,
    price,
    year,
    mileage,
    image_url,
    description,
    category_id,
    id
  ]);
}

/**
 * Delete a vehicle
 */
export async function deleteVehicle(id) {
  const sql = `
    DELETE FROM vehicles
    WHERE id = $1
  `;

  await pool.query(sql, [id]);
}
