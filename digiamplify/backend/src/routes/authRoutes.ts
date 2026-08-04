import { Router } from 'express';
import { signup, login, logout, heartbeat } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', authenticateToken as any, logout);
router.post('/heartbeat', authenticateToken as any, heartbeat);

export default router;
