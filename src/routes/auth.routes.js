import { Router } from "express";
import {
  showLogin,
  processLogin,
  logout,
} from "../controllers/auth.controller.js";

const router = Router();

// Show login form
router.get("/login", showLogin);

// Handle login submission
router.post("/login", processLogin);

// Logout user
router.get("/logout", logout);

export default router;
