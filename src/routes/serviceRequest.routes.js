import { Router } from 'express';
import { requireLogin, requireRole } from '../middleware/auth.js';
import {
  showNewServiceRequestForm,
  submitServiceRequest,
  showUserRequests,
  showAdminRequests,
  updateRequestStatus
} from '../controllers/serviceRequest.controller.js';

const router = Router();

// User
router.get('/service-requests/new', requireLogin, showNewServiceRequestForm);
router.post('/service-requests', requireLogin, submitServiceRequest);
router.get('/account/service-requests', requireLogin, showUserRequests);

// Employee/Owner
router.get('/admin/service-requests', requireLogin, requireRole('employee'), showAdminRequests);
router.post('/admin/service-requests/:id/status', requireLogin, requireRole('employee'), updateRequestStatus);

export default router;
