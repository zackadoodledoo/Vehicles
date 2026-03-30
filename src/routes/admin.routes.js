import { Router } from "express";
import { requireRole } from "../middleware/auth.js";
import { showAdminPanel } from "../controllers/admin.controller.js";
import { listUsers } from "../controllers/admin.users.controller.js";

const router = Router();

router.get("/admin", requireRole("owner"), showAdminPanel);
router.get("/admin/users", requireRole("owner"), listUsers);

export default router;
