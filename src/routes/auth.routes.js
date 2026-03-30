import { Router } from 'express';
import {
  showRegister,
  register,
  showLogin,
  login,
  logout,
} from '../controllers/auth.controller.js';

const router = Router();

// Registration routes
router.get('/register', showRegister);
router.post('/register', register);

// Login routes
router.get('/login', showLogin);
router.post('/login', login);

// Logout route
router.get('/logout', logout);

export default router;
