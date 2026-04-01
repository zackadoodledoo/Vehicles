import pool from "../db/index.js";

export async function getAllVehicles() {
  const result = await pool.query(
    `SELECT id, title, price, year, mileage
     FROM vehicles
     ORDER BY created_at DESC`
  );
  return result.rows;
}

export async function getVehicleById(id) {
  const result = await pool.query(
    `SELECT *
     FROM vehicles
     WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

export async function createVehicle(data) {
  const { title, year, mileage, price } = data;

  await pool.query(
    `INSERT INTO vehicles (title, year, mileage, price)
     VALUES ($1, $2, $3, $4)`,
    [title, year, mileage, price]
  );
}


export async function updateVehicle(id, data) {
  const { title, price, year, mileage } = data;
  
  await pool.query(
    `UPDATE vehicles
     SET title = $1, price = $2, year = $3, mileage = $4
     WHERE id = $5`,
    [title, price, year, mileage, id]
  );
}

export async function deleteVehicle(id) {
  await pool.query(
    `DELETE FROM vehicles WHERE id = $1`,
    [id]
  );
}
