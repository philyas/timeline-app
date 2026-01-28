import { Router } from 'express';
import * as AuthController from '../controllers/AuthController';
import { jwtAuth } from '../middleware/jwtAuth';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/verify-email', AuthController.verifyEmail);
router.post('/verify-email', AuthController.verifyEmail);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.post('/change-password', jwtAuth, AuthController.changePassword);
router.get('/me', jwtAuth, AuthController.me);

export default router;
