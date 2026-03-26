import pool from "../db/index.js";
import { getAllVehicles, getVehicleById } from "../models/vehicle.model.js";

export function showCreateVehicleForm(req, res) {
  res.render("vehicles/create");
}

export async function createVehicle(req, res, next) {
  try {
    const { make, model, year, price, mileage } = req.body;

    const title = `${year} ${make} ${model}`;
    const description = `${make} ${model}`;

    await pool.query(
      `INSERT INTO vehicles (title, description, year, price, mileage)
       VALUES ($1, $2, $3, $4, $5)`,
      [title, description, year, price, mileage]
    );

    res.redirect("/dashboard");
  } catch (err) {
    next(err);
  }
}


export async function showVehicleListings(req, res, next) {
  try {
    const vehicles = await getAllVehicles();
    res.render("vehicles/index", { vehicles });
  } catch (err) {
    next(err);
  }
}

export async function showVehicleDetails(req, res, next) {
  try {
    const vehicle = await getVehicleById(req.params.id);
    if (!vehicle) return res.status(404).render("404");
    res.render("vehicles/show", { vehicle });
  } catch (err) {
    next(err);
  }
}