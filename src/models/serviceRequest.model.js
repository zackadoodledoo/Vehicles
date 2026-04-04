import pool from "../db/index.js";

/**
 * Create a new service request
 * FIX: default status is 'submitted' (not 'pending') to match the
 *      allowed values in updateRequestStatus: submitted | in_progress | completed
 */
export async function createServiceRequest({ user_id, vehicle_id, message }) {
  const sql = `
    INSERT INTO service_requests (user_id, vehicle_id, message, status)
    VALUES ($1, $2, $3, 'submitted')
    RETURNING id
  `;
  const result = await pool.query(sql, [user_id, vehicle_id, message]);
  return result.rows[0].id;
}

/**
 * Get service requests for a specific user
 * FIX: was selecting r.title and r.service_type which don't exist on service_requests.
 *      Now selects correct columns: sr.message, sr.status, v.title AS vehicle_title
 */
export async function getServiceRequestsByUser(userId) {
  const sql = `
    SELECT
      sr.id,
      sr.message,
      sr.status,
      sr.created_at,
      v.title AS vehicle_title
    FROM service_requests sr
    LEFT JOIN vehicles v ON sr.vehicle_id = v.id
    WHERE sr.user_id = $1
    ORDER BY sr.created_at DESC
  `;
  const result = await pool.query(sql, [userId]);
  return result.rows;
}

/**
 * Get all service requests (employee / owner view)
 */
export async function getAllServiceRequests() {
  const sql = `
    SELECT
      sr.id,
      sr.message,
      sr.status,
      sr.created_at,
      u.email AS user_email,
      v.title AS vehicle_title
    FROM service_requests sr
    JOIN  users u    ON sr.user_id    = u.id
    LEFT JOIN vehicles v ON sr.vehicle_id = v.id
    ORDER BY sr.created_at DESC
  `;
  const result = await pool.query(sql);
  return result.rows;
}

/**
 * Update service request status
 */
export async function updateServiceRequestStatus(id, status) {
  await pool.query(
    `UPDATE service_requests SET status = $1 WHERE id = $2`,
    [status, id]
  );
}