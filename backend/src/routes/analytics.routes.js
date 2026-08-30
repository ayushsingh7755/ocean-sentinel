import express from 'express';
import { getDashboardAnalytics, getTrends, getSystemStats } from '../controllers/analytics.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardAnalytics);
router.get('/trends', getTrends);
router.get('/system', authorize('admin'), getSystemStats);

export default router;
