import { getAllCategories } from "../models/category.model.js";

export async function showAboutPage(req, res, next) {
  try {
    const categories = await getAllCategories();

    res.render("about", {
      categories
    });
  } catch (err) {
    next(err);
  }
}
