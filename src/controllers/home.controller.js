import pool from '../db/index.js';
import { splitTitleToParts } from '../lib/helpers.js';


function resolveVehicleImage(vehicle) {
  if (
    vehicle.image_url &&
    typeof vehicle.image_url === 'string' &&
    vehicle.image_url.trim() &&
    vehicle.image_url !== 'null' &&
    vehicle.image_url !== '[null]'
  ) {
    return vehicle.image_url.trim();
  }

  if (vehicle.make && vehicle.model) {
    const slug = `${vehicle.make}-${vehicle.model}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');

    return `/images/vehicles/makes/${slug}.jpg`;
  }

  return '/images/placeholder-vehicle.jpg';
}


export async function renderHome(req, res, next) {
  try {
    const categoriesResult = await pool.query(
      `SELECT id, name FROM categories ORDER BY name`
    );
    const categories = categoriesResult.rows || [];

    const vehiclesResult = await pool.query(
      `SELECT id, title, year, price
       FROM vehicles
       ORDER BY created_at DESC
       LIMIT $1`,
      [12]
    );

    // Determine current category from the query string (e.g., ?category=trucks)
    const currentCategory = (req.query.category || '').toString().toLowerCase();

    const featured = (vehiclesResult.rows || []).map(v => {
      const parts = splitTitleToParts(v.title);
      const isTruckView = currentCategory === 'trucks';
      return {
        id: v.id,
        make: parts.make,
        model: parts.model,
        year: v.year,
        price: v.price,
        image_url: resolveVehicleImage({
        make: parts.make,
        model: parts.model,
        image_url: null
        })
      };
    });

    return res.render('home', { title: 'Home', categories, featured, currentCategory });
  } catch (err) {
    return next(err);
  }
}



// export async function renderHome(req, res, next) {
//   try {
//     // Fetch categories
//     const categoriesResult = await pool.query(
//       `SELECT id, name, slug
//        FROM categories
//        ORDER BY name`
//     );
//     const categories = categoriesResult.rows || [];

//     // Fetch featured vehicles (limit 6)
//     const featuredResult = await pool.query(
//       `SELECT v.id, v.make, v.model, v.year, v.price, vi.url AS image_url
//        FROM vehicles v
//        LEFT JOIN vehicle_images vi ON vi.vehicle_id = v.id
//        WHERE v.is_featured = true
//        GROUP BY v.id, vi.url
//        ORDER BY v.updated_at DESC
//        LIMIT $1`,
//       [6]
//     );
//     const featured = featuredResult.rows || [];

//     // Render view
//     return res.render('home', {
//       title: 'Home',
//       categories,
//       featured
//     });
//   } catch (err) {
//     return next(err);
//   }
// }
