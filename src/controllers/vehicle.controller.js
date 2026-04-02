// src/controllers/vehicle.controller.js
// Controller for vehicle routes (index, show, new, create).
// Uses ES module exports to match a modern Node setup.
// Assumes you have a `db` or `pool` module that exposes query execution.
// Adjust the DB calls to match your project's data access layer.
import { getVehicles, getVehicleById, createVehicle as createVehicleModel } from '../models/vehicle.model.js';
import { splitTitleToParts } from '../lib/helpers.js'; // optional helper used elsewhere; adjust or inline if missing

// Helper: choose placeholder based on category slug
function placeholderForCategory(slug) {
  const s = (slug || '').toString().toLowerCase();
  if (s === 'trucks') return '/images/placeholder-truck.jpg';
  if (s === 'vans') return '/images/placeholder-van.jpg';
  return '/images/placeholder-vehicle.jpg';
}

// Normalize a single image URL (ensures no .svg placeholders leak through)
function resolveVehicleImage(vehicle) {
  // Explicit vehicle image (from DB)
  if (
    vehicle.image_url &&
    typeof vehicle.image_url === "string" &&
    vehicle.image_url.trim() &&
    !vehicle.image_url.endsWith(".svg")
  ) {
    return vehicle.image_url.trim();
  }

  // Make + model image (static asset)
  if (vehicle.make && vehicle.model) {
    const slug = `${vehicle.make}-${vehicle.model}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");

    return `/images/vehicles/makes/${slug}.jpg`;
  }

  // Category placeholder
  return placeholderForCategory(vehicle.category_slug);
}



/**
 * GET /vehicles
 * Render a paginated list of vehicles.
 */
export async function showVehicleListings(req, res, next) {
  try {
    // Accept optional category and page query params
    const categorySlug = req.query.category || null;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = 24;
    const offset = (page - 1) * limit;

    const vehiclesRaw = await getVehicles({
      categorySlug,
      limit,
      offset
});


    // Normalize rows and image_url
    const vehicles = (vehiclesRaw || []).map((v) => {
      const parts = splitTitleToParts ? splitTitleToParts(v.title || '') : { make: '', model: '' };
      const rowSlug = (v.category_slug || categorySlug || '').toString().toLowerCase();

      const image_url = resolveVehicleImage({
        image_url: v.image_url,
        make: parts.make,
        model: parts.model,
        category_slug: rowSlug
});


      return {
        id: v.id,
        title: v.title,
        make: parts.make,
        model: parts.model,
        year: v.year,
        price: v.price,
        mileage: v.mileage || null,
        image_url,
        category_slug: v.category_slug || null
      };
    });

    // Debug log (keeps parity with your existing logs)
    console.log('DEBUG showVehicleListings params:', [categorySlug, limit]);
    console.log('DEBUG vehicles image urls:', vehicles.map(v => ({ id: v.id, image_url: v.image_url })));

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

/**
 * GET /vehicles/:id
 * Render a single vehicle detail page.
 */
export async function showVehicleDetails(req, res, next) {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).send('Vehicle id required');

    const vehicle = await getVehicleById(id);
    const parts = splitTitleToParts
      ? splitTitleToParts(vehicle.title || '')
      : { make: '', model: '' };


    console.log('DEBUG getVehicleById result:', vehicle);

    if (!vehicle) {
      // Render a 404 page or forward to next with a 404 error
      const err = new Error('Page Not Found');
      err.status = 404;
      return next(err);
    }

    // Normalize image_url (choose placeholder based on category)
    const image_url = resolveVehicleImage({
      image_url: vehicle.image_url,
      make: vehicle.make || parts.make,
      model: vehicle.model || parts.model,
      category_slug: vehicle.category_slug
    });


    // Render view with normalized vehicle object
    return res.render('vehicles/show', {
      vehicle: { ...vehicle, image_url }
    });
  } catch (err) {
    console.error('showVehicleDetails error:', err);
    return next(err);
  }
}

/**
 * GET /vehicles/new
 * Render the create vehicle form.
 */
export function newVehicleForm(req, res) {
  return res.render('vehicles/create', { vehicle: {} });
}

/**
 * POST /vehicles
 * Create a new vehicle (basic example).
 * Adjust validation and DB insert to match your schema and security needs.
 */
export async function createVehicle(req, res, next) {
  try {
    const {
      title,
      year,
      make,
      model,
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
      make,
      model,
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
