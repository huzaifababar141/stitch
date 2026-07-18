import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { sendOtpSchema, verifyOtpSchema, loginSchema } from './auth.validator';
import { authenticate } from '../../middleware/auth.middleware';
import { authLimiter, otpLimiter } from '../../middleware/rateLimit.middleware';

const router = Router();

// Public routes (Rate limited to prevent SMS spam)
router.post('/send-otp', otpLimiter, validate(sendOtpSchema), authController.sendOtp);
router.post('/verify-otp', authLimiter, validate(verifyOtpSchema), authController.verifyOtp);
router.post('/login', authLimiter, validate(loginSchema), authController.login);

// Cookie-driven silent refresh
router.post('/refresh', authController.refresh);

// Protected routes (Require authentication token attached)
router.post('/logout', authenticate, authController.logout);
router.post('/logout-all', authenticate, authController.logoutAll);
router.get('/me', authenticate, authController.getMe);

export default router;
