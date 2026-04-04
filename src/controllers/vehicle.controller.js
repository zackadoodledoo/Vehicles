// src/controllers/vehicle.controller.js

import {
  getVehicles,
  getVehicleById,
  createVehicle as createVehicleModel
} from '../models/vehicle.model.js';

import { getRecentReviews } from '../models/review.model.js';

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
  if (
    vehicle.image_url &&
    typeof vehicle.image_url === 'string' &&
    vehicle.image_url.trim() &&
    vehicle.image_url !== '[null]' &&
    !vehicle.image_url.endsWith('.svg')
  ) {
    return vehicle.image_url.trim();
  }

  if (vehicle.title) {
    const slug = vehicle.title
      .toLowerCase()
      .replace(/^\d+\s*/, '')
      .replace(/[^a-z0-9]+/g, '-');

    return `/images/vehicles/makes/${slug}.jpg`;
  }

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

    const vehiclesRaw = await getVehicles({ categorySlug, limit, offset });

    const vehicles = (vehiclesRaw || []).map(v => ({
      id: v.id,
      title: v.title,
      year: v.year,
      price: v.price,
      mileage: v.mileage || null,
      image_url: resolveVehicleImage(v),
      category_slug: v.category_slug || null
    }));

    return res.render('vehicles/index', { vehicles, page, category: categorySlug });
  } catch (err) {
    console.error('showVehicleListings error:', err);
    next(err);
  }
}

// ---------------------------------------------
// GET /vehicles/:id
// ---------------------------------------------

export async function showVehicleDetails(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(404).send('Vehicle not found');
    }

    const vehicle = await getVehicleById(id);
    if (!vehicle) {
      return res.status(404).send('Vehicle not found');
    }

    const image_url = resolveVehicleImage(vehicle);
    const reviews = await getRecentReviews(id);

    return res.render('vehicles/show', {
      vehicle: { ...vehicle, image_url },
      reviews,
      session: req.session
    });
  } catch (err) {
    console.error('showVehicleDetails error:', err);
    next(err);
  }
}

// ---------------------------------------------
// GET /vehicles/new
// ---------------------------------------------

export function newVehicleForm(req, res) {
  res.render('vehicles/create', { vehicle: {} });
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

    res.redirect(`/vehicles/${newId}`);
  } catch (err) {
    console.error('createVehicle error:', err);
    next(err);
  }
}
