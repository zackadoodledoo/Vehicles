import { Router } from "express";
import { requireLogin, requireRole } from "../middleware/auth.js";
import { showVehicleListings, showVehicleDetails, newVehicleForm, createVehicle } from "../controllers/vehicle.controller.js";

const router = Router();

// Public routes
router.get("/vehicles", showVehicleListings);
// Owner-only routes
router.get("/vehicles/new", requireRole("owner"), newVehicleForm);

router.get("/vehicles/:id", showVehicleDetails);

// Create 
router.post("/vehicles", requireRole("owner"), createVehicle);

export default router;
