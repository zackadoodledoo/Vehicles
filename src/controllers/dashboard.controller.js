import { getAllCategories } from "../models/category.model.js";

export async function showDashboard(req, res, next) {
  try {
    const categories = await getAllCategories();

    res.render("dashboard", {
      user: req.session.user,
      categories
    });
  } catch (err) {
    next(err);
  }
}
