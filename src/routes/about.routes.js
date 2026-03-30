import { Router } from "express";
import { showAboutPage } from "../controllers/about.controller.js";

const router = Router();

router.get("/about", showAboutPage);

export default router;
