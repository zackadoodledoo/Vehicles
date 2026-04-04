import express from "express";
import { showReviews, showEditReview, updateReview, deleteReview } from "../controllers/review.controller.js";
import { requireLogin, requireRole } from "../middleware/auth.js";

const router = express.Router();


// submit a review (user must be logged in)
router.post("/reviews", requireLogin, submitReview);

// edit form for a user's own review
router.get("/reviews/:id/edit", requireLogin, showEditReview);

// update review (user must own review)
router.post("/reviews/:id", requireLogin, updateReview);

// delete review (user must own review or admin/employee)
router.post("/reviews/:id/delete", requireLogin, deleteReview);

export default router;