import { Router } from 'express';
import { signup, login, logout } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', authenticateToken as any, logout);

export default router;
