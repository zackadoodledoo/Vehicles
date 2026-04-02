import pool from "../db/index.js";

/**
 * Get all users for admin dashboard
 */
export async function getAllUsers() {
  const sql = `
    SELECT
      id,
      name,
      email,
      role,
      created_at
    FROM users
    ORDER BY created_at DESC
  `;

  const result = await pool.query(sql);
  return result.rows;
}

/**
 * Update a user's role
 */
export async function updateUserRoleById(userId, role) {
  const sql = `
    UPDATE users
    SET role = $1
    WHERE id = $2
  `;

  await pool.query(sql, [role, userId]);
}

/**
 * Reset a user's password
 */
export async function resetUserPasswordById(userId, hashedPassword) {
  const sql = `
    UPDATE users
    SET password_hash = $1
    WHERE id = $2
  `;

  await pool.query(sql, [hashedPassword, userId]);
}
