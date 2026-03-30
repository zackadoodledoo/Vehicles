import pool from '../db/index.js';

export async function showAboutPage(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT name, slug FROM categories ORDER BY name'
    );

    res.render('about', {
      categories: result.rows
    });
  } catch (err) {
    next(err);
  }
}
