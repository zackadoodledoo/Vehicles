import { Router } from "express";
import { requireLogin } from "../middleware/require-login.js";
import { requireRole } from "../middleware/require-role.js";
import {showCreateVehicleForm, createVehicle, } from "../controllers/vehicle.controller.js";
import { showVehicleDetails, showVehicleListings } from "../controllers/vehicle.controller.js";


const router = Router();

// Load CSS only for vehicle pages
router.use((req, res, next) => {
  res.addStyle('<link rel="stylesheet" href="/css/vehicles.css">');
  res.addStyle('<link rel="stylesheet" href="/css/reviews.css">'); // because reviews appear on vehicle detail pages
  next();
});

router.get("/vehicles", showVehicleListings);
router.get("/vehicles/:id", showVehicleDetails);

router.get("/vehicles/new", requireLogin, requireRole("owner"), showCreateVehicleForm);

router.post(
  "/vehicles",
  requireLogin,
  requireRole("owner"),
  createVehicle
);

export default router;
