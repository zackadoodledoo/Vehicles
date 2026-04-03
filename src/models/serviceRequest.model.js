import pool from '../db/index.js';

export async function createServiceRequest({ userId, vehicleId, serviceType, description }) {
  await pool.query(
    `
    INSERT INTO service_requests (user_id, vehicle_id, service_type, description)
    VALUES ($1, $2, $3, $4)
    `,
    [userId, vehicleId, vehicleId ? serviceType : serviceType, description]
  );
}

export async function getUserServiceRequests(userId) {
  const result = await pool.query(
    `
    SELECT sr.*, v.title AS vehicle_title
    FROM service_requests sr
    LEFT JOIN vehicles v ON sr.vehicle_id = v.id
    WHERE sr.user_id = $1
    ORDER BY sr.created_at DESC
    `,
    [userId]
  );
  return result.rows;
}

export async function getAllServiceRequests() {
  const result = await pool.query(
    `
    SELECT
      sr.*,
      u.name AS requester_name,
      v.title AS vehicle_title
    FROM service_requests sr
    LEFT JOIN users u ON sr.user_id = u.id
    LEFT JOIN vehicles v ON sr.vehicle_id = v.id
    ORDER BY sr.created_at DESC
    `
  );
  return result.rows;
}

export async function updateServiceStatus(id, status) {
  await pool.query(
    `
    UPDATE service_requests
    SET status = $1
    WHERE id = $2
    `,
    [status, id]
  );
}
