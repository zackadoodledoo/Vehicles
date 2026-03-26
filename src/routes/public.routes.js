import { Router } from 'express';
import { renderHome } from '../controllers/home.controller.js';

const router = Router();

router.get('/', renderHome);

if ((process.env.NODE_ENV || '').toLowerCase() !== 'production') {
  router.get('/test-error', (req, res, next) => {
    const err = new Error('This is a test error');
    err.status = 500;
    next(err);
  });
}

export default router;
