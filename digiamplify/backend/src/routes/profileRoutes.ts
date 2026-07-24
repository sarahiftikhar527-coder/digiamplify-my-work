import { Router } from 'express';
import { getProfile, upsertProfile } from '../controllers/profileController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Secure all profile operations
router.get('/', authenticateToken as any, getProfile);
router.post('/', authenticateToken as any, upsertProfile);

export default router;
