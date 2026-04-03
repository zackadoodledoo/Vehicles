import { getAllReviews, deleteReviewById } from '../models/review.model.js';

export function showAdminPanel(req, res) {
  res.render('admin/index');
}

export async function showReviewDashboard(req, res, next) {
  console.log(
    "SHOW REVIEW DASHBOARD HIT",
    "PATH:", req.path,
    "REFERER:", req.get('Referer') || 'none',
    "USER:", req.session?.user
  );

  try {
    const reviews = await getAllReviews();
    res.render('admin/reviews', { reviews });
  } catch (err) {
    next(err);
  }
}



export async function deleteReview(req, res, next) {
  console.log(
    "DELETE REVIEW HIT",
    "PATH:", req.path,
    "REFERER:", req.get('Referer') || 'none',
    "USER:", req.session?.user
  );

  try {
    await deleteReviewById(req.params.id);
    res.redirect('/admin/reviews');
  } catch (err) {
    next(err);
  }
}
