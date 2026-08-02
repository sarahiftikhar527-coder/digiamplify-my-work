import { Router } from 'express';
import { 
  createTask, 
  getTasks, 
  updateTaskStatus, 
  deleteTask, 
  getTaskActivities,
  getTaskRequests,
  approveTaskRequest,
  rejectTaskRequest
} from '../controllers/taskController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateToken as any, createTask as any);
router.get('/', authenticateToken as any, getTasks as any);
router.get('/activities', authenticateToken as any, getTaskActivities as any);
router.get('/requests', authenticateToken as any, getTaskRequests as any);
router.post('/requests/:requestId/approve', authenticateToken as any, approveTaskRequest as any);
router.post('/requests/:requestId/reject', authenticateToken as any, rejectTaskRequest as any);
router.patch('/:taskId', authenticateToken as any, updateTaskStatus as any);
router.delete('/:taskId', authenticateToken as any, deleteTask as any);

export default router;
