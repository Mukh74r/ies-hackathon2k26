import express from 'express';
import { AuthController } from '../controllers/AuthController.ts';
import { ProfileController } from '../controllers/ProfileController.ts';
import { authenticate } from '../middleware/auth.ts';

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/signup', AuthController.register); // Alias for signup
router.post('/login', AuthController.login);
router.post('/google', AuthController.google);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Profile routes
router.get('/profile', authenticate, ProfileController.getMyProfile);
router.patch('/profile', authenticate, ProfileController.updateMyProfile);

export default router;
