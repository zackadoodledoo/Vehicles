import express from "express";
import {
  submitReview,
  removeReview,
} from "../controllers/review.controller.js";
import { requireLogin, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Submit a review for a vehicle (users)
router.post(
  "/vehicles/:id/reviews",
  requireLogin,
  submitReview
);

// Delete a review (employees/admins)
router.post(
  "/reviews/:reviewId/delete",
  requireLogin,
  requireRole("employee"),
  removeReview
);

export default router;
