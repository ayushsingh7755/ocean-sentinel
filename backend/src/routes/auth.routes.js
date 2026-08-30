import express from 'express';
import { register, login, logout, getMe, getAllUsers } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('admin'), getAllUsers);

export default router;
