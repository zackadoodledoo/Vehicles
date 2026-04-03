import pool from "../db/index.js";

/**
 * Create a new contact message
 */
export async function createContactMessage(name, email, message) {
  const sql = `
    INSERT INTO contact_messages (name, email, message)
    VALUES ($1, $2, $3)
  `;

  await pool.query(sql, [name, email, message]);
}
