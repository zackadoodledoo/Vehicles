import pool from "../db/index.js";

/**
 * Save an incoming contact form submission
 */
export async function createContactMessage(name, email, message) {
  const sql = `
    INSERT INTO contact_messages (name, email, message)
    VALUES ($1, $2, $3)
  `;
  await pool.query(sql, [name, email, message]);
}

/**
 * Get all contact messages for the admin view
 * ADDED: required by admin dashboard (rubric: "view contact form submissions")
 */
export async function getAllContactMessages() {
  const result = await pool.query(
    `SELECT id, name, email, message, created_at
     FROM contact_messages
     ORDER BY created_at DESC`
  );
  return result.rows;
}