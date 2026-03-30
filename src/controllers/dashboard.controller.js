import pool from "../db/index.js";

export async function showDashboard(req, res, next) {
  try {
    const result = await pool.query(
      "SELECT name, slug FROM categories ORDER BY name"
    );

    res.render("dashboard", {
      user: req.session.user,
      categories: result.rows
    });
  } catch (err) {
    next(err);
  }
}
