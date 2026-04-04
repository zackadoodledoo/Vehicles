import { Router } from "express";
import { requireLogin, requireRole } from "../middleware/auth.js";
import {
  showVehicleListings,
  showVehicleDetails,
  newVehicleForm,
  createVehicle
} from "../controllers/vehicle.controller.js";

const router = Router();

router.get("/vehicles", showVehicleListings);

// FIX: /vehicles/new MUST come before /vehicles/:id
// Previously "new" was being captured as :id, causing a 404
router.get("/vehicles/new", requireRole("owner"), newVehicleForm);

router.get("/vehicles/:id", showVehicleDetails);
router.post("/vehicles", requireRole("owner"), createVehicle);

export default router;