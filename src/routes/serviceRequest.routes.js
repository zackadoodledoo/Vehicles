import express from "express";
import {
  showServiceRequestForm,
  submitServiceRequest,
  showUserRequests,
  showAllRequests,
  updateRequestStatus,
} from "../controllers/serviceRequest.controller.js";
import { requireLogin, requireRole } from "../middleware/auth.js";

const router = express.Router();

// User routes
router.get("/service-requests/new", requireLogin, showServiceRequestForm);
router.post("/service-requests", requireLogin, submitServiceRequest);
router.get("/service-requests", requireLogin, showUserRequests);

// Employee / Admin routes
router.get(
  "/admin/service-requests",
  requireLogin,
  requireRole("employee"),
  showAllRequests
);

router.post(
  "/admin/service-requests/:id",
  requireLogin,
  requireRole("employee"),
  updateRequestStatus
);

export default router;
