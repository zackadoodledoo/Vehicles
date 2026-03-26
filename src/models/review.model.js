import pool from "../db/index.js";

/**
 * Create a new review for a vehicle
 */
export async function createReview(userId, vehicleId, rating, comment) {
  await pool.query(
    `INSERT INTO reviews (user_id, vehicle_id, rating, comment)
     VALUES ($1, $2, $3, $4)`,
    [userId, vehicleId, rating, comment]
  );
}

/**
 * Get all reviews for a specific vehicle
 */
export async function getReviewsByVehicle(vehicleId) {
  const result = await pool.query(
    `SELECT r.*, u.email
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     WHERE r.vehicle_id = $1
     ORDER BY r.created_at DESC`,
    [vehicleId]
  );

  return result.rows;
}

/**
 * Delete a review (used by employees/admins)
 */
export async function deleteReview(reviewId) {
  await pool.query(
    `DELETE FROM reviews WHERE id = $1`,
    [reviewId]
  );
}
