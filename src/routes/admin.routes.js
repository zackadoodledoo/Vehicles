import { Router } from "express";
import { requireLogin, requireRole } from "../middleware/auth.js";
import { showAdminPanel, showReviewDashboard, deleteReview } from "../controllers/admin.controller.js";
import { listUsers, updateUserRole, resetUserPassword } from "../controllers/admin.users.controller.js";
import { getVehicles, getVehicleById } from "../models/vehicle.model.js";
import { createVehicle, updateVehicle, deleteVehicle, } from "../models/vehicle.model.js";
import { getAllCategories } from "../models/category.model.js";

const router = Router();

// Admin dashboard
router.get("/", requireRole("owner"), showAdminPanel);

router.get("/reviews", requireLogin, requireRole("employee"), showReviewDashboard);
router.post("/reviews/:id/delete", requireLogin, requireRole("employee"), deleteReview);


// User management
router.get("/users", requireRole("owner"), listUsers);
router.post("/users/:id/role", requireRole("owner"), updateUserRole);
router.post("/users/:id/reset-password", requireRole("owner"), resetUserPassword);

// Vehicle management
router.get("/vehicles", requireRole("owner"), async (req, res, next) => {
  try {
    const vehicles = await getVehicles();
    res.render("admin/vehicles", { vehicles });
  } catch (err) {
    next(err);
  }
});

router.get("/vehicles/new", requireRole("owner"), async (req, res, next) => {
  try {
    const categories = await getAllCategories();
    res.render("admin/new-vehicle", { categories });
  } catch (err) {
    next(err);
  }
});


router.get("/vehicles/:id/edit", requireRole("owner"), async (req, res, next) => {
  try {
    const vehicle = await getVehicleById(req.params.id);
    const categories = await getAllCategories();

    res.render("admin/edit-vehicle", {
      vehicle,
      categories
    });
  } catch (err) {
    next(err);
  }
});


router.post("/vehicles", requireRole("owner"), async (req, res, next) => {
  try {
    await createVehicle(req.body);
    res.redirect("/admin/vehicles");
  } catch (err) {
    next(err);
  }
});


router.post("/vehicles/:id", requireRole("owner"), async (req, res, next) => {
    try {
        await updateVehicle(req.params.id, req.body);
        res.redirect("/admin/vehicles");
    } catch (err) {
        next(err);
    }
});

router.post("/vehicles/:id/delete", requireRole("owner"), async (req, res, next) => {
  try {
    await deleteVehicle(req.params.id);
    res.redirect("/admin/vehicles");
  } catch (err) {
    next(err);
  }
});






export default router;
