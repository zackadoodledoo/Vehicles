import pool from "../db/index.js";
import { createReview, deleteReview,} from "../models/review.model.js";

/**
 * GET /reviews
 * Render a public list of recent reviews
 */
export async function showReviews(req, res, next) {
  try {
    const sql = `
      SELECT
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        v.title AS vehicle_title
      FROM reviews r
      LEFT JOIN vehicles v ON r.vehicle_id = v.id
      ORDER BY r.id DESC
      LIMIT 25
    `;

    const result = await pool.query(sql);

    res.render("reviews/index", {
      reviews: result.rows
    });
  } catch (err) {
    console.error("showReviews error:", err);
    next(err);
  }
}

/**
 * Handle review submission by a logged-in user
 */
export async function submitReview(req, res, next) {
  try {
    const { rating, comment } = req.body;
    const vehicleId = req.params.id;

    await createReview(
      req.session.user.id,
      vehicleId,
      rating,
      comment
    );

    res.redirect(`/vehicles/${vehicleId}`);
  } catch (err) {
    next(err);
  }
}

/**
 * Allow employees/admins to delete a review
 */
export async function removeReview(req, res, next) {
  try {
    await deleteReview(req.params.reviewId);
    res.redirect("back");
  } catch (err) {
    next(err);
  }
}
