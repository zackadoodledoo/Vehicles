import pool from "../db/index.js";

/**
 * Create a new user account
 */
export async function createUser(email, passwordHash, name = null) {
  const sql = `
    INSERT INTO users (email, password_hash, name)
    VALUES ($1, $2, $3)
    RETURNING id, email, role, name
  `;

  const result = await pool.query(sql, [email, passwordHash, name]);
  return result.rows[0];
}

/**
 * Find a user by email (for login)
 */
export async function findUserByEmail(email) {
  const sql = `
    SELECT
      id,
      email,
      password_hash,
      role,
      name
    FROM users
    WHERE email = $1
    LIMIT 1
  `;

  const result = await pool.query(sql, [email]);
  return result.rows[0] || null;
}
