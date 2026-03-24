import { Router } from "express";
import { requireLogin } from "../middleware/require-login.js";
import { requireRole } from "../middleware/require-role.js";
import { showAdminPanel } from "../controllers/admin.controller.js";

const router = Router();

router.get("/admin", requireLogin, requireRole("owner"), showAdminPanel);

export default router;
