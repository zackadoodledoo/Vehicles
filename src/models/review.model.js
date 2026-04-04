import pool from '../db/index.js';

/**
 * Create a new review
 * FIX: renamed 'comment' -> 'content' to match controller and schema
 */
export async function createReview({ vehicleId, userId, rating, content }) {
  await pool.query(
    `INSERT INTO reviews (vehicle_id, user_id, rating, content)
     VALUES ($1, $2, $3, $4)`,
    [vehicleId, userId, rating, content]
  );
}

/**
 * Get recent reviews for a vehicle
 * FIX: SELECT r.content instead of r.comment
 * FIX: added r.user_id so the view can check ownership for edit/delete buttons
 */
export async function getRecentReviews(vehicleId) {
  const result = await pool.query(
    `SELECT
       r.id,
       r.rating,
       r.content,
       r.created_at,
       r.user_id,
       u.name
     FROM reviews r
     LEFT JOIN users u ON r.user_id = u.id
     WHERE r.vehicle_id = $1
     ORDER BY r.created_at DESC`,
    [Number(vehicleId)]
  );
  return result.rows;
}

/**
 * Admin moderation delete
 */
export async function deleteReviewById(id) {
  await pool.query(`DELETE FROM reviews WHERE id = $1`, [id]);
}

/**
 * Admin dashboard — all reviews
 * FIX: SELECT r.content instead of r.comment
 */
export async function getAllReviews() {
  const result = await pool.query(
    `SELECT
       r.id,
       r.rating,
       r.content,
       r.created_at,
       v.title AS vehicle_title,
       u.name  AS reviewer
     FROM reviews r
     LEFT JOIN vehicles v ON r.vehicle_id = v.id
     LEFT JOIN users u    ON r.user_id    = u.id
     ORDER BY r.created_at DESC`
  );
  return result.rows;
}