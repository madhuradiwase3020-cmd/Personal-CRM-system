import { Router } from 'express';
import { currentUser, login, register, updateProfile } from '../controllers/authController.js';
import authenticate from '../middleware/auth.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = Router();
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/me', authenticate, asyncHandler(currentUser));
router.patch('/profile', authenticate, asyncHandler(updateProfile));
export default router;
