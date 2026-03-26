import pool from "../db/index.js";

export async function createServiceRequest(userId, vehicleId, message) {
  await pool.query(
    `INSERT INTO service_requests (user_id, vehicle_id, message, status)
     VALUES ($1, $2, $3, 'submitted')`,
    [userId, vehicleId, message]
  );
}

export async function getUserServiceRequests(userId) {
  const result = await pool.query(
    `SELECT sr.*, v.title
     FROM service_requests sr
     LEFT JOIN vehicles v ON sr.vehicle_id = v.id
     WHERE sr.user_id = $1
     ORDER BY sr.created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function getAllServiceRequests() {
  const result = await pool.query(
    `SELECT sr.*, u.email, v.title
     FROM service_requests sr
     JOIN users u ON sr.user_id = u.id
     LEFT JOIN vehicles v ON sr.vehicle_id = v.id
     ORDER BY sr.created_at DESC`
  );
  return result.rows;
}

export async function updateServiceStatus(id, status) {
  await pool.query(
    `UPDATE service_requests
     SET status = $1
     WHERE id = $2`,
    [status, id]
  );
}
