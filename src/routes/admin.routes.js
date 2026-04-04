console.log("ADMIN ROUTES FILE LOADED");
import { Router } from "express";
import { requireLogin, requireRole } from "../middleware/auth.js";
import { showAdminPanel, showReviewDashboard, deleteReview } from "../controllers/admin.controller.js";
import { listUsers, updateUserRole, resetUserPassword, deleteUser } from "../controllers/admin.users.controller.js";
import { getVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle } from "../models/vehicle.model.js";
import { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from "../models/category.model.js";
import { showAdminRequests, updateRequestStatus } from "../controllers/serviceRequest.controller.js";
import { getAllContactMessages } from "../models/contact.model.js";

const router = Router();

/* ─────────────────────────────────────────
   Dashboard
───────────────────────────────────────── */
router.get("/", requireRole("owner"), showAdminPanel);

/* ─────────────────────────────────────────
   Review moderation (employee + owner)
───────────────────────────────────────── */
router.get("/reviews",
  requireLogin, requireRole(["employee", "owner"]),
  showReviewDashboard
);
router.post("/reviews/:id/delete",
  requireLogin, requireRole(["employee", "owner"]),
  deleteReview
);

/* ─────────────────────────────────────────
   User management (owner only)
───────────────────────────────────────── */
router.get("/users",                    requireRole("owner"), listUsers);
router.post("/users/:id/role",          requireRole("owner"), updateUserRole);
router.post("/users/:id/reset-password",requireRole("owner"), resetUserPassword);
router.post("/users/:id/delete",        requireLogin, requireRole("owner"), deleteUser);

/* ─────────────────────────────────────────
   Vehicle management (owner only)
───────────────────────────────────────── */
router.get("/vehicles", requireRole("owner"), async (req, res, next) => {
  try {
    const vehicles = await getVehicles();
    res.render("admin/vehicles", { vehicles });
  } catch (err) { next(err); }
});

// IMPORTANT: /vehicles/new must come before /vehicles/:id
router.get("/vehicles/new", requireRole("owner"), async (req, res, next) => {
  try {
    const categories = await getAllCategories();
    res.render("admin/new-vehicle", { categories });
  } catch (err) { next(err); }
});

router.get("/vehicles/:id/edit", requireRole("owner"), async (req, res, next) => {
  try {
    const vehicle    = await getVehicleById(req.params.id);
    const categories = await getAllCategories();
    res.render("admin/edit-vehicle", { vehicle, categories });
  } catch (err) { next(err); }
});

router.post("/vehicles", requireRole("owner"), async (req, res, next) => {
  try {
    await createVehicle(req.body);
    res.redirect("/admin/vehicles");
  } catch (err) { next(err); }
});

router.post("/vehicles/:id", requireRole("owner"), async (req, res, next) => {
  try {
    await updateVehicle(req.params.id, req.body);
    res.redirect("/admin/vehicles");
  } catch (err) { next(err); }
});

router.post("/vehicles/:id/delete", requireRole("owner"), async (req, res, next) => {
  try {
    await deleteVehicle(req.params.id);
    res.redirect("/admin/vehicles");
  } catch (err) { next(err); }
});

/* ─────────────────────────────────────────
   Category management (owner only)
   ADDED: rubric requires owner to add/edit/delete vehicle categories
───────────────────────────────────────── */
router.get("/categories", requireRole("owner"), async (req, res, next) => {
  try {
    const categories = await getAllCategories();
    res.render("admin/categories", { categories });
  } catch (err) { next(err); }
});

router.post("/categories", requireRole("owner"), async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).send("Category name is required.");
    await createCategory(name);
    res.redirect("/admin/categories");
  } catch (err) { next(err); }
});

router.post("/categories/:id", requireRole("owner"), async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).send("Category name is required.");
    await updateCategory(req.params.id, name);
    res.redirect("/admin/categories");
  } catch (err) { next(err); }
});

router.post("/categories/:id/delete", requireRole("owner"), async (req, res, next) => {
  try {
    await deleteCategory(req.params.id);
    res.redirect("/admin/categories");
  } catch (err) { next(err); }
});

/* ─────────────────────────────────────────
   Service request management (employee + owner)
───────────────────────────────────────── */
router.get("/service-requests",
  requireLogin, requireRole(["employee", "owner"]),
  showAdminRequests
);
router.post("/service-requests/:id/status",
  requireLogin, requireRole(["employee", "owner"]),
  updateRequestStatus
);

/* ─────────────────────────────────────────
   Contact messages (employee + owner)
   ADDED: rubric requires admin to view contact form submissions
───────────────────────────────────────── */
router.get("/contact-messages",
  requireLogin, requireRole(["employee", "owner"]),
  async (req, res, next) => {
    try {
      const messages = await getAllContactMessages();
      res.render("admin/contact-messages", { messages });
    } catch (err) { next(err); }
  }
);

/* ─────────────────────────────────────────
   Debug (remove before production submission)
───────────────────────────────────────── */
if ((process.env.NODE_ENV || '').toLowerCase() !== 'production') {
  router.get("/debug-session", (req, res) => {
    res.json({ sessionUser: req.session?.user || null });
  });
}

export default router;