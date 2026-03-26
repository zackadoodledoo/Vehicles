// src/controllers/home.controller.js
import pool from '../db/index.js';

function splitTitleToParts(title = '') {
  const t = (title || '').toString().trim();
  const withoutYear = t.replace(/^\s*\d{4}\s*/, '');
  // naive split: first word after year is make, rest is model
  const parts = withoutYear.split(/\s+/);
  return {
    make: parts.length > 1 ? parts[0] : '',
    model: parts.length > 1 ? parts.slice(1).join(' ') : withoutYear || t
  };
}

export async function renderHome(req, res, next) {
  try {
    const categoriesResult = await pool.query(
      `SELECT id, name, slug FROM categories ORDER BY name`
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
        image_url: isTruckView ? '/images/placeholder-truck.svg' : '/images/placeholder-vehicle.jpg'
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
