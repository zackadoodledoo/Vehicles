import { Router } from "express";
import { requireLogin } from "../middleware/auth.js";
import { showDashboard } from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/dashboard", requireLogin, showDashboard);

export default router;
