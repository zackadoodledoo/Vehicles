import {createReview, deleteReview, getRecentReviews} from "../models/review.model.js";

/**
 * GET /reviews
 * Render a public list of recent reviews
 */
export async function showReviews(req, res, next) {
  try {
    const reviews = await getRecentReviews(25);

    res.render("reviews/index", {
      reviews
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
