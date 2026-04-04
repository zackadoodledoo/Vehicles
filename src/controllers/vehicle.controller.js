// src/controllers/vehicle.controller.js
// Controller for vehicle routes (index, show, new, create).
// Uses ES module exports to match a modern Node setup.

import {
  getVehicles,
  getVehicleById,
  createVehicle as createVehicleModel
} from '../models/vehicle.model.js';

// ---------------------------------------------
// Image helpers
// ---------------------------------------------

function placeholderForCategory(slug) {
  const s = (slug || '').toString().toLowerCase();
  if (s === 'trucks') return '/images/placeholder-truck.jpg';
  if (s === 'vans') return '/images/placeholder-van.jpg';
  return '/images/placeholder-vehicle.jpg';
}

function resolveVehicleImage(vehicle) {
  // Explicit image from DB (ignore bad legacy values)
  if (
    vehicle.image_url &&
    typeof vehicle.image_url === 'string' &&
    vehicle.image_url.trim() &&
    vehicle.image_url !== '[null]' &&
    !vehicle.image_url.endsWith('.svg')
  ) {
    return vehicle.image_url.trim();
  }

  // Derive image from title (Option 2)
  if (vehicle.title) {
    const slug = vehicle.title
      .toLowerCase()
      .replace(/^\d+\s*/, '') // remove leading year
      .replace(/[^a-z0-9]+/g, '-');

    return `/images/vehicles/makes/${slug}.jpg`;
  }

  // Category placeholder fallback
  return placeholderForCategory(vehicle.category_slug);
}

// ---------------------------------------------
// GET /vehicles
// ---------------------------------------------

export async function showVehicleListings(req, res, next) {
  try {
    const categorySlug = req.query.category || null;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = 24;
    const offset = (page - 1) * limit;

    const vehiclesRaw = await getVehicles({
      categorySlug,
      limit,
      offset
    });

    const vehicles = (vehiclesRaw || []).map((v) => {
      const rowSlug = (v.category_slug || categorySlug || '')
        .toString()
        .toLowerCase();

      const image_url = resolveVehicleImage({
        image_url: v.image_url,
        title: v.title,
        category_slug: rowSlug
      });

      return {
        id: v.id,
        title: v.title,
        year: v.year,
        price: v.price,
        mileage: v.mileage || null,
        image_url,
        category_slug: v.category_slug || null
      };
    });

    return res.render('vehicles/index', {
      vehicles,
      page,
      category: categorySlug
    });
  } catch (err) {
    console.error('showVehicleListings error:', err);
    return next(err);
  }
}

// ---------------------------------------------
// GET /vehicles/:id
// ---------------------------------------------

export async function showVehicleDetails(req, res, next) {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).send('Vehicle id required');

    const vehicle = await getVehicleById(id);

    if (!vehicle) {
      const err = new Error('Page Not Found');
      err.status = 404;
      return next(err);
    }

    const image_url = resolveVehicleImage({
      image_url: vehicle.image_url,
      title: vehicle.title,
      category_slug: vehicle.category_slug
    });

    return res.render('vehicles/show', {
      vehicle: { ...vehicle, image_url },
      session: req.session
    });
  } catch (err) {
    console.error('showVehicleDetails error:', err);
    return next(err);
  }
}

// ---------------------------------------------
// GET /vehicles/new
// ---------------------------------------------

export function newVehicleForm(req, res) {
  return res.render('vehicles/create', { vehicle: {} });
}

// ---------------------------------------------
// POST /vehicles
// ---------------------------------------------

export async function createVehicle(req, res, next) {
  try {
    const {
      title,
      year,
      price,
      mileage,
      image_url,
      category_id,
      description
    } = req.body;

    if (!title || !year) {
      return res.status(400).render('vehicles/create', {
        vehicle: req.body,
        error: 'Title and year are required.'
      });
    }

    const newId = await createVehicleModel({
      title,
      year,
      price,
      mileage,
      image_url,
      category_id,
      description
    });

    return res.redirect(`/vehicles/${newId}`);
  } catch (err) {
    console.error('createVehicle error:', err);
    return next(err);
  }
}
