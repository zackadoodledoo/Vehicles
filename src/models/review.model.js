import pool from "../db/index.js";

/**
 * Create a new review for a vehicle
 */
export async function createReview(userId, vehicleId, rating, comment) {
  const sql = `
    INSERT INTO reviews (user_id, vehicle_id, rating, comment)
    VALUES ($1, $2, $3, $4)
  `;

  await pool.query(sql, [userId, vehicleId, rating, comment]);
}

/**
 * Get all reviews for a specific vehicle
 */
export async function getReviewsByVehicle(vehicleId) {
  const sql = `
    SELECT
      r.id,
      r.rating,
      r.comment,
      r.created_at,
      u.email
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.vehicle_id = $1
    ORDER BY r.created_at DESC
  `;

  const result = await pool.query(sql, [vehicleId]);
  return result.rows;
}

/**
 * Get recent reviews for the public reviews page
 */
export async function getRecentReviews(limit = 25) {
  const sql = `
    SELECT
      r.id,
      r.rating,
      r.comment,
      r.created_at,
      v.title AS vehicle_title
    FROM reviews r
    LEFT JOIN vehicles v ON r.vehicle_id = v.id
    ORDER BY r.id DESC
    LIMIT $1
  `;

  const result = await pool.query(sql, [limit]);
  return result.rows;
}

/**
 * Delete a review (used by employees/admins)
 */
export async function deleteReview(reviewId) {
  const sql = `
    DELETE FROM reviews
    WHERE id = $1
  `;

  await pool.query(sql, [reviewId]);
}
