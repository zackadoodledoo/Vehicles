import { Router } from "express";
import { showContactForm, submitContactForm } from "../controllers/contact.controller.js";

const router = Router();

router.get("/contact", showContactForm);
router.post("/contact", submitContactForm);

export default router;
