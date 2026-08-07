import { Router } from 'express';
import {
  getMonthCalendarData,
  getDayScheduleData,
  createLeaveRequest
} from '../controllers/calendarController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/month', authenticateToken as any, getMonthCalendarData as any);
router.get('/day', authenticateToken as any, getDayScheduleData as any);
router.post('/leave-request', authenticateToken as any, createLeaveRequest as any);

export default router;
