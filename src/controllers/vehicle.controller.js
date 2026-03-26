// src/controllers/vehicle.controller.js
import pool from "../db/index.js";
import { getVehicleById } from "../models/vehicle.model.js";

function splitTitleToParts(title = '') {
  const t = (title || '').toString().trim();
  const withoutYear = t.replace(/^\s*\d{4}\s*/, '');
  const parts = withoutYear.split(/\s+/);
  return {
    make: parts.length > 1 ? parts[0] : '',
    model: parts.length > 1 ? parts.slice(1).join(' ') : withoutYear || t
  };
}

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
    const categorySlug = (req.query.category || '').toString().toLowerCase();

    const params = categorySlug ? [categorySlug, 24] : [24];
    const vehiclesResult = await pool.query(
      `SELECT v.id, v.title, v.year, v.price, c.slug AS category_slug
       FROM vehicles v
       LEFT JOIN categories c ON v.category_id = c.id
       ${categorySlug ? 'WHERE c.slug = $1' : ''}
       ORDER BY v.created_at DESC
       LIMIT $2`,
      params
    );

    const vehicles = (vehiclesResult.rows || []).map(v => {
      const parts = splitTitleToParts(v.title || '');
      const rowSlug = (v.category_slug || categorySlug || '').toString().toLowerCase();
      const isTruck = rowSlug === 'trucks';
      const isVan = rowSlug === 'vans';
      return {
        id: v.id,
        make: parts.make,
        model: parts.model,
        year: v.year,
        price: v.price,
        image_url: v.image_url || (isTruck
          ? '/images/placeholder-truck.jpg'
          : isVan
            ? '/images/placeholder-van.svg'
            : '/images/placeholder-vehicle.jpg')
      };
    });

    return res.render("vehicles/index", { vehicles, category: categorySlug });
  } catch (err) {
    return next(err);
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
