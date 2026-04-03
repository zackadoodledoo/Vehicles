import { getAllReviews, deleteReviewById } from '../models/review.model.js';

export async function showReviewDashboard(req, res, next) {
  try {
    const reviews = await getAllReviews();
    res.render('admin/reviews', { reviews });
  } catch (err) {
    next(err);
  }
}

export async function deleteReview(req, res, next) {
  try {
    await deleteReviewById(req.params.id);
    res.redirect('/admin/reviews');
  } catch (err) {
    next(err);
  }
}
