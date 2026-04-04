// src/controllers/review.controller.js
import db from "../db/index.js"; // your pg pool wrapper
import { validationResult } from "express-validator";

export async function submitReview(req, res, next) {
  try {
    const { vehicleId, rating, content } = req.body;
    const userId = req.session.user.id;

    // basic server-side validation
    if (!vehicleId || !rating || rating < 1 || rating > 5 || !content || content.trim().length < 3) {
      return res.status(400).render("errors/400", { message: "Invalid review input" });
    }

    const sql = `
      INSERT INTO reviews (user_id, vehicle_id, rating, content, created_at)
      VALUES ($1, $2, $3, $4, now())
      RETURNING id;
    `;
    const { rows } = await db.query(sql, [userId, vehicleId, rating, content.trim()]);
    res.redirect(`/vehicles/${vehicleId}#reviews`);
  } catch (err) {
    next(err);
  }
}

export async function showEditReview(req, res, next) {
  try {
    const reviewId = Number(req.params.id);
    const { rows } = await db.query("SELECT * FROM reviews WHERE id = $1", [reviewId]);
    const review = rows[0];
    if (!review) return res.status(404).render("errors/404");

    // ownership check
    const user = req.session.user;
    if (review.user_id !== user.id && user.role !== "owner" && user.role !== "employee") {
      return res.status(403).render("errors/403");
    }

    res.render("reviews/edit", { review });
  } catch (err) {
    next(err);
  }
}

export async function updateReview(req, res, next) {
  try {
    const reviewId = Number(req.params.id);
    const { rating, content } = req.body;
    const user = req.session.user;

    const { rows } = await db.query("SELECT * FROM reviews WHERE id = $1", [reviewId]);
    const review = rows[0];
    if (!review) return res.status(404).render("errors/404");

    if (review.user_id !== user.id && user.role !== "owner" && user.role !== "employee") {
      return res.status(403).render("errors/403");
    }

    await db.query(
      "UPDATE reviews SET rating = $1, content = $2, updated_at = now() WHERE id = $3",
      [rating, content.trim(), reviewId]
    );

    res.redirect(`/vehicles/${review.vehicle_id}#reviews`);
  } catch (err) {
    next(err);
  }
}

export async function deleteReview(req, res, next) {
  try {
    const reviewId = Number(req.params.id);
    const user = req.session.user;

    const { rows } = await db.query("SELECT * FROM reviews WHERE id = $1", [reviewId]);
    const review = rows[0];
    if (!review) return res.status(404).render("errors/404");

    if (review.user_id !== user.id && user.role !== "owner" && user.role !== "employee") {
      return res.status(403).render("errors/403");
    }

    await db.query("DELETE FROM reviews WHERE id = $1", [reviewId]);
    res.redirect(req.get("Referer") || "/");
  } catch (err) {
    next(err);
  }
}
