import { Router } from 'express';
import { createTask, getTasks, updateTaskStatus, deleteTask, getTaskActivities } from '../controllers/taskController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateToken as any, createTask as any);
router.get('/', authenticateToken as any, getTasks as any);
router.get('/activities', authenticateToken as any, getTaskActivities as any);
router.patch('/:taskId', authenticateToken as any, updateTaskStatus as any);
router.delete('/:taskId', authenticateToken as any, deleteTask as any);

export default router;
