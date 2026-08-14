import { Router } from 'express';
import {
  getMonthCalendarData,
  getDayScheduleData,
  createLeaveRequest,
  createCalendarEvent,
  getCalendarTeamMembers
} from '../controllers/calendarController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/month', authenticateToken as any, getMonthCalendarData as any);
router.get('/day', authenticateToken as any, getDayScheduleData as any);
router.get('/users', authenticateToken as any, getCalendarTeamMembers as any);
router.post('/leave-request', authenticateToken as any, createLeaveRequest as any);
router.post('/events', authenticateToken as any, createCalendarEvent as any);

export default router;
