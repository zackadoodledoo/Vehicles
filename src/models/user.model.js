import pool from "../db/index.js";

/**
 * Get all users for admin dashboard
 */
export async function getAllUsers() {
  const sql = `
    SELECT id, name, email, role, created_at
    FROM users
    ORDER BY created_at DESC
  `;
  const result = await pool.query(sql);
  return result.rows;
}

/**
 * Get a single user by ID
 * FIX: was missing — required by deleteUser in admin.users.controller.js
 */
export async function getUserById(id) {
  const sql = `
    SELECT id, name, email, role, created_at
    FROM users
    WHERE id = $1
    LIMIT 1
  `;
  const result = await pool.query(sql, [id]);
  return result.rows[0] || null;
}

/**
 * Update a user's role
 */
export async function updateUserRoleById(userId, role) {
  await pool.query(
    `UPDATE users SET role = $1 WHERE id = $2`,
    [role, userId]
  );
}

/**
 * Reset a user's password
 */
export async function resetUserPasswordById(userId, hashedPassword) {
  await pool.query(
    `UPDATE users SET password_hash = $1 WHERE id = $2`,
    [hashedPassword, userId]
  );
}

/**
 * Delete a user
 */
export async function deleteUserById(id) {
  await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
}