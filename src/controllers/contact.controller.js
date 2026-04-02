import { createContactMessage } from "../models/contact.model.js";

export function showContactForm(req, res) {
  res.render("contact");
}

export async function submitContactForm(req, res, next) {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).render("contact", {
        error: "All fields are required."
      });
    }

    await createContactMessage(name, email, message);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
}
