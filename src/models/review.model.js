import pool from '../db/index.js';

export async function getAllReviews() {
  const result = await pool.query(`
    SELECT
      r.id,
      r.rating,
      r.comment,
      r.created_at,
      v.title AS vehicle_title,
      u.name AS reviewer
    FROM reviews r
    LEFT JOIN vehicles v ON r.vehicle_id = v.id
    LEFT JOIN users u ON r.user_id = u.id
    ORDER BY r.created_at DESC
  `);

  return result.rows;
}

export async function deleteReviewById(id) {
  await pool.query(
    'DELETE FROM reviews WHERE id = $1',
    [id]
  );
}
