import { Router } from 'express';
import { getTodayStatus, clockIn, clockOut, startBreak, endBreak, resetPin, getAdminTodayStatus } from '../controllers/attendanceController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/today', authenticateToken as any, getTodayStatus as any);
router.get('/admin/today', authenticateToken as any, getAdminTodayStatus as any);
router.post('/clock-in', authenticateToken as any, clockIn as any);
router.post('/clock-out', authenticateToken as any, clockOut as any);
router.post('/break/start', authenticateToken as any, startBreak as any);
router.post('/break/end', authenticateToken as any, endBreak as any);
router.post('/reset-pin', authenticateToken as any, resetPin as any);

export default router;
