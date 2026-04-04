import db from "../db/index.js"; 

// Create a new review (POST /reviews)
export async function submitReview(req, res, next) {
  try {
    const user = req.session?.user;
    if (!user) return res.status(403).render("errors/403");

    const { vehicleId, rating, content } = req.body;
    if (!vehicleId || !rating || !content || content.trim().length < 3) {
      return res.status(400).render("errors/400", { message: "Invalid review input" });
    }

    const sql = `
      INSERT INTO reviews (user_id, vehicle_id, rating, content, created_at)
      VALUES ($1, $2, $3, $4, now())
      RETURNING id;
    `;
    await db.query(sql, [user.id, Number(vehicleId), Number(rating), content.trim()]);

    res.redirect(`/vehicles/${vehicleId}#reviews`);
  } catch (err) {
    next(err);
  }
}

// Show edit form for a review (GET /reviews/:id/edit)
export async function showEditReview(req, res, next) {
  try {
    const reviewId = Number(req.params.id);
    const { rows } = await db.query("SELECT * FROM reviews WHERE id = $1", [reviewId]);
    const review = rows[0];
    if (!review) return res.status(404).render("errors/404");

    const user = req.session?.user;
    if (!user) return res.status(403).render("errors/403");

    // ownership or admin/employee check
    if (review.user_id !== user.id && user.role !== "owner" && user.role !== "employee") {
      return res.status(403).render("errors/403");
    }

    res.render("reviews/edit", { review });
  } catch (err) {
    next(err);
  }
}

// Update a review (POST /reviews/:id)
export async function updateReview(req, res, next) {
  try {
    const reviewId = Number(req.params.id);
    const { rating, content } = req.body;
    const user = req.session?.user;
    if (!user) return res.status(403).render("errors/403");

    const { rows } = await db.query("SELECT * FROM reviews WHERE id = $1", [reviewId]);
    const review = rows[0];
    if (!review) return res.status(404).render("errors/404");

    if (review.user_id !== user.id && user.role !== "owner" && user.role !== "employee") {
      return res.status(403).render("errors/403");
    }

    await db.query(
      "UPDATE reviews SET rating = $1, content = $2, updated_at = now() WHERE id = $3",
      [Number(rating), content.trim(), reviewId]
    );

    res.redirect(`/vehicles/${review.vehicle_id}#reviews`);
  } catch (err) {
    next(err);
  }
}

// Delete a review (POST /reviews/:id/delete)
export async function deleteReview(req, res, next) {
  try {
    const reviewId = Number(req.params.id);
    const user = req.session?.user;
    if (!user) return res.status(403).render("errors/403");

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
